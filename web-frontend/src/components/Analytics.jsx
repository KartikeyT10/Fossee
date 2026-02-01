import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analytics = ({ data }) => {
    if (!data || data.length === 0) return <div className="text-gray-500">No data available. Upload a CSV file.</div>;

    // Process data for charts
    const statusCounts = data.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});

    const statusData = {
        labels: Object.keys(statusCounts),
        datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'],
            borderColor: '#111315',
            borderWidth: 2,
        }],
    };

    const typeCounts = data.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
    }, {});

    const typeData = {
        labels: Object.keys(typeCounts),
        datasets: [{
            label: 'Equipment by Type',
            data: Object.values(typeCounts),
            backgroundColor: '#3b82f6',
            borderRadius: 4,
        }],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1a1d21] p-6 rounded-xl border border-gray-800">
                <h3 className="text-white font-bold mb-4">Equipment Status Distribution</h3>
                <div className="h-64 flex justify-center">
                    <Doughnut data={statusData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#fff' } } } }} />
                </div>
            </div>
            <div className="bg-[#1a1d21] p-6 rounded-xl border border-gray-800">
                <h3 className="text-white font-bold mb-4">Equipment Types</h3>
                <div className="h-64">
                    <Bar data={typeData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } } }} />
                </div>
            </div>
        </div>
    );
};

export default Analytics;
