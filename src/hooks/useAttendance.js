import { useState } from 'react';
import { supabase } from '../supabase';

// GIET Rajahmundry coordinates (approx: 17.07, 81.85)
const GIET_LAT = 17.07;
const GIET_LNG = 81.85;
const MAX_DISTANCE_METERS = 200;

// Haversine formula to calculate distance in meters
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of the earth in m
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in meters
    return d;
};

export const useAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const verifyLocation = async () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const distance = getDistanceFromLatLonInMeters(latitude, longitude, GIET_LAT, GIET_LNG);

                    if (distance <= MAX_DISTANCE_METERS) {
                        resolve(true);
                    } else {
                        reject(new Error(`You must be within ${MAX_DISTANCE_METERS}m of the campus gate. You are currently ${Math.round(distance)}m away.`));
                    }
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    if (err.code === 1) {
                        reject(new Error('Location access denied. Please allow location access to mark attendance.'));
                    } else {
                        reject(new Error('Could not get your location. Please check your signal and try again.'));
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    };

    const markAttendance = async (studentId) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Verify Geolocation first
            await verifyLocation();

            // 2. Call the secure RPC function to prevent manual time spoofing
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
