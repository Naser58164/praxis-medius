import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, Calendar, Clock, User, Star,
  ChevronRight, Download, Trash2, Eye, BarChart2, Play,
  CheckCircle, XCircle, AlertTriangle, RefreshCw
} from 'lucide-react';

// Sample session history data
const sampleSessions = [
  {
    sessionId: 'SES-001',
    scenarioTitle: 'Severe Asthma Exacerbation',
    category: 'Respiratory',
    examineeName: 'John Smith',
    startedAt: '2024-12-12T09:30:00Z',
    endedAt: '2024-12-12T09:45:32Z',
    duration: 932,
    criticalScore: 83,
    completedActions: 5,
    totalActions: 6,
    status: 'COMPLETED'
  },
  {
    sessionId: 'SES-002',
    scenarioTitle: 'Acute MI - STEMI',
    category: 'Cardiac',
    examineeName: 'Sarah Johnson',
    startedAt: '2024-12-12T10:00:00Z',
    endedAt: '2024-12-12T10:22:15Z',
    duration: 1335,
    criticalScore: 100,
    completedActions: 8,
    totalActions: 8,
    status: 'COMPLETED'
  },
  {
    sessionId: 'SES-003',
    scenarioTitle: 'Stroke - CVA Assessment',
    category: 'Neurological',
    examineeName: 'Michael Chen',
    startedAt: '2024-12-11T14:15:00Z',
    endedAt: '2024-12-11T14:35:48Z',
    duration: 1248,
    criticalScore: 67,
    completedActions: 4,
    totalActions: 6,
    status: 'COMPLETED'
  },
  {
    sessionId: 'SES-004',
    scenarioTitle: 'Pediatric Respiratory Distress',
    category: 'Pediatric',
    examineeName: 'Emily Davis',
    startedAt: '2024-12-11T11:00:00Z',
    endedAt: null,
    duration: 0,
    criticalScore: 0,
    completedActions: 0,
    totalActions: 5,
    status: 'ABORTED'
  },
  {
    sessionId: 'SES-005',
    scenarioTitle: 'Anaphylaxis Response',
    category: 'Emergency',
    examineeName: 'David Wilson',
    startedAt: '2024-12-10T16:45:00Z',
    endedAt: '2024-12-10T16:58:23Z',
    duration: 803,
    criticalScore: 75,
    completedActions: 6,
    totalActions: 8,
    status: 'COMPLETED'
  }
];

function SessionHistoryPanel({ onViewSession, onReplaySession }) {
  const [sessions, setSessions] = useState(sampleSessions);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSession, setSelectedSession] = useState(null);

  const categories = ['all', ...new Set(sessions.map(s => s.category))];
  const statuses = ['all', 'COMPLETED', 'ABORTED'];

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#3fb950';
    if (score >= 60) return '#58a6ff';
    if (score >= 40) return '#d29922';
    return '#f85149';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { color: '#3fb950', bg: 'rgba(63, 185, 80, 0.15)', icon: CheckCircle };
      case 'ABORTED':
        return { color: '#f85149', bg: 'rgba(248, 81, 73, 0.15)', icon: XCircle };
      default:
        return { color: '#8b949e', bg: 'rgba(139, 148, 158, 0.15)', icon: AlertTriangle };
    }
  };

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(s => {
      const matchesSearch = !searchQuery || 
        s.scenarioTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.examineeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || s.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.startedAt) - new Date(b.startedAt);
          break;
        case 'score':
          comparison = a.criticalScore - b.criticalScore;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'student':
          comparison = a.examineeName.localeCompare(b.examineeName);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleDelete = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session record?')) {
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    }
  };

  const handleExport = (session) => {
    const exportData = {
      ...session,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
  };

  // Calculate statistics
  const stats = {
    totalSessions: sessions.length,
    completedSessions: sessions.filter(s => s.status === 'COMPLETED').length,
    avgScore: Math.round(
      sessions.filter(s => s.status === 'COMPLETED').reduce((a, s) => a + s.criticalScore, 0) /
      sessions.filter(s => s.status === 'COMPLETED').length
    ) || 0,
    avgDuration: Math.round(
      sessions.filter(s => s.duration > 0).reduce((a, s) => a + s.duration, 0) /
      sessions.filter(s => s.duration > 0).length
    ) || 0
  };

  return (
    <div className="session-history-panel">
      {/* Header */}
      <div className="history-header">
        <div className="header-title">
          <History size={24} />
          <h2>Session History</h2>
        </div>
        <button className="btn btn-ghost" onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{stats.totalSessions}</span>
          <span className="stat-label">Total Sessions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.completedSessions}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: getScoreColor(stats.avgScore) }}>
            {stats.avgScore}%
          </span>
          <span className="stat-label">Avg Score</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatDuration(stats.avgDuration)}</span>
          <span className="stat-label">Avg Duration</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by scenario or student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={16} />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <span className="sort-label">Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date</option>
            <option value="score">Score</option>
            <option value="duration">Duration</option>
            <option value="student">Student</option>
          </select>
          <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="sessions-list">
        {filteredSessions.length === 0 ? (
          <div className="empty-state">
            <History size={48} />
            <p>No sessions found</p>
          </div>
        ) : (
          filteredSessions.map(session => {
            const statusConfig = getStatusBadge(session.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div 
                key={session.sessionId} 
                className={`session-card ${selectedSession === session.sessionId ? 'selected' : ''}`}
                onClick={() => setSelectedSession(session.sessionId)}
              >
                <div className="session-main">
                  <div className="session-info">
                    <h4 className="scenario-title">{session.scenarioTitle}</h4>
                    <div className="session-meta">
                      <span className="category-tag">{session.category}</span>
                      <span className="meta-item">
                        <User size={12} />
                        {session.examineeName}
                      </span>
                      <span className="meta-item">
                        <Calendar size={12} />
                        {formatDate(session.startedAt)}
                      </span>
                      <span className="meta-item">
                        <Clock size={12} />
                        {formatTime(session.startedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="session-stats">
                    <div className="score-display">
                      <span 
                        className="score-value"
                        style={{ color: getScoreColor(session.criticalScore) }}
                      >
                        {session.criticalScore}%
                      </span>
                      <span className="score-detail">
                        <Star size={12} />
                        {session.completedActions}/{session.totalActions}
                      </span>
                    </div>
                    <div className="duration-display">
                      <Clock size={14} />
                      {formatDuration(session.duration)}
                    </div>
                    <div 
                      className="status-badge"
                      style={{ background: statusConfig.bg, color: statusConfig.color }}
                    >
                      <StatusIcon size={12} />
                      {session.status}
                    </div>
                  </div>
                </div>

                <div className="session-actions">
                  <button 
                    className="action-btn view"
                    onClick={(e) => { e.stopPropagation(); onViewSession?.(session); }}
                    title="View Results"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-btn replay"
                    onClick={(e) => { e.stopPropagation(); onReplaySession?.(session); }}
                    title="Replay Session"
                  >
                    <Play size={16} />
                  </button>
                  <button 
                    className="action-btn export"
                    onClick={(e) => { e.stopPropagation(); handleExport(session); }}
                    title="Export"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(session.sessionId); }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .session-history-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          height: 100%;
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .header-title h2 {
          margin: 0;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-md);
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-muted);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: var(--font-mono);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .filters-bar {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          flex-wrap: wrap;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex: 1;
          min-width: 200px;
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
        }

        .search-box input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          outline: none;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .filter-group select {
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
        }

        .sort-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .sort-order-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          cursor: pointer;
        }

        .sessions-list {
          flex: 1;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-2xl);
          color: var(--text-muted);
        }

        .session-card {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .session-card:hover {
          border-color: var(--border-default);
          background: var(--bg-elevated);
        }

        .session-card.selected {
          border-color: var(--color-info);
          background: rgba(88, 166, 255, 0.05);
        }

        .session-main {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .session-info {
          flex: 1;
        }

        .scenario-title {
          margin: 0 0 var(--space-xs) 0;
          font-size: 1rem;
        }

        .session-meta {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .category-tag {
          font-size: 0.75rem;
          padding: 2px 8px;
          background: var(--bg-elevated);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .session-stats {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .score-display {
          text-align: center;
        }

        .score-display .score-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          font-family: var(--font-mono);
        }

        .score-detail {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--color-warning);
        }

        .duration-display {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .session-actions {
          display: flex;
          gap: var(--space-xs);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .session-card:hover .session-actions {
          opacity: 1;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn:hover {
          background: var(--bg-elevated);
        }

        .action-btn.view:hover {
          color: var(--color-info);
          border-color: var(--color-info);
        }

        .action-btn.replay:hover {
          color: var(--color-success);
          border-color: var(--color-success);
        }

        .action-btn.export:hover {
          color: var(--color-warning);
          border-color: var(--color-warning);
        }

        .action-btn.delete:hover {
          color: var(--color-danger);
          border-color: var(--color-danger);
        }
      `}</style>
    </div>
  );
}

export default SessionHistoryPanel;
