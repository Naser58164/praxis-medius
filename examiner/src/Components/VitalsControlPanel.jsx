import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Heart, Activity, Wind, Thermometer, Droplets, AlertTriangle } from 'lucide-react';

function VitalsControlPanel() {
  const { currentVitals, updateVitals, simulationStatus } = useSocket();
  const [localVitals, setLocalVitals] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});

  useEffect(() => {
    if (currentVitals) {
      setLocalVitals(currentVitals);
    }
  }, [currentVitals]);

  const handleVitalChange = (key, value, nested = null) => {
    if (nested) {
      setLocalVitals(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          [nested]: parseInt(value)
        }
      }));
      setPendingChanges(prev => ({
        ...prev,
        [`${key}.${nested}`]: true
      }));
    } else {
      setLocalVitals(prev => ({
        ...prev,
        [key]: key === 'temperature' ? parseFloat(value) : parseInt(value)
      }));
      setPendingChanges(prev => ({
        ...prev,
        [key]: true
      }));
    }
  };

  const applyChanges = async () => {
    try {
      await updateVitals(localVitals);
      setPendingChanges({});
    } catch (err) {
      console.error('Failed to update vitals:', err);
    }
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;
  const isDisabled = simulationStatus !== 'RUNNING';

  if (!localVitals) {
    return <div className="loading">Loading vitals...</div>;
  }

  const vitalsConfig = [
    {
      key: 'heartRate',
      label: 'Heart Rate',
      unit: 'bpm',
      icon: Heart,
      color: 'var(--vital-hr)',
      min: 30,
      max: 200,
      normalRange: [60, 100],
      step: 1
    },
    {
      key: 'bloodPressure.systolic',
      label: 'Systolic BP',
      unit: 'mmHg',
      icon: Activity,
      color: 'var(--vital-bp)',
      min: 60,
      max: 220,
      normalRange: [90, 140],
      step: 1,
      nested: true,
      parentKey: 'bloodPressure',
      nestedKey: 'systolic'
    },
    {
      key: 'bloodPressure.diastolic',
      label: 'Diastolic BP',
      unit: 'mmHg',
      icon: Activity,
      color: 'var(--vital-bp)',
      min: 30,
      max: 140,
      normalRange: [60, 90],
      step: 1,
      nested: true,
      parentKey: 'bloodPressure',
      nestedKey: 'diastolic'
    },
    {
      key: 'respiratoryRate',
      label: 'Respiratory Rate',
      unit: '/min',
      icon: Wind,
      color: 'var(--vital-rr)',
      min: 4,
      max: 60,
      normalRange: [12, 20],
      step: 1
    },
    {
      key: 'oxygenSaturation',
      label: 'SpO2',
      unit: '%',
      icon: Droplets,
      color: 'var(--vital-spo2)',
      min: 50,
      max: 100,
      normalRange: [94, 100],
      step: 1
    },
    {
      key: 'temperature',
      label: 'Temperature',
      unit: '°C',
      icon: Thermometer,
      color: 'var(--vital-temp)',
      min: 34,
      max: 42,
      normalRange: [36.1, 37.2],
      step: 0.1
    },
    {
      key: 'painLevel',
      label: 'Pain Level',
      unit: '/10',
      icon: AlertTriangle,
      color: 'var(--vital-pain)',
      min: 0,
      max: 10,
      normalRange: [0, 3],
      step: 1
    }
  ];

  const getValue = (config) => {
    if (config.nested) {
      return localVitals[config.parentKey]?.[config.nestedKey] ?? 0;
    }
    return localVitals[config.key] ?? 0;
  };

  const isAbnormal = (value, normalRange) => {
    return value < normalRange[0] || value > normalRange[1];
  };

  return (
    <div className="vitals-control-panel">
      <div className="panel-header">
        <h3>Vital Signs Control</h3>
        <p className="text-muted">Adjust patient vitals in real-time</p>
      </div>

      <div className="vitals-grid">
        {vitalsConfig.map(config => {
          const value = getValue(config);
          const abnormal = isAbnormal(value, config.normalRange);
          const Icon = config.icon;
          const changeKey = config.nested ? `${config.parentKey}.${config.nestedKey}` : config.key;
          const hasChange = pendingChanges[changeKey];

          return (
            <div key={config.key} className={`vital-control ${abnormal ? 'abnormal' : ''} ${hasChange ? 'pending' : ''}`}>
              <div className="vital-header">
                <div className="vital-icon" style={{ color: config.color }}>
                  <Icon size={18} />
                </div>
                <span className="vital-label">{config.label}</span>
                {abnormal && <span className="abnormal-indicator">!</span>}
              </div>

              <div className="vital-value-display">
                <span className="vital-value mono" style={{ color: abnormal ? 'var(--color-danger)' : config.color }}>
                  {config.key === 'temperature' ? value.toFixed(1) : value}
                </span>
                <span className="vital-unit">{config.unit}</span>
              </div>

              <div className="vital-slider-container">
                <input
                  type="range"
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  value={value}
                  disabled={isDisabled}
                  onChange={(e) => {
                    if (config.nested) {
                      handleVitalChange(config.parentKey, e.target.value, config.nestedKey);
                    } else {
                      handleVitalChange(config.key, e.target.value);
                    }
                  }}
                  style={{
                    '--track-color': config.color,
                    '--thumb-color': abnormal ? 'var(--color-danger)' : config.color
                  }}
                />
                <div className="range-labels">
                  <span>{config.min}</span>
                  <span className="normal-range">
                    Normal: {config.normalRange[0]}-{config.normalRange[1]}
                  </span>
                  <span>{config.max}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="vitals-actions">
        <button 
          className="btn btn-primary btn-lg w-full"
          disabled={!hasPendingChanges || isDisabled}
          onClick={applyChanges}
        >
          Apply Vital Changes
        </button>
        {isDisabled && (
          <p className="text-xs text-muted text-center" style={{ marginTop: 'var(--space-sm)' }}>
            Simulation must be running to modify vitals
          </p>
        )}
      </div>

      <style>{`
        .vitals-control-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .panel-header h3 {
          margin-bottom: var(--space-xs);
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-md);
        }

        .vital-control {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          transition: all var(--transition-fast);
        }

        .vital-control.pending {
          border-color: var(--color-warning);
          box-shadow: 0 0 0 2px rgba(210, 153, 34, 0.2);
        }

        .vital-control.abnormal {
          background: rgba(248, 81, 73, 0.05);
        }

        .vital-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .vital-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vital-label {
          flex: 1;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .abnormal-indicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-danger);
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 1s infinite;
        }

        .vital-value-display {
          display: flex;
          align-items: baseline;
          gap: var(--space-xs);
          margin-bottom: var(--space-md);
        }

        .vital-value {
          font-size: 2rem;
          font-weight: 600;
          line-height: 1;
        }

        .vital-unit {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .vital-slider-container {
          margin-top: var(--space-sm);
        }

        .vital-slider-container input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: var(--bg-elevated);
          cursor: pointer;
        }

        .vital-slider-container input[type="range"]::-webkit-slider-thumb {
          background: var(--thumb-color, var(--color-info));
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          margin-top: var(--space-xs);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .normal-range {
          color: var(--color-success);
        }

        .vitals-actions {
          padding-top: var(--space-md);
          border-top: 1px solid var(--border-muted);
        }
      `}</style>
    </div>
  );
}

export default VitalsControlPanel;
