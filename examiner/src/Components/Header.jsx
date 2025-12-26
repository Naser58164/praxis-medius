import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Activity, Wifi, WifiOff, Clock, Plus } from 'lucide-react';

function Header({ onCreateScenario, showCreateButton }) {
  const { connected, sessionId, simulationStatus, elapsedTime, participants } = useSocket();

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

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <Activity size={24} strokeWidth={2.5} />
          <span className="logo-text">PRAXIS MEDIUS</span>
        </div>
        <span className="header-divider" />
        <span className="header-subtitle">Examiner Control Panel</span>
      </div>

      <div className="header-center">
        {sessionId && (
          <div className="session-info">
            <div className="status-indicator" style={{ background: getStatusColor() }} />
            <span className="session-status">{simulationStatus}</span>
            {simulationStatus === 'RUNNING' && (
              <>
                <span className="header-divider" />
                <Clock size={14} />
                <span className="elapsed-time mono">{formatTime(elapsedTime)}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="header-right">
        {showCreateButton && onCreateScenario && (
          <button className="btn btn-primary btn-sm" onClick={onCreateScenario}>
            <Plus size={16} />
            Create Scenario
          </button>
        )}

        <div className="connection-status">
          {connected ? (
            <>
              <Wifi size={16} className="text-success" />
              <span className="text-success">Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-danger" />
              <span className="text-danger">Disconnected</span>
            </>
          )}
        </div>
        
        {sessionId && (
          <div className="participants-status">
            <div className={`participant-dot ${participants.examinee?.connected ? 'online' : 'offline'}`} 
                 title={participants.examinee?.connected ? 'Examinee Connected' : 'Examinee Disconnected'} />
            <span className="text-xs text-muted">Student</span>
            <div className={`participant-dot ${participants.manikin?.connected ? 'online' : 'offline'}`}
                 title={participants.manikin?.connected ? 'Manikin Connected' : 'Manikin Disconnected'} />
            <span className="text-xs text-muted">Manikin</span>
          </div>
        )}
      </div>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-muted);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--color-info);
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.05em;
        }

        .header-divider {
          width: 1px;
          height: 20px;
          background: var(--border-default);
        }

        .header-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .header-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .session-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-xs) var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-muted);
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .session-status {
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .elapsed-time {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.85rem;
        }

        .participants-status {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .participant-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .participant-dot.online {
          background: var(--color-success);
          box-shadow: 0 0 6px var(--color-success);
        }

        .participant-dot.offline {
          background: var(--text-muted);
        }

        .btn-sm {
          padding: var(--space-xs) var(--space-md);
          font-size: 0.85rem;
        }
      `}</style>
    </header>
  );
}

export default Header;
