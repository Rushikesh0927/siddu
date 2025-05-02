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