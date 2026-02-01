import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { collection, addDoc, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config/firebase';
import { AuthProvider, useAuth } from './config/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StatCard from './components/StatCard';
import EquipmentTable from './components/EquipmentTable';
import DashboardCharts from './components/DashboardCharts';
import ActivityLog from './components/ActivityLog';
import Toast from './components/Toast';
import Analytics from './components/Analytics';
import Reports from './components/Reports';

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Default mock data
  const defaultData = [
    { name: 'Reactor-04', type: 'Heat Exchanger', flow: '12.5', pressure: '4.2', temp: '85.0', status: 'Stable' },
    { name: 'Pump-02', type: 'Centrifugal', flow: '45.0', pressure: '2.1', temp: '32.4', status: 'Stable' },
    { name: 'Boiler-01', type: 'Steam Generator', flow: '0.0', pressure: '8.5', temp: '120.2', status: 'Critical' },
    { name: 'Valves-A9', type: 'Flow Control', flow: '8.2', pressure: '1.8', temp: '24.0', status: 'Stable' },
    { name: 'Tank-03', type: 'Storage', flow: '15.5', pressure: '0.5', temp: '18.5', status: 'Warning' },
  ];
  const [equipmentData, setEquipmentData] = useState(defaultData);
  const [activityLogs, setActivityLogs] = useState([]);

  // Fetch History from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "datasets"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          time: data.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now',
          message: `User uploaded '${data.filename}'`,
          type: 'user',
          data: data.parsedData
        };
      });
      if (logs.length > 0) {
        setActivityLogs(logs);
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
      setToast({ message: "Sync Error: " + error.message, type: 'error' });
    });

    return () => unsubscribe();
  }, []);

  const addLog = async (message, type = 'system', dataSnapshot = null, filename = null) => {
    // Local log update happens via onSnapshot automatically if we write to DB.
    // For system logs we might want a separate collection or just local state.
    // For this task, we focus on File Uploads persistence.
    if (type === 'system') {
      setActivityLogs(prev => [{
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message,
        type,
        data: null
      }, ...prev].slice(0, 5));
    }
  };

  const handleRestore = (log) => {
    if (log.data) {
      setEquipmentData(log.data);
      setToast({ message: `Restored data from ${log.time}`, type: 'success' });
    }
  };

  const handleUpload = async (file) => {
    const reader = new FileReader();
    setToast({ message: "Reading file...", type: 'info' });

    reader.onload = async (e) => {
      const text = e.target.result;
      try {
        const rows = text.split('\n');
        // ... (parsing logic is fine)
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const newData = [];

        // Identify column indices
        const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('equipment'));
        const typeIdx = headers.findIndex(h => h.includes('type'));
        const flowIdx = headers.findIndex(h => h.includes('flow'));
        const pressIdx = headers.findIndex(h => h.includes('press'));
        const tempIdx = headers.findIndex(h => h.includes('temp'));
        const statusIdx = headers.findIndex(h => h.includes('stat'));

        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          const values = rows[i].split(',').map(v => v.trim());

          if (values.length >= headers.length) {
            const item = {
              name: nameIdx > -1 ? values[nameIdx] : values[0],
              type: typeIdx > -1 ? values[typeIdx] : values[1],
              flow: flowIdx > -1 ? values[flowIdx] : values[2],
              pressure: pressIdx > -1 ? values[pressIdx] : values[3],
              temp: tempIdx > -1 ? values[tempIdx] : values[4],
              status: 'Stable'
            };

            // Status Logic Reuse
            if (statusIdx > -1) {
              item.status = values[statusIdx];
            } else if (values[5] && isNaN(parseFloat(values[5])) && values[5].length > 2) {
              item.status = values[5];
            } else {
              const p = parseFloat(item.pressure);
              const t = parseFloat(item.temp);
              if (p > 15 || t > 130) item.status = 'Critical';
              else if (p > 9 || t > 115) item.status = 'Warning';
              else item.status = 'Stable';
            }
            // Clean up status
            if (!isNaN(parseFloat(item.status)) && item.status.length < 4) {
              const p = parseFloat(item.pressure);
              const t = parseFloat(item.temp);
              if (p > 15 || t > 130) item.status = 'Critical';
              else if (p > 9 || t > 115) item.status = 'Warning';
              else item.status = 'Stable';
            }
            newData.push(item);
          }
        }

        if (newData.length > 0) {
          setToast({ message: "Saving to Database...", type: 'info' });

          // 1. Skip Storage to avoid Paywall. Save directly to Database.

          // 2. Save Metadata to Firestore
          await addDoc(collection(db, "datasets"), {
            filename: file.name,
            url: null, // No downloadable URL
            parsedData: newData,
            createdAt: serverTimestamp(),
            summary: {
              total: newData.length,
              critical: newData.filter(i => i.status === 'Critical').length
            }
          });

          setEquipmentData(newData);
          setToast({ message: `Success! "${file.name}" saved to Database.`, type: 'success' });

          // Check for critical items
          const criticalCount = newData.filter(i => i.status === 'Critical').length;
          if (criticalCount > 0) {
            addLog(`System Update: ${criticalCount} critical items detected`, 'system');
          }
        } else {
          setToast({ message: "Failed to parse CSV: No valid rows found.", type: 'error' });
        }
      } catch (err) {
        console.error(err);
        setToast({ message: "Upload Failed: " + err.message, type: 'error' });
        alert("Upload Error: " + err.message); // Fallback
      }
    };
    reader.readAsText(file);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const criticalCount = equipmentData.filter(i => i.status === 'Critical').length;
  const avgPressure = (equipmentData.reduce((acc, curr) => acc + parseFloat(curr.pressure || 0), 0) / equipmentData.length || 0).toFixed(1);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Equipment"
                value={equipmentData.length}
                trend="+2% from last month"
                trendValue="+2%"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>}
                color="blue"
              />
              <StatCard
                title="Average Pressure"
                value={avgPressure}
                unit="PSI"
                trend="-1.5% deviation"
                trendValue="-1.5%"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                color="blue"
              />
              <StatCard
                title="Critical Alerts"
                value={criticalCount}
                trend={criticalCount > 0 ? "Requires Attention" : "All Clear"}
                trendValue={criticalCount > 0 ? "-10%" : "0%"}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
                color="red"
              />
            </div>

            <EquipmentTable searchTerm={searchTerm} data={equipmentData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">
              <div className="lg:col-span-2">
                <DashboardCharts data={equipmentData} />
              </div>
              <div>
                <ActivityLog logs={activityLogs} onRestore={handleRestore} />
              </div>
            </div>
          </>
        );
      case 'equipment':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Full Equipment Inventory</h2>
            <EquipmentTable searchTerm={searchTerm} data={equipmentData} />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
            <Analytics data={equipmentData} />
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">System Reports</h2>
            <Reports data={equipmentData} />
          </div>
        );
      default:
        return <div className="text-white">Page Under Construction</div>;
    }
  };

  const [showHistory, setShowHistory] = useState(false);

  const { logout } = useAuth();

  const handleTopBarAction = async (action) => {
    if (action === 'SHOW_HISTORY') {
      setShowHistory(true);
    } else if (action === 'LOGOUT') {
      try {
        await logout();
        // PrivateRoute will automatically redirect to /login
      } catch (err) {
        setToast({ message: "Failed to logout: " + err.message, type: 'error' });
      }
    } else {
      setToast({ message: action, type: 'info' });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#111315]">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onSearch={handleSearch} onUpload={handleUpload} onAction={handleTopBarAction} />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {renderContent()}
        </main>
      </div>

      {/* History Modal - Only Show if state is true */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#1a1d21] border border-gray-700 rounded-xl w-[500px] shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Upload History</h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {activityLogs.filter(l => l.data).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upload history found.</p>
              ) : (
                activityLogs.filter(l => l.data).map((log, idx) => (
                  <div key={idx} className="bg-black/30 p-4 rounded-lg flex justify-between items-center border border-gray-800 hover:border-gray-600 transition-colors">
                    <div>
                      <div className="text-white font-medium">Uploaded File</div>
                      <div className="text-xs text-gray-400">{log.time} • {log.data.length} records</div>
                    </div>
                    <button
                      onClick={() => {
                        handleRestore(log);
                        setShowHistory(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-sm font-medium transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="text-right">
              <button onClick={() => setShowHistory(false)} className="px-4 py-2 text-gray-300 hover:text-white transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
