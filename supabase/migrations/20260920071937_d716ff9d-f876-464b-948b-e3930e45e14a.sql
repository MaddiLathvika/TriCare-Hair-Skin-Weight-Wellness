CREATE TYPE public.policy_status AS ENUM ('proposal','issued','lapsed');

CREATE TABLE public.agent_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name text NOT NULL DEFAULT '',
  agent_code text NOT NULL DEFAULT '',
  branch text,
  division text,
  club_tier text,
  joined_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_profiles TO authenticated;
GRANT ALL ON public.agent_profiles TO service_role;
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents manage their own agent profile" ON public.agent_profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_no text NOT NULL,
  client_name text NOT NULL,
  plan_name text,
  sum_assured numeric(14,2) NOT NULL DEFAULT 0,
  premium numeric(14,2) NOT NULL DEFAULT 0,
  commission numeric(14,2) NOT NULL DEFAULT 0,
  issued_on date NOT NULL DEFAULT current_date,
  status public.policy_status NOT NULL DEFAULT 'issued',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX policies_user_issued_idx ON public.policies (user_id, issued_on DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.policies TO authenticated;
GRANT ALL ON public.policies TO service_role;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents manage their own policies" ON public.policies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_month date NOT NULL,
  policy_goal integer NOT NULL DEFAULT 0,
  premium_goal numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_month)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.targets TO authenticated;
GRANT ALL ON public.targets TO service_role;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents manage their own targets" ON public.targets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.portal_leaderboard()
RETURNS TABLE (user_id uuid, agent_name text, agent_code text, policy_count bigint, premium_total numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id,
         COALESCE(NULLIF(a.agent_name, ''), 'Agent') AS agent_name,
         COALESCE(a.agent_code, '') AS agent_code,
         COUNT(*) AS policy_count,
         COALESCE(SUM(p.premium), 0) AS premium_total
  FROM public.policies p
  LEFT JOIN public.agent_profiles a ON a.id = p.user_id
  WHERE p.status = 'issued'
  GROUP BY p.user_id, a.agent_name, a.agent_code
  ORDER BY premium_total DESC, policy_count DESC
  LIMIT 50
$$;

REVOKE ALL ON FUNCTION public.portal_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_leaderboard() TO authenticated;