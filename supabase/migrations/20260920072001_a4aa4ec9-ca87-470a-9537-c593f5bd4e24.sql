REVOKE ALL ON FUNCTION public.portal_leaderboard() FROM anon;
REVOKE ALL ON FUNCTION public.portal_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_leaderboard() TO authenticated;