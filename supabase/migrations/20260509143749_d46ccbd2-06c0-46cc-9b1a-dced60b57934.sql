
-- Tabella che tiene la PRIMA associazione dispositivo -> utente
CREATE TABLE public.device_registrations (
  device_fingerprint text PRIMARY KEY,
  user_id uuid NOT NULL,
  user_agent text,
  ip_address text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_device_registrations_user ON public.device_registrations(user_id);

ALTER TABLE public.device_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founder can view all device registrations"
ON public.device_registrations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'founder'::public.app_role));

-- Tabella di audit di tutti i tentativi
CREATE TABLE public.device_login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint text NOT NULL,
  user_id uuid NOT NULL,
  email text,
  ip_address text,
  user_agent text,
  outcome text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_device_login_history_fp ON public.device_login_history(device_fingerprint);
CREATE INDEX idx_device_login_history_user ON public.device_login_history(user_id);

ALTER TABLE public.device_login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founder can view device login history"
ON public.device_login_history FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'founder'::public.app_role));

-- Funzione SECURITY DEFINER: associa o blocca
CREATE OR REPLACE FUNCTION public.register_or_check_device(
  p_fingerprint text,
  p_user_agent text DEFAULT NULL,
  p_ip text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_existing_user uuid;
  v_email text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'unauthenticated');
  END IF;

  IF p_fingerprint IS NULL OR length(p_fingerprint) < 8 THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'invalid_fingerprint');
  END IF;

  -- Founder bypass totale
  IF public.has_role(v_uid, 'founder'::public.app_role) THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'founder_bypass');
  END IF;

  SELECT email INTO v_email FROM public.profiles WHERE user_id = v_uid LIMIT 1;

  SELECT user_id INTO v_existing_user
  FROM public.device_registrations
  WHERE device_fingerprint = p_fingerprint;

  IF v_existing_user IS NULL THEN
    -- Nuovo dispositivo → registra
    INSERT INTO public.device_registrations (device_fingerprint, user_id, user_agent, ip_address)
    VALUES (p_fingerprint, v_uid, p_user_agent, p_ip);

    INSERT INTO public.device_login_history (device_fingerprint, user_id, email, ip_address, user_agent, outcome)
    VALUES (p_fingerprint, v_uid, v_email, p_ip, p_user_agent, 'registered');

    RETURN jsonb_build_object('allowed', true, 'reason', 'newly_registered');
  ELSIF v_existing_user = v_uid THEN
    -- Stesso utente, stesso dispositivo
    UPDATE public.device_registrations
    SET last_seen_at = now(),
        ip_address = COALESCE(p_ip, ip_address),
        user_agent = COALESCE(p_user_agent, user_agent)
    WHERE device_fingerprint = p_fingerprint;

    INSERT INTO public.device_login_history (device_fingerprint, user_id, email, ip_address, user_agent, outcome)
    VALUES (p_fingerprint, v_uid, v_email, p_ip, p_user_agent, 'allowed');

    RETURN jsonb_build_object('allowed', true, 'reason', 'same_user');
  ELSE
    -- Dispositivo già usato da un altro account → BLOCCA
    INSERT INTO public.device_login_history (device_fingerprint, user_id, email, ip_address, user_agent, outcome)
    VALUES (p_fingerprint, v_uid, v_email, p_ip, p_user_agent, 'blocked');

    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'device_already_registered',
      'original_user_id', v_existing_user
    );
  END IF;
END;
$$;
