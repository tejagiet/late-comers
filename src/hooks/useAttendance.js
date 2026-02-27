import { useState } from 'react';
import { supabase } from '../supabase';

export const useAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const markAttendance = async (studentId) => {
        setLoading(true);
        setError(null);
        try {
            // Call the secure RPC function to prevent manual time spoofing
            const { data, error: rpcError } = await supabase.rpc('log_secure_attendance', {
                p_student_id: studentId
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
