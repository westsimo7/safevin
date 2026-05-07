
-- Trigger: send "free limit reached" email when a free user reaches their studio cap
CREATE OR REPLACE FUNCTION public.send_free_limit_reached_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email TEXT;
  v_name TEXT;
  v_eff jsonb;
  v_limit int;
  v_period_start timestamptz;
BEGIN
  IF NEW.plan <> 'free' THEN
    RETURN NEW;
  END IF;

  -- Determine effective free limit and current window
  v_eff := public.get_free_effective_limit(NEW.user_id);
  v_limit := COALESCE((v_eff->>'limit')::int, 2);
  v_period_start := COALESCE((v_eff->>'period_start')::timestamptz, NEW.current_period_start);

  -- Fire only when the user just crossed the limit in this window
  IF NEW.studio_used < v_limit THEN
    RETURN NEW;
  END IF;
  IF COALESCE(OLD.studio_used, 0) >= v_limit
     AND COALESCE(OLD.current_period_start, NEW.current_period_start) = NEW.current_period_start THEN
    -- Already sent in this window
    RETURN NEW;
  END IF;

  SELECT email, COALESCE(NULLIF(nome, ''), '')
    INTO v_email, v_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  IF v_email IS NULL OR v_email = '' THEN
    RETURN NEW;
  END IF;

  PERFORM public.invoke_send_transactional_email(
    'free-limit-reached',
    v_email,
    'free-limit-' || NEW.user_id::text || '-' || extract(epoch from v_period_start)::bigint::text,
    jsonb_build_object('name', v_name)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_send_free_limit_reached_email ON public.user_credits;
CREATE TRIGGER trg_send_free_limit_reached_email
AFTER UPDATE OF studio_used, current_period_start ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.send_free_limit_reached_email();

-- Backfill: send the email once to existing free users who already reached the limit
DO $$
DECLARE
  r RECORD;
  v_eff jsonb;
  v_limit int;
  v_period_start timestamptz;
BEGIN
  FOR r IN
    SELECT uc.user_id, uc.studio_used, p.email, COALESCE(NULLIF(p.nome, ''), '') AS name
    FROM public.user_credits uc
    JOIN public.profiles p ON p.user_id = uc.user_id
    WHERE uc.plan = 'free'
      AND p.email IS NOT NULL AND p.email <> ''
  LOOP
    v_eff := public.get_free_effective_limit(r.user_id);
    v_limit := COALESCE((v_eff->>'limit')::int, 2);
    v_period_start := (v_eff->>'period_start')::timestamptz;
    IF r.studio_used >= v_limit THEN
      PERFORM public.invoke_send_transactional_email(
        'free-limit-reached',
        r.email,
        'free-limit-' || r.user_id::text || '-' || extract(epoch from v_period_start)::bigint::text,
        jsonb_build_object('name', r.name)
      );
    END IF;
  END LOOP;
END $$;
