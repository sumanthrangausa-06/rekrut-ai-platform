DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('candidate', 'recruiter', 'admin');
  END IF;
END$$;
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL DEFAULT '',
  work_email TEXT,
  company_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT recruiter_company_check CHECK(
    work_email IS NULL OR (company_name IS NOT NULL AND length(trim(company_name)) > 0)
  )
);
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(uid UUID, r public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = uid AND role = r
  );
$$;
-- profiles
DROP POLICY IF EXISTS "profile_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_insert_own" ON public.profiles;

CREATE POLICY "profile_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "profile_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profile_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- user_roles: view only (no public writes)
DROP POLICY IF EXISTS "roles_select_own_or_admin" ON public.user_roles;

CREATE POLICY "roles_select_own_or_admin"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
  CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
  _full_name TEXT;
  _company_name TEXT;
  _email_domain TEXT;
  _blocked_domains TEXT[] := ARRAY[
    'gmail.com','yahoo.com','outlook.com','hotmail.com','live.com',
    'icloud.com','proton.me','protonmail.com','aol.com','zoho.com'
  ];
BEGIN
  _role := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'candidate');
  _full_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), '');
  _company_name := NULLIF(trim(NEW.raw_user_meta_data ->> 'company_name'), '');
  _email_domain := lower(split_part(NEW.email, '@', 2));

  -- Block admin signup
  IF _role NOT IN ('candidate','recruiter') THEN
    RAISE EXCEPTION 'Invalid role for public signup';
  END IF;
  
  -- Recruiter rules
  IF _role = 'recruiter' THEN
    IF _company_name IS NULL THEN
      RAISE EXCEPTION 'Recruiter must provide company name';
    END IF;
    IF _email_domain = ANY (_blocked_domains) THEN
      RAISE EXCEPTION 'Recruiter must use a company email address';
    END IF;
  END IF;

  -- Create profile
  INSERT INTO public.profiles (id, full_name, work_email, company_name)
  VALUES (
    NEW.id,
    _full_name,
    CASE WHEN _role = 'recruiter' THEN NEW.email ELSE NULL END,
    CASE WHEN _role = 'recruiter' THEN _company_name ELSE NULL END
  );

  -- Create role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();