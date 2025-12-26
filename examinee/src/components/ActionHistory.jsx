import React from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  Clock, CheckCircle, Star, Shield, MessageCircle, 
  Stethoscope, Hand, Pill, TestTube 
} from 'lucide-react';

const dimensionConfig = {
  SAFETY: { color: '#f0883e', icon: Shield },
  COMMUNICATION: { color: '#a371f7', icon: MessageCircle },
  ASSESSMENT: { color: '#58a6ff', icon: Stethoscope },
  INTERVENTION: { color: '#3fb950', icon: Hand },
  DRUG_IV: { color: '#f778ba', icon: Pill },
  TESTS_DIAGNOSTICS: { color: '#79c0ff', icon: TestTube }
};

function ActionHistory() {
  const { actionHistory, elapsedTime } = useSocket();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDimensionConfig = (dimension) => {
    return dimensionConfig[dimension] || { color: 'var(--text-muted)', icon: CheckCircle };
  };

  return (
    <div className="action-history">
      <div className="history-header">
        <h2>Action History</h2>
        <div className="action-count">
          <span className="count">{actionHistory.length}</span>
          <span className="label">actions performed</span>
        </div>
      </div>

      <div className="history-list">
        {actionHistory.length === 0 ? (
          <div className="no-actions">
            <Clock size={32} />
            <p>No actions performed yet</p>
            <p className="hint">Actions will appear here as you perform them</p>
          </div>
        ) : (
          actionHistory.map((action, index) => {
            const config = getDimensionConfig(action.dimension);
            const Icon = config.icon;

            return (
              <div 
                key={action.entryId || index}
                className={`action-entry ${action.isCriticalAction ? 'critical' : ''}`}
                style={{ '--dim-color': config.color }}
              >
                <div className="action-time">
                  <Clock size={12} />
                  <span>{formatTime(action.elapsedTime)}</span>
                </div>
                <div className="action-icon">
                  <Icon size={18} />
                </div>
                <div className="action-content">
                  <span className="action-label">
                    {action.actionLabel}
                    {action.isCriticalAction && (
                      <Star size={14} className="critical-star" />
                    )}
                  </span>
                  <span className="action-dimension">{action.dimension}</span>
                </div>
                <div className="action-status">
                  <CheckCircle size={18} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="dimension-legend">
        <span className="legend-title">Dimensions:</span>
        <div className="legend-items">
          {Object.entries(dimensionConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="legend-item" style={{ '--dim-color': config.color }}>
                <Icon size={12} />
                <span>{key.replace('_', ' ')}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .action-history {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md);
        }

        .history-header h2 {
          font-size: 1.25rem;
        }

        .action-count {
          display: flex;
          align-items: baseline;
          gap: var(--space-xs);
        }

        .action-count .count {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-info);
          font-family: var(--font-mono);
        }

        .action-count .label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .history-list {
          flex: 1;
          overflow: auto;
          padding: 0 var(--space-md);
        }

        .no-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          text-align: center;
          gap: var(--space-sm);
        }

        .no-actions .hint {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .action-entry {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-left: 3px solid var(--dim-color);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-sm);
        }

        .action-entry.critical {
          background: rgba(210, 153, 34, 0.08);
          border-color: var(--color-warning);
        }

        .action-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
          min-width: 50px;
        }

        .action-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--dim-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .action-content {
          flex: 1;
          min-width: 0;
        }

        .action-label {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .critical-star {
          color: var(--color-warning);
          fill: var(--color-warning);
        }

        .action-dimension {
          display: block;
          font-size: 0.75rem;
          color: var(--dim-color);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .action-status {
          color: var(--color-success);
        }

        .dimension-legend {
          padding: var(--space-md);
          border-top: 1px solid var(--border-muted);
          background: var(--bg-tertiary);
        }

        .legend-title {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: block;
          margin-bottom: var(--space-sm);
        }

        .legend-items {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          color: var(--dim-color);
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}

export default ActionHistory;
