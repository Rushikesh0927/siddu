-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rated_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view ratings for jobs they participated in"
    ON public.ratings
    FOR SELECT
    USING (
        job_id IN (
            SELECT id FROM public.jobs 
            WHERE employer_id = auth.uid() OR 
            id IN (SELECT job_id FROM public.applications WHERE student_id = auth.uid())
        )
    );

CREATE POLICY "Users can create ratings for completed jobs they participated in"
    ON public.ratings
    FOR INSERT
    WITH CHECK (
        job_id IN (
            SELECT id FROM public.jobs 
            WHERE status = 'COMPLETED' AND (
                employer_id = auth.uid() OR 
                id IN (SELECT job_id FROM public.applications WHERE student_id = auth.uid())
            )
        ) AND
        (rater_id = auth.uid() OR rated_id = auth.uid())
    );

CREATE POLICY "Users can update their own ratings"
    ON public.ratings
    FOR UPDATE
    USING (rater_id = auth.uid())
    WITH CHECK (rater_id = auth.uid());

CREATE POLICY "Users can delete their own ratings"
    ON public.ratings
    FOR DELETE
    USING (rater_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
