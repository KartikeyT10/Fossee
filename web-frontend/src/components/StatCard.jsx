import React from 'react';

const StatCard = ({ title, value, unit, trend, trendValue, icon, color }) => {
    // Determine trend color
    const isPositive = trendValue && trendValue.startsWith('+');
    const trendColor = isPositive ? 'text-green-500' : 'text-orange-500';

    return (
        <div className="bg-[#1a1d21] p-6 rounded-xl border border-gray-800 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                {icon && <div className={`p-2 rounded-lg ${color === 'blue' ? 'bg-blue-500/20 text-blue-500' : color === 'red' ? 'bg-red-500/20 text-red-500' : 'bg-gray-700/50 text-gray-400'}`}>
                    {icon}
                </div>}
            </div>

            <div className="mt-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
                    {unit && <span className="text-gray-500 text-sm font-medium">{unit}</span>}
                </div>

                {trend && (
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs font-bold ${trendColor}`}>{trendValue}</span>
                        <span className="text-xs text-gray-500">{trend}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
