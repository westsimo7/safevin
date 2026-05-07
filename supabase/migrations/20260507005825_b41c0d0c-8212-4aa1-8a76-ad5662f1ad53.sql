
DELETE FROM public.studio_creations
WHERE user_id IN (SELECT user_id FROM public.profiles WHERE email LIKE 'test+%@example.com');

DELETE FROM public.user_credits
WHERE user_id IN (SELECT user_id FROM public.profiles WHERE email LIKE 'test+%@example.com');

DELETE FROM public.profiles
WHERE email LIKE 'test+%@example.com';
