import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Activity, LogIn, AlertCircle, Loader } from 'lucide-react';

function JoinSession() {
  const { joinSession } = useSocket();
  const [sessionCode, setSessionCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!sessionCode.trim()) {
      setError('Please enter a session code');
      return;
    }

    setJoining(true);
    setError(null);

    try {
      await joinSession(sessionCode.trim().toUpperCase());
    } catch (err) {
      setError(err.message || 'Failed to join session');
      setJoining(false);
    }
  };

  return (
    <div className="join-session">
      <div className="join-card">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">
            <Activity size={40} strokeWidth={2.5} />
          </div>
          <h1>PRAXIS MEDIUS</h1>
          <p className="subtitle">Medical Simulation Platform</p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleJoin} className="join-form">
          <div className="form-group">
            <label htmlFor="sessionCode">Enter Session Code</label>
            <input
              id="sessionCode"
              type="text"
              placeholder="e.g., ASTHMA-001"
              value={sessionCode}
              onChange={(e) => {
                setSessionCode(e.target.value.toUpperCase());
                setError(null);
              }}
              autoComplete="off"
              autoCapitalize="characters"
              disabled={joining}
            />
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-full"
            disabled={joining || !sessionCode.trim()}
          >
            {joining ? (
              <>
                <Loader size={20} className="spinner-icon" />
                Joining...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Join Simulation
              </>
            )}
          </button>
        </form>

        {/* Instructions */}
        <div className="instructions">
          <p>Enter the session code provided by your instructor to join the simulation.</p>
        </div>
      </div>

      <style>{`
        .join-session {
          min-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          padding-top: calc(var(--space-lg) + var(--safe-area-top));
          padding-bottom: calc(var(--space-lg) + var(--safe-area-bottom));
        }

        .join-card {
          width: 100%;
          max-width: 400px;
          padding: var(--space-xl);
        }

        .logo {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .logo-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--space-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-info), #3fb950);
          border-radius: var(--radius-xl);
          color: white;
        }

        .logo h1 {
          font-size: 1.5rem;
          letter-spacing: 0.1em;
          color: var(--color-info);
          margin-bottom: var(--space-xs);
        }

        .logo .subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .join-form {
          background: var(--bg-card);
          padding: var(--space-lg);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-muted);
          margin-bottom: var(--space-lg);
        }

        .form-group {
          margin-bottom: var(--space-md);
        }

        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: var(--space-sm);
        }

        .form-group input {
          width: 100%;
          font-size: 1.25rem;
          font-family: var(--font-mono);
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: rgba(248, 81, 73, 0.15);
          border-radius: var(--radius-md);
          color: var(--color-danger);
          font-size: 0.9rem;
          margin-bottom: var(--space-md);
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
        }

        .instructions {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default JoinSession;
