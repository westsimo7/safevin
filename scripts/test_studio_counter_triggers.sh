#!/usr/bin/env bash
# Tests for the studio_creations -> user_credits trigger.
# Validates: INSERT increments studio_used, DELETE does NOT decrement (high-water-mark),
# limit blocks at 2, and CTA-block condition (studio_remaining=0) holds.
set -euo pipefail
PASS=0; FAIL=0
assert_eq() {
  if [[ "$2" == "$3" ]]; then echo "  ✓ $1"; PASS=$((PASS+1));
  else echo "  ✗ $1  expected=[$2] actual=[$3]"; FAIL=$((FAIL+1)); fi
}

echo "=== Studio counter trigger tests ==="
UID_T=$(psql -tAc "SELECT gen_random_uuid()")
EMAIL="test+$UID_T@example.com"

psql -q -v ON_ERROR_STOP=1 <<SQL >/dev/null
INSERT INTO public.profiles (user_id, email, nome, cognome, created_at)
VALUES ('$UID_T', '$EMAIL', 'T', 'T', now() - interval '5 days');
INSERT INTO public.user_credits (user_id, plan, plan_type, studio_used)
VALUES ('$UID_T', 'free', 'free', 0);
SQL

# Initial state
USED=$(psql -tAc "SELECT studio_used FROM public.user_credits WHERE user_id='$UID_T'")
assert_eq "initial studio_used = 0" "0" "$USED"

# INSERT 1
ID1=$(psql -tAc "SELECT gen_random_uuid()")
psql -q -c "INSERT INTO public.studio_creations (id, user_id, status, categoria) VALUES ('$ID1','$UID_T','complete','x')" >/dev/null
USED=$(psql -tAc "SELECT studio_used FROM public.user_credits WHERE user_id='$UID_T'")
assert_eq "after 1st INSERT studio_used = 1" "1" "$USED"

# INSERT 2
ID2=$(psql -tAc "SELECT gen_random_uuid()")
psql -q -c "INSERT INTO public.studio_creations (id, user_id, status, categoria) VALUES ('$ID2','$UID_T','complete','x')" >/dev/null
USED=$(psql -tAc "SELECT studio_used FROM public.user_credits WHERE user_id='$UID_T'")
assert_eq "after 2nd INSERT studio_used = 2" "2" "$USED"

# CTA-block condition: remaining = limit - used
REMAIN=$(psql -tAc "SELECT GREATEST(0, (public.get_free_effective_limit('$UID_T')->>'limit')::int - studio_used) FROM public.user_credits WHERE user_id='$UID_T'")
assert_eq "remaining = 0 -> CTA must be disabled" "0" "$REMAIN"

# DELETE 1 — must NOT refund
psql -q -c "SELECT public.test_delete_studio_creation('$ID1'::uuid)" >/dev/null
USED=$(psql -tAc "SELECT studio_used FROM public.user_credits WHERE user_id='$UID_T'")
assert_eq "after DELETE studio_used STILL = 2 (no refund)" "2" "$USED"
REMAIN=$(psql -tAc "SELECT GREATEST(0, (public.get_free_effective_limit('$UID_T')->>'limit')::int - studio_used) FROM public.user_credits WHERE user_id='$UID_T'")
assert_eq "after DELETE remaining still 0" "0" "$REMAIN"

# DELETE 2 — also no refund
psql -q -c "SELECT public.test_delete_studio_creation('$ID2'::uuid)" >/dev/null
USED=$(psql -tAc "SELECT studio_used FROM public.user_credits WHERE user_id='$UID_T'")
assert_eq "after deleting all, studio_used STILL = 2" "2" "$USED"

# Window rollover: simulate 35 days passed -> new window resets to real count (0)
psql -q -c "SELECT public.test_age_test_user('$UID_T'::uuid, 35)" >/dev/null
# Trigger rollover by ensuring credits
psql -q -c "SELECT public.ensure_user_credits('$UID_T')" >/dev/null
USED=$(psql -tAc "SELECT studio_used FROM public.user_credits WHERE user_id='$UID_T'")
assert_eq "after window rollover studio_used = 0 (new window)" "0" "$USED"

# Insert in new window, then delete: still no refund within same window
ID3=$(psql -tAc "SELECT gen_random_uuid()")
psql -q -c "INSERT INTO public.studio_creations (id, user_id, status, categoria) VALUES ('$ID3','$UID_T','complete','x')" >/dev/null
USED=$(psql -tAc "SELECT studio_used FROM public.user_credits WHERE user_id='$UID_T'")
assert_eq "new window, 1 INSERT -> studio_used = 1" "1" "$USED"
psql -q -c "SELECT public.test_delete_studio_creation('$ID3'::uuid)" >/dev/null
USED=$(psql -tAc "SELECT studio_used FROM public.user_credits WHERE user_id='$UID_T'")
assert_eq "new window, after DELETE still 1 (high-water-mark)" "1" "$USED"

# Cleanup
psql -q -c "SELECT public.cleanup_test_users()" >/dev/null

echo ""
echo "=== Existing-user invariants ==="
# No free user should have studio_used < real count in current window (under-counted = exploitable)
UNDER=$(psql -tAc "
SELECT COUNT(*) FROM public.user_credits uc
WHERE uc.plan='free'
  AND uc.studio_used < (
    SELECT COUNT(*) FROM public.studio_creations sc
    WHERE sc.user_id=uc.user_id AND sc.status='complete'
      AND sc.created_at >= uc.current_period_start AND sc.created_at < uc.current_period_end)")
assert_eq "no free user is under-counted" "0" "$UNDER"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[[ $FAIL -eq 0 ]] || exit 1
