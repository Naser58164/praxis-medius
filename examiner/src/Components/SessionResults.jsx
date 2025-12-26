import React, { useState, useEffect } from 'react';
import { 
  Trophy, Clock, Star, CheckCircle, XCircle, AlertTriangle,
  Download, Share2, ChevronDown, ChevronRight, BarChart2,
  Activity, User, FileText, Printer, RefreshCw
} from 'lucide-react';

const dimensionLabels = {
  SAFETY: 'Safety',
  COMMUNICATION: 'Communication',
  ASSESSMENT: 'Assessment',
  INTERVENTION: 'Intervention',
  DRUG_IV: 'Drug & IV',
  TESTS_DIAGNOSTICS: 'Tests & Diagnostics'
};

const dimensionColors = {
  SAFETY: '#f0883e',
  COMMUNICATION: '#a371f7',
  ASSESSMENT: '#58a6ff',
  INTERVENTION: '#3fb950',
  DRUG_IV: '#f778ba',
  TESTS_DIAGNOSTICS: '#79c0ff'
};

function SessionResults({ session, onClose, onRestart }) {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    timeline: true,
    criticalActions: true,
    dimensions: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate scores and metrics
  const actionLog = session?.actionLog || [];
  const criticalActions = session?.scenario?.criticalActions || [];
  const completedCritical = actionLog.filter(a => a.isCriticalAction && a.success).length;
  const totalCritical = criticalActions.length;
  const criticalScore = totalCritical > 0 ? Math.round((completedCritical / totalCritical) * 100) : 0;

  // Group actions by dimension
  const dimensionStats = {};
  actionLog.forEach(action => {
    const dim = action.dimension || 'SAFETY';
    if (!dimensionStats[dim]) {
      dimensionStats[dim] = { total: 0, successful: 0, critical: 0 };
    }
    dimensionStats[dim].total++;
    if (action.success) dimensionStats[dim].successful++;
    if (action.isCriticalAction) dimensionStats[dim].critical++;
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString();
  };

  // Determine overall performance level
  let performanceLevel = 'Needs Improvement';
  let performanceColor = '#f85149';
  if (criticalScore >= 90) {
    performanceLevel = 'Excellent';
    performanceColor = '#3fb950';
  } else if (criticalScore >= 70) {
    performanceLevel = 'Good';
    performanceColor = '#58a6ff';
  } else if (criticalScore >= 50) {
    performanceLevel = 'Satisfactory';
    performanceColor = '#d29922';
  }

  const handleExport = () => {
    // Create export data
    const exportData = {
      scenario: session.scenario?.title,
      student: session.examineeId || 'Anonymous',
      date: session.startedAt,
      duration: session.elapsedTime,
      criticalScore,
      completedCritical,
      totalCritical,
      actionLog: actionLog.map(a => ({
        time: a.elapsedTime,
        action: a.actionLabel,
        dimension: a.dimension,
        success: a.success,
        critical: a.isCriticalAction
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-results-${session.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="session-results">
      {/* Header */}
      <div className="results-header">
        <div className="header-info">
          <h2>Simulation Results</h2>
          <p className="scenario-name">{session?.scenario?.title || 'Untitled Scenario'}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
          <button className="btn btn-ghost" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          {onRestart && (
            <button className="btn btn-primary" onClick={onRestart}>
              <RefreshCw size={16} /> Run Again
            </button>
          )}
        </div>
      </div>

      <div className="results-content">
        {/* Score Card */}
        <div className="score-card">
          <div className="score-main">
            <div className="score-circle" style={{ '--score-color': performanceColor }}>
              <span className="score-value">{criticalScore}%</span>
              <span className="score-label">Critical Actions</span>
            </div>
            <div className="score-details">
              <div className="performance-badge" style={{ background: performanceColor }}>
                <Trophy size={16} />
                {performanceLevel}
              </div>
              <div className="score-stats">
                <div className="stat">
                  <CheckCircle size={16} className="success" />
                  <span>{completedCritical} of {totalCritical} critical actions completed</span>
                </div>
                <div className="stat">
                  <Clock size={16} />
                  <span>Duration: {formatTime(session?.elapsedTime || 0)}</span>
                </div>
                <div className="stat">
                  <Activity size={16} />
                  <span>Total actions: {actionLog.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="results-section">
          <button className="section-header" onClick={() => toggleSection('overview')}>
            <div className="section-title">
              <FileText size={18} />
              <span>Session Overview</span>
            </div>
            {expandedSections.overview ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {expandedSections.overview && (
            <div className="section-content">
              <div className="overview-grid">
                <div className="overview-item">
                  <label>Scenario</label>
                  <span>{session?.scenario?.title}</span>
                </div>
                <div className="overview-item">
                  <label>Category</label>
                  <span>{session?.scenario?.category}</span>
                </div>
                <div className="overview-item">
                  <label>Difficulty</label>
                  <span>{session?.scenario?.difficulty}</span>
                </div>
                <div className="overview-item">
                  <label>Started</label>
                  <span>{formatDateTime(session?.startedAt)}</span>
                </div>
                <div className="overview-item">
                  <label>Completed</label>
                  <span>{formatDateTime(session?.endedAt)}</span>
                </div>
                <div className="overview-item">
                  <label>Duration</label>
                  <span>{formatTime(session?.elapsedTime || 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Critical Actions Section */}
        <div className="results-section">
          <button className="section-header" onClick={() => toggleSection('criticalActions')}>
            <div className="section-title">
              <Star size={18} />
              <span>Critical Actions ({completedCritical}/{totalCritical})</span>
            </div>
            {expandedSections.criticalActions ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {expandedSections.criticalActions && (
            <div className="section-content">
              <div className="critical-list">
                {criticalActions.map((ca, index) => {
                  const completed = actionLog.find(a => a.isCriticalAction && a.actionId === ca.actionId && a.success);
                  return (
                    <div key={ca.id || index} className={`critical-item ${completed ? 'completed' : 'missed'}`}>
                      <div className="critical-status">
                        {completed ? (
                          <CheckCircle size={20} className="success" />
                        ) : (
                          <XCircle size={20} className="danger" />
                        )}
                      </div>
                      <div className="critical-info">
                        <span className="critical-label">{ca.label}</span>
                        <span className="critical-dimension" style={{ color: dimensionColors[ca.dimension] }}>
                          {dimensionLabels[ca.dimension]}
                        </span>
                      </div>
                      <div className="critical-time">
                        {completed ? (
                          <span className="time-value">{formatTime(completed.elapsedTime)}</span>
                        ) : (
                          <span className="missed-label">Not completed</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div className="results-section">
          <button className="section-header" onClick={() => toggleSection('timeline')}>
            <div className="section-title">
              <Clock size={18} />
              <span>Action Timeline ({actionLog.length} actions)</span>
            </div>
            {expandedSections.timeline ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {expandedSections.timeline && (
            <div className="section-content">
              <div className="timeline">
                {actionLog.map((action, index) => (
                  <div key={action.entryId || index} className="timeline-item">
                    <div className="timeline-time">
                      {formatTime(action.elapsedTime)}
                    </div>
                    <div className="timeline-marker">
                      <div 
                        className={`marker-dot ${action.success ? 'success' : 'failed'}`}
                        style={{ borderColor: dimensionColors[action.dimension] }}
                      />
                      {index < actionLog.length - 1 && <div className="marker-line" />}
                    </div>
                    <div className={`timeline-content ${action.isCriticalAction ? 'critical' : ''}`}>
                      <div className="action-label">
                        {action.actionLabel}
                        {action.isCriticalAction && <Star size={12} className="critical-star" />}
                      </div>
                      <div className="action-meta">
                        <span 
                          className="dimension-tag"
                          style={{ background: `${dimensionColors[action.dimension]}20`, color: dimensionColors[action.dimension] }}
                        >
                          {dimensionLabels[action.dimension]}
                        </span>
                        {action.result && <span className="result-preview">{action.result}</span>}
                      </div>
                    </div>
                    <div className="timeline-status">
                      {action.success ? (
                        <CheckCircle size={16} className="success" />
                      ) : (
                        <XCircle size={16} className="danger" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dimension Breakdown Section */}
        <div className="results-section">
          <button className="section-header" onClick={() => toggleSection('dimensions')}>
            <div className="section-title">
              <BarChart2 size={18} />
              <span>Performance by Dimension</span>
            </div>
            {expandedSections.dimensions ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {expandedSections.dimensions && (
            <div className="section-content">
              <div className="dimension-breakdown">
                {Object.entries(dimensionStats).map(([dim, stats]) => (
                  <div key={dim} className="dimension-row">
                    <div className="dimension-label" style={{ color: dimensionColors[dim] }}>
                      {dimensionLabels[dim]}
                    </div>
                    <div className="dimension-bar-container">
                      <div 
                        className="dimension-bar"
                        style={{ 
                          width: `${(stats.successful / stats.total) * 100}%`,
                          background: dimensionColors[dim]
                        }}
                      />
                    </div>
                    <div className="dimension-stats">
                      <span>{stats.successful}/{stats.total}</span>
                      {stats.critical > 0 && (
                        <span className="critical-count">
                          <Star size={12} /> {stats.critical}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="results-footer">
        <button className="btn btn-ghost" onClick={onClose}>
          Close Results
        </button>
      </div>

      <style>{`
        .session-results {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-primary);
        }

        .results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg);
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-muted);
        }

        .results-header h2 {
          margin-bottom: var(--space-xs);
        }

        .scenario-name {
          color: var(--text-muted);
        }

        .header-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .results-content {
          flex: 1;
          overflow: auto;
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .score-card {
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
        }

        .score-main {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
        }

        .score-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: conic-gradient(
            var(--score-color) calc(var(--score-value, 0) * 1%),
            var(--bg-tertiary) 0
          );
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          --score-value: ${criticalScore};
        }

        .score-circle::before {
          content: '';
          position: absolute;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: var(--bg-card);
        }

        .score-value {
          position: relative;
          font-size: 2rem;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--score-color);
        }

        .score-label {
          position: relative;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .score-details {
          flex: 1;
        }

        .performance-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-md);
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: var(--space-md);
        }

        .score-stats {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .stat {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-secondary);
        }

        .stat .success { color: var(--color-success); }

        .results-section {
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .section-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 500;
          border: none;
          cursor: pointer;
        }

        .section-header:hover {
          background: var(--bg-elevated);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .section-content {
          padding: var(--space-lg);
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-md);
        }

        .overview-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .overview-item label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .overview-item span {
          font-weight: 500;
        }

        .critical-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .critical-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border-left: 3px solid transparent;
        }

        .critical-item.completed {
          border-left-color: var(--color-success);
        }

        .critical-item.missed {
          border-left-color: var(--color-danger);
          opacity: 0.8;
        }

        .critical-status .success { color: var(--color-success); }
        .critical-status .danger { color: var(--color-danger); }

        .critical-info {
          flex: 1;
        }

        .critical-label {
          display: block;
          font-weight: 500;
        }

        .critical-dimension {
          font-size: 0.8rem;
        }

        .critical-time {
          font-family: var(--font-mono);
        }

        .missed-label {
          color: var(--color-danger);
          font-size: 0.85rem;
        }

        .timeline {
          display: flex;
          flex-direction: column;
        }

        .timeline-item {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-sm) 0;
        }

        .timeline-time {
          width: 50px;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: right;
        }

        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 20px;
        }

        .marker-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid;
          background: var(--bg-card);
        }

        .marker-dot.success { background: var(--color-success); border-color: var(--color-success); }
        .marker-dot.failed { background: var(--color-danger); border-color: var(--color-danger); }

        .marker-line {
          flex: 1;
          width: 2px;
          background: var(--border-muted);
          margin: 4px 0;
        }

        .timeline-content {
          flex: 1;
          padding: var(--space-sm);
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
        }

        .timeline-content.critical {
          border: 1px solid var(--color-warning);
          background: rgba(210, 153, 34, 0.05);
        }

        .action-label {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-weight: 500;
          margin-bottom: 4px;
        }

        .critical-star {
          color: var(--color-warning);
        }

        .action-meta {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .dimension-tag {
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }

        .result-preview {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .timeline-status {
          display: flex;
          align-items: flex-start;
          padding-top: var(--space-sm);
        }

        .timeline-status .success { color: var(--color-success); }
        .timeline-status .danger { color: var(--color-danger); }

        .dimension-breakdown {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .dimension-row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .dimension-label {
          width: 140px;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .dimension-bar-container {
          flex: 1;
          height: 24px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .dimension-bar {
          height: 100%;
          border-radius: var(--radius-md);
          transition: width 0.5s ease;
        }

        .dimension-stats {
          width: 80px;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-family: var(--font-mono);
          font-size: 0.85rem;
        }

        .critical-count {
          display: flex;
          align-items: center;
          gap: 2px;
          color: var(--color-warning);
        }

        .results-footer {
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-card);
          border-top: 1px solid var(--border-muted);
          display: flex;
          justify-content: flex-end;
        }

        @media print {
          .results-header .header-actions,
          .results-footer {
            display: none;
          }
          
          .section-header {
            pointer-events: none;
          }
          
          .results-content {
            overflow: visible;
          }
        }
      `}</style>
    </div>
  );
}

export default SessionResults;
