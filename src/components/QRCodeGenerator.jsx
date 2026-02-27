import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Download, QrCode } from 'lucide-react';

const QRCodeGenerator = () => {
    const [studentId, setStudentId] = useState('');

    const downloadQRCode = () => {
        const svg = document.getElementById("QRCode");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw white background
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw SVG element on top
            ctx.drawImage(img, 0, 0);

            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `student-${studentId || 'unknown'}-qrcode.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
            <div className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 right-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                    <QrCode className="w-8 h-8 text-secondary" />
                    Generate ID Pass
                </h2>
                <p className="text-slate-400 mb-8 text-sm">
                    Create student entry passes for scanning.
                </p>

                <div className="space-y-6">
                    <div className="text-left">
                        <label htmlFor="studentId" className="block text-sm font-semibold text-slate-300 mb-2">Student ID (UUID or Roll No)</label>
                        <input
                            type="text"
                            id="studentId"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="e.g. 21X71A05A..."
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        />
                    </div>

                    <div className="flex justify-center p-8 bg-white rounded-2xl shadow-inner mt-4">
                        <QRCode
                            id="QRCode"
                            value={studentId || 'No ID Provided'}
                            size={200}
                            level="H"
                        />
                    </div>

                    <button
                        onClick={downloadQRCode}
                        disabled={!studentId}
                        className={`w-full py-4 px-4 flex items-center justify-center gap-2 font-bold rounded-xl transition-all shadow-lg text-lg ${studentId
                                ? 'bg-secondary hover:bg-secondary/80 text-white shadow-secondary/20 active:scale-95'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Download className="w-5 h-5" />
                        Download Pass
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeGenerator;
