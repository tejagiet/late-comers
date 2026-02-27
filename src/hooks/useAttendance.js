import { useState } from 'react';
import { supabase } from '../supabase';

export const useAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const markAttendance = async (pinNumber, branch) => {
        setLoading(true);
        setError(null);
        try {
            // Call the secure RPC function to prevent manual time spoofing
            // The RPC calculates "Late" vs "On-Time" and the Delay on the server side
            const { data, error: rpcError } = await supabase.rpc('log_secure_attendance', {
                p_pin_number: pinNumber,
                p_branch: branch
            });

            if (rpcError) throw rpcError;

            setLoading(false);
            return data;

        } catch (err) {
            console.error("Attendance Error:", err);
            setLoading(false);
            setError(err.message);
            throw err;
        }
    };

    return { markAttendance, loading, error };
};
