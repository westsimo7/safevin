
-- Table to record one-time free listing redemption per user
CREATE TABLE IF NOT EXISTS public.free_listing_claims (
  user_id uuid PRIMARY KEY,
  claimed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.free_listing_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own free listing claim" ON public.free_listing_claims;
CREATE POLICY "Users can view their own free listing claim"
ON public.free_listing_claims
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'founder'::app_role));

-- RPC: idempotent redemption that grants +1 bonus credit
CREATE OR REPLACE FUNCTION public.redeem_free_listing()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_existed boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  -- Check if user already claimed
  SELECT EXISTS(SELECT 1 FROM public.free_listing_claims WHERE user_id = v_uid)
    INTO v_existed;

  IF v_existed THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_claimed');
  END IF;

  -- Ensure user_credits row exists
  INSERT INTO public.user_credits (user_id)
  VALUES (v_uid)
  ON CONFLICT (user_id) DO NOTHING;

  -- Record claim
  INSERT INTO public.free_listing_claims (user_id) VALUES (v_uid);

  -- Grant +1 bonus credit
  UPDATE public.user_credits
    SET bonus_credits = COALESCE(bonus_credits, 0) + 1
    WHERE user_id = v_uid;

  RETURN jsonb_build_object('success', true, 'granted', 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_free_listing() TO authenticated;
