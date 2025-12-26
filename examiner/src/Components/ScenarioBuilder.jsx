import React, { useState, useEffect } from 'react';
import { 
  Save, X, Plus, Trash2, ChevronDown, ChevronRight, 
  User, Activity, FileText, AlertTriangle, Clock, Star,
  ArrowRight, Zap, CheckCircle, XCircle, Timer
} from 'lucide-react';

const categories = [
  'Respiratory', 'Cardiac', 'Neurological', 'Trauma', 
  'Pediatric', 'OB/GYN', 'Psychiatric', 'Other'
];

const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const defaultVitals = {
  heartRate: 80,
  bloodPressure: { systolic: 120, diastolic: 80 },
  respiratoryRate: 16,
  oxygenSaturation: 98,
  temperature: 37.0,
  painLevel: 0
};

const defaultFindings = {
  respiratory: {
    breathSounds: {
      rightUpperLobe: 'Clear',
      rightMiddleLobe: 'Clear',
      rightLowerLobe: 'Clear',
      leftUpperLobe: 'Clear',
      leftLowerLobe: 'Clear'
    },
    breathingPattern: 'Regular, unlabored',
    accessoryMuscleUse: false
  },
  cardiac: {
    heartSounds: {
      aortic: 'S1, S2 normal',
      pulmonic: 'S1, S2 normal',
      erbs: 'S1, S2 normal',
      tricuspid: 'S1, S2 normal',
      mitral: 'S1, S2 normal'
    },
    rhythm: 'Regular',
    jvd: false
  },
  neurological: {
    levelOfConsciousness: 'Alert',
    orientation: 'Oriented x4 (person, place, time, situation)',
    pupils: 'PERRLA, 3mm bilaterally',
    motorStrength: '5/5 all extremities',
    speech: 'Clear and coherent'
  }
};

const dimensionOptions = [
  { id: 'SAFETY', label: 'Safety', color: '#f0883e' },
  { id: 'COMMUNICATION', label: 'Communication', color: '#a371f7' },
  { id: 'ASSESSMENT', label: 'Assessment', color: '#58a6ff' },
  { id: 'INTERVENTION', label: 'Intervention', color: '#3fb950' },
  { id: 'DRUG_IV', label: 'Drug & IV', color: '#f778ba' },
  { id: 'TESTS_DIAGNOSTICS', label: 'Tests & Diagnostics', color: '#79c0ff' }
];

function ScenarioBuilder({ scenario, onSave, onCancel }) {
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    category: 'Respiratory',
    difficulty: 'Intermediate',
    estimatedDuration: 15,
    description: '',
    objectives: [''],
    tags: [],
    patient: {
      firstName: '',
      lastName: '',
      age: 45,
      gender: 'Male',
      roomNumber: '101',
      codeStatus: 'Full Code',
      allergies: [],
      admissionDiagnosis: '',
      chiefComplaint: '',
      medicalHistory: [],
      currentMedications: []
    },
    initialVitals: { ...defaultVitals },
    initialFindings: { ...defaultFindings },
    criticalActions: [],
    progressionMap: []
  });

  const [newTag, setNewTag] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newHistory, setNewHistory] = useState('');
  const [saving, setSaving] = useState(false);

  // Load existing scenario if editing
  useEffect(() => {
    if (scenario) {
      setFormData(prev => ({
        ...prev,
        ...scenario,
        patient: { ...prev.patient, ...scenario.patient },
        initialVitals: { ...prev.initialVitals, ...scenario.initialVitals },
        initialFindings: { ...prev.initialFindings, ...scenario.initialFindings }
      }));
    }
  }, [scenario]);

  const updateField = (path, value) => {
    setFormData(prev => {
      const updated = { ...prev };
      const parts = path.split('.');
      let obj = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return updated;
    });
  };

  const addArrayItem = (path, item) => {
    setFormData(prev => {
      const updated = { ...prev };
      const parts = path.split('.');
      let obj = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = [...obj[parts[parts.length - 1]], item];
      return updated;
    });
  };

  const removeArrayItem = (path, index) => {
    setFormData(prev => {
      const updated = { ...prev };
      const parts = path.split('.');
      let obj = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = obj[parts[parts.length - 1]].filter((_, i) => i !== index);
      return updated;
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      addArrayItem('tags', newTag.trim());
      setNewTag('');
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      addArrayItem('patient.allergies', newAllergy.trim());
      setNewAllergy('');
    }
  };

  const handleAddHistory = () => {
    if (newHistory.trim()) {
      addArrayItem('patient.medicalHistory', newHistory.trim());
      setNewHistory('');
    }
  };

  const handleAddCriticalAction = () => {
    addArrayItem('criticalActions', {
      id: `ca_${Date.now()}`,
      actionId: '',
      label: '',
      dimension: 'SAFETY',
      timeLimit: null,
      required: true
    });
  };

  const updateCriticalAction = (index, field, value) => {
    setFormData(prev => {
      const updated = { ...prev };
      updated.criticalActions[index][field] = value;
      return { ...updated };
    });
  };

  const handleAddObjective = () => {
    addArrayItem('objectives', '');
  };

  const updateObjective = (index, value) => {
    setFormData(prev => {
      const updated = { ...prev };
      updated.objectives[index] = value;
      return { ...updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Failed to save scenario:', err);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'patient', label: 'Patient', icon: User },
    { id: 'vitals', label: 'Initial Vitals', icon: Activity },
    { id: 'actions', label: 'Critical Actions', icon: Star },
    { id: 'progression', label: 'Progression Map', icon: ArrowRight }
  ];

  return (
    <div className="scenario-builder">
      {/* Header */}
      <div className="builder-header">
        <h2>{scenario ? 'Edit Scenario' : 'Create New Scenario'}</h2>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            <X size={18} /> Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving || !formData.title.trim()}
          >
            {saving ? <div className="spinner-sm" /> : <Save size={18} />}
            Save Scenario
          </button>
        </div>
      </div>

      <div className="builder-content">
        {/* Sidebar Navigation */}
        <div className="builder-sidebar">
          {sections.map(section => (
            <button
              key={section.id}
              className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon size={18} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Main Form */}
        <div className="builder-main">
          {/* Basic Info Section */}
          {activeSection === 'basic' && (
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>Scenario Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Severe Asthma Exacerbation"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => updateField('difficulty', e.target.value)}
                  >
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => updateField('estimatedDuration', parseInt(e.target.value))}
                    min={5}
                    max={120}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief description of the scenario..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Learning Objectives</label>
                {formData.objectives.map((obj, i) => (
                  <div key={i} className="array-input-row">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => updateObjective(i, e.target.value)}
                      placeholder={`Objective ${i + 1}`}
                    />
                    <button 
                      className="btn-icon danger"
                      onClick={() => removeArrayItem('objectives', i)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button className="btn btn-sm btn-ghost" onClick={handleAddObjective}>
                  <Plus size={14} /> Add Objective
                </button>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {formData.tags.map((tag, i) => (
                      <span key={i} className="tag">
                        {tag}
                        <button onClick={() => removeArrayItem('tags', i)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-add">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add tag..."
                    />
                    <button className="btn btn-sm" onClick={handleAddTag}>Add</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patient Section */}
          {activeSection === 'patient' && (
            <div className="form-section">
              <h3>Patient Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={formData.patient.firstName}
                    onChange={(e) => updateField('patient.firstName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.patient.lastName}
                    onChange={(e) => updateField('patient.lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={formData.patient.age}
                    onChange={(e) => updateField('patient.age', parseInt(e.target.value))}
                    min={0}
                    max={120}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.patient.gender}
                    onChange={(e) => updateField('patient.gender', e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Room Number</label>
                  <input
                    type="text"
                    value={formData.patient.roomNumber}
                    onChange={(e) => updateField('patient.roomNumber', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Code Status</label>
                <select
                  value={formData.patient.codeStatus}
                  onChange={(e) => updateField('patient.codeStatus', e.target.value)}
                >
                  <option value="Full Code">Full Code</option>
                  <option value="DNR">DNR</option>
                  <option value="DNR/DNI">DNR/DNI</option>
                  <option value="Comfort Care">Comfort Care</option>
                </select>
              </div>

              <div className="form-group">
                <label>Chief Complaint</label>
                <input
                  type="text"
                  value={formData.patient.chiefComplaint}
                  onChange={(e) => updateField('patient.chiefComplaint', e.target.value)}
                  placeholder="e.g., Shortness of breath"
                />
              </div>

              <div className="form-group">
                <label>Admission Diagnosis</label>
                <input
                  type="text"
                  value={formData.patient.admissionDiagnosis}
                  onChange={(e) => updateField('patient.admissionDiagnosis', e.target.value)}
                  placeholder="e.g., Acute asthma exacerbation"
                />
              </div>

              <div className="form-group">
                <label>
                  <AlertTriangle size={14} className="warning-icon" />
                  Allergies
                </label>
                <div className="allergy-list">
                  {formData.patient.allergies.map((allergy, i) => (
                    <span key={i} className="allergy-tag">
                      {allergy}
                      <button onClick={() => removeArrayItem('patient.allergies', i)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="array-add-row">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
                    placeholder="Add allergy..."
                  />
                  <button className="btn btn-sm" onClick={handleAddAllergy}>Add</button>
                </div>
              </div>

              <div className="form-group">
                <label>Medical History</label>
                <div className="history-list">
                  {formData.patient.medicalHistory.map((item, i) => (
                    <div key={i} className="history-item">
                      {item}
                      <button onClick={() => removeArrayItem('patient.medicalHistory', i)}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="array-add-row">
                  <input
                    type="text"
                    value={newHistory}
                    onChange={(e) => setNewHistory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddHistory()}
                    placeholder="Add medical history item..."
                  />
                  <button className="btn btn-sm" onClick={handleAddHistory}>Add</button>
                </div>
              </div>
            </div>
          )}

          {/* Vitals Section */}
          {activeSection === 'vitals' && (
            <div className="form-section">
              <h3>Initial Vital Signs</h3>
              <p className="text-muted">Set the patient's vital signs at the start of the simulation</p>

              <div className="vitals-grid">
                <div className="vital-input-card">
                  <label>Heart Rate</label>
                  <div className="vital-input-row">
                    <input
                      type="number"
                      value={formData.initialVitals.heartRate}
                      onChange={(e) => updateField('initialVitals.heartRate', parseInt(e.target.value))}
                      min={20}
                      max={250}
                    />
                    <span className="unit">bpm</span>
                  </div>
                  <span className="normal-range">Normal: 60-100</span>
                </div>

                <div className="vital-input-card">
                  <label>Blood Pressure</label>
                  <div className="vital-input-row bp-row">
                    <input
                      type="number"
                      value={formData.initialVitals.bloodPressure.systolic}
                      onChange={(e) => updateField('initialVitals.bloodPressure.systolic', parseInt(e.target.value))}
                      min={50}
                      max={250}
                    />
                    <span>/</span>
                    <input
                      type="number"
                      value={formData.initialVitals.bloodPressure.diastolic}
                      onChange={(e) => updateField('initialVitals.bloodPressure.diastolic', parseInt(e.target.value))}
                      min={30}
                      max={150}
                    />
                    <span className="unit">mmHg</span>
                  </div>
                  <span className="normal-range">Normal: 90-140 / 60-90</span>
                </div>

                <div className="vital-input-card">
                  <label>Respiratory Rate</label>
                  <div className="vital-input-row">
                    <input
                      type="number"
                      value={formData.initialVitals.respiratoryRate}
                      onChange={(e) => updateField('initialVitals.respiratoryRate', parseInt(e.target.value))}
                      min={4}
                      max={60}
                    />
                    <span className="unit">/min</span>
                  </div>
                  <span className="normal-range">Normal: 12-20</span>
                </div>

                <div className="vital-input-card">
                  <label>SpO2</label>
                  <div className="vital-input-row">
                    <input
                      type="number"
                      value={formData.initialVitals.oxygenSaturation}
                      onChange={(e) => updateField('initialVitals.oxygenSaturation', parseInt(e.target.value))}
                      min={50}
                      max={100}
                    />
                    <span className="unit">%</span>
                  </div>
                  <span className="normal-range">Normal: 94-100</span>
                </div>

                <div className="vital-input-card">
                  <label>Temperature</label>
                  <div className="vital-input-row">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.initialVitals.temperature}
                      onChange={(e) => updateField('initialVitals.temperature', parseFloat(e.target.value))}
                      min={32}
                      max={44}
                    />
                    <span className="unit">°C</span>
                  </div>
                  <span className="normal-range">Normal: 36.5-37.5</span>
                </div>

                <div className="vital-input-card">
                  <label>Pain Level</label>
                  <div className="vital-input-row">
                    <input
                      type="number"
                      value={formData.initialVitals.painLevel}
                      onChange={(e) => updateField('initialVitals.painLevel', parseInt(e.target.value))}
                      min={0}
                      max={10}
                    />
                    <span className="unit">/10</span>
                  </div>
                  <span className="normal-range">Scale: 0-10</span>
                </div>
              </div>
            </div>
          )}

          {/* Critical Actions Section */}
          {activeSection === 'actions' && (
            <div className="form-section">
              <h3>Critical Actions</h3>
              <p className="text-muted">Define the essential actions the student must perform</p>

              <div className="critical-actions-list">
                {formData.criticalActions.map((action, index) => (
                  <div key={action.id} className="critical-action-card">
                    <div className="action-card-header">
                      <span className="action-number">#{index + 1}</span>
                      <button 
                        className="btn-icon danger"
                        onClick={() => removeArrayItem('criticalActions', index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="action-card-body">
                      <div className="form-group">
                        <label>Action Label *</label>
                        <input
                          type="text"
                          value={action.label}
                          onChange={(e) => updateCriticalAction(index, 'label', e.target.value)}
                          placeholder="e.g., Administer Albuterol"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Dimension</label>
                          <select
                            value={action.dimension}
                            onChange={(e) => updateCriticalAction(index, 'dimension', e.target.value)}
                          >
                            {dimensionOptions.map(dim => (
                              <option key={dim.id} value={dim.id}>{dim.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Time Limit (seconds)</label>
                          <input
                            type="number"
                            value={action.timeLimit || ''}
                            onChange={(e) => updateCriticalAction(index, 'timeLimit', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Optional"
                            min={0}
                          />
                        </div>
                      </div>

                      <div className="form-group checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={action.required}
                            onChange={(e) => updateCriticalAction(index, 'required', e.target.checked)}
                          />
                          Required for passing
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button className="btn btn-ghost add-action-btn" onClick={handleAddCriticalAction}>
                  <Plus size={18} /> Add Critical Action
                </button>
              </div>
            </div>
          )}

          {/* Progression Map Section */}
          {activeSection === 'progression' && (
            <div className="form-section">
              <h3>Progression Map</h3>
              <p className="text-muted">Define how the scenario evolves based on student actions (Advanced)</p>

              <div className="progression-placeholder">
                <Zap size={48} />
                <h4>Visual Progression Editor</h4>
                <p>The progression map allows you to create dynamic scenarios that respond to student actions.</p>
                <p className="text-muted">Coming soon: Drag-and-drop node editor for creating branching scenarios</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scenario-builder {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-primary);
        }

        .builder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-muted);
        }

        .builder-header h2 {
          font-size: 1.25rem;
        }

        .header-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .builder-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .builder-sidebar {
          width: 220px;
          background: var(--bg-tertiary);
          border-right: 1px solid var(--border-muted);
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .sidebar-item:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .sidebar-item.active {
          background: var(--color-info);
          color: white;
        }

        .builder-main {
          flex: 1;
          overflow: auto;
          padding: var(--space-lg);
        }

        .form-section h3 {
          margin-bottom: var(--space-xs);
        }

        .form-section > p.text-muted {
          margin-bottom: var(--space-lg);
        }

        .form-group {
          margin-bottom: var(--space-md);
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: var(--space-xs);
        }

        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-md);
        }

        .array-input-row {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
        }

        .array-input-row input {
          flex: 1;
        }

        .btn-icon {
          padding: var(--space-xs);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
        }

        .btn-icon:hover {
          background: var(--bg-elevated);
        }

        .btn-icon.danger:hover {
          color: var(--color-danger);
          background: rgba(248, 81, 73, 0.1);
        }

        .tags-input {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: var(--space-sm);
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
          margin-bottom: var(--space-sm);
        }

        .tag {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: var(--bg-elevated);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
        }

        .tag button {
          background: none;
          border: none;
          padding: 0;
          color: var(--text-muted);
          cursor: pointer;
        }

        .tag-add, .array-add-row {
          display: flex;
          gap: var(--space-sm);
        }

        .tag-add input, .array-add-row input {
          flex: 1;
          padding: var(--space-xs) var(--space-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
        }

        .allergy-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
          margin-bottom: var(--space-sm);
        }

        .allergy-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: rgba(248, 81, 73, 0.2);
          color: var(--color-danger);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
        }

        .allergy-tag button {
          background: none;
          border: none;
          padding: 0;
          color: var(--color-danger);
          cursor: pointer;
        }

        .warning-icon {
          color: var(--color-danger);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          margin-bottom: var(--space-sm);
        }

        .history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-xs) var(--space-sm);
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
        }

        .history-item button {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: var(--space-md);
        }

        .vital-input-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          padding: var(--space-md);
        }

        .vital-input-card label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: var(--space-sm);
        }

        .vital-input-row {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .vital-input-row input {
          width: 80px;
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 1.1rem;
          text-align: center;
        }

        .vital-input-row.bp-row input {
          width: 60px;
        }

        .vital-input-row .unit {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .normal-range {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: var(--space-xs);
        }

        .critical-actions-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .critical-action-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .action-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-muted);
        }

        .action-number {
          font-weight: 600;
          color: var(--color-warning);
        }

        .action-card-body {
          padding: var(--space-md);
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
        }

        .add-action-btn {
          border: 2px dashed var(--border-muted);
          padding: var(--space-md);
          justify-content: center;
        }

        .progression-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-2xl);
          background: var(--bg-tertiary);
          border: 2px dashed var(--border-muted);
          border-radius: var(--radius-lg);
          text-align: center;
          color: var(--text-muted);
        }

        .progression-placeholder h4 {
          margin-top: var(--space-md);
          color: var(--text-primary);
        }

        .spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-muted);
          border-top-color: white;
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

export default ScenarioBuilder;
