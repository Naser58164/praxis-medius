import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  User, FileText, AlertTriangle, Pill, History, 
  ChevronDown, ChevronRight, Heart, Clipboard
} from 'lucide-react';

function PatientChart() {
  const { patientInfo, sessionData, currentFindings } = useSocket();
  const [expandedSections, setExpandedSections] = useState({
    demographics: true,
    allergies: true,
    history: false,
    medications: false,
    findings: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!patientInfo) {
    return (
      <div className="patient-chart loading">
        <div className="loading-content">
          <div className="spinner" />
          <p>Loading patient chart...</p>
        </div>
      </div>
    );
  }

  const scenario = sessionData?.scenario;

  return (
    <div className="patient-chart">
      {/* Patient Header */}
      <div className="patient-header">
        <div className="patient-avatar">
          <User size={32} />
        </div>
        <div className="patient-info">
          <h2>{patientInfo.firstName} {patientInfo.lastName}</h2>
          <div className="patient-meta">
            <span>{patientInfo.age} y/o {patientInfo.gender}</span>
            <span className="divider">•</span>
            <span>Room {patientInfo.roomNumber}</span>
          </div>
        </div>
        <div className={`code-status ${patientInfo.codeStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
          {patientInfo.codeStatus}
        </div>
      </div>

      {/* Chief Complaint */}
      {patientInfo.chiefComplaint && (
        <div className="chief-complaint">
          <span className="cc-label">Chief Complaint:</span>
          <span className="cc-text">"{patientInfo.chiefComplaint}"</span>
        </div>
      )}

      {/* Sections */}
      <div className="chart-sections">
        {/* Allergies - Always Visible & Prominent */}
        {patientInfo.allergies && patientInfo.allergies.length > 0 && (
          <div className="chart-section allergies-section">
            <button 
              className="section-header danger"
              onClick={() => toggleSection('allergies')}
            >
              <div className="section-title">
                <AlertTriangle size={18} />
                <span>Allergies</span>
                <span className="count-badge danger">{patientInfo.allergies.length}</span>
              </div>
              {expandedSections.allergies ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {expandedSections.allergies && (
              <div className="section-content">
                <div className="allergy-list">
                  {patientInfo.allergies.map((allergy, i) => (
                    <div key={i} className="allergy-item">
                      <AlertTriangle size={14} />
                      {allergy}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Medical History */}
        <div className="chart-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('history')}
          >
            <div className="section-title">
              <History size={18} />
              <span>Medical History</span>
            </div>
            {expandedSections.history ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {expandedSections.history && (
            <div className="section-content">
              {patientInfo.medicalHistory && patientInfo.medicalHistory.length > 0 ? (
                <ul className="history-list">
                  {patientInfo.medicalHistory.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No significant medical history documented</p>
              )}
            </div>
          )}
        </div>

        {/* Current Medications */}
        <div className="chart-section">
          <button 
            className="section-header"
            onClick={() => toggleSection('medications')}
          >
            <div className="section-title">
              <Pill size={18} />
              <span>Current Medications</span>
            </div>
            {expandedSections.medications ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {expandedSections.medications && (
            <div className="section-content">
              {patientInfo.currentMedications && patientInfo.currentMedications.length > 0 ? (
                <div className="medication-list">
                  {patientInfo.currentMedications.map((med, i) => (
                    <div key={i} className="medication-item">
                      <Pill size={14} />
                      <span>{med}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No current medications</p>
              )}
            </div>
          )}
        </div>

        {/* Physical Findings (if available) */}
        {currentFindings && (
          <div className="chart-section">
            <button 
              className="section-header"
              onClick={() => toggleSection('findings')}
            >
              <div className="section-title">
                <Clipboard size={18} />
                <span>Physical Examination</span>
              </div>
              {expandedSections.findings ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {expandedSections.findings && (
              <div className="section-content">
                <div className="findings-summary">
                  {/* Respiratory */}
                  {currentFindings.respiratory && (
                    <div className="finding-group">
                      <h4>Respiratory</h4>
                      <div className="finding-items">
                        {currentFindings.respiratory.breathingPattern && (
                          <div className="finding-item">
                            <span className="label">Breathing:</span>
                            <span className="value">{currentFindings.respiratory.breathingPattern}</span>
                          </div>
                        )}
                        {currentFindings.respiratory.accessoryMuscleUse && (
                          <div className="finding-item abnormal">
                            <span className="label">Accessory Muscles:</span>
                            <span className="value">In use</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cardiac */}
                  {currentFindings.cardiac && (
                    <div className="finding-group">
                      <h4>Cardiac</h4>
                      <div className="finding-items">
                        {currentFindings.cardiac.rhythm && (
                          <div className="finding-item">
                            <span className="label">Rhythm:</span>
                            <span className="value">{currentFindings.cardiac.rhythm}</span>
                          </div>
                        )}
                        {currentFindings.cardiac.jvd && (
                          <div className="finding-item abnormal">
                            <span className="label">JVD:</span>
                            <span className="value">Present</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Neurological */}
                  {currentFindings.neurological && (
                    <div className="finding-group">
                      <h4>Neurological</h4>
                      <div className="finding-items">
                        {currentFindings.neurological.levelOfConsciousness && (
                          <div className="finding-item">
                            <span className="label">LOC:</span>
                            <span className="value">{currentFindings.neurological.levelOfConsciousness}</span>
                          </div>
                        )}
                        {currentFindings.neurological.pupils && (
                          <div className="finding-item">
                            <span className="label">Pupils:</span>
                            <span className="value">{currentFindings.neurological.pupils}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admission Info */}
      {patientInfo.admissionDiagnosis && (
        <div className="admission-info">
          <span className="admission-label">Admission Dx:</span>
          <span>{patientInfo.admissionDiagnosis}</span>
        </div>
      )}

      <style>{`
        .patient-chart {
          padding: var(--space-md);
          height: 100%;
          overflow: auto;
        }

        .patient-chart.loading {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content {
          text-align: center;
          color: var(--text-muted);
        }

        .patient-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-md);
        }

        .patient-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-info);
        }

        .patient-info {
          flex: 1;
        }

        .patient-info h2 {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }

        .patient-meta {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .divider {
          color: var(--border-default);
        }

        .code-status {
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          border-radius: var(--radius-md);
          background: var(--color-success);
          color: white;
        }

        .code-status.dnr {
          background: var(--color-danger);
        }

        .code-status.dnr-dni {
          background: var(--color-danger);
        }

        .code-status.comfort-care {
          background: var(--color-warning);
          color: var(--bg-primary);
        }

        .chief-complaint {
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-lg);
          border-left: 4px solid var(--color-info);
          margin-bottom: var(--space-md);
        }

        .cc-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: block;
          margin-bottom: 4px;
        }

        .cc-text {
          font-style: italic;
          color: var(--text-primary);
        }

        .chart-sections {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .chart-section {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .allergies-section {
          border: 2px solid var(--color-danger);
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
          transition: background var(--transition-fast);
        }

        .section-header:active {
          background: var(--bg-elevated);
        }

        .section-header.danger {
          background: rgba(248, 81, 73, 0.15);
          color: var(--color-danger);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .count-badge {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--bg-elevated);
        }

        .count-badge.danger {
          background: var(--color-danger);
          color: white;
        }

        .section-content {
          padding: var(--space-md);
          border-top: 1px solid var(--border-muted);
        }

        .allergy-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .allergy-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: rgba(248, 81, 73, 0.1);
          border-radius: var(--radius-md);
          color: var(--color-danger);
          font-weight: 500;
        }

        .history-list {
          list-style: disc;
          padding-left: var(--space-lg);
          color: var(--text-secondary);
        }

        .history-list li {
          margin-bottom: var(--space-xs);
        }

        .medication-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .medication-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
        }

        .medication-item svg {
          color: var(--color-info);
        }

        .no-data {
          color: var(--text-muted);
          font-style: italic;
          text-align: center;
          padding: var(--space-md);
        }

        .findings-summary {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .finding-group h4 {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-sm);
        }

        .finding-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .finding-item {
          display: flex;
          justify-content: space-between;
          padding: var(--space-xs) var(--space-sm);
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
        }

        .finding-item.abnormal {
          background: rgba(248, 81, 73, 0.1);
          color: var(--color-danger);
        }

        .finding-item .label {
          color: var(--text-muted);
        }

        .finding-item .value {
          font-weight: 500;
        }

        .admission-info {
          margin-top: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-lg);
          font-size: 0.9rem;
        }

        .admission-label {
          color: var(--text-muted);
          margin-right: var(--space-sm);
        }
      `}</style>
    </div>
  );
}

export default PatientChart;
