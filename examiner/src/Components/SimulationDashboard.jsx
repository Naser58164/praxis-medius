import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  ArrowLeft, Play, Pause, Square, AlertCircle,
  User, Activity, ClipboardList, Stethoscope, MessageCircle, TestTube
} from 'lucide-react';
import VitalsControlPanel from './VitalsControlPanel';
import PatientInfoPanel from './PatientInfoPanel';
import ActionLogPanel from './ActionLogPanel';
import FindingsControlPanel from './FindingsControlPanel';
import PatientVoicePanel from './PatientVoicePanel';
import LabsOrdersPanel from './LabsOrdersPanel';

function SimulationDashboard({ onBack }) {
  const {
    sessionData,
    simulationStatus,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    endSimulation,
    participants
  } = useSocket();

  const [activeTab, setActiveTab] = useState('vitals');
  const [endConfirm, setEndConfirm] = useState(false);

  const handleStart = async () => {
    try {
      await startSimulation();
    } catch (err) {
      console.error('Failed to start:', err);
    }
  };

  const handlePauseResume = async () => {
    try {
      if (simulationStatus === 'RUNNING') {
        await pauseSimulation();
      } else if (simulationStatus === 'PAUSED') {
        await resumeSimulation();
      }
    } catch (err) {
      console.error('Failed to pause/resume:', err);
    }
  };

  const handleEnd = async () => {
    if (!endConfirm) {
      setEndConfirm(true);
      setTimeout(() => setEndConfirm(false), 3000);
      return;
    }
    
    try {
      await endSimulation('COMPLETED');
    } catch (err) {
      console.error('Failed to end:', err);
    }
  };

  const tabs = [
    { id: 'vitals', label: 'Vitals Control', icon: Activity },
    { id: 'findings', label: 'Physical Findings', icon: Stethoscope },
    { id: 'voice', label: 'Patient Voice', icon: MessageCircle },
    { id: 'labs', label: 'Labs & Orders', icon: TestTube }
  ];

  return (
    <div className="simulation-dashboard">
      {/* Top Bar */}
      <div className="dashboard-topbar">
        <button className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to Scenarios
        </button>

        <div className="scenario-title-bar">
          <h2>{sessionData?.scenario?.title || 'Simulation'}</h2>
          <span className="scenario-category">{sessionData?.scenario?.category}</span>
        </div>

        <div className="simulation-controls">
          {simulationStatus === 'CREATED' && (
            <button 
              className="btn btn-success btn-lg"
              onClick={handleStart}
              disabled={!participants.examinee?.connected}
            >
              <Play size={18} />
              Start Simulation
            </button>
          )}

          {(simulationStatus === 'RUNNING' || simulationStatus === 'PAUSED') && (
            <>
              <button 
                className={`btn ${simulationStatus === 'PAUSED' ? 'btn-success' : 'btn-warning'}`}
                onClick={handlePauseResume}
              >
                {simulationStatus === 'PAUSED' ? <Play size={18} /> : <Pause size={18} />}
                {simulationStatus === 'PAUSED' ? 'Resume' : 'Pause'}
              </button>
              <button 
                className={`btn ${endConfirm ? 'btn-danger' : 'btn-ghost'}`}
                onClick={handleEnd}
              >
                <Square size={18} />
                {endConfirm ? 'Confirm End?' : 'End'}
              </button>
            </>
          )}

          {simulationStatus === 'COMPLETED' && (
            <div className="completion-badge">
              <AlertCircle size={18} />
              Simulation Complete
            </div>
          )}
        </div>
      </div>

      {/* Waiting Screen */}
      {simulationStatus === 'CREATED' && (
        <div className="waiting-screen">
          <div className="waiting-content">
            <div className="waiting-icon">
              <User size={48} />
            </div>
            <h3>Waiting for Participants</h3>
            <p className="text-muted">The simulation will begin when you click Start</p>
            
            <div className="participant-checklist">
              <div className={`checklist-item ${participants.examiner?.connected ? 'connected' : ''}`}>
                <div className="checklist-status" />
                <span>Examiner (You)</span>
              </div>
              <div className={`checklist-item ${participants.examinee?.connected ? 'connected' : ''}`}>
                <div className="checklist-status" />
                <span>Examinee (Student)</span>
              </div>
              <div className={`checklist-item ${participants.manikin?.connected ? 'connected' : ''}`}>
                <div className="checklist-status" />
                <span>Manikin Gateway (Optional)</span>
              </div>
            </div>

            {!participants.examinee?.connected && (
              <div className="share-info">
                <p className="text-sm text-muted">Share the session link with your student to join</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      {(simulationStatus === 'RUNNING' || simulationStatus === 'PAUSED' || simulationStatus === 'COMPLETED') && (
        <div className="dashboard-main">
          {/* Left Panel - Patient Info & Action Log */}
          <div className="dashboard-left">
            <PatientInfoPanel patient={sessionData?.patient} />
            <ActionLogPanel />
          </div>

          {/* Right Panel - Control Tabs */}
          <div className="dashboard-right">
            <div className="control-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`control-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="control-content">
              {activeTab === 'vitals' && <VitalsControlPanel />}
              {activeTab === 'findings' && <FindingsControlPanel />}
              {activeTab === 'voice' && <PatientVoicePanel />}
              {activeTab === 'labs' && <LabsOrdersPanel />}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .simulation-dashboard {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          height: calc(100vh - 120px);
        }

        .dashboard-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-muted);
        }

        .scenario-title-bar {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .scenario-title-bar h2 {
          font-size: 1.1rem;
        }

        .scenario-category {
          font-size: 0.8rem;
          color: var(--text-muted);
          padding: 2px 8px;
          background: var(--bg-elevated);
          border-radius: var(--radius-sm);
        }

        .simulation-controls {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .completion-badge {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--color-info);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
        }

        .waiting-screen {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .waiting-content {
          text-align: center;
          padding: var(--space-2xl);
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-muted);
          max-width: 500px;
        }

        .waiting-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-lg);
          color: var(--color-info);
        }

        .waiting-content h3 {
          margin-bottom: var(--space-sm);
        }

        .participant-checklist {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          margin-top: var(--space-lg);
          text-align: left;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .checklist-status {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--text-muted);
        }

        .checklist-item.connected .checklist-status {
          background: var(--color-success);
          box-shadow: 0 0 8px var(--color-success);
        }

        .share-info {
          margin-top: var(--space-lg);
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border-muted);
        }

        .dashboard-main {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: var(--space-lg);
          flex: 1;
          min-height: 0;
        }

        .dashboard-left {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          overflow: hidden;
        }

        .dashboard-right {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-muted);
        }

        .control-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-muted);
          background: var(--bg-tertiary);
        }

        .control-tab {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          transition: all var(--transition-fast);
        }

        .control-tab:hover {
          color: var(--text-primary);
          background: var(--bg-elevated);
        }

        .control-tab.active {
          color: var(--color-info);
          border-bottom-color: var(--color-info);
          background: var(--bg-card);
        }

        .control-content {
          flex: 1;
          overflow: auto;
          padding: var(--space-lg);
        }
      `}</style>
    </div>
  );
}

export default SimulationDashboard;
