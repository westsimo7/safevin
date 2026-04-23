CREATE OR REPLACE FUNCTION public.sync_user_plan_from_payment(p_user_id uuid, p_new_plan public.subscription_plan)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.ensure_user_credits(p_user_id);

  UPDATE public.user_credits
  SET plan = p_new_plan,
      plan_type = p_new_plan::text
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'plan', p_new_plan);
END;
$function$;