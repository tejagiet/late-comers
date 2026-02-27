import React, { useState } from 'react';
import Dashboard from './Dashboard';
import QRCodeGenerator from './QRCodeGenerator';
import { Lock, LayoutDashboard, Ticket, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';

const AdminPortal = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'qr'

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple hardcoded password for GIET Admin
        if (password === 'admin123') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid Administrator Password');
            setPassword('');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
                <div className="glass rounded-3xl p-10 max-w-md w-full shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                    <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Lock className="w-10 h-10 text-primary" />
                    </div>

                    <h2 className="text-3xl font-black mb-2 text-white italic tracking-tighter">ADMIN <span className="text-primary">ONLY</span></h2>
                    <p className="text-slate-400 mb-8 text-sm">Access to live database and QR generation is restricted.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="text-left">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Admin Password"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white text-center text-lg placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-xs font-bold flex items-center gap-2 justify-center animate-shake">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-4 bg-primary hover:bg-primary/80 text-white font-black rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 uppercase tracking-widest text-sm"
                        >
                            Unlock Access
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Admin Sub-Nav */}
            <div className="glass border-b border-primary/20 bg-primary/5 sticky top-16 z-40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Authenticated Session</span>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Live Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('qr')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'qr' ? 'bg-secondary text-white' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Ticket className="w-4 h-4" />
                            QR Link
                        </button>
                        <div className="w-px h-6 bg-slate-800 mx-2"></div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-red-400 hover:bg-red-400/10 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="py-8">
                {activeTab === 'dashboard' ? <Dashboard /> : <QRCodeGenerator />}
            </div>
        </div>
    );
};

export default AdminPortal;
