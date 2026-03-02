import React, { useState } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { User, BookOpen, AlertCircle, CheckCircle2, Send, Home } from 'lucide-react';

import { syncAttendanceToSheet } from '../utils/googleSheets';

const StudentAttendanceForm = () => {
    const { markAttendance, loading, error: hookError } = useAttendance();
    const [pinNumber, setPinNumber] = useState('');
    const [branch, setBranch] = useState('');
    const [successData, setSuccessData] = useState(null);
    const [customError, setCustomError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pinNumber || !branch) return;
        setCustomError(null);

        try {
            const data = await markAttendance(pinNumber, branch);

            // Handle the "Get back to home" strike logic response from server
            if (data && data.success === false) {
                setCustomError(data.message);
            } else {
                setSuccessData(data);
                // Sync to Google Sheets in the background
                syncAttendanceToSheet({
                    pin_number: pinNumber,
                    branch: branch,
                    status: data.status,
                    delay_minutes: data.delay_minutes,
                    arrival_time: data.arrival_time
                });
            }
        } catch (err) {
            console.error("Submission error:", err);
        }
    };

    const resetForm = () => {
        setPinNumber('');
        setBranch('');
        setSuccessData(null);
        setCustomError(null);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <div className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2 text-white">
                    <User className="w-8 h-8 text-primary" />
                    Mark Attendance
                </h2>
                <p className="text-slate-400 mb-8 text-sm">
                    Enter your details below to log your arrival time.
                </p>

                {customError ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 animate-[zoomIn_0.3s_ease-out] space-y-6">
                        {customError === 'Get back to home' ? (
                            <>
                                <Home className="w-20 h-20 text-red-500 mx-auto mb-4" />
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{customError}</h3>
                                <p className="text-slate-400 text-sm">
                                    You have been late too many times. Access is restricted for today according to college policy.
                                </p>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{customError}</h3>
                                <p className="text-slate-400 text-sm">
                                    Our records show you have already logged your arrival for today.
                                </p>
                            </>
                        )}
                        <button
                            onClick={resetForm}
                            className={`w-full py-4 px-4 ${customError === 'Get back to home' ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700 hover:bg-slate-600'} text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 text-lg`}
                        >
                            {customError === 'Get back to home' ? 'Understand' : 'Close'}
                        </button>
                    </div>
                ) : !successData ? (
                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div>
                            <label htmlFor="pinNumber" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                PIN Number
                            </label>
                            <input
                                type="text"
                                id="pinNumber"
                                value={pinNumber}
                                onChange={(e) => setPinNumber(e.target.value.toUpperCase())}
                                placeholder="e.g. 21X71A05XX"
                                required
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all uppercase"
                            />
                        </div>

                        <div>
                            <label htmlFor="branch" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                Branch
                            </label>
                            <select
                                id="branch"
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                                required
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                            >
                                <option value="" disabled className="bg-slate-950">Select Your Branch</option>
                                <option value="CME" className="bg-slate-950">CME</option>
                                <option value="ECE" className="bg-slate-950">ECE</option>
                                <option value="EEE" className="bg-slate-950">EEE</option>
                                <option value="AI" className="bg-slate-950">AI</option>
                                <option value="CIVIL" className="bg-slate-950">CIVIL</option>
                                <option value="MECH" className="bg-slate-950">MECH</option>
                                <option value="AUTO MOBILE" className="bg-slate-950">AUTO MOBILE</option>
                            </select>
                        </div>

                        {(hookError || customError) && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-red-400 text-sm animate-pulse">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{hookError || customError}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !pinNumber || !branch}
                            className={`w-full py-4 px-4 flex items-center justify-center gap-2 font-bold rounded-xl transition-all shadow-lg text-lg ${loading || !pinNumber || !branch
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/80 text-white shadow-primary/20 active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit Attendance
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 animate-[zoomIn_0.3s_ease-out]">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Logged Successfully</h3>
                        <p className="text-slate-300 mb-6 font-medium">
                            PIN: <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded">{pinNumber}</span><br />
                            Time: <span className="text-white">{new Date(successData.arrival_time).toLocaleTimeString()}</span>
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-left bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</p>
                                <p className={`text-xl font-bold ${successData.status === 'Late' ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {successData.status}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Delay</p>
                                <p className="text-xl font-bold text-slate-200">{successData.delay_minutes} min</p>
                            </div>
                        </div>

                        <button
                            onClick={resetForm}
                            className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-lg"
                        >
                            Back to Form
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendanceForm;
