import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  Zap, AlertTriangle, Heart, Activity, Brain, Wind,
  ChevronDown, ChevronRight, Clock, Play, Square,
  Thermometer, Droplets, Shield, AlertCircle
} from 'lucide-react';

const emergencyScenarios = [
  {
    id: 'cardiac_arrest',
    label: 'Cardiac Arrest',
    icon: Heart,
    color: '#f85149',
    description: 'Patient becomes pulseless and unresponsive',
    actions: [
      { type: 'vitals', changes: { heartRate: 0, bloodPressure: { systolic: 0, diastolic: 0 } } },
      { type: 'findings', path: 'neurological.levelOfConsciousness', value: 'Unresponsive' },
      { type: 'findings', path: 'cardiac.pulses', value: 'Absent' },
      { type: 'iot', action: 'stop_breath_sounds' },
      { type: 'iot', action: 'pulse_stop' },
      { type: 'patient_speak', text: '', mood: 'unresponsive' }
    ]
  },
  {
    id: 'respiratory_arrest',
    label: 'Respiratory Arrest',
    icon: Wind,
    color: '#d29922',
    description: 'Patient stops breathing',
    actions: [
      { type: 'vitals', changes: { respiratoryRate: 0, oxygenSaturation: 75 } },
      { type: 'findings', path: 'respiratory.breathingPattern', value: 'Absent' },
      { type: 'iot', action: 'stop_breath_sounds' },
      { type: 'iot', action: 'led_cyanosis' }
    ]
  },
  {
    id: 'seizure',
    label: 'Seizure',
    icon: Brain,
    color: '#a371f7',
    description: 'Patient experiences generalized seizure',
    actions: [
      { type: 'vitals', changes: { heartRate: 130, respiratoryRate: 28 } },
      { type: 'findings', path: 'neurological.levelOfConsciousness', value: 'Unresponsive' },
      { type: 'findings', path: 'neurological.pupils', value: 'Fixed and dilated' },
      { type: 'iot', action: 'seizure_start' }
    ]
  },
  {
    id: 'anaphylaxis',
    label: 'Anaphylaxis',
    icon: AlertTriangle,
    color: '#f0883e',
    description: 'Severe allergic reaction',
    actions: [
      { type: 'vitals', changes: { heartRate: 140, bloodPressure: { systolic: 70, diastolic: 40 }, respiratoryRate: 32, oxygenSaturation: 85 } },
      { type: 'findings', path: 'respiratory.breathSounds.all', value: 'Stridor' },
      { type: 'iot', action: 'play_stridor' },
      { type: 'iot', action: 'led_flushed' },
      { type: 'patient_speak', text: 'I can\'t breathe... my throat...', mood: 'distressed' }
    ]
  },
  {
    id: 'hypotension',
    label: 'Acute Hypotension',
    icon: Activity,
    color: '#58a6ff',
    description: 'Sudden drop in blood pressure',
    actions: [
      { type: 'vitals', changes: { bloodPressure: { systolic: 70, diastolic: 40 }, heartRate: 120 } },
      { type: 'findings', path: 'neurological.levelOfConsciousness', value: 'Drowsy' },
      { type: 'iot', action: 'led_pale' },
      { type: 'iot', action: 'pulse_weak' },
      { type: 'patient_speak', text: 'I feel dizzy... lightheaded...', mood: 'distressed' }
    ]
  },
  {
    id: 'hyperthermia',
    label: 'Hyperthermia Crisis',
    icon: Thermometer,
    color: '#ff6b6b',
    description: 'Dangerously elevated temperature',
    actions: [
      { type: 'vitals', changes: { temperature: 41.5, heartRate: 150 } },
      { type: 'findings', path: 'neurological.levelOfConsciousness', value: 'Confused' },
      { type: 'iot', action: 'led_flushed' },
      { type: 'patient_speak', text: 'So hot... can\'t think straight...', mood: 'confused' }
    ]
  }
];

const quickVitalChanges = [
  { id: 'hr_up', label: 'HR ↑20', vital: 'heartRate', delta: 20 },
  { id: 'hr_down', label: 'HR ↓20', vital: 'heartRate', delta: -20 },
  { id: 'bp_up', label: 'BP ↑20', vital: 'bloodPressure.systolic', delta: 20 },
  { id: 'bp_down', label: 'BP ↓20', vital: 'bloodPressure.systolic', delta: -20 },
  { id: 'rr_up', label: 'RR ↑6', vital: 'respiratoryRate', delta: 6 },
  { id: 'rr_down', label: 'RR ↓6', vital: 'respiratoryRate', delta: -6 },
  { id: 'spo2_up', label: 'SpO2 ↑5', vital: 'oxygenSaturation', delta: 5 },
  { id: 'spo2_down', label: 'SpO2 ↓5', vital: 'oxygenSaturation', delta: -5 },
];

const patientStatePresets = [
  { id: 'stable', label: 'Stable', color: '#3fb950', vitals: { heartRate: 75, respiratoryRate: 16, oxygenSaturation: 98, bloodPressure: { systolic: 120, diastolic: 80 } } },
  { id: 'improving', label: 'Improving', color: '#58a6ff', vitalDeltas: { heartRate: -10, respiratoryRate: -2, oxygenSaturation: 3 } },
  { id: 'deteriorating', label: 'Deteriorating', color: '#d29922', vitalDeltas: { heartRate: 15, respiratoryRate: 4, oxygenSaturation: -5 } },
  { id: 'critical', label: 'Critical', color: '#f85149', vitals: { heartRate: 140, respiratoryRate: 32, oxygenSaturation: 82, bloodPressure: { systolic: 80, diastolic: 50 } } },
];

function QuickActionsPanel() {
  const { simulationStatus, currentVitals, updateVitals, updateFindings, patientSpeak } = useSocket();
  
  const [expandedSection, setExpandedSection] = useState('emergency');
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const isDisabled = simulationStatus !== 'RUNNING';

  const toggleSection = (section) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const executeEmergencyScenario = async (scenario) => {
    if (isDisabled) return;
    
    // Require confirmation for dangerous scenarios
    if (!confirmAction || confirmAction !== scenario.id) {
      setConfirmAction(scenario.id);
      setTimeout(() => setConfirmAction(null), 3000);
      return;
    }

    setPendingAction(scenario.id);
    setActiveEmergency(scenario.id);
    setConfirmAction(null);

    try {
      for (const action of scenario.actions) {
        switch (action.type) {
          case 'vitals':
            await updateVitals({ ...currentVitals, ...action.changes });
            break;
          case 'findings':
            await updateFindings(action.path, action.value);
            break;
          case 'patient_speak':
            if (action.text) {
              await patientSpeak(action.text, action.mood);
            }
            break;
          // IoT actions would be handled by the socket
        }
        // Small delay between actions
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (err) {
      console.error('Failed to execute emergency scenario:', err);
    } finally {
      setPendingAction(null);
    }
  };

  const stopEmergency = async () => {
    setActiveEmergency(null);
    // Could send IoT commands to stop ongoing effects
  };

  const applyQuickVitalChange = async (change) => {
    if (isDisabled || !currentVitals) return;
    
    setPendingAction(change.id);
    try {
      const newVitals = { ...currentVitals };
      if (change.vital.includes('.')) {
        const [parent, child] = change.vital.split('.');
        newVitals[parent] = { ...newVitals[parent], [child]: newVitals[parent][child] + change.delta };
      } else {
        newVitals[change.vital] = (newVitals[change.vital] || 0) + change.delta;
      }
      await updateVitals(newVitals);
    } catch (err) {
      console.error('Failed to apply vital change:', err);
    } finally {
      setPendingAction(null);
    }
  };

  const applyStatePreset = async (preset) => {
    if (isDisabled || !currentVitals) return;
    
    setPendingAction(preset.id);
    try {
      let newVitals;
      if (preset.vitals) {
        newVitals = { ...currentVitals, ...preset.vitals };
      } else if (preset.vitalDeltas) {
        newVitals = { ...currentVitals };
        Object.entries(preset.vitalDeltas).forEach(([key, delta]) => {
          newVitals[key] = (newVitals[key] || 0) + delta;
        });
      }
      await updateVitals(newVitals);
    } catch (err) {
      console.error('Failed to apply preset:', err);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="quick-actions-panel">
      {/* Emergency Scenarios Section */}
      <div className="action-section">
        <button 
          className="section-header emergency"
          onClick={() => toggleSection('emergency')}
        >
          <AlertTriangle size={18} />
          <span>Emergency Scenarios</span>
          <span className="section-badge danger">Critical</span>
          {expandedSection === 'emergency' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        
        {expandedSection === 'emergency' && (
          <div className="section-content">
            {activeEmergency && (
              <div className="active-emergency-banner">
                <AlertCircle size={16} />
                <span>Emergency scenario active</span>
                <button className="btn btn-sm btn-danger" onClick={stopEmergency}>
                  <Square size={14} /> Stop
                </button>
              </div>
            )}
            
            <div className="emergency-grid">
              {emergencyScenarios.map(scenario => {
                const Icon = scenario.icon;
                const isPending = pendingAction === scenario.id;
                const isConfirming = confirmAction === scenario.id;
                const isActive = activeEmergency === scenario.id;
                
                return (
                  <button
                    key={scenario.id}
                    className={`emergency-btn ${isActive ? 'active' : ''} ${isConfirming ? 'confirming' : ''}`}
                    style={{ '--emergency-color': scenario.color }}
                    onClick={() => executeEmergencyScenario(scenario)}
                    disabled={isDisabled || isPending}
                  >
                    {isPending ? (
                      <div className="spinner-sm" />
                    ) : (
                      <Icon size={24} />
                    )}
                    <span className="emergency-label">{scenario.label}</span>
                    <span className="emergency-desc">{scenario.description}</span>
                    {isConfirming && (
                      <span className="confirm-hint">Click again to confirm</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Vital Adjustments */}
      <div className="action-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('vitals')}
        >
          <Activity size={18} />
          <span>Quick Vital Adjustments</span>
          {expandedSection === 'vitals' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        
        {expandedSection === 'vitals' && (
          <div className="section-content">
            <div className="quick-vitals-grid">
              {quickVitalChanges.map(change => (
                <button
                  key={change.id}
                  className={`quick-vital-btn ${change.delta > 0 ? 'increase' : 'decrease'}`}
                  onClick={() => applyQuickVitalChange(change)}
                  disabled={isDisabled || pendingAction === change.id}
                >
                  {pendingAction === change.id ? (
                    <div className="spinner-sm" />
                  ) : (
                    change.label
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Patient State Presets */}
      <div className="action-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('presets')}
        >
          <Shield size={18} />
          <span>Patient State Presets</span>
          {expandedSection === 'presets' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        
        {expandedSection === 'presets' && (
          <div className="section-content">
            <div className="presets-grid">
              {patientStatePresets.map(preset => (
                <button
                  key={preset.id}
                  className="preset-btn"
                  style={{ '--preset-color': preset.color }}
                  onClick={() => applyStatePreset(preset)}
                  disabled={isDisabled || pendingAction === preset.id}
                >
                  {pendingAction === preset.id ? (
                    <div className="spinner-sm" />
                  ) : (
                    <>
                      <span className="preset-label">{preset.label}</span>
                      <span className="preset-indicator" />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timed Events */}
      <div className="action-section">
        <button 
          className="section-header"
          onClick={() => toggleSection('timed')}
        >
          <Clock size={18} />
          <span>Timed Events</span>
          {expandedSection === 'timed' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        
        {expandedSection === 'timed' && (
          <div className="section-content">
            <div className="timed-events">
              <div className="timed-event-form">
                <select className="event-select" disabled={isDisabled}>
                  <option value="">Select event...</option>
                  <option value="deteriorate">Gradual Deterioration</option>
                  <option value="improve">Gradual Improvement</option>
                  <option value="custom">Custom Vital Change</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Delay (sec)"
                  className="delay-input"
                  disabled={isDisabled}
                />
                <button className="btn btn-primary btn-sm" disabled={isDisabled}>
                  <Play size={14} /> Schedule
                </button>
              </div>
              <p className="text-muted text-sm">Schedule events to occur after a delay</p>
            </div>
          </div>
        )}
      </div>

      {isDisabled && (
        <div className="disabled-notice">
          <AlertCircle size={16} />
          <span>Start simulation to enable quick actions</span>
        </div>
      )}

      <style>{`
        .quick-actions-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .action-section {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          width: 100%;
          padding: var(--space-md);
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .section-header:hover {
          background: var(--bg-elevated);
        }

        .section-header.emergency {
          background: rgba(248, 81, 73, 0.1);
        }

        .section-header span:first-of-type {
          flex: 1;
          text-align: left;
        }

        .section-badge {
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          text-transform: uppercase;
        }

        .section-badge.danger {
          background: var(--color-danger);
          color: white;
        }

        .section-content {
          padding: var(--space-md);
          border-top: 1px solid var(--border-muted);
        }

        .active-emergency-banner {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: rgba(248, 81, 73, 0.2);
          border: 1px solid var(--color-danger);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
          color: var(--color-danger);
          font-weight: 500;
        }

        .active-emergency-banner button {
          margin-left: auto;
        }

        .emergency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: var(--space-md);
        }

        .emergency-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-lg);
          background: var(--bg-card);
          border: 2px solid var(--border-muted);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
        }

        .emergency-btn:hover:not(:disabled) {
          border-color: var(--emergency-color);
          background: var(--bg-elevated);
        }

        .emergency-btn:hover:not(:disabled) svg {
          color: var(--emergency-color);
        }

        .emergency-btn.active {
          border-color: var(--emergency-color);
          background: rgba(248, 81, 73, 0.1);
          animation: pulse-border 1s infinite;
        }

        .emergency-btn.confirming {
          border-color: var(--color-warning);
          animation: shake 0.3s;
        }

        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 var(--emergency-color); }
          50% { box-shadow: 0 0 0 4px rgba(248, 81, 73, 0.3); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .emergency-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .emergency-label {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .emergency-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .confirm-hint {
          font-size: 0.7rem;
          color: var(--color-warning);
          font-weight: 500;
          margin-top: var(--space-xs);
        }

        .quick-vitals-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-sm);
        }

        .quick-vital-btn {
          padding: var(--space-md);
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          font-family: var(--font-mono);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .quick-vital-btn.increase:hover:not(:disabled) {
          border-color: var(--color-danger);
          color: var(--color-danger);
          background: rgba(248, 81, 73, 0.1);
        }

        .quick-vital-btn.decrease:hover:not(:disabled) {
          border-color: var(--color-success);
          color: var(--color-success);
          background: rgba(63, 185, 80, 0.1);
        }

        .quick-vital-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-sm);
        }

        .preset-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .preset-btn:hover:not(:disabled) {
          border-color: var(--preset-color);
        }

        .preset-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .preset-label {
          font-weight: 500;
        }

        .preset-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--preset-color);
        }

        .timed-events {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .timed-event-form {
          display: flex;
          gap: var(--space-sm);
        }

        .event-select {
          flex: 1;
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
        }

        .delay-input {
          width: 100px;
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
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
        }

        .spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-muted);
          border-top-color: var(--text-primary);
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

export default QuickActionsPanel;
