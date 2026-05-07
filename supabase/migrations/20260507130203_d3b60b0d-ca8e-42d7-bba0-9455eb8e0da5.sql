
CREATE OR REPLACE FUNCTION public.test_delete_studio_creation(p_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow deleting rows that belong to a synthetic test user
  DELETE FROM public.studio_creations
  WHERE id = p_id
    AND user_id IN (SELECT user_id FROM public.profiles WHERE email LIKE 'test+%@example.com');
END;
$$;
