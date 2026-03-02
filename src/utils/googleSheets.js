/**
 * Utility to sync attendance data to Google Sheets via a Web App URL.
 */

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

export const syncAttendanceToSheet = async (data) => {
    if (!GOOGLE_SCRIPT_URL) {
        console.warn("Google Script URL not configured. Sync skipped.");
        return;
    }

    try {
        // Prepare the payload
        const payload = {
            pin_number: data.pin_number,
            branch: data.branch,
            status: data.status,
            delay_minutes: data.delay_minutes,
            arrival_time: data.arrival_time || new Date().toISOString()
        };

        // Send to Google Apps Script
        // Note: Google Apps Script redirects (302), so we use 'no-cors' if we don't need the response,
        // or ensure the script handles OPTIONS/CORS for a full response.
        // For simplicity and since we don't strictly need the response, 'no-cors' is often used.
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log("Sync request sent to Google Sheets for PIN:", data.pin_number);
    } catch (error) {
        console.error("Google Sheets Sync Error:", error);
    }
};
