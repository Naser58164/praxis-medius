import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  Volume2, VolumeX, Lightbulb, Activity, Heart, Wind, Zap,
  AlertTriangle, Play, Square, Sliders, Wifi, WifiOff,
  ChevronDown, ChevronRight, RefreshCw, Power
} from 'lucide-react';

const soundCategories = {
  BREATH_SOUNDS: {
    label: 'Breath Sounds',
    icon: Wind,
    sounds: [
      { id: 'wheeze_exp', label: 'Expiratory Wheeze', file: 'wheeze_expiratory.wav' },
      { id: 'wheeze_insp', label: 'Inspiratory Wheeze', file: 'wheeze_inspiratory.wav' },
      { id: 'crackles_fine', label: 'Fine Crackles', file: 'crackles_fine.wav' },
      { id: 'crackles_coarse', label: 'Coarse Crackles', file: 'crackles_coarse.wav' },
      { id: 'rhonchi', label: 'Rhonchi', file: 'rhonchi.wav' },
      { id: 'stridor', label: 'Stridor', file: 'stridor.wav' },
      { id: 'pleural_rub', label: 'Pleural Friction Rub', file: 'pleural_rub.wav' },
      { id: 'diminished', label: 'Diminished Breath Sounds', file: 'diminished.wav' },
    ]
  },
  HEART_SOUNDS: {
    label: 'Heart Sounds',
    icon: Heart,
    sounds: [
      { id: 's1s2_normal', label: 'S1/S2 Normal', file: 's1s2_normal.wav' },
      { id: 's3_gallop', label: 'S3 Gallop', file: 's3_gallop.wav' },
      { id: 's4_gallop', label: 'S4 Gallop', file: 's4_gallop.wav' },
      { id: 'murmur_systolic', label: 'Systolic Murmur', file: 'murmur_systolic.wav' },
      { id: 'murmur_diastolic', label: 'Diastolic Murmur', file: 'murmur_diastolic.wav' },
      { id: 'pericardial_rub', label: 'Pericardial Friction Rub', file: 'pericardial_rub.wav' },
      { id: 'irregular', label: 'Irregular Rhythm', file: 'irregular.wav' },
    ]
  },
  PATIENT_SOUNDS: {
    label: 'Patient Sounds',
    icon: Volume2,
    sounds: [
      { id: 'cough_dry', label: 'Dry Cough', file: 'cough_dry.wav' },
      { id: 'cough_productive', label: 'Productive Cough', file: 'cough_productive.wav' },
      { id: 'moan', label: 'Moaning', file: 'moan.wav' },
      { id: 'groan', label: 'Groaning', file: 'groan.wav' },
      { id: 'crying', label: 'Crying', file: 'crying.wav' },
      { id: 'vomiting', label: 'Vomiting', file: 'vomiting.wav' },
      { id: 'gasping', label: 'Gasping/Agonal', file: 'gasping.wav' },
    ]
  },
  BOWEL_SOUNDS: {
    label: 'Bowel Sounds',
    icon: Activity,
    sounds: [
      { id: 'bowel_normal', label: 'Normal Bowel Sounds', file: 'bowel_normal.wav' },
      { id: 'bowel_hyperactive', label: 'Hyperactive', file: 'bowel_hyperactive.wav' },
      { id: 'bowel_hypoactive', label: 'Hypoactive', file: 'bowel_hypoactive.wav' },
      { id: 'bowel_absent', label: 'Absent', file: 'bowel_absent.wav' },
    ]
  }
};

const ledZones = [
  { id: 'face', label: 'Face/Lips', position: { top: '10%', left: '45%' } },
  { id: 'chest', label: 'Chest', position: { top: '30%', left: '45%' } },
  { id: 'hands', label: 'Hands', position: { top: '50%', left: '20%' } },
  { id: 'feet', label: 'Feet', position: { top: '85%', left: '45%' } },
];

const ledColors = [
  { id: 'normal', label: 'Normal', color: '#ffdab3' },
  { id: 'pale', label: 'Pale', color: '#f5f5f5' },
  { id: 'cyanotic', label: 'Cyanotic', color: '#8fa6c4' },
  { id: 'flushed', label: 'Flushed', color: '#ffb3b3' },
  { id: 'jaundice', label: 'Jaundice', color: '#ffe066' },
  { id: 'mottled', label: 'Mottled', color: '#c4a8c4' },
];

const actuatorControls = [
  { id: 'pulse_radial', label: 'Radial Pulse', type: 'pulse' },
  { id: 'pulse_carotid', label: 'Carotid Pulse', type: 'pulse' },
  { id: 'pulse_femoral', label: 'Femoral Pulse', type: 'pulse' },
  { id: 'chest_rise', label: 'Chest Rise', type: 'motion' },
  { id: 'seizure', label: 'Seizure/Tremor', type: 'motion' },
  { id: 'eye_blink', label: 'Eye Blink', type: 'motion' },
];

function ManikinControlPanel() {
  const { socket, simulationStatus, participants } = useSocket();
  
  const [expandedCategories, setExpandedCategories] = useState({ BREATH_SOUNDS: true });
  const [activeSounds, setActiveSounds] = useState(new Set());
  const [soundVolumes, setSoundVolumes] = useState({});
  const [ledStates, setLedStates] = useState({});
  const [actuatorStates, setActuatorStates] = useState({});
  const [pulseRate, setPulseRate] = useState(80);
  const [respiratoryRate, setRespiratoryRate] = useState(16);
  const [pendingActions, setPendingActions] = useState(new Set());

  const manikinConnected = participants?.manikin?.connected;
  const isDisabled = simulationStatus !== 'RUNNING' || !manikinConnected;

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const sendIoTCommand = async (command, params = {}) => {
    if (!socket || isDisabled) return;
    
    const actionId = `${command}_${Date.now()}`;
    setPendingActions(prev => new Set([...prev, actionId]));
    
    return new Promise((resolve, reject) => {
      socket.emit('examiner_iot_command', { command, params }, (response) => {
        setPendingActions(prev => {
          const next = new Set(prev);
          next.delete(actionId);
          return next;
        });
        
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const toggleSound = async (soundId, file) => {
    try {
      if (activeSounds.has(soundId)) {
        await sendIoTCommand('stop_sound', { soundId });
        setActiveSounds(prev => {
          const next = new Set(prev);
          next.delete(soundId);
          return next;
        });
      } else {
        const volume = soundVolumes[soundId] || 70;
        await sendIoTCommand('play_sound', { soundId, file, volume, loop: true });
        setActiveSounds(prev => new Set([...prev, soundId]));
      }
    } catch (err) {
      console.error('Failed to toggle sound:', err);
    }
  };

  const updateSoundVolume = async (soundId, volume) => {
    setSoundVolumes(prev => ({ ...prev, [soundId]: volume }));
    if (activeSounds.has(soundId)) {
      try {
        await sendIoTCommand('set_volume', { soundId, volume });
      } catch (err) {
        console.error('Failed to update volume:', err);
      }
    }
  };

  const stopAllSounds = async () => {
    try {
      await sendIoTCommand('stop_all_sounds');
      setActiveSounds(new Set());
    } catch (err) {
      console.error('Failed to stop all sounds:', err);
    }
  };

  const setLedColor = async (zoneId, colorId) => {
    try {
      const color = ledColors.find(c => c.id === colorId);
      await sendIoTCommand('set_led', { zone: zoneId, color: color?.color || '#ffdab3' });
      setLedStates(prev => ({ ...prev, [zoneId]: colorId }));
    } catch (err) {
      console.error('Failed to set LED:', err);
    }
  };

  const toggleActuator = async (actuatorId, type) => {
    try {
      const isActive = actuatorStates[actuatorId];
      if (isActive) {
        await sendIoTCommand('stop_actuator', { actuatorId });
      } else {
        const rate = type === 'pulse' ? pulseRate : respiratoryRate;
        await sendIoTCommand('start_actuator', { actuatorId, rate });
      }
      setActuatorStates(prev => ({ ...prev, [actuatorId]: !isActive }));
    } catch (err) {
      console.error('Failed to toggle actuator:', err);
    }
  };

  const resetManikin = async () => {
    try {
      await sendIoTCommand('reset_all');
      setActiveSounds(new Set());
      setLedStates({});
      setActuatorStates({});
    } catch (err) {
      console.error('Failed to reset manikin:', err);
    }
  };

  return (
    <div className="manikin-control-panel">
      {/* Connection Status */}
      <div className={`connection-banner ${manikinConnected ? 'connected' : 'disconnected'}`}>
        {manikinConnected ? (
          <>
            <Wifi size={16} />
            <span>Manikin Gateway Connected</span>
            <span className="signal-strength">Signal: Strong</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span>Manikin Gateway Not Connected</span>
            <span className="hint">Connect the IoT gateway to enable controls</span>
          </>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="quick-actions">
        <button 
          className="btn btn-danger"
          onClick={stopAllSounds}
          disabled={isDisabled}
        >
          <VolumeX size={16} /> Stop All Sounds
        </button>
        <button 
          className="btn btn-warning"
          onClick={resetManikin}
          disabled={isDisabled}
        >
          <RefreshCw size={16} /> Reset Manikin
        </button>
        <div className="rate-controls">
          <div className="rate-control">
            <label>Pulse Rate:</label>
            <input 
              type="number" 
              value={pulseRate} 
              onChange={(e) => setPulseRate(parseInt(e.target.value))}
              min={0} 
              max={200}
              disabled={isDisabled}
            />
            <span>bpm</span>
          </div>
          <div className="rate-control">
            <label>RR:</label>
            <input 
              type="number" 
              value={respiratoryRate} 
              onChange={(e) => setRespiratoryRate(parseInt(e.target.value))}
              min={0} 
              max={60}
              disabled={isDisabled}
            />
            <span>/min</span>
          </div>
        </div>
      </div>

      <div className="control-sections">
        {/* Sound Controls */}
        <div className="control-section">
          <h3><Volume2 size={18} /> Sound Controls</h3>
          
          {Object.entries(soundCategories).map(([catId, category]) => {
            const Icon = category.icon;
            const isExpanded = expandedCategories[catId];
            
            return (
              <div key={catId} className="sound-category">
                <button 
                  className="category-header"
                  onClick={() => toggleCategory(catId)}
                >
                  <Icon size={16} />
                  <span>{category.label}</span>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {isExpanded && (
                  <div className="sound-grid">
                    {category.sounds.map(sound => {
                      const isActive = activeSounds.has(sound.id);
                      return (
                        <div key={sound.id} className={`sound-card ${isActive ? 'active' : ''}`}>
                          <button
                            className={`sound-toggle ${isActive ? 'playing' : ''}`}
                            onClick={() => toggleSound(sound.id, sound.file)}
                            disabled={isDisabled}
                          >
                            {isActive ? <Square size={14} /> : <Play size={14} />}
                          </button>
                          <span className="sound-label">{sound.label}</span>
                          <input
                            type="range"
                            className="volume-slider"
                            min={0}
                            max={100}
                            value={soundVolumes[sound.id] || 70}
                            onChange={(e) => updateSoundVolume(sound.id, parseInt(e.target.value))}
                            disabled={isDisabled}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* LED Controls */}
        <div className="control-section">
          <h3><Lightbulb size={18} /> Skin Color (LEDs)</h3>
          
          <div className="led-body-map">
            <div className="body-outline">
              {ledZones.map(zone => (
                <div 
                  key={zone.id}
                  className="led-zone"
                  style={{ 
                    top: zone.position.top, 
                    left: zone.position.left,
                    background: ledColors.find(c => c.id === ledStates[zone.id])?.color || '#ffdab3'
                  }}
                >
                  <span className="zone-label">{zone.label}</span>
                </div>
              ))}
            </div>
            
            <div className="led-controls">
              {ledZones.map(zone => (
                <div key={zone.id} className="led-control-row">
                  <span className="zone-name">{zone.label}</span>
                  <div className="color-options">
                    {ledColors.map(color => (
                      <button
                        key={color.id}
                        className={`color-btn ${ledStates[zone.id] === color.id ? 'selected' : ''}`}
                        style={{ background: color.color }}
                        onClick={() => setLedColor(zone.id, color.id)}
                        disabled={isDisabled}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actuator Controls */}
        <div className="control-section">
          <h3><Zap size={18} /> Actuators & Motors</h3>
          
          <div className="actuator-grid">
            {actuatorControls.map(actuator => {
              const isActive = actuatorStates[actuator.id];
              return (
                <div key={actuator.id} className={`actuator-card ${isActive ? 'active' : ''}`}>
                  <span className="actuator-label">{actuator.label}</span>
                  <span className="actuator-type">{actuator.type}</span>
                  <button
                    className={`actuator-toggle ${isActive ? 'on' : 'off'}`}
                    onClick={() => toggleActuator(actuator.id, actuator.type)}
                    disabled={isDisabled}
                  >
                    <Power size={16} />
                    {isActive ? 'ON' : 'OFF'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isDisabled && !manikinConnected && (
        <div className="disabled-overlay">
          <AlertTriangle size={24} />
          <span>Connect manikin gateway to enable controls</span>
        </div>
      )}

      <style>{`
        .manikin-control-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          position: relative;
        }

        .connection-banner {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
        }

        .connection-banner.connected {
          background: rgba(63, 185, 80, 0.15);
          color: var(--color-success);
          border: 1px solid var(--color-success);
        }

        .connection-banner.disconnected {
          background: rgba(248, 81, 73, 0.15);
          color: var(--color-danger);
          border: 1px solid var(--color-danger);
        }

        .signal-strength, .hint {
          margin-left: auto;
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .quick-actions {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .rate-controls {
          display: flex;
          gap: var(--space-md);
          margin-left: auto;
        }

        .rate-control {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.85rem;
        }

        .rate-control input {
          width: 60px;
          padding: var(--space-xs);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          text-align: center;
        }

        .control-sections {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .control-section {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: var(--space-md);
        }

        .control-section h3 {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .sound-category {
          margin-bottom: var(--space-sm);
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-elevated);
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
        }

        .category-header span {
          flex: 1;
          text-align: left;
        }

        .category-header:hover {
          background: var(--bg-card);
        }

        .sound-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-sm);
          padding: var(--space-sm);
        }

        .sound-card {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm);
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-sm);
        }

        .sound-card.active {
          border-color: var(--color-success);
          background: rgba(63, 185, 80, 0.05);
        }

        .sound-toggle {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
        }

        .sound-toggle:hover:not(:disabled) {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .sound-toggle.playing {
          background: var(--color-success);
          border-color: var(--color-success);
          color: white;
        }

        .sound-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sound-label {
          flex: 1;
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .volume-slider {
          width: 60px;
          accent-color: var(--color-info);
        }

        .led-body-map {
          display: flex;
          gap: var(--space-lg);
        }

        .body-outline {
          width: 120px;
          height: 200px;
          background: var(--bg-elevated);
          border-radius: var(--radius-lg);
          position: relative;
          border: 2px dashed var(--border-muted);
        }

        .led-zone {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          border: 2px solid var(--border-default);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .zone-label {
          position: absolute;
          bottom: -18px;
          font-size: 0.65rem;
          white-space: nowrap;
          color: var(--text-muted);
        }

        .led-controls {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .led-control-row {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .zone-name {
          width: 80px;
          font-size: 0.85rem;
        }

        .color-options {
          display: flex;
          gap: var(--space-xs);
        }

        .color-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .color-btn:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .color-btn.selected {
          border-color: var(--color-info);
          box-shadow: 0 0 0 2px var(--bg-primary);
        }

        .color-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .actuator-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: var(--space-sm);
        }

        .actuator-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          padding: var(--space-md);
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
        }

        .actuator-card.active {
          border-color: var(--color-success);
          background: rgba(63, 185, 80, 0.05);
        }

        .actuator-label {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .actuator-type {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .actuator-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-xs);
          padding: var(--space-sm);
          border: none;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          margin-top: auto;
        }

        .actuator-toggle.off {
          background: var(--bg-tertiary);
          color: var(--text-muted);
        }

        .actuator-toggle.on {
          background: var(--color-success);
          color: white;
        }

        .actuator-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .disabled-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 14, 20, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-md);
          color: var(--text-muted);
          border-radius: var(--radius-lg);
        }
      `}</style>
    </div>
  );
}

export default ManikinControlPanel;
