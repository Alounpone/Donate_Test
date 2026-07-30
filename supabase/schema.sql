-- Supabase SQL Migration Script for Live Stream Donation Laos
-- Create the 'donations' table

CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    streamer_slug TEXT NOT NULL,
    donor_name TEXT NOT NULL,
    amount_lak NUMERIC NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups by streamer
CREATE INDEX IF NOT EXISTS idx_donations_streamer_created ON public.donations (streamer_slug, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Allow public read access for donation overlays and dashboards
CREATE POLICY "Allow public select on donations" 
ON public.donations 
FOR SELECT 
USING (true);

-- Allow public insert access for donor submissions
CREATE POLICY "Allow public insert on donations" 
ON public.donations 
FOR INSERT 
WITH CHECK (true);

-- Enable Supabase Realtime for the donations table
-- (Run this if Realtime publication exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
