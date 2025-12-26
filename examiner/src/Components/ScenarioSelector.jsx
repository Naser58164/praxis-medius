import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  FileText, Clock, BarChart2, Tag, Users, Play, Plus, 
  Stethoscope, Heart, Brain, Pill, TestTube, AlertTriangle 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const categoryIcons = {
  'Respiratory': Stethoscope,
  'Cardiac': Heart,
  'Neurological': Brain,
  'Surgical': Pill,
  'Emergency': AlertTriangle,
  'General': TestTube
};

function ScenarioSelector() {
  const { joinSession } = useSocket();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await fetch(`${API_URL}/api/scenarios`);
      const data = await response.json();
      setScenarios(data);
    } catch (err) {
      setError('Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedScenario) return;
    
    setCreating(true);
    setError(null);

    try {
      // Create session via REST API
      const response = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.scenarioId,
          examiner: { odId: 'EXAMINER_001', odName: 'Instructor' }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Join via WebSocket
        await joinSession(data.sessionId);
      } else {
        setError(data.error || 'Failed to create session');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'var(--color-success)';
      case 'Intermediate': return 'var(--color-warning)';
      case 'Advanced': return 'var(--color-danger)';
      default: return 'var(--text-muted)';
    }
  };

  if (loading) {
    return (
      <div className="selector-loading">
        <div className="spinner" />
        <p>Loading scenarios...</p>
      </div>
    );
  }

  return (
    <div className="scenario-selector">
      <div className="selector-header">
        <div>
          <h1>Select Simulation Scenario</h1>
          <p className="text-muted">Choose a clinical case to begin the examination session</p>
        </div>
        <button className="btn btn-ghost">
          <Plus size={18} />
          Create New Scenario
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <div className="scenarios-grid">
        {scenarios.map((scenario, index) => {
          const CategoryIcon = categoryIcons[scenario.category] || FileText;
          const isSelected = selectedScenario?.scenarioId === scenario.scenarioId;
          
          return (
            <div 
              key={scenario.scenarioId}
              className={`scenario-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedScenario(scenario)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="scenario-card-header">
                <div className="scenario-category">
                  <CategoryIcon size={16} />
                  {scenario.category}
                </div>
                <div 
                  className="scenario-difficulty"
                  style={{ color: getDifficultyColor(scenario.difficulty) }}
                >
                  <BarChart2 size={14} />
                  {scenario.difficulty}
                </div>
              </div>

              <h3 className="scenario-title">{scenario.title}</h3>
              <p className="scenario-description">{scenario.description}</p>

              <div className="scenario-meta">
                <div className="meta-item">
                  <Clock size={14} />
                  {scenario.estimatedDuration} min
                </div>
                {scenario.tags?.length > 0 && (
                  <div className="meta-item">
                    <Tag size={14} />
                    {scenario.tags.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>

              <div className="scenario-select-indicator">
                {isSelected && <div className="check-mark">✓</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="selector-footer">
        <div className="selected-info">
          {selectedScenario ? (
            <>
              <FileText size={18} />
              <span>Selected: <strong>{selectedScenario.title}</strong></span>
            </>
          ) : (
            <span className="text-muted">No scenario selected</span>
          )}
        </div>
        <button 
          className="btn btn-primary btn-lg"
          disabled={!selectedScenario || creating}
          onClick={handleStartSession}
        >
          {creating ? (
            <>
              <div className="spinner" />
              Creating Session...
            </>
          ) : (
            <>
              <Play size={18} />
              Start Simulation
            </>
          )}
        </button>
      </div>

      <style>{`
        .scenario-selector {
          max-width: 1200px;
          margin: 0 auto;
        }

        .selector-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-md);
          height: 50vh;
          color: var(--text-secondary);
        }

        .selector-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-xl);
        }

        .selector-header h1 {
          margin-bottom: var(--space-xs);
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: rgba(248, 81, 73, 0.1);
          border: 1px solid var(--color-danger);
          border-radius: var(--radius-md);
          color: var(--color-danger);
          margin-bottom: var(--space-lg);
        }

        .scenarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
        }

        .scenario-card {
          position: relative;
          background: var(--bg-card);
          border: 2px solid var(--border-muted);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          animation: fadeIn var(--transition-base) ease-out both;
        }

        .scenario-card:hover {
          border-color: var(--border-default);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .scenario-card.selected {
          border-color: var(--color-info);
          background: rgba(88, 166, 255, 0.05);
          box-shadow: var(--shadow-glow);
        }

        .scenario-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-md);
        }

        .scenario-category {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .scenario-difficulty {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .scenario-title {
          font-size: 1.15rem;
          margin-bottom: var(--space-sm);
          color: var(--text-primary);
        }

        .scenario-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: var(--space-md);
        }

        .scenario-meta {
          display: flex;
          gap: var(--space-md);
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .scenario-select-indicator {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--border-default);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .scenario-card.selected .scenario-select-indicator {
          background: var(--color-info);
          border-color: var(--color-info);
        }

        .check-mark {
          color: white;
          font-size: 0.85rem;
          font-weight: bold;
        }

        .selector-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-muted);
        }

        .selected-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-secondary);
        }

        .selected-info strong {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

export default ScenarioSelector;
