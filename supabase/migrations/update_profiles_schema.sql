
-- Add additional fields to the profiles table for student profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS degree TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add proper types for application status to ensure type safety
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE public.application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HOLD');
    END IF;
END$$;

-- Update applications table to use the enum type
-- Note: This is a more complex migration that should be executed carefully
-- ALTER TABLE public.applications
-- ALTER COLUMN status TYPE public.application_status USING status::public.application_status;
