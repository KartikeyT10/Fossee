import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const Dashboard = ({ refreshTrigger }) => {
    const [datasets, setDatasets] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState(null);

    useEffect(() => {
        fetchDatasets();
    }, [refreshTrigger]);

    const fetchDatasets = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/datasets/');
            setDatasets(res.data);
            if (res.data.length > 0) {
                if (selectedDataset) {
                    const found = res.data.find(d => d.id === selectedDataset.id);
                    setSelectedDataset(found || res.data[0]);
                } else {
                    setSelectedDataset(res.data[0]);
                }
            } else {
                setSelectedDataset(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (datasets.length === 0) return (
        <div className="text-center py-20 animate-fade-in">
            <div className="inline-block p-6 rounded-full bg-slate-100 mb-4 text-4xl">📄</div>
            <h3 className="text-xl font-bold text-slate-700">No Data Available</h3>
            <p className="text-slate-500 mt-2">Upload a CSV file above to see the magic happen.</p>
        </div>
    );
    if (!selectedDataset) return null;

    const stats = selectedDataset.summary_stats;
    const typeCounts = stats.type_counts || {};

    // Modern Palette
    const colors = {
        purple: { bg: 'rgba(139, 92, 246, 0.7)', border: 'rgba(139, 92, 246, 1)' },
        blue: { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(59, 130, 246, 1)' },
        teal: { bg: 'rgba(20, 184, 166, 0.7)', border: 'rgba(20, 184, 166, 1)' },
        orange: { bg: 'rgba(249, 115, 22, 0.7)', border: 'rgba(249, 115, 22, 1)' },
        pink: { bg: 'rgba(236, 72, 153, 0.7)', border: 'rgba(236, 72, 153, 1)' },
    };

    const chartColors = Object.values(colors);

    const barData = {
        labels: Object.keys(typeCounts),
        datasets: [
            {
                label: 'Count',
                data: Object.values(typeCounts),
                backgroundColor: chartColors.map(c => c.bg),
                borderColor: chartColors.map(c => c.border),
                borderWidth: 2,
                borderRadius: 8,
                hoverOffset: 4
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Equipment Distribution',
                font: { size: 16, weight: 'bold' },
                color: '#334155'
            },
        },
        scales: {
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
    };

    // Calculate overall health score (fake metric for engagement)
    const healthScore = 98;

    return (
        <div className="animate-fade-in-up transition-all">
            {/* Dataset Selector */}
            <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4">
                    {datasets.map(d => (
                        <button
                            key={d.id}
                            onClick={() => setSelectedDataset(d)}
                            className={`
                            px-6 py-3 rounded-xl whitespace-nowrap text-sm font-bold transition-all flex items-center gap-2
                            ${selectedDataset.id === d.id
                                    ? 'bg-slate-800 text-white shadow-lg scale-105'
                                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                }
                        `}
                        >
                            <span>📊</span>
                            ID: {d.id}
                            <span className={`text-xs ml-1 font-normal opacity-70`}>
                                {new Date(d.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Dashboard Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Dashboard Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Analytics Overview</h2>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            Source: {selectedDataset.file.split('/').pop()}
                        </p>
                    </div>
                    <div className="hidden sm:block">
                        <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            Processing Complete
                        </span>
                    </div>
                </div>

                <div className="p-8">
                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {/* Total Rows Card */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 transform hover:scale-105 transition-transform duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Records</p>
                                    <h3 className="text-4xl font-extrabold mt-2">{stats.total_rows}</h3>
                                </div>
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Numeric Stats */}
                        {Object.entries(stats.numerical_stats).slice(0, 3).map(([col, data], idx) => {
                            const gradients = [
                                'from-purple-500 to-purple-600',
                                'from-teal-400 to-teal-500',
                                'from-orange-400 to-orange-500'
                            ];
                            const shadows = ['shadow-purple-200', 'shadow-teal-200', 'shadow-orange-200'];
                            const bgGradient = gradients[idx % gradients.length];
                            const shadowClass = shadows[idx % shadows.length];

                            return (
                                <div key={col} className={`bg-gradient-to-br ${bgGradient} rounded-2xl p-6 text-white shadow-lg ${shadowClass} transform hover:scale-105 transition-transform duration-300`}>
                                    <div className="flex justify-between items-start">
                                        <div className="overflow-hidden">
                                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider truncate" title={col}>{col}</p>
                                            <h3 className="text-3xl font-extrabold mt-2">{data.mean ? data.mean.toFixed(1) : 'N/A'}</h3>
                                            <p className="text-xs text-white/70 mt-1">Average Value</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Charts & Table Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Chart */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="relative h-64 w-full flex items-center justify-center">
                                <Doughnut
                                    data={barData}
                                    options={{
                                        ...options,
                                        cutout: '70%',
                                        plugins: {
                                            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                                            title: { display: true, text: 'Equipment Types' }
                                        }
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center mt-8">
                                        <span className="text-3xl font-bold text-slate-800">{stats.total_rows}</span>
                                        <br />
                                        <span className="text-xs text-slate-400 uppercase">Items</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">Raw Data Preview</h3>
                                <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
                            </div>
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                                        <tr>
                                            {stats.columns.map(c => (
                                                <th key={c} className="px-6 py-3 font-semibold whitespace-nowrap">{c}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {stats.preview.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                                {stats.columns.map(c => (
                                                    <td key={c} className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                                                        {row[c]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
