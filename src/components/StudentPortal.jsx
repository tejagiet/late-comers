import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Search, Clock, CheckCircle2, AlertCircle, Calendar, History, BookOpen } from 'lucide-react';

const StudentPortal = () => {
    const [pinNumber, setPinNumber] = useState('');
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const fetchHistory = async (e) => {
        e.preventDefault();
        if (!pinNumber) return;

        setLoading(true);
        setSearched(true);

        try {
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .eq('pin_number', pinNumber.toUpperCase())
                .order('arrival_time', { ascending: false });

            if (error) throw error;

            setHistory(data || []);

            // Calculate Stats
            const total = data.length;
            const late = data.filter(r => r.status === 'Late').length;
            const onTime = total - late;

            setStats({ total, late, onTime });

        } catch (err) {
            console.error("Fetch history error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Student Portal</h1>
                <p className="text-slate-400 text-lg">Check your attendance history and status.</p>
            </div>

            {/* Search Bar */}
            <div className="glass rounded-3xl p-6 shadow-xl relative overflow-hidden max-w-xl mx-auto">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Search className="w-24 h-24 text-primary" />
                </div>

                <form onSubmit={fetchHistory} className="relative z-10 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Enter PIN (e.g. 21X71A05XX)"
                            value={pinNumber}
                            onChange={(e) => setPinNumber(e.target.value.toUpperCase())}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all uppercase font-mono"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/80 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 whitespace-nowrap"
                    >
                        {loading ? "Searching..." : "Track My Stats"}
                    </button>
                </form>
            </div>

            {searched && !loading && stats && (
                <div className="animate-[fadeIn_0.5s_ease-out] space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass rounded-2xl p-6 border-b-4 border-b-blue-500">
                            <p className="text-slate-400 font-medium mb-1">Total Present</p>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-white">{stats.total}</p>
                                <p className="text-slate-500 mb-1 text-sm">Days</p>
                            </div>
                        </div>
                        <div className="glass rounded-2xl p-6 border-b-4 border-b-emerald-500">
                            <p className="text-slate-400 font-medium mb-1">On-Time</p>
                            <div className="flex items-end gap-2 text-emerald-400">
                                <p className="text-4xl font-black">{stats.onTime}</p>
                                <CheckCircle2 className="w-6 h-6 mb-1" />
                            </div>
                        </div>
                        <div className="glass rounded-2xl p-6 border-b-4 border-b-red-500">
                            <p className="text-slate-400 font-medium mb-1">Late Strike Count</p>
                            <div className="flex items-end gap-2 text-red-400">
                                <p className="text-4xl font-black">{stats.late}</p>
                                <AlertCircle className="w-6 h-6 mb-1" />
                            </div>
                            {stats.late >= 2 && (
                                <p className="text-xs text-red-500/80 mt-2 font-bold animate-pulse">WARNING: One more late entry will block you!</p>
                            )}
                        </div>
                    </div>

                    {/* History List */}
                    <div className="glass rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-3">
                            <History className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold">Your Arrival History</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-400 text-xs tracking-wider uppercase bg-slate-900/50">
                                        <th className="px-6 py-4 font-bold">Date</th>
                                        <th className="px-6 py-4 font-bold">Arrival Time</th>
                                        <th className="px-6 py-4 font-bold">Branch</th>
                                        <th className="px-6 py-4 font-bold">Status</th>
                                        <th className="px-6 py-4 font-bold text-right">Delay</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center p-12 text-slate-500">No records found for this PIN.</td>
                                        </tr>
                                    ) : (
                                        history.map((record) => (
                                            <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 text-slate-200 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-slate-500" />
                                                        {new Date(record.arrival_time).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">
                                                    {new Date(record.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-2 text-primary font-bold text-sm">
                                                        <BookOpen className="w-4 h-4" />
                                                        {record.branch}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${record.status === 'Late'
                                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {record.status === 'Late' ? (
                                                        <span className="text-red-400 font-bold">+{record.delay_minutes}m</span>
                                                    ) : (
                                                        <span className="text-slate-500">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentPortal;
