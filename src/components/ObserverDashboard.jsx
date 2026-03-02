import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Clock, Users, AlertTriangle, BookOpen } from 'lucide-react';

const ObserverDashboard = () => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .order('arrival_time', { ascending: false })
                .limit(100);

            if (!error && data) {
                setAttendanceRecords(data);
            }
            setLoading(false);
        };

        fetchInitialData();

        const channel = supabase.channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'attendance',
                },
                (payload) => {
                    setAttendanceRecords(prev => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const totalScans = attendanceRecords.length;
    const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
    const onTimeCount = totalScans - lateCount;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Gate Attendance Dashboard</h1>
                    <p className="text-slate-400 mt-2 text-lg">Live monitoring of student arrivals.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 shadow-inner">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                    <span className="text-sm font-bold tracking-wide">Live Server Feed</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:bg-slate-800/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-blue-300" />
                    </div>
                    <p className="text-slate-400 font-medium mb-1 text-lg">Total Entries</p>
                    <p className="text-6xl font-black text-white">{totalScans}</p>
                </div>

                <div className="glass rounded-3xl p-6 flex flex-col relative overflow-hidden group border-b-4 border-b-emerald-500 hover:bg-slate-800/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-24 h-24 text-emerald-500" />
                    </div>
                    <p className="text-slate-400 font-medium mb-1 text-lg">On-Time</p>
                    <p className="text-6xl font-black text-emerald-400">{onTimeCount}</p>
                </div>

                <div className="glass rounded-3xl p-6 flex flex-col relative overflow-hidden group border-b-4 border-b-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="w-24 h-24 text-red-500" />
                    </div>
                    <p className="text-slate-400 font-medium mb-1 text-lg">Late Arrivals</p>
                    <p className="text-6xl font-black text-red-400">{lateCount}</p>
                </div>
            </div>

            {/* Live Table */}
            <div className="glass rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <Clock className="w-6 h-6 text-primary" />
                        Arrival Log
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10 text-slate-400 text-sm tracking-wider uppercase bg-slate-900/50">
                                <th className="px-6 py-5 font-bold">PIN Number</th>
                                <th className="px-6 py-5 font-bold">Branch</th>
                                <th className="px-6 py-5 font-bold">Time (IST)</th>
                                <th className="px-6 py-5 font-bold">Status</th>
                                <th className="px-6 py-5 font-bold text-right">Delay</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12 text-slate-400">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            Loading records...
                                        </div>
                                    </td>
                                </tr>
                            ) : attendanceRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-16 text-slate-500">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-xl font-medium mb-2">No entries yet today.</p>
                                    </td>
                                </tr>
                            ) : (
                                attendanceRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-white/5 transition-colors group animate-[fadeIn_0.5s_ease-out]">
                                        <td className="px-6 py-5">
                                            <span className="font-mono text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-medium">
                                                {record.pin_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-2 text-slate-300 font-semibold px-2 py-1 bg-slate-800 rounded-md text-sm">
                                                <BookOpen className="w-4 h-4 text-primary" />
                                                {record.branch}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-slate-300 font-medium">
                                            {new Date(record.arrival_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${record.status === 'Late'
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {record.status === 'Late' ? (
                                                <span className="inline-block bg-red-500/10 text-red-400 font-black px-3 py-1 rounded-lg">+{record.delay_minutes}m</span>
                                            ) : (
                                                <span className="text-slate-500 font-medium">On time</span>
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
    );
};

export default ObserverDashboard;
