
CREATE TABLE IF NOT EXISTS public.purchase_gift_claims (
  user_id uuid PRIMARY KEY,
  claimed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_gift_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gift claim"
  ON public.purchase_gift_claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'founder'::public.app_role));

CREATE OR REPLACE FUNCTION public.get_purchase_gift_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_has_purchase boolean;
  v_claimed boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('eligible', false, 'claimed', false);
  END IF;
  SELECT EXISTS(SELECT 1 FROM public.bundle_purchases WHERE user_id = v_uid) INTO v_has_purchase;
  SELECT EXISTS(SELECT 1 FROM public.purchase_gift_claims WHERE user_id = v_uid) INTO v_claimed;
  RETURN jsonb_build_object('eligible', v_has_purchase, 'claimed', v_claimed);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_purchase_gift()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_has_purchase boolean;
  v_inserted int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthenticated');
  END IF;
  SELECT EXISTS(SELECT 1 FROM public.bundle_purchases WHERE user_id = v_uid) INTO v_has_purchase;
  IF NOT v_has_purchase THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_eligible');
  END IF;
  INSERT INTO public.purchase_gift_claims (user_id) VALUES (v_uid)
  ON CONFLICT (user_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_claimed');
  END IF;
  PERFORM public.ensure_user_credits(v_uid);
  UPDATE public.user_credits
  SET bonus_credits = COALESCE(bonus_credits, 0) + 1
  WHERE user_id = v_uid;
  RETURN jsonb_build_object('success', true, 'credited', 1);
END;
$$;
