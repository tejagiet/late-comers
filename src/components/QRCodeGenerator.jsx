import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Download, Link as LinkIcon, ExternalLink } from 'lucide-react';

const QRCodeGenerator = () => {
    const [siteUrl, setSiteUrl] = useState('');

    useEffect(() => {
        // Default to the current window location if available
        setSiteUrl(window.location.origin);
    }, []);

    const downloadQRCode = () => {
        const svg = document.getElementById("StaticQRCode");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width + 40; // Add padding
            canvas.height = img.height + 40;

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 20, 20);

            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `gate-attendance-static-qr.png`;
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

                <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2 text-white">
                    <LinkIcon className="w-8 h-8 text-secondary" />
                    Static Gateway QR
                </h2>
                <p className="text-slate-400 mb-8 text-sm">
                    Generate a static QR code for the gate. Students scan this to access the attendance form.
                </p>

                <div className="space-y-6">
                    <div className="text-left">
                        <label htmlFor="siteUrl" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-secondary" />
                            Website URL
                        </label>
                        <input
                            type="url"
                            id="siteUrl"
                            value={siteUrl}
                            onChange={(e) => setSiteUrl(e.target.value)}
                            placeholder="https://latecomers-giet.vercel.app/"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        />
                    </div>

                    <div className="flex justify-center p-8 bg-white rounded-2xl shadow-inner mt-4">
                        <QRCode
                            id="StaticQRCode"
                            value={siteUrl || 'No URL Provided'}
                            size={200}
                            level="H"
                        />
                    </div>

                    <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono break-all text-left">
                        URL: {siteUrl}
                    </div>

                    <button
                        onClick={downloadQRCode}
                        disabled={!siteUrl}
                        className={`w-full py-4 px-4 flex items-center justify-center gap-2 font-bold rounded-xl transition-all shadow-lg text-lg ${siteUrl
                                ? 'bg-secondary hover:bg-secondary/80 text-white shadow-secondary/20 active:scale-95'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <Download className="w-5 h-5" />
                        Download Static QR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeGenerator;
