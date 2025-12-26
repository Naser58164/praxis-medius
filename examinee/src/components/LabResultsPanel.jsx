import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  TestTube, Beaker, Droplets, Activity, Microscope, Image,
  ChevronDown, ChevronRight, Lock, Unlock, Clock, AlertCircle
} from 'lucide-react';

const labCategories = {
  HEMATOLOGY: {
    label: 'Hematology',
    icon: Droplets,
    color: '#f85149',
    tests: {
      cbc: {
        name: 'Complete Blood Count (CBC)',
        components: [
          { id: 'wbc', name: 'WBC', unit: 'x10³/µL', normalRange: '4.5-11.0' },
          { id: 'rbc', name: 'RBC', unit: 'x10⁶/µL', normalRange: '4.5-5.5' },
          { id: 'hemoglobin', name: 'Hemoglobin', unit: 'g/dL', normalRange: '12.0-16.0' },
          { id: 'hematocrit', name: 'Hematocrit', unit: '%', normalRange: '36-46' },
          { id: 'platelets', name: 'Platelets', unit: 'x10³/µL', normalRange: '150-400' },
        ]
      },
      coagulation: {
        name: 'Coagulation Panel',
        components: [
          { id: 'pt', name: 'PT', unit: 'seconds', normalRange: '11-13.5' },
          { id: 'inr', name: 'INR', unit: '', normalRange: '0.8-1.2' },
          { id: 'ptt', name: 'PTT', unit: 'seconds', normalRange: '25-35' },
        ]
      }
    }
  },
  CHEMISTRY: {
    label: 'Chemistry',
    icon: Beaker,
    color: '#58a6ff',
    tests: {
      bmp: {
        name: 'Basic Metabolic Panel (BMP)',
        components: [
          { id: 'sodium', name: 'Sodium', unit: 'mEq/L', normalRange: '136-145' },
          { id: 'potassium', name: 'Potassium', unit: 'mEq/L', normalRange: '3.5-5.0' },
          { id: 'chloride', name: 'Chloride', unit: 'mEq/L', normalRange: '98-106' },
          { id: 'co2', name: 'CO2', unit: 'mEq/L', normalRange: '23-29' },
          { id: 'bun', name: 'BUN', unit: 'mg/dL', normalRange: '7-20' },
          { id: 'creatinine', name: 'Creatinine', unit: 'mg/dL', normalRange: '0.7-1.3' },
          { id: 'glucose', name: 'Glucose', unit: 'mg/dL', normalRange: '70-100' },
        ]
      },
      cardiac: {
        name: 'Cardiac Markers',
        components: [
          { id: 'troponin', name: 'Troponin I', unit: 'ng/mL', normalRange: '<0.04' },
          { id: 'bnp', name: 'BNP', unit: 'pg/mL', normalRange: '<100' },
          { id: 'ckMb', name: 'CK-MB', unit: 'ng/mL', normalRange: '<5' },
        ]
      }
    }
  },
  BLOOD_GAS: {
    label: 'Blood Gas',
    icon: Activity,
    color: '#3fb950',
    tests: {
      abg: {
        name: 'Arterial Blood Gas (ABG)',
        components: [
          { id: 'ph', name: 'pH', unit: '', normalRange: '7.35-7.45' },
          { id: 'pco2', name: 'pCO2', unit: 'mmHg', normalRange: '35-45' },
          { id: 'po2', name: 'pO2', unit: 'mmHg', normalRange: '80-100' },
          { id: 'hco3', name: 'HCO3', unit: 'mEq/L', normalRange: '22-26' },
          { id: 'o2Sat', name: 'O2 Saturation', unit: '%', normalRange: '95-100' },
        ]
      }
    }
  },
  IMAGING: {
    label: 'Imaging',
    icon: Image,
    color: '#79c0ff',
    tests: {
      cxr: { name: 'Chest X-Ray', isImaging: true },
      ekg: { name: 'EKG/ECG', isImaging: true },
      ct_head: { name: 'CT Head', isImaging: true },
    }
  }
};

function LabResultsPanel() {
  const { labResults, requestLab, simulationStatus } = useSocket();
  const [activeCategory, setActiveCategory] = useState('CHEMISTRY');
  const [expandedTests, setExpandedTests] = useState({});
  const [requestingLab, setRequestingLab] = useState(null);

  const isDisabled = simulationStatus !== 'RUNNING';

  const toggleTest = (testId) => {
    setExpandedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const handleRequestLab = async (testId) => {
    if (isDisabled || requestingLab) return;
    
    setRequestingLab(testId);
    try {
      await requestLab(testId);
    } catch (err) {
      console.error('Failed to request lab:', err);
    } finally {
      setRequestingLab(null);
    }
  };

  const isLabRevealed = (testId) => {
    return labResults[testId]?.revealed || false;
  };

  const getLabValue = (testId, componentId) => {
    return labResults[testId]?.results?.[componentId] || null;
  };

  const isAbnormal = (value, normalRange) => {
    if (!value || !normalRange) return false;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    
    const [minStr, maxStr] = normalRange.split('-');
    const min = parseFloat(minStr.replace('<', ''));
    const max = parseFloat(maxStr || minStr);
    
    if (normalRange.startsWith('<')) {
      return numValue >= min;
    }
    return numValue < min || numValue > max;
  };

  const category = labCategories[activeCategory];

  return (
    <div className="lab-results-panel">
      <div className="panel-header">
        <h2>Lab Results</h2>
        <p className="text-muted">Order tests and view results</p>
      </div>

      {/* Category Tabs */}
      <div className="lab-categories">
        {Object.entries(labCategories).map(([key, cat]) => {
          const CatIcon = cat.icon;
          return (
            <button
              key={key}
              className={`category-tab ${activeCategory === key ? 'active' : ''}`}
              onClick={() => setActiveCategory(key)}
              style={{ '--cat-color': cat.color }}
            >
              <CatIcon size={18} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lab Tests */}
      <div className="lab-tests">
        {category && Object.entries(category.tests).map(([testId, test]) => {
          const revealed = isLabRevealed(testId);
          const isExpanded = expandedTests[testId];
          const isPending = requestingLab === testId;

          return (
            <div key={testId} className={`lab-test-card ${revealed ? 'revealed' : 'locked'}`}>
              <button 
                className="test-header"
                onClick={() => revealed && toggleTest(testId)}
                disabled={!revealed}
              >
                <div className="test-info">
                  {revealed ? <Unlock size={16} className="unlock-icon" /> : <Lock size={16} />}
                  <span className="test-name">{test.name}</span>
                </div>
                {revealed ? (
                  isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
                ) : (
                  <button
                    className="request-btn"
                    onClick={(e) => { e.stopPropagation(); handleRequestLab(testId); }}
                    disabled={isDisabled || isPending}
                  >
                    {isPending ? (
                      <div className="spinner-sm" />
                    ) : (
                      <>Order</>
                    )}
                  </button>
                )}
              </button>

              {revealed && isExpanded && !test.isImaging && (
                <div className="test-results">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Value</th>
                        <th>Normal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {test.components?.map(comp => {
                        const value = getLabValue(testId, comp.id);
                        const abnormal = isAbnormal(value, comp.normalRange);

                        return (
                          <tr key={comp.id} className={abnormal ? 'abnormal' : ''}>
                            <td className="comp-name">{comp.name}</td>
                            <td className={`comp-value ${abnormal ? 'abnormal' : ''}`}>
                              {value || '—'}
                              {comp.unit && <span className="unit">{comp.unit}</span>}
                              {abnormal && <AlertCircle size={14} className="alert-icon" />}
                            </td>
                            <td className="comp-range">{comp.normalRange}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {revealed && isExpanded && test.isImaging && (
                <div className="imaging-result">
                  <div className="imaging-content">
                    <p className="imaging-text">
                      {labResults[testId]?.results?.result || 'Results pending...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isDisabled && (
        <div className="disabled-notice">
          <Clock size={16} />
          <span>Start simulation to order tests</span>
        </div>
      )}

      <style>{`
        .lab-results-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .panel-header {
          padding: var(--space-md);
        }

        .panel-header h2 {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .text-muted {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .lab-categories {
          display: flex;
          gap: var(--space-xs);
          padding: 0 var(--space-md) var(--space-md);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .category-tab.active {
          background: var(--cat-color);
          border-color: var(--cat-color);
          color: white;
        }

        .lab-tests {
          flex: 1;
          overflow: auto;
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .lab-test-card {
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .lab-test-card.revealed {
          border-color: var(--color-success);
        }

        .test-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md);
          background: var(--bg-tertiary);
        }

        .test-header:disabled {
          cursor: default;
        }

        .lab-test-card.revealed .test-header {
          background: rgba(63, 185, 80, 0.08);
        }

        .test-info {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .test-info svg {
          color: var(--text-muted);
        }

        .unlock-icon {
          color: var(--color-success) !important;
        }

        .test-name {
          font-weight: 500;
        }

        .request-btn {
          padding: var(--space-sm) var(--space-md);
          background: var(--color-info);
          color: white;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .request-btn:disabled {
          opacity: 0.5;
        }

        .test-results {
          padding: var(--space-md);
          border-top: 1px solid var(--border-muted);
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
        }

        .results-table th {
          text-align: left;
          padding: var(--space-xs) var(--space-sm);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-muted);
        }

        .results-table td {
          padding: var(--space-sm);
          border-bottom: 1px solid var(--border-muted);
        }

        .results-table tr:last-child td {
          border-bottom: none;
        }

        .results-table tr.abnormal {
          background: rgba(248, 81, 73, 0.08);
        }

        .comp-name {
          font-weight: 500;
        }

        .comp-value {
          font-family: var(--font-mono);
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .comp-value.abnormal {
          color: var(--color-danger);
          font-weight: 600;
        }

        .comp-value .unit {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .alert-icon {
          color: var(--color-danger);
        }

        .comp-range {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .imaging-result {
          padding: var(--space-md);
          border-top: 1px solid var(--border-muted);
        }

        .imaging-content {
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .imaging-text {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .disabled-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--bg-tertiary);
          color: var(--text-muted);
          font-size: 0.85rem;
          margin: var(--space-md);
          border-radius: var(--radius-md);
        }

        .spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default LabResultsPanel;
