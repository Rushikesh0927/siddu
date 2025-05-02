
# Job Portal Application

## Database Setup

To update the database schema for this application, you need to run the following SQL in your Supabase SQL Editor:

```sql
-- Add additional fields to the profiles table for student profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS degree TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS bio TEXT;
```

This will add the necessary fields to the profiles table that the application expects.

## Running the Application

To run the application locally:

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Visit `http://localhost:5173` in your browser

## Features

- Student dashboard for job search and applications
- Employer dashboard for posting jobs and reviewing applications
- Admin dashboard for platform management
- User authentication and role-based access control
