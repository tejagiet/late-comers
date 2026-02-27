-- Late Comer Identification & Attendance System Schema
-- Run this in your Supabase SQL Editor

-- 1. Create the attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL, -- Assumes UUID from auth.users. If using Roll Numbers, change to TEXT.
    arrival_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('On-Time', 'Late')),
    delay_minutes INT NOT NULL DEFAULT 0
);

-- 2. Enable Realtime for the Admin Dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow anyone to read the attendance data (for the dashboard)
CREATE POLICY "Enable read access for all users" ON public.attendance FOR SELECT USING (true);
-- (Optional) If you want students to only see their own:
-- CREATE POLICY "Enable read for self" ON public.attendance FOR SELECT USING (auth.uid() = student_id);

-- Note: We do NOT need an INSERT policy here because our secure RPC function
-- uses SECURITY DEFINER, which bypasses RLS to safely insert calibrated data.

-- 5. Create Secure Server-Time Function to Prevent "Manual Time Spoofing"
-- This function completely ignores the user's device clock.
CREATE OR REPLACE FUNCTION public.log_secure_attendance(p_student_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_now TIMESTAMPTZ := NOW();
    -- Convert to Indian Standard Time (IST) 
    v_ist_timestamp TIMESTAMPTZ := v_now AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata';
    v_current_time TIME := v_ist_timestamp::TIME;
    
    v_start_time TIME := '09:15:00'::TIME;
    v_delay_minutes INT := 0;
    v_status TEXT := 'On-Time';
    
    v_student_uuid UUID;
BEGIN
    -- Cast string parameter to UUID
    v_student_uuid := p_student_id::UUID;

    -- Calculate delay minutes against 09:15 AM
    IF v_current_time > v_start_time THEN
        -- extract epoch from exact time difference in seconds, then divide by 60
        v_delay_minutes := FLOOR(EXTRACT(EPOCH FROM (v_current_time - v_start_time)) / 60);
        v_status := 'Late';
    END IF;

    -- Insert record using DB server timestamp
    INSERT INTO public.attendance (student_id, arrival_time, status, delay_minutes)
    VALUES (v_student_uuid, v_now, v_status, v_delay_minutes);

    RETURN json_build_object(
        'success', true, 
        'status', v_status, 
        'delay_minutes', v_delay_minutes,
        'arrival_time', v_now
    );
END;
$$;
