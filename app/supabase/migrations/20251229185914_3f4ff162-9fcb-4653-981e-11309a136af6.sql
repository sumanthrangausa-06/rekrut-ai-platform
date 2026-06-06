-- Create waitlist_leads table
CREATE TABLE public.waitlist_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  role TEXT NOT NULL,
  team_size TEXT,
  hiring_for TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  source TEXT DEFAULT 'landing',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT
);

-- Enable Row Level Security
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting via edge function (service role only for security)
-- No public read access to protect PII (emails, names)
CREATE POLICY "Service role can insert waitlist leads"
ON public.waitlist_leads
FOR INSERT
TO service_role
WITH CHECK (true);

-- Service role can read for admin purposes
CREATE POLICY "Service role can read waitlist leads"
ON public.waitlist_leads
FOR SELECT
TO service_role
USING (true);

-- Create index on email for faster duplicate checks
CREATE INDEX idx_waitlist_leads_email ON public.waitlist_leads(email);

-- Create index on created_at for sorting
CREATE INDEX idx_waitlist_leads_created_at ON public.waitlist_leads(created_at DESC);