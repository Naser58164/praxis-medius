import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  Stethoscope, Heart, Brain, Activity, ChevronDown, ChevronRight, 
  AlertCircle
} from 'lucide-react';

// Options for dropdowns
const breathSoundOptions = [
  'Clear',
  'Diminished',
  'Wheezes',
  'Expiratory wheezes',
  'Inspiratory wheezes',
  'Crackles (fine)',
  'Crackles (coarse)',
  'Rhonchi',
  'Stridor',
  'Absent'
];

const heartSoundOptions = [
  'S1, S2 normal',
  'S1, S2 with S3 gallop',
  'S1, S2 with S4 gallop',
  'Systolic murmur',
  'Diastolic murmur',
  'Irregular rhythm',
  'Tachycardic',
  'Bradycardic',
  'Muffled',
  'Rub'
];

const rhythmOptions = ['Regular', 'Irregular', 'Irregularly irregular'];
const pulseOptions = ['Strong, equal bilaterally', 'Weak', 'Bounding', 'Thready', 'Absent left pedal', 'Absent right pedal'];
const edemaOptions = ['None', '+1 pitting', '+2 pitting', '+3 pitting', '+4 pitting', 'Non-pitting'];
const locOptions = ['Alert', 'Drowsy', 'Lethargic', 'Obtunded', 'Stuporous', 'Comatose'];
const orientationOptions = [
  'Oriented x4 (person, place, time, situation)',
  'Oriented x3 (person, place, time)',
  'Oriented x2 (person, place)',
  'Oriented x1 (person only)',
  'Disoriented'
];
const pupilOptions = [
  'PERRLA, 3mm bilaterally',
  'PERRLA, 4mm bilaterally',
  'Sluggish reaction',
  'Fixed and dilated',
  'Unequal (anisocoria)',
  'Pinpoint'
];
const motorOptions = [
  '5/5 all extremities',
  '4/5 (mild weakness)',
  '3/5 (moderate weakness)',
  '2/5 (severe weakness)',
  'Unilateral weakness (left)',
  'Unilateral weakness (right)',
  'Paralysis'
];
const speechOptions = ['Clear and coherent', 'Slurred', 'Aphasia', 'Dysarthria', 'Confused', 'Nonverbal'];
const breathingPatternOptions = ['Regular, unlabored', 'Labored', 'Shallow', 'Deep', 'Kussmaul', 'Cheyne-Stokes', 'Agonal'];
const coughOptions = ['None', 'Dry, non-productive', 'Productive - clear', 'Productive - yellow/green', 'Productive - blood-tinged', 'Barking'];
const bowelSoundOptions = ['Present in all quadrants', 'Hyperactive', 'Hypoactive', 'Absent'];
const abdomenOptions = ['Soft, non-tender, non-distended', 'Soft, tender', 'Distended', 'Rigid', 'Guarding present'];

function FindingsControlPanel() {
  const { currentFindings, updateFindings, simulationStatus } = useSocket();
  
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    respiratory: true,
    cardiac: true,
    neurological: true,
    abdominal: false
  });

  // Local state for findings
  const [localFindings, setLocalFindings] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(new Set());

  const isDisabled = simulationStatus !== 'RUNNING';

  // Sync with server state
  useEffect(() => {
    if (currentFindings) {
      setLocalFindings(currentFindings);
    }
  }, [currentFindings]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle finding changes
  const handleFindingChange = async (path, value) => {
    setLocalFindings(prev => {
      const updated = JSON.parse(JSON.stringify(prev || {}));
      const pathParts = path.split('.');
      let obj = updated;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!obj[pathParts[i]]) obj[pathParts[i]] = {};
        obj = obj[pathParts[i]];
      }
      obj[pathParts[pathParts.length - 1]] = value;
      return updated;
    });

    setPendingChanges(prev => new Set([...prev, path]));

    try {
      await updateFindings(path, value);
      setTimeout(() => {
        setPendingChanges(prev => {
          const next = new Set(prev);
          next.delete(path);
          return next;
        });
      }, 300);
    } catch (err) {
      console.error('Failed to update finding:', err);
    }
  };

  // Helper to get nested value
  const getValue = (path) => {
    if (!localFindings) return '';
    const pathParts = path.split('.');
    let obj = localFindings;
    for (const part of pathParts) {
      if (obj === undefined || obj === null) return '';
      obj = obj[part];
    }
    return obj ?? '';
  };

  if (!localFindings) {
    return (
      <div className="findings-loading">
        <div className="spinner" />
        <p>Loading findings...</p>
      </div>
    );
  }

  return (
    <div className="findings-control-panel">
      <div className="panel-header">
        <h3>Physical Findings Control</h3>
        <p className="text-muted">Modify auscultation sounds and physical exam findings in real-time</p>
      </div>

      {/* RESPIRATORY SECTION */}
      <div className="findings-section">
        <button 
          className={`section-header ${expandedSections.respiratory ? 'expanded' : ''}`}
          onClick={() => toggleSection('respiratory')}
        >
          <div className="section-title">
            <Stethoscope size={18} />
            <span>Respiratory Findings</span>
          </div>
          {expandedSections.respiratory ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {expandedSections.respiratory && (
          <div className="section-content">
            <div className="subsection-title">Lung Auscultation</div>
            <div className="lung-grid">
              <div className="lung-side">
                <h4>Right Lung</h4>
                <SelectField label="Upper Lobe (RUL)" value={getValue('respiratory.breathSounds.rightUpperLobe')} options={breathSoundOptions} onChange={(v) => handleFindingChange('respiratory.breathSounds.rightUpperLobe', v)} disabled={isDisabled} />
                <SelectField label="Middle Lobe (RML)" value={getValue('respiratory.breathSounds.rightMiddleLobe')} options={breathSoundOptions} onChange={(v) => handleFindingChange('respiratory.breathSounds.rightMiddleLobe', v)} disabled={isDisabled} />
                <SelectField label="Lower Lobe (RLL)" value={getValue('respiratory.breathSounds.rightLowerLobe')} options={breathSoundOptions} onChange={(v) => handleFindingChange('respiratory.breathSounds.rightLowerLobe', v)} disabled={isDisabled} />
              </div>
              <div className="lung-side">
                <h4>Left Lung</h4>
                <SelectField label="Upper Lobe (LUL)" value={getValue('respiratory.breathSounds.leftUpperLobe')} options={breathSoundOptions} onChange={(v) => handleFindingChange('respiratory.breathSounds.leftUpperLobe', v)} disabled={isDisabled} />
                <SelectField label="Lower Lobe (LLL)" value={getValue('respiratory.breathSounds.leftLowerLobe')} options={breathSoundOptions} onChange={(v) => handleFindingChange('respiratory.breathSounds.leftLowerLobe', v)} disabled={isDisabled} />
              </div>
            </div>

            <div className="subsection-title">Other Respiratory Findings</div>
            <div className="findings-grid">
              <SelectField label="Breathing Pattern" value={getValue('respiratory.breathingPattern')} options={breathingPatternOptions} onChange={(v) => handleFindingChange('respiratory.breathingPattern', v)} disabled={isDisabled} />
              <SelectField label="Cough" value={getValue('respiratory.cough')} options={coughOptions} onChange={(v) => handleFindingChange('respiratory.cough', v)} disabled={isDisabled} />
              <ToggleField label="Accessory Muscle Use" value={getValue('respiratory.accessoryMuscleUse')} onChange={(v) => handleFindingChange('respiratory.accessoryMuscleUse', v)} disabled={isDisabled} />
              <SelectField label="Oxygen Device" value={getValue('respiratory.oxygenDevice')} options={['Room air', 'Nasal cannula', 'Simple mask', 'Non-rebreather', 'Venturi mask', 'High-flow', 'BiPAP', 'Ventilator']} onChange={(v) => handleFindingChange('respiratory.oxygenDevice', v)} disabled={isDisabled} />
            </div>
          </div>
        )}
      </div>

      {/* CARDIAC SECTION */}
      <div className="findings-section">
        <button 
          className={`section-header ${expandedSections.cardiac ? 'expanded' : ''}`}
          onClick={() => toggleSection('cardiac')}
        >
          <div className="section-title">
            <Heart size={18} />
            <span>Cardiac Findings</span>
          </div>
          {expandedSections.cardiac ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {expandedSections.cardiac && (
          <div className="section-content">
            <div className="subsection-title">Heart Auscultation Areas</div>
            <div className="heart-grid">
              <HeartAreaField label="Aortic" position="2nd ICS, RSB" value={getValue('cardiac.heartSounds.aortic')} options={heartSoundOptions} onChange={(v) => handleFindingChange('cardiac.heartSounds.aortic', v)} disabled={isDisabled} />
              <HeartAreaField label="Pulmonic" position="2nd ICS, LSB" value={getValue('cardiac.heartSounds.pulmonic')} options={heartSoundOptions} onChange={(v) => handleFindingChange('cardiac.heartSounds.pulmonic', v)} disabled={isDisabled} />
              <HeartAreaField label="Erb's Point" position="3rd ICS, LSB" value={getValue('cardiac.heartSounds.erbs')} options={heartSoundOptions} onChange={(v) => handleFindingChange('cardiac.heartSounds.erbs', v)} disabled={isDisabled} />
              <HeartAreaField label="Tricuspid" position="4th ICS, LSB" value={getValue('cardiac.heartSounds.tricuspid')} options={heartSoundOptions} onChange={(v) => handleFindingChange('cardiac.heartSounds.tricuspid', v)} disabled={isDisabled} />
              <HeartAreaField label="Mitral (Apical)" position="5th ICS, MCL" value={getValue('cardiac.heartSounds.mitral')} options={heartSoundOptions} onChange={(v) => handleFindingChange('cardiac.heartSounds.mitral', v)} disabled={isDisabled} />
            </div>

            <div className="subsection-title">Other Cardiac Findings</div>
            <div className="findings-grid">
              <SelectField label="Rhythm" value={getValue('cardiac.rhythm')} options={rhythmOptions} onChange={(v) => handleFindingChange('cardiac.rhythm', v)} disabled={isDisabled} />
              <SelectField label="Peripheral Pulses" value={getValue('cardiac.peripheralPulses')} options={pulseOptions} onChange={(v) => handleFindingChange('cardiac.peripheralPulses', v)} disabled={isDisabled} />
              <SelectField label="Capillary Refill" value={getValue('cardiac.capillaryRefill')} options={['< 2 seconds', '2-3 seconds', '> 3 seconds']} onChange={(v) => handleFindingChange('cardiac.capillaryRefill', v)} disabled={isDisabled} />
              <SelectField label="Edema" value={getValue('cardiac.edema')} options={edemaOptions} onChange={(v) => handleFindingChange('cardiac.edema', v)} disabled={isDisabled} />
              <ToggleField label="JVD Present" value={getValue('cardiac.jvd')} onChange={(v) => handleFindingChange('cardiac.jvd', v)} disabled={isDisabled} />
            </div>
          </div>
        )}
      </div>

      {/* NEUROLOGICAL SECTION */}
      <div className="findings-section">
        <button 
          className={`section-header ${expandedSections.neurological ? 'expanded' : ''}`}
          onClick={() => toggleSection('neurological')}
        >
          <div className="section-title">
            <Brain size={18} />
            <span>Neurological Findings</span>
          </div>
          {expandedSections.neurological ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {expandedSections.neurological && (
          <div className="section-content">
            <div className="findings-grid">
              <SelectField label="Level of Consciousness" value={getValue('neurological.levelOfConsciousness')} options={locOptions} onChange={(v) => handleFindingChange('neurological.levelOfConsciousness', v)} disabled={isDisabled} />
              <SelectField label="Orientation" value={getValue('neurological.orientation')} options={orientationOptions} onChange={(v) => handleFindingChange('neurological.orientation', v)} disabled={isDisabled} />
              <SelectField label="Pupils" value={getValue('neurological.pupils')} options={pupilOptions} onChange={(v) => handleFindingChange('neurological.pupils', v)} disabled={isDisabled} />
              <SelectField label="Motor Strength" value={getValue('neurological.motorStrength')} options={motorOptions} onChange={(v) => handleFindingChange('neurological.motorStrength', v)} disabled={isDisabled} />
              <SelectField label="Sensation" value={getValue('neurological.sensation')} options={['Intact to light touch', 'Diminished', 'Absent', 'Paresthesias']} onChange={(v) => handleFindingChange('neurological.sensation', v)} disabled={isDisabled} />
              <SelectField label="Speech" value={getValue('neurological.speech')} options={speechOptions} onChange={(v) => handleFindingChange('neurological.speech', v)} disabled={isDisabled} />
            </div>

            <div className="subsection-title">Glasgow Coma Scale</div>
            <div className="gcs-grid">
              <SelectField label="Eye Opening (E)" value={getValue('neurological.gcs.eye')} options={['4 - Spontaneous', '3 - To voice', '2 - To pain', '1 - None']} onChange={(v) => handleFindingChange('neurological.gcs.eye', parseInt(v))} disabled={isDisabled} />
              <SelectField label="Verbal Response (V)" value={getValue('neurological.gcs.verbal')} options={['5 - Oriented', '4 - Confused', '3 - Inappropriate', '2 - Incomprehensible', '1 - None']} onChange={(v) => handleFindingChange('neurological.gcs.verbal', parseInt(v))} disabled={isDisabled} />
              <SelectField label="Motor Response (M)" value={getValue('neurological.gcs.motor')} options={['6 - Obeys commands', '5 - Localizes pain', '4 - Withdraws', '3 - Flexion', '2 - Extension', '1 - None']} onChange={(v) => handleFindingChange('neurological.gcs.motor', parseInt(v))} disabled={isDisabled} />
            </div>
          </div>
        )}
      </div>

      {/* ABDOMINAL SECTION */}
      <div className="findings-section">
        <button 
          className={`section-header ${expandedSections.abdominal ? 'expanded' : ''}`}
          onClick={() => toggleSection('abdominal')}
        >
          <div className="section-title">
            <Activity size={18} />
            <span>Abdominal Findings</span>
          </div>
          {expandedSections.abdominal ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {expandedSections.abdominal && (
          <div className="section-content">
            <div className="findings-grid">
              <SelectField label="Bowel Sounds" value={getValue('abdominal.bowelSounds')} options={bowelSoundOptions} onChange={(v) => handleFindingChange('abdominal.bowelSounds', v)} disabled={isDisabled} />
              <SelectField label="Abdomen" value={getValue('abdominal.abdomen')} options={abdomenOptions} onChange={(v) => handleFindingChange('abdominal.abdomen', v)} disabled={isDisabled} />
              <ToggleField label="Distension Present" value={getValue('abdominal.distension')} onChange={(v) => handleFindingChange('abdominal.distension', v)} disabled={isDisabled} />
            </div>
          </div>
        )}
      </div>

      {isDisabled && (
        <div className="disabled-notice">
          <AlertCircle size={16} />
          <span>Start simulation to modify findings</span>
        </div>
      )}

      <style>{`
        .findings-control-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .findings-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-md);
          padding: var(--space-2xl);
          color: var(--text-muted);
        }

        .panel-header h3 {
          margin-bottom: var(--space-xs);
        }

        .findings-section {
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-tertiary);
        }

        .section-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .section-header:hover {
          background: var(--bg-elevated);
        }

        .section-header.expanded {
          border-bottom: 1px solid var(--border-muted);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .section-content {
          padding: var(--space-md);
          background: var(--bg-card);
        }

        .subsection-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-md);
          margin-top: var(--space-md);
          padding-bottom: var(--space-xs);
          border-bottom: 1px solid var(--border-muted);
        }

        .subsection-title:first-child {
          margin-top: 0;
        }

        .lung-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
        }

        .lung-side h4 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-sm);
        }

        .heart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: var(--space-md);
        }

        .findings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: var(--space-md);
        }

        .gcs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-md);
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
        }
      `}</style>
    </div>
  );
}

// Sub-components

function SelectField({ label, value, options, onChange, disabled, pending }) {
  return (
    <div className={`select-field ${pending ? 'pending' : ''}`}>
      <label>{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {options.map(opt => <option key={opt} value={typeof opt === 'string' ? opt : opt.toString()}>{opt}</option>)}
      </select>
      <style>{`
        .select-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: var(--space-sm); }
        .select-field.pending select { border-color: var(--color-warning); box-shadow: 0 0 0 2px rgba(210, 153, 34, 0.2); }
        .select-field label { font-size: 0.8rem; color: var(--text-muted); }
        .select-field select { padding: var(--space-sm) var(--space-md); background: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 0.9rem; cursor: pointer; }
        .select-field select:hover:not(:disabled) { border-color: var(--border-accent); }
        .select-field select:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function HeartAreaField({ label, position, value, options, onChange, disabled }) {
  return (
    <div className="heart-area-field">
      <div className="heart-area-header">
        <span className="heart-area-label">{label}</span>
        <span className="heart-area-position">{position}</span>
      </div>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <style>{`
        .heart-area-field { background: var(--bg-tertiary); padding: var(--space-sm); border-radius: var(--radius-sm); border: 1px solid var(--border-muted); }
        .heart-area-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs); }
        .heart-area-label { font-weight: 600; font-size: 0.85rem; color: var(--text-primary); }
        .heart-area-position { font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); }
        .heart-area-field select { width: 100%; padding: var(--space-xs) var(--space-sm); background: var(--bg-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 0.85rem; }
        .heart-area-field select:disabled { opacity: 0.5; }
      `}</style>
    </div>
  );
}

function ToggleField({ label, value, onChange, disabled }) {
  return (
    <div className="toggle-field">
      <label>{label}</label>
      <button className={`toggle-btn ${value ? 'active' : ''}`} onClick={() => onChange(!value)} disabled={disabled}>
        {value ? '✓ Yes' : 'No'}
      </button>
      <style>{`
        .toggle-field { display: flex; align-items: center; justify-content: space-between; padding: var(--space-sm) 0; }
        .toggle-field label { font-size: 0.9rem; color: var(--text-primary); }
        .toggle-btn { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs) var(--space-md); border-radius: var(--radius-md); font-weight: 500; font-size: 0.85rem; cursor: pointer; transition: all var(--transition-fast); border: 1px solid var(--border-default); background: var(--bg-elevated); color: var(--text-secondary); min-width: 70px; justify-content: center; }
        .toggle-btn.active { background: var(--color-warning); color: var(--bg-primary); border-color: var(--color-warning); }
        .toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .toggle-btn:hover:not(:disabled):not(.active) { border-color: var(--border-accent); color: var(--text-primary); }
      `}</style>
    </div>
  );
}

export default FindingsControlPanel;
