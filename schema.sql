-- Table for storing petition signatures
CREATE TABLE signatures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  reason text NOT NULL,
  consent boolean NOT NULL DEFAULT false
);

-- Turn on row level security
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone can sign the petition)
CREATE POLICY "Allow anonymous inserts" ON signatures
  FOR INSERT WITH CHECK (true);

-- Allow anonymous selects (needed for realtime count and displaying supporters list)
-- Note: This makes the whole table readable by anon. If you need strict privacy for email/phone,
-- you should create a view for public data and revoke access to the main table for anon.
-- However, for Supabase Realtime and basic row counts, giving select to anon is the simplest approach.
CREATE POLICY "Allow anonymous selects" ON signatures
  FOR SELECT USING (true);
