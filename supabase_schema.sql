-- 1. Create the attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pin_number TEXT NOT NULL,
    branch TEXT NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('On-Time', 'Late')),
    delay_minutes INT NOT NULL DEFAULT 0
);

-- 2. Enable Realtime for the Admin Dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
CREATE POLICY "Enable read access for all users" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Enable insert for everyone" ON public.attendance FOR INSERT WITH CHECK (true);

-- 5. Create Secure Server-Time Function to Prevent "Manual Time Spoofing"
-- This function handles the "2 Late Strikes" logic.
CREATE OR REPLACE FUNCTION public.log_secure_attendance(p_pin_number text, p_branch text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_now TIMESTAMPTZ := NOW();
    -- Extract the current time in Indian Standard Time (IST)
    v_current_time TIME := (v_now AT TIME ZONE 'Asia/Kolkata')::TIME;
    
    v_start_time TIME := '09:30:00'::TIME;
    v_delay_minutes INT := 0;
    v_status TEXT := 'On-Time';
    
    v_late_strikes INT := 0;
BEGIN
    -- Calculate current status & delay
    IF v_current_time > v_start_time THEN
        v_delay_minutes := FLOOR(EXTRACT(EPOCH FROM (v_current_time - v_start_time)) / 60);
        v_status := 'Late';
    END IF;

    -- If student is LATE today, check if they have 2 existing late strikes
    IF v_status = 'Late' THEN
        SELECT COUNT(*) INTO v_late_strikes 
        FROM public.attendance 
        WHERE pin_number = p_pin_number AND status = 'Late';
        
        -- If already late for 2 days, block the 3rd one
        IF v_late_strikes >= 2 THEN
            RETURN json_build_object(
                'success', false, 
                'message', 'Get back to home'
            );
        END IF;
    END IF;

    -- Insert record using DB server timestamp
    INSERT INTO public.attendance (pin_number, branch, arrival_time, status, delay_minutes)
    VALUES (p_pin_number, p_branch, v_now, v_status, v_delay_minutes);

    RETURN json_build_object(
        'success', true, 
        'status', v_status, 
        'delay_minutes', v_delay_minutes,
        'arrival_time', v_now
    );
END;
$$;
