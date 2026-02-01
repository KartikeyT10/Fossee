import React, { useState, useEffect } from 'react';

const EquipmentTable = ({ searchTerm = '', data = [] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filterCritical, setFilterCritical] = useState(false);
    const itemsPerPage = 5;

    // Reset page when search or data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, data, filterCritical]);

    // Filter Logic
    const filteredData = data.filter(item => {
        const matchesSearch = (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.type && item.type.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filterCritical) {
            return matchesSearch && (item.status === 'Critical' || item.status === 'Warning');
        }
        return matchesSearch;
    });

    // Pagination Logic
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentData = filteredData.slice(startIndex, endIndex);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    const handleExport = () => {
        if (!data.length) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "equipment_data_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Stable': return 'bg-green-500/10 text-green-500 border border-green-500/20';
            case 'Critical': return 'bg-red-500/10 text-red-500 border border-red-500/20';
            case 'Warning': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="bg-[#1a1d21] rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-gray-800">
                <h3 className="text-lg font-bold text-white">Equipment Real-time Monitoring</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterCritical(!filterCritical)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1 transition-colors ${filterCritical ? 'bg-red-500/20 text-red-500 border-red-500' : 'text-gray-400 bg-gray-800 border-gray-700 hover:text-white'}`}
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                        {filterCritical ? 'Clear Filter' : 'Filter Critical'}
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-800 rounded-lg border border-gray-700 hover:text-white flex items-center gap-1 active:scale-95 transition-transform"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-[#1a1d21] border-b border-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-medium tracking-wider">Equipment Name</th>
                            <th scope="col" className="px-6 py-4 font-medium tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-4 font-medium tracking-wider">Flowrate (m³/h)</th>
                            <th scope="col" className="px-6 py-4 font-medium tracking-wider">Pressure (Bar)</th>
                            <th scope="col" className="px-6 py-4 font-medium tracking-wider">Temp (°C)</th>
                            <th scope="col" className="px-6 py-4 font-medium tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {currentData.length > 0 ? currentData.map((item, index) => (
                            <tr key={index} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                                <td className="px-6 py-4 text-gray-400">{item.type}</td>
                                <td className="px-6 py-4 text-white font-mono">{item.flow}</td>
                                <td className={`px-6 py-4 font-mono ${parseFloat(item.pressure) > 8 ? 'text-orange-500 font-bold' : 'text-white'}`}>{item.pressure}</td>
                                <td className={`px-6 py-4 font-mono ${parseFloat(item.temp) > 100 ? 'text-orange-500 font-bold' : 'text-white'}`}>{item.temp}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">
                                    No equipment found matching criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
                <span>Showing {totalItems > 0 ? startIndex + 1 : 0} - {endIndex} of {totalItems} equipment {filterCritical && '(Filtered)'}</span>
                <div className="flex gap-1">
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded border border-gray-700 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 hover:text-white'}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={`px-3 py-1 rounded border border-gray-700 transition-colors ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 hover:text-white'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EquipmentTable;
