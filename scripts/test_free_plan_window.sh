#!/usr/bin/env bash
# Automated tests for the Free plan 30-day rolling-window logic.
# Seeds synthetic users, asserts get_free_effective_limit() outputs, then cleans up.
# Safe to re-run: every test uses fresh UUIDs and rolls back via DELETE.
set -euo pipefail

PASS=0
FAIL=0

assert_eq() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$expected" == "$actual" ]]; then
    echo "  ✓ $label"
    PASS=$((PASS+1))
  else
    echo "  ✗ $label  expected=[$expected] actual=[$actual]"
    FAIL=$((FAIL+1))
  fi
}

run_case() {
  local name="$1" days_ago="$2" expected_window="$3" expected_limit="$4"
  echo "→ $name"
  local uid
  uid=$(psql -tAc "SELECT gen_random_uuid()")
  local registered_at
  registered_at=$(psql -tAc "SELECT (now() - interval '${days_ago} days')::text")

  psql -q -v ON_ERROR_STOP=1 <<SQL >/dev/null
INSERT INTO public.profiles (user_id, email, nome, cognome, created_at)
VALUES ('$uid', 'test+$uid@example.com', 'Test', 'Free', '$registered_at');
INSERT INTO public.user_credits (user_id, plan, plan_type, studio_used, creative_director_used)
VALUES ('$uid', 'free', 'free', 0, 0);
SQL

  local res
  res=$(psql -tAc "SELECT (public.get_free_effective_limit('$uid'::uuid))::text")
  local w_limit w_index w_throttle
  w_limit=$(echo "$res" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['limit'])")
  w_index=$(echo "$res" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['window_index'])")
  w_throttle=$(echo "$res" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['throttle'])")

  assert_eq "limit=$expected_limit" "$expected_limit" "$w_limit"
  assert_eq "window_index=$expected_window" "$expected_window" "$w_index"
  assert_eq "throttle=False" "False" "$w_throttle"

  # Validate window contains "now"
  local in_window
  in_window=$(psql -tAc "
    SELECT (now() >= ((public.get_free_effective_limit('$uid'::uuid))->>'period_start')::timestamptz
        AND now() <  ((public.get_free_effective_limit('$uid'::uuid))->>'period_end')::timestamptz)::text")
  assert_eq "current time is inside window" "true" "$in_window"

  # Validate window span is 30 days
  local span_days
  span_days=$(psql -tAc "
    SELECT EXTRACT(EPOCH FROM (
      ((public.get_free_effective_limit('$uid'::uuid))->>'period_end')::timestamptz
      - ((public.get_free_effective_limit('$uid'::uuid))->>'period_start')::timestamptz
    )) / 86400")
  assert_eq "window span = 30d" "30" "$(printf '%.0f' "$span_days")"

  # Cleanup
  psql -q <<SQL >/dev/null
DELETE FROM public.studio_creations WHERE user_id = '$uid';
DELETE FROM public.user_credits WHERE user_id = '$uid';
DELETE FROM public.profiles WHERE user_id = '$uid';
SQL
}

echo "=== Free plan 30-day rolling window tests ==="
run_case "New account (today)"        0   0  2
run_case "Account 15 days old"        15  0  2
run_case "Account exactly 30 days"    30  1  2
run_case "Account 35 days old"        35  1  2
run_case "Account 95 days old"        95  3  2
run_case "Account 365 days old"       365 12 2

echo ""
echo "=== Existing-user backfill consistency ==="
# Verify all currently-Free users have current_period_end matching get_free_effective_limit
mismatch=$(psql -tAc "
SELECT COUNT(*) FROM public.user_credits uc
WHERE uc.plan = 'free'
  AND uc.current_period_end IS DISTINCT FROM
      ((public.get_free_effective_limit(uc.user_id))->>'period_end')::timestamptz")
assert_eq "all free users aligned to computed window" "0" "$mismatch"

# Verify studio_used never exceeds the limit (2)
overflow=$(psql -tAc "SELECT COUNT(*) FROM public.user_credits WHERE plan='free' AND studio_used > 2")
assert_eq "no free user exceeds limit of 2" "0" "$overflow"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[[ $FAIL -eq 0 ]] || exit 1
