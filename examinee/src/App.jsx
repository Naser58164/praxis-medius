import React, { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import JoinSession from './components/JoinSession';
import VitalsMonitor from './components/VitalsMonitor';
import PatientChart from './components/PatientChart';
import ActionMenu from './components/ActionMenu';
import LabResultsPanel from './components/LabResultsPanel';
import PatientCommunication from './components/PatientCommunication';
import ActionHistory from './components/ActionHistory';
import { 
  Activity, FileText, Hand, TestTube, Clock, 
  Wifi, WifiOff, MessageCircle, AlertTriangle, History
} from 'lucide-react';

function AppContent() {
  const { 
    connected, 
    sessionId, 
    simulationStatus, 
    elapsedTime, 
    patientMessages,
    connect 
  } = useSocket();
  
  const [activeTab, setActiveTab] = useState('vitals');
  const [showPatientMessage, setShowPatientMessage] = useState(false);
  const [latestMessage, setLatestMessage] = useState(null);

  useEffect(() => {
    connect();
  }, [connect]);

  // Show patient message notification
  useEffect(() => {
    if (patientMessages.length > 0 && patientMessages[0] !== latestMessage) {
      setLatestMessage(patientMessages[0]);
      setShowPatientMessage(true);
      setTimeout(() => setShowPatientMessage(false), 5000);
    }
  }, [patientMessages]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (simulationStatus) {
      case 'RUNNING': return 'var(--color-success)';
      case 'PAUSED': return 'var(--color-warning)';
      case 'COMPLETED': return 'var(--color-info)';
      default: return 'var(--text-muted)';
    }
  };

  const tabs = [
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'chart', label: 'Chart', icon: FileText },
    { id: 'actions', label: 'Actions', icon: Hand },
    { id: 'labs', label: 'Labs', icon: TestTube },
    { id: 'comm', label: 'Patient', icon: MessageCircle },
    { id: 'history', label: 'History', icon: History }
  ];

  // Not connected
  if (!connected) {
    return (
      <div className="app connecting">
        <div className="connecting-content">
          <div className="spinner" />
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  // Not in a session
  if (!sessionId) {
    return (
      <div className="app">
        <JoinSession />
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header safe-top">
        <div className="header-left">
          <div className={`connection-dot ${connected ? 'connected' : ''}`} />
          <span className="header-title">Praxis Medius</span>
        </div>

        <div className="header-center">
          {simulationStatus !== 'WAITING' && (
            <div className="status-badge" style={{ '--status-color': getStatusColor() }}>
              <div className="status-dot" />
              <span className="status-text">{simulationStatus}</span>
              {simulationStatus === 'RUNNING' && (
                <>
                  <span className="divider">|</span>
                  <Clock size={14} />
                  <span className="elapsed">{formatTime(elapsedTime)}</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="header-right">
          {connected ? (
            <Wifi size={18} className="text-success" />
          ) : (
            <WifiOff size={18} className="text-danger" />
          )}
        </div>
      </header>

      {/* Patient Message Toast */}
      {showPatientMessage && latestMessage && (
        <div className={`patient-message-toast ${latestMessage.mood}`}>
          <MessageCircle size={18} />
          <span>"{latestMessage.text}"</span>
        </div>
      )}

      {/* Waiting Screen */}
      {simulationStatus === 'WAITING' || simulationStatus === 'CREATED' ? (
        <div className="waiting-screen">
          <div className="waiting-content">
            <div className="waiting-icon pulse">
              <Activity size={48} />
            </div>
            <h2>Waiting for Simulation</h2>
            <p>The examiner will start the simulation shortly.</p>
            <p className="text-muted">Stay connected and be ready.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <main className="app-main">
            {activeTab === 'vitals' && <VitalsMonitor />}
            {activeTab === 'chart' && <PatientChart />}
            {activeTab === 'actions' && <ActionMenu />}
            {activeTab === 'labs' && <LabResultsPanel />}
            {activeTab === 'comm' && <PatientCommunication />}
            {activeTab === 'history' && <ActionHistory />}
          </main>

          {/* Bottom Navigation */}
          <nav className="bottom-nav safe-bottom">
            <div className="nav-items">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={22} />
                    <span className="nav-label">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </>
      )}

      {/* Simulation Complete Overlay */}
      {simulationStatus === 'COMPLETED' && (
        <div className="completion-overlay">
          <div className="completion-card">
            <div className="completion-icon">
              <Activity size={48} />
            </div>
            <h2>Simulation Complete</h2>
            <p>The simulation has ended. Your examiner will review your performance.</p>
          </div>
        </div>
      )}

      <style>{`
        .app {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .app.connecting {
          align-items: center;
          justify-content: center;
        }

        .connecting-content {
          text-align: center;
          color: var(--text-muted);
        }

        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-muted);
          min-height: 56px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .connection-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-danger);
        }

        .connection-dot.connected {
          background: var(--color-success);
        }

        .header-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--color-info);
        }

        .header-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 4px 12px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--status-color);
        }

        .status-text {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .divider {
          color: var(--border-default);
        }

        .elapsed {
          font-family: var(--font-mono);
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .patient-message-toast {
          position: fixed;
          top: 70px;
          left: var(--space-md);
          right: var(--space-md);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 200;
          animation: slideIn 0.3s ease;
        }

        .patient-message-toast.distressed {
          border-color: var(--color-danger);
          background: rgba(248, 81, 73, 0.1);
        }

        .patient-message-toast.calm {
          border-color: var(--color-success);
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .waiting-screen {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
        }

        .waiting-content {
          text-align: center;
        }

        .waiting-icon {
          width: 100px;
          height: 100px;
          margin: 0 auto var(--space-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border-radius: 50%;
          color: var(--color-info);
        }

        .waiting-content h2 {
          margin-bottom: var(--space-sm);
        }

        .waiting-content p {
          color: var(--text-secondary);
        }

        .app-main {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .bottom-nav {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-muted);
        }

        .nav-items {
          display: flex;
          justify-content: space-around;
          padding: var(--space-xs) 0;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: var(--space-sm) var(--space-xs);
          color: var(--text-muted);
          transition: color var(--transition-fast);
          min-width: 52px;
          flex: 1;
        }

        .nav-item.active {
          color: var(--color-info);
        }

        .nav-label {
          font-size: 0.7rem;
          font-weight: 500;
        }

        .completion-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          z-index: 300;
        }

        .completion-card {
          background: var(--bg-card);
          padding: var(--space-2xl);
          border-radius: var(--radius-xl);
          text-align: center;
          max-width: 400px;
        }

        .completion-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--space-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-info);
          border-radius: 50%;
          color: white;
        }

        .completion-card h2 {
          margin-bottom: var(--space-md);
        }

        .completion-card p {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;
