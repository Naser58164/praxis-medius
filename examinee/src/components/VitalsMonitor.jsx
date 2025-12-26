import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Heart, Activity, Wind, Droplets, Thermometer, AlertCircle } from 'lucide-react';

const vitalConfig = {
  heartRate: {
    label: 'Heart Rate',
    unit: 'bpm',
    icon: Heart,
    color: 'var(--vital-hr)',
    normalRange: [60, 100],
    criticalLow: 40,
    criticalHigh: 150
  },
  systolic: {
    label: 'Systolic BP',
    unit: 'mmHg',
    icon: Activity,
    color: 'var(--vital-bp)',
    normalRange: [90, 140],
    criticalLow: 70,
    criticalHigh: 180
  },
  diastolic: {
    label: 'Diastolic BP',
    unit: 'mmHg',
    icon: Activity,
    color: 'var(--vital-bp)',
    normalRange: [60, 90],
    criticalLow: 40,
    criticalHigh: 110
  },
  respiratoryRate: {
    label: 'Resp Rate',
    unit: '/min',
    icon: Wind,
    color: 'var(--vital-rr)',
    normalRange: [12, 20],
    criticalLow: 8,
    criticalHigh: 35
  },
  oxygenSaturation: {
    label: 'SpO₂',
    unit: '%',
    icon: Droplets,
    color: 'var(--vital-spo2)',
    normalRange: [94, 100],
    criticalLow: 88,
    criticalHigh: 101
  },
  temperature: {
    label: 'Temp',
    unit: '°C',
    icon: Thermometer,
    color: 'var(--vital-temp)',
    normalRange: [36.5, 37.5],
    criticalLow: 35,
    criticalHigh: 40
  }
};

function VitalsMonitor() {
  const { currentVitals, simulationStatus } = useSocket();
  const [flashVital, setFlashVital] = useState(null);
  const [prevVitals, setPrevVitals] = useState(null);

  // Flash animation when vitals change
  useEffect(() => {
    if (prevVitals && currentVitals) {
      const changedVitals = [];
      if (prevVitals.heartRate !== currentVitals.heartRate) changedVitals.push('heartRate');
      if (prevVitals.bloodPressure?.systolic !== currentVitals.bloodPressure?.systolic) changedVitals.push('systolic');
      if (prevVitals.respiratoryRate !== currentVitals.respiratoryRate) changedVitals.push('respiratoryRate');
      if (prevVitals.oxygenSaturation !== currentVitals.oxygenSaturation) changedVitals.push('oxygenSaturation');
      if (prevVitals.temperature !== currentVitals.temperature) changedVitals.push('temperature');
      
      if (changedVitals.length > 0) {
        setFlashVital(changedVitals);
        setTimeout(() => setFlashVital(null), 500);
      }
    }
    setPrevVitals(currentVitals);
  }, [currentVitals]);

  const getVitalStatus = (key, value) => {
    const config = vitalConfig[key];
    if (!config || value === undefined || value === null) return 'unknown';
    
    if (value <= config.criticalLow || value >= config.criticalHigh) return 'critical';
    if (value < config.normalRange[0] || value > config.normalRange[1]) return 'abnormal';
    return 'normal';
  };

  const renderVital = (key, value, config) => {
    const status = getVitalStatus(key, value);
    const Icon = config.icon;
    const isFlashing = flashVital?.includes(key);

    return (
      <div 
        key={key}
        className={`vital-card ${status} ${isFlashing ? 'flash' : ''}`}
        style={{ '--vital-color': config.color }}
      >
        <div className="vital-header">
          <Icon size={20} />
          <span className="vital-label">{config.label}</span>
          {status === 'critical' && <AlertCircle size={16} className="alert-icon" />}
        </div>
        <div className="vital-value">
          <span className="value">{value !== undefined && value !== null ? value : '--'}</span>
          <span className="unit">{config.unit}</span>
        </div>
        <div className="vital-range">
          Normal: {config.normalRange[0]}-{config.normalRange[1]}
        </div>
      </div>
    );
  };

  if (!currentVitals) {
    return (
      <div className="vitals-monitor loading">
        <div className="loading-content">
          <div className="spinner" />
          <p>Waiting for vitals data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vitals-monitor">
      <div className="vitals-header">
        <h2>Patient Vitals</h2>
        <div className={`status-badge ${simulationStatus === 'RUNNING' ? 'live' : ''}`}>
          {simulationStatus === 'RUNNING' ? 'LIVE' : simulationStatus}
        </div>
      </div>

      <div className="vitals-grid">
        {renderVital('heartRate', currentVitals.heartRate, vitalConfig.heartRate)}
        {renderVital('oxygenSaturation', currentVitals.oxygenSaturation, vitalConfig.oxygenSaturation)}
        {renderVital('systolic', currentVitals.bloodPressure?.systolic, vitalConfig.systolic)}
        {renderVital('diastolic', currentVitals.bloodPressure?.diastolic, vitalConfig.diastolic)}
        {renderVital('respiratoryRate', currentVitals.respiratoryRate, vitalConfig.respiratoryRate)}
        {renderVital('temperature', currentVitals.temperature, vitalConfig.temperature)}
      </div>

      {/* Pain Level (if present) */}
      {currentVitals.painLevel !== undefined && (
        <div className="pain-scale">
          <span className="pain-label">Pain Level</span>
          <div className="pain-bar">
            <div 
              className="pain-fill"
              style={{ width: `${currentVitals.painLevel * 10}%` }}
            />
          </div>
          <span className="pain-value">{currentVitals.painLevel}/10</span>
        </div>
      )}

      <style>{`
        .vitals-monitor {
          padding: var(--space-md);
          height: 100%;
          overflow: auto;
        }

        .vitals-monitor.loading {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content {
          text-align: center;
          color: var(--text-muted);
        }

        .vitals-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-lg);
        }

        .vitals-header h2 {
          font-size: 1.25rem;
        }

        .status-badge {
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-radius: var(--radius-full);
          background: var(--bg-elevated);
          color: var(--text-muted);
        }

        .status-badge.live {
          background: var(--color-success);
          color: white;
          animation: pulse 2s infinite;
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-md);
        }

        .vital-card {
          background: var(--bg-card);
          border: 2px solid var(--border-muted);
          border-radius: var(--radius-lg);
          padding: var(--space-md);
          transition: all var(--transition-fast);
        }

        .vital-card.flash {
          transform: scale(1.02);
          box-shadow: 0 0 20px rgba(88, 166, 255, 0.3);
        }

        .vital-card.abnormal {
          border-color: var(--color-warning);
          background: rgba(210, 153, 34, 0.05);
        }

        .vital-card.critical {
          border-color: var(--color-danger);
          background: rgba(248, 81, 73, 0.08);
          animation: critical-pulse 1s infinite;
        }

        @keyframes critical-pulse {
          0%, 100% { border-color: var(--color-danger); }
          50% { border-color: rgba(248, 81, 73, 0.5); }
        }

        .vital-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
          color: var(--vital-color);
        }

        .vital-label {
          font-size: 0.85rem;
          font-weight: 500;
          flex: 1;
        }

        .alert-icon {
          color: var(--color-danger);
          animation: blink 0.5s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .vital-value {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: var(--space-xs);
        }

        .vital-value .value {
          font-family: var(--font-mono);
          font-size: 2rem;
          font-weight: 600;
          color: var(--vital-color);
          line-height: 1;
        }

        .vital-card.abnormal .vital-value .value {
          color: var(--color-warning);
        }

        .vital-card.critical .vital-value .value {
          color: var(--color-danger);
        }

        .vital-value .unit {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .vital-range {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .pain-scale {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-top: var(--space-lg);
          padding: var(--space-md);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
        }

        .pain-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          min-width: 80px;
        }

        .pain-bar {
          flex: 1;
          height: 12px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .pain-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-success), var(--color-warning), var(--color-danger));
          border-radius: var(--radius-full);
          transition: width var(--transition-normal);
        }

        .pain-value {
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--vital-pain);
          min-width: 40px;
          text-align: right;
        }

        @media (max-width: 380px) {
          .vitals-grid {
            grid-template-columns: 1fr;
          }

          .vital-value .value {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}

export default VitalsMonitor;
