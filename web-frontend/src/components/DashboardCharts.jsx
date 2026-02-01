import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const DashboardCharts = ({ data }) => {
    // Process data for chart
    let chartLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
    let chartValues = [42, 58, 48, 85, 75, 65, 92];

    if (data && data.length > 0) {
        // Assume data has some time or just use index
        chartLabels = data.map((_, i) => i + 1);
        chartValues = data.map(d => parseFloat(d.pressure || 0));
        // Limit to last 20 points for readability if too many
        if (chartLabels.length > 20) {
            chartLabels = chartLabels.slice(-20);
            chartValues = chartValues.slice(-20);
        }
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#1a1d21',
                titleColor: '#fff',
                bodyColor: '#9ca3af',
                borderColor: '#374151',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(75, 85, 99, 0.2)', drawBorder: false },
                ticks: { color: '#9ca3af' },
            },
            y: {
                grid: { color: 'rgba(75, 85, 99, 0.2)', borderDash: [5, 5], drawBorder: false },
                ticks: { color: '#9ca3af' },
                beginAtZero: true,
            },
        },
        elements: {
            line: { tension: 0.4 },
            point: { radius: 0, hitRadius: 10, hoverRadius: 4 },
        },
    };

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Pressure (Bar)',
                data: chartValues,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="bg-[#1a1d21] p-6 rounded-xl border border-gray-800 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                <h3 className="text-sm font-bold text-white">System Pressure Trend</h3>
            </div>
            <div className="flex-1 min-h-[200px]">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
};

export default DashboardCharts;
