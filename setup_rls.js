import { Client } from 'pg';

const connectionString = 'postgresql://postgres:Rushi@1928@@@db.vjkkfundbxrgcfcivcdy.supabase.co:5432/postgres';

const dropPolicies = `
-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Drop existing policies for jobs table
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can delete their own jobs" ON public.jobs;

-- Drop existing policies for applications table
DROP POLICY IF EXISTS "Students can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Students can create applications" ON public.applications;
DROP POLICY IF EXISTS "Employers can update applications for their jobs" ON public.applications;
`;

const rlsPolicies = `
-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- Create policies for jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs"
ON public.jobs
FOR SELECT
USING (status = 'ACTIVE');

CREATE POLICY "Employers can view their own jobs"
ON public.jobs
FOR SELECT
USING (employer_id = auth.uid());

CREATE POLICY "Employers can create jobs"
ON public.jobs
FOR INSERT
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs"
ON public.jobs
FOR UPDATE
USING (employer_id = auth.uid());

CREATE POLICY "Employers can delete their own jobs"
ON public.jobs
FOR DELETE
USING (employer_id = auth.uid());

-- Create policies for applications table
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own applications"
ON public.applications
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Employers can view applications for their jobs"
ON public.applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = applications.job_id
    AND jobs.employer_id = auth.uid()
  )
);

CREATE POLICY "Students can create applications"
ON public.applications
FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Employers can update applications for their jobs"
ON public.applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = applications.job_id
    AND jobs.employer_id = auth.uid()
  )
);
`;

async function setupRLS() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to the database');

    // First drop existing policies
    console.log('Dropping existing policies...');
    await client.query(dropPolicies);
    console.log('Existing policies dropped');

    // Then create new policies
    console.log('Creating new policies...');
    await client.query(rlsPolicies);
    console.log('RLS policies have been successfully set up');

  } catch (err) {
    console.error('Error setting up RLS policies:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

setupRLS(); 