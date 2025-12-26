import React, { useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  ClipboardList, Star, Check, X, Clock,
  Shield, MessageCircle, Stethoscope, Hand, Pill, TestTube
} from 'lucide-react';

const dimensionConfig = {
  SAFETY: { icon: Shield, color: 'safety', label: 'Safety' },
  COMMUNICATION: { icon: MessageCircle, color: 'communication', label: 'Communication' },
  ASSESSMENT: { icon: Stethoscope, color: 'assessment', label: 'Assessment' },
  INTERVENTION: { icon: Hand, color: 'intervention', label: 'Intervention' },
  DRUG_IV: { icon: Pill, color: 'drug-iv', label: 'Drug & IV' },
  TESTS_DIAGNOSTICS: { icon: TestTube, color: 'tests', label: 'Tests' }
};

function ActionLogPanel() {
  const { actionLog, sessionData } = useSocket();
  const logEndRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const criticalActions = sessionData?.scenario?.criticalActions || [];
  const completedCritical = actionLog.filter(a => a.isCriticalAction).length;

  return (
    <div className="action-log-panel card">
      <div className="card-header">
        <div className="card-title">
          <ClipboardList size={16} />
          Action Log
        </div>
        <div className="critical-counter">
          <Star size={14} className="critical-star" />
          <span>{completedCritical}/{criticalActions.length}</span>
        </div>
      </div>

      <div className="action-log-content">
        {actionLog.length === 0 ? (
          <div className="empty-log">
            <p className="text-muted">Waiting for student actions...</p>
          </div>
        ) : (
          <div className="action-list">
            {actionLog.map((action, index) => {
              const dimConfig = dimensionConfig[action.dimension] || dimensionConfig.SAFETY;
              const DimIcon = dimConfig.icon;

              return (
                <div 
                  key={action.entryId || index} 
                  className={`action-item ${action.isCriticalAction ? 'critical' : ''} ${!action.success ? 'failed' : ''}`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="action-time">
                    <Clock size={12} />
                    <span className="mono">{formatTime(action.elapsedTime)}</span>
                  </div>

                  <div className={`action-dimension-icon dimension-badge ${dimConfig.color}`}>
                    <DimIcon size={14} />
                  </div>

                  <div className="action-content">
                    <div className="action-header">
                      <span className="action-label">{action.actionLabel}</span>
                      {action.isCriticalAction && (
                        <Star size={14} className="critical-star" fill="currentColor" />
                      )}
                    </div>
                    
                    {action.result && (
                      <div className="action-result">
                        {typeof action.result === 'object' 
                          ? JSON.stringify(action.result).slice(0, 50) + '...'
                          : action.result
                        }
                      </div>
                    )}

                    {action.drugName && (
                      <div className="action-drug">
                        {action.drugName} {action.dosage}
                      </div>
                    )}
                  </div>

                  <div className={`action-status ${action.success ? 'success' : 'failed'}`}>
                    {action.success ? <Check size={16} /> : <X size={16} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={logEndRef} />
      </div>

      <style>{`
        .action-log-panel {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .critical-counter {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--color-warning);
        }

        .action-log-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-sm);
        }

        .empty-log {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 150px;
        }

        .action-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .action-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border-left: 3px solid transparent;
          animation: slideIn var(--transition-fast) ease-out both;
        }

        .action-item.critical {
          border-left-color: var(--color-warning);
          background: rgba(210, 153, 34, 0.05);
        }

        .action-item.failed {
          border-left-color: var(--color-danger);
          background: rgba(248, 81, 73, 0.05);
        }

        .action-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
          min-width: 50px;
        }

        .action-dimension-icon {
          padding: 4px;
          border-radius: var(--radius-sm);
        }

        .action-content {
          flex: 1;
          min-width: 0;
        }

        .action-header {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .action-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .action-result {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          margin-top: 2px;
        }

        .action-drug {
          font-size: 0.8rem;
          color: var(--color-drug-iv);
          margin-top: 2px;
        }

        .action-status {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-status.success {
          background: rgba(63, 185, 80, 0.2);
          color: var(--color-success);
        }

        .action-status.failed {
          background: rgba(248, 81, 73, 0.2);
          color: var(--color-danger);
        }
      `}</style>
    </div>
  );
}

export default ActionLogPanel;
