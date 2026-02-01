import { useAuth } from '../config/AuthContext';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { currentUser } = useAuth();
  const displayName = currentUser?.email ? currentUser.email.split('@')[0] : 'Admin User';

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z" /> },
    { id: 'equipment', name: 'Equipment List', icon: <path d="M4 6h16M4 12h16M4 18h16" /> },
    { id: 'analytics', name: 'Analytics', icon: <path d="M3 3v18h18M18 9l-5 5-4-4-3 3" /> },
    { id: 'reports', name: 'Reports', icon: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /> },
  ];

  return (
    <div className="w-64 h-screen bg-[#0d0e10] flex flex-col border-r border-gray-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight">ChemAnalytics</span>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Industrial Control</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
              ? 'bg-blue-600/10 text-blue-500'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              {item.icon}
            </svg>
            {item.name}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{displayName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
