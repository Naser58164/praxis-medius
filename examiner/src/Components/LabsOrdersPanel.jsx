import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  TestTube, FileText, Eye, EyeOff, Clock, AlertCircle,
  Droplets, Activity, Zap, Beaker, Microscope, Scan,
  Check, ChevronDown, ChevronRight, Image, Radio
} from 'lucide-react';

// Lab Categories and their tests
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
      cmp: {
        name: 'Comprehensive Metabolic Panel (CMP)',
        components: [
          { id: 'albumin', name: 'Albumin', unit: 'g/dL', normalRange: '3.5-5.0' },
          { id: 'totalProtein', name: 'Total Protein', unit: 'g/dL', normalRange: '6.0-8.3' },
          { id: 'alt', name: 'ALT', unit: 'U/L', normalRange: '7-56' },
          { id: 'ast', name: 'AST', unit: 'U/L', normalRange: '10-40' },
          { id: 'alkPhos', name: 'Alk Phos', unit: 'U/L', normalRange: '44-147' },
          { id: 'bilirubin', name: 'Total Bilirubin', unit: 'mg/dL', normalRange: '0.1-1.2' },
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
          { id: 'baseExcess', name: 'Base Excess', unit: 'mEq/L', normalRange: '-2 to +2' },
          { id: 'o2Sat', name: 'O2 Saturation', unit: '%', normalRange: '95-100' },
        ]
      },
      lactate: {
        name: 'Lactate',
        components: [
          { id: 'lactate', name: 'Lactate', unit: 'mmol/L', normalRange: '0.5-2.0' },
        ]
      }
    }
  },
  URINALYSIS: {
    label: 'Urinalysis',
    icon: TestTube,
    color: '#d29922',
    tests: {
      ua: {
        name: 'Urinalysis',
        components: [
          { id: 'color', name: 'Color', unit: '', normalRange: 'Yellow' },
          { id: 'clarity', name: 'Clarity', unit: '', normalRange: 'Clear' },
          { id: 'specificGravity', name: 'Specific Gravity', unit: '', normalRange: '1.005-1.030' },
          { id: 'ph_urine', name: 'pH', unit: '', normalRange: '4.5-8.0' },
          { id: 'protein_urine', name: 'Protein', unit: '', normalRange: 'Negative' },
          { id: 'glucose_urine', name: 'Glucose', unit: '', normalRange: 'Negative' },
          { id: 'blood_urine', name: 'Blood', unit: '', normalRange: 'Negative' },
          { id: 'leukocytes', name: 'Leukocytes', unit: '', normalRange: 'Negative' },
          { id: 'nitrites', name: 'Nitrites', unit: '', normalRange: 'Negative' },
        ]
      }
    }
  },
  MICROBIOLOGY: {
    label: 'Microbiology',
    icon: Microscope,
    color: '#a371f7',
    tests: {
      bloodCulture: {
        name: 'Blood Culture',
        components: [
          { id: 'bloodCultureResult', name: 'Result', unit: '', normalRange: 'No growth' },
        ]
      },
      urineCulture: {
        name: 'Urine Culture',
        components: [
          { id: 'urineCultureResult', name: 'Result', unit: '', normalRange: 'No growth' },
        ]
      }
    }
  }
};

// Imaging types
const imagingTypes = [
  { id: 'cxr', name: 'Chest X-Ray', icon: Image },
  { id: 'ct_head', name: 'CT Head', icon: Scan },
  { id: 'ct_chest', name: 'CT Chest', icon: Scan },
  { id: 'ct_abd', name: 'CT Abdomen/Pelvis', icon: Scan },
  { id: 'echo', name: 'Echocardiogram', icon: Activity },
  { id: 'ekg', name: 'EKG/ECG', icon: Zap },
  { id: 'ultrasound', name: 'Ultrasound', icon: Radio },
];

function LabsOrdersPanel() {
  const { sessionData, simulationStatus, revealLabResults } = useSocket();
  
  const [activeCategory, setActiveCategory] = useState('CHEMISTRY');
  const [expandedTests, setExpandedTests] = useState({});
  const [labValues, setLabValues] = useState({});
  const [revealedLabs, setRevealedLabs] = useState(new Set());
  const [revealedImaging, setRevealedImaging] = useState(new Set());
  const [imagingResults, setImagingResults] = useState({});
  const [pendingReveal, setPendingReveal] = useState(null);

  const isDisabled = simulationStatus !== 'RUNNING';

  // Initialize lab values from scenario
  useEffect(() => {
    if (sessionData?.scenario?.labResults) {
      setLabValues(sessionData.scenario.labResults);
    }
  }, [sessionData]);

  const toggleTest = (testId) => {
    setExpandedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const handleRevealLab = async (testId, testName) => {
    if (isDisabled || revealedLabs.has(testId)) return;
    
    setPendingReveal(testId);
    try {
      await revealLabResults(testId, labValues[testId] || {});
      setRevealedLabs(prev => new Set([...prev, testId]));
    } catch (err) {
      console.error('Failed to reveal lab:', err);
    } finally {
      setPendingReveal(null);
    }
  };

  const handleRevealImaging = async (imagingId) => {
    if (isDisabled || revealedImaging.has(imagingId)) return;
    
    setPendingReveal(imagingId);
    try {
      await revealLabResults(`imaging_${imagingId}`, imagingResults[imagingId] || { result: 'Normal' });
      setRevealedImaging(prev => new Set([...prev, imagingId]));
    } catch (err) {
      console.error('Failed to reveal imaging:', err);
    } finally {
      setPendingReveal(null);
    }
  };

  const handleLabValueChange = (testId, componentId, value) => {
    setLabValues(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [componentId]: value
      }
    }));
  };

  const handleImagingResultChange = (imagingId, result) => {
    setImagingResults(prev => ({
      ...prev,
      [imagingId]: { result }
    }));
  };

  const category = labCategories[activeCategory];

  return (
    <div className="labs-orders-panel">
      <div className="panel-header">
        <h3>Labs & Orders Management</h3>
        <p className="text-muted">Set lab values and reveal results to the student when ordered</p>
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
              <CatIcon size={16} />
              {cat.label}
            </button>
          );
        })}
        <button
          className={`category-tab ${activeCategory === 'IMAGING' ? 'active' : ''}`}
          onClick={() => setActiveCategory('IMAGING')}
          style={{ '--cat-color': '#79c0ff' }}
        >
          <Image size={16} />
          Imaging
        </button>
      </div>

      {/* Lab Tests Content */}
      {activeCategory !== 'IMAGING' && category && (
        <div className="lab-tests-list">
          {Object.entries(category.tests).map(([testId, test]) => {
            const isExpanded = expandedTests[testId];
            const isRevealed = revealedLabs.has(testId);
            const isPending = pendingReveal === testId;

            return (
              <div key={testId} className={`lab-test-card ${isRevealed ? 'revealed' : ''}`}>
                <div className="test-header" onClick={() => toggleTest(testId)}>
                  <div className="test-title">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span>{test.name}</span>
                    {isRevealed && (
                      <span className="revealed-badge">
                        <Check size={12} /> Revealed
                      </span>
                    )}
                  </div>
                  <button
                    className={`reveal-btn ${isRevealed ? 'revealed' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleRevealLab(testId, test.name); }}
                    disabled={isDisabled || isRevealed || isPending}
                  >
                    {isPending ? (
                      <div className="spinner-sm" />
                    ) : isRevealed ? (
                      <><Eye size={14} /> Visible</>
                    ) : (
                      <><EyeOff size={14} /> Reveal to Student</>
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="test-components">
                    <table className="lab-table">
                      <thead>
                        <tr>
                          <th>Test</th>
                          <th>Value</th>
                          <th>Unit</th>
                          <th>Normal Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {test.components.map(comp => {
                          const currentValue = labValues[testId]?.[comp.id] || '';
                          const numValue = parseFloat(currentValue);
                          const [minStr, maxStr] = (comp.normalRange || '').split('-');
                          const min = parseFloat(minStr);
                          const max = parseFloat(maxStr);
                          const isAbnormal = !isNaN(numValue) && !isNaN(min) && !isNaN(max) && 
                            (numValue < min || numValue > max);

                          return (
                            <tr key={comp.id} className={isAbnormal ? 'abnormal' : ''}>
                              <td className="comp-name">{comp.name}</td>
                              <td>
                                <input
                                  type="text"
                                  className={`lab-input ${isAbnormal ? 'abnormal' : ''}`}
                                  value={currentValue}
                                  onChange={(e) => handleLabValueChange(testId, comp.id, e.target.value)}
                                  placeholder="—"
                                  disabled={isDisabled}
                                />
                              </td>
                              <td className="comp-unit">{comp.unit}</td>
                              <td className="comp-range">{comp.normalRange}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Imaging Content */}
      {activeCategory === 'IMAGING' && (
        <div className="imaging-list">
          {imagingTypes.map(imaging => {
            const ImagingIcon = imaging.icon;
            const isRevealed = revealedImaging.has(imaging.id);
            const isPending = pendingReveal === imaging.id;

            return (
              <div key={imaging.id} className={`imaging-card ${isRevealed ? 'revealed' : ''}`}>
                <div className="imaging-header">
                  <div className="imaging-title">
                    <ImagingIcon size={18} />
                    <span>{imaging.name}</span>
                    {isRevealed && (
                      <span className="revealed-badge">
                        <Check size={12} /> Revealed
                      </span>
                    )}
                  </div>
                  <button
                    className={`reveal-btn ${isRevealed ? 'revealed' : ''}`}
                    onClick={() => handleRevealImaging(imaging.id)}
                    disabled={isDisabled || isRevealed || isPending}
                  >
                    {isPending ? (
                      <div className="spinner-sm" />
                    ) : isRevealed ? (
                      <><Eye size={14} /> Visible</>
                    ) : (
                      <><EyeOff size={14} /> Reveal</>
                    )}
                  </button>
                </div>
                <div className="imaging-result">
                  <label>Result/Interpretation:</label>
                  <textarea
                    value={imagingResults[imaging.id]?.result || ''}
                    onChange={(e) => handleImagingResultChange(imaging.id, e.target.value)}
                    placeholder="Enter imaging findings..."
                    disabled={isDisabled}
                    rows={3}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isDisabled && (
        <div className="disabled-notice">
          <AlertCircle size={16} />
          <span>Start simulation to manage labs and orders</span>
        </div>
      )}

      <style>{`
        .labs-orders-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .panel-header h3 {
          margin-bottom: var(--space-xs);
        }

        .lab-categories {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
          padding: var(--space-sm);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .category-tab {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-md);
          background: var(--bg-elevated);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .category-tab:hover {
          border-color: var(--cat-color);
          color: var(--cat-color);
        }

        .category-tab.active {
          background: var(--cat-color);
          border-color: var(--cat-color);
          color: white;
        }

        .lab-tests-list, .imaging-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .lab-test-card, .imaging-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .lab-test-card.revealed, .imaging-card.revealed {
          border-color: var(--color-success);
          background: rgba(63, 185, 80, 0.05);
        }

        .test-header, .imaging-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md);
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .test-header:hover, .imaging-header:hover {
          background: var(--bg-elevated);
        }

        .test-title, .imaging-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-weight: 500;
        }

        .revealed-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--color-success);
          background: rgba(63, 185, 80, 0.15);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }

        .reveal-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .reveal-btn:hover:not(:disabled) {
          border-color: var(--color-info);
          color: var(--color-info);
        }

        .reveal-btn.revealed {
          background: var(--color-success);
          border-color: var(--color-success);
          color: white;
        }

        .reveal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .test-components {
          padding: var(--space-md);
          border-top: 1px solid var(--border-muted);
          background: var(--bg-card);
        }

        .lab-table {
          width: 100%;
          border-collapse: collapse;
        }

        .lab-table th {
          text-align: left;
          padding: var(--space-xs) var(--space-sm);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-muted);
        }

        .lab-table td {
          padding: var(--space-sm);
          border-bottom: 1px solid var(--border-muted);
        }

        .lab-table tr:last-child td {
          border-bottom: none;
        }

        .lab-table tr.abnormal {
          background: rgba(248, 81, 73, 0.08);
        }

        .comp-name {
          font-weight: 500;
        }

        .comp-unit, .comp-range {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .lab-input {
          width: 100px;
          padding: var(--space-xs) var(--space-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 0.9rem;
          text-align: center;
        }

        .lab-input.abnormal {
          border-color: var(--color-danger);
          color: var(--color-danger);
          background: rgba(248, 81, 73, 0.1);
        }

        .lab-input:disabled {
          opacity: 0.5;
        }

        .imaging-result {
          padding: var(--space-md);
          border-top: 1px solid var(--border-muted);
        }

        .imaging-result label {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: var(--space-xs);
        }

        .imaging-result textarea {
          width: 100%;
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.9rem;
          resize: vertical;
          min-height: 60px;
        }

        .imaging-result textarea:disabled {
          opacity: 0.5;
        }

        .disabled-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: var(--space-md);
        }

        .spinner-sm {
          width: 14px;
          height: 14px;
          border: 2px solid var(--border-muted);
          border-top-color: var(--color-info);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LabsOrdersPanel;
