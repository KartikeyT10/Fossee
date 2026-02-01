import React from 'react';

const ActivityLog = ({ logs = [], onRestore }) => {
    // Mock removed in favor of passed props

    return (
        <div className="bg-[#1a1d21] p-6 rounded-xl border border-gray-800 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="text-sm font-bold text-white">Recent Activity Log</h3>
            </div>

            <div className="space-y-6">
                {logs.map((log, index) => (
                    <div key={index} className="flex gap-4">
                        <div className="text-xs font-mono text-gray-500 whitespace-nowrap">{log.time}</div>
                        <div className="text-sm text-gray-300">
                            {log.type === 'user' ? (
                                <span className="text-white font-medium">User 'Admin'</span>
                            ) : (
                                <span className={log.message.includes('High temp') ? "text-orange-400" : "text-gray-300"}>
                                    {log.message.replace("User 'Admin'", "")}
                                </span>
                            )}
                            {log.type === 'user' && " uploaded 'monthly_report_v2.csv'"}
                        </div>
                        {log.data && onRestore && (
                            <button
                                onClick={() => onRestore(log)}
                                className="ml-auto text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                                Restore
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityLog;
