import React, { useState } from 'react';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useAttendance } from '../hooks/useAttendance';
import { Camera, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';

const Scanner = () => {
    const { markAttendance, loading, error } = useAttendance();
    const [scanResult, setScanResult] = useState(null);
    const [successData, setSuccessData] = useState(null);
    const [scanError, setScanError] = useState(null);

    const handleScan = async (err, result) => {
        if (result && !loading && !successData && !scanError) {
            const studentId = result.text;
            setScanResult(studentId);

            try {
                const data = await markAttendance(studentId);
                setSuccessData(data);
            } catch (e) {
                setScanError(e.message);
            }
        }
    };

    const resetState = () => {
        setScanResult(null);
        setSuccessData(null);
        setScanError(null);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <div className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 left-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                    <Camera className="w-8 h-8 text-primary" />
                    Scan Entry Pass
                </h2>
                <p className="text-slate-400 mb-8 flex items-center justify-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    Requires GIET Campus Geolocation (200m)
                </p>

                {!successData && !scanError && (
                    <div className="relative rounded-2xl overflow-hidden shadow-inner border border-slate-700/50 aspect-square flex items-center justify-center bg-black/50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-6 animate-pulse">
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-xl font-medium text-white">Verifying Location & Server Time...</p>
                            </div>
                        ) : (
                            <BarcodeScannerComponent
                                width={500}
                                height={500}
                                onUpdate={handleScan}
                                delay={500}
                            />
                        )}

                        {/* Scanner overlay styling */}
                        {!loading && (
                            <div className="absolute inset-x-8 inset-y-8 border-2 border-primary/50 pointer-events-none flex flex-col justify-between">
                                <div className="w-6 h-6 border-t-4 border-l-4 border-primary absolute -top-1 -left-1"></div>
                                <div className="w-6 h-6 border-t-4 border-r-4 border-primary absolute -top-1 -right-1"></div>
                                <div className="w-6 h-6 border-b-4 border-l-4 border-primary absolute -bottom-1 -left-1"></div>
                                <div className="w-6 h-6 border-b-4 border-r-4 border-primary absolute -bottom-1 -right-1"></div>
                            </div>
                        )}
                    </div>
                )}

                {successData && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-4 animate-[zoomIn_0.3s_ease-out]">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                        <p className="text-slate-300 mb-4">Student: <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded truncate inline-block max-w-[200px] align-bottom">{scanResult}</span></p>

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
                            onClick={resetState}
                            className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-lg"
                        >
                            Scan Next Student
                        </button>
                    </div>
                )}

                {scanError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-4 animate-[zoomIn_0.3s_ease-out]">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Access Denied</h3>
                        <p className="text-slate-300 mb-6 break-words">{scanError}</p>

                        <button
                            onClick={resetState}
                            className="w-full py-4 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 text-lg"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Scanner;
