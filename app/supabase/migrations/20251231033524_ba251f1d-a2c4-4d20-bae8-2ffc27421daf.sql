-- Add candidate-specific columns to waitlist_leads table
ALTER TABLE public.waitlist_leads 
ADD COLUMN IF NOT EXISTS audience text DEFAULT 'recruiter',
ADD COLUMN IF NOT EXISTS "current_role" text,
ADD COLUMN IF NOT EXISTS target_roles text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS challenge text;