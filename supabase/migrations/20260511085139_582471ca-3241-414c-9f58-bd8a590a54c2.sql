CREATE OR REPLACE FUNCTION public.get_plan_limits(p_plan subscription_plan)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT CASE p_plan
    WHEN 'free' THEN jsonb_build_object(
      'studio_limit', 1, 'creative_director_limit', 0,
      'history_mode', 'last_2', 'incomplete_save', false, 'support_24h', false,
      'creative_director_access', false, 'upgrade_access', false, 'collaboration_access', false)
    WHEN 'starter' THEN jsonb_build_object(
      'studio_limit', 10, 'creative_director_limit', 0,
      'history_mode', 'last_3_sessions', 'incomplete_save', true, 'support_24h', true,
      'creative_director_access', false, 'upgrade_access', false, 'collaboration_access', false)
    WHEN 'pro' THEN jsonb_build_object(
      'studio_limit', 25, 'creative_director_limit', 2,
      'history_mode', 'monthly', 'incomplete_save', true, 'support_24h', true,
      'creative_director_access', true, 'upgrade_access', false, 'collaboration_access', false)
    WHEN 'expert' THEN jsonb_build_object(
      'studio_limit', 60, 'creative_director_limit', 6,
      'history_mode', 'quarterly', 'incomplete_save', true, 'support_24h', true,
      'creative_director_access', true, 'upgrade_access', true, 'collaboration_access', true)
  END;
$function$;