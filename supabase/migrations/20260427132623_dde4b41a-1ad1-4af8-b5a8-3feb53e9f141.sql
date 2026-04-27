REVOKE ALL ON FUNCTION public.invoke_send_transactional_email(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.send_welcome_email_on_signup() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.send_plan_upgrade_email() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_user_on_founder_reply(UUID, TEXT, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_notify_creative_director_reply() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_notify_upgrade_reply() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_notify_support_reply() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_notify_collaboration_reply() FROM PUBLIC, anon, authenticated;