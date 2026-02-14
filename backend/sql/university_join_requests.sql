-- Create table for university join requests
CREATE TABLE IF NOT EXISTS public.university_join_requests (
    request_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    university_id uuid NOT NULL,
    requester_id uuid NOT NULL,
    message text,
    status text DEFAULT 'pending' NOT NULL,
    handled_by uuid,
    handled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT university_join_requests_university_fkey FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON DELETE CASCADE,
    CONSTRAINT university_join_requests_requester_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.university_join_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own request when they have no university
DROP POLICY IF EXISTS insert_university_join_requests_authenticated ON public.university_join_requests;
CREATE POLICY insert_university_join_requests_authenticated
  ON public.university_join_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.status = 'active'
        AND p.university_id IS NULL
    )
  );

-- Allow a requester to select their own requests
DROP POLICY IF EXISTS select_university_join_requests_own ON public.university_join_requests;
CREATE POLICY select_university_join_requests_own
  ON public.university_join_requests
  FOR SELECT
  TO authenticated
  USING (
    requester_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin' AND p.university_id = university_join_requests.university_id
    )
  );

-- Allow admins of the university to update (accept/reject) requests for their university
DROP POLICY IF EXISTS update_university_join_requests_admin ON public.university_join_requests;
CREATE POLICY update_university_join_requests_admin
  ON public.university_join_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.university_id = university_join_requests.university_id
    )
  )
  WITH CHECK (
    -- only allow status transitions to accepted/rejected handled by admin
    status IN ('accepted','rejected')
  );

-- Allow admins to select requests for their university
DROP POLICY IF EXISTS select_university_join_requests_admin ON public.university_join_requests;
CREATE POLICY select_university_join_requests_admin
  ON public.university_join_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.university_id = university_join_requests.university_id
    )
  );
