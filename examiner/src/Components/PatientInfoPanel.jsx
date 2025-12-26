import React from 'react';
import { useSocket } from '../context/SocketContext';
import { User, Calendar, MapPin, AlertCircle, Pill, FileText } from 'lucide-react';

function PatientInfoPanel({ patient }) {
  const { currentVitals } = useSocket();

  if (!patient) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-muted">No patient data</p>
        </div>
      </div>
    );
  }

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="patient-info-panel card">
      <div className="card-header">
        <div className="card-title">
          <User size={16} />
          Patient Information
        </div>
      </div>

      <div className="patient-header">
        <div className="patient-avatar">
          {patient.firstName?.[0]}{patient.lastName?.[0]}
        </div>
        <div className="patient-name-block">
          <h3 className="patient-name">{patient.firstName} {patient.lastName}</h3>
          <div className="patient-meta">
            <span>{patient.gender}</span>
            <span>•</span>
            <span>{calculateAge(patient.dateOfBirth)} years</span>
            <span>•</span>
            <span>Room {patient.roomNumber}</span>
          </div>
        </div>
        <div className="code-status" data-status={patient.codeStatus?.toLowerCase().replace(' ', '-')}>
          {patient.codeStatus}
        </div>
      </div>

      <div className="patient-vitals-summary">
        {currentVitals && (
          <>
            <VitalBadge label="HR" value={currentVitals.heartRate} unit="bpm" color="var(--vital-hr)" />
            <VitalBadge 
              label="BP" 
              value={`${currentVitals.bloodPressure?.systolic}/${currentVitals.bloodPressure?.diastolic}`} 
              unit="mmHg" 
              color="var(--vital-bp)" 
            />
            <VitalBadge label="SpO2" value={currentVitals.oxygenSaturation} unit="%" color="var(--vital-spo2)" />
            <VitalBadge label="RR" value={currentVitals.respiratoryRate} unit="/min" color="var(--vital-rr)" />
          </>
        )}
      </div>

      <div className="patient-details">
        {/* Allergies */}
        {patient.allergies?.length > 0 && (
          <div className="detail-section allergies">
            <div className="detail-header">
              <AlertCircle size={14} />
              <span>Allergies</span>
            </div>
            <div className="allergy-tags">
              {patient.allergies.map((allergy, i) => (
                <span key={i} className="allergy-tag">{allergy}</span>
              ))}
            </div>
          </div>
        )}

        {/* Admission Diagnosis */}
        {patient.admissionDiagnosis && (
          <div className="detail-section">
            <div className="detail-header">
              <FileText size={14} />
              <span>Admission Diagnosis</span>
            </div>
            <p className="detail-value">{patient.admissionDiagnosis}</p>
          </div>
        )}

        {/* Medical History */}
        {patient.medicalHistory?.length > 0 && (
          <div className="detail-section">
            <div className="detail-header">
              <Calendar size={14} />
              <span>Medical History</span>
            </div>
            <ul className="history-list">
              {patient.medicalHistory.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Current Medications */}
        {patient.currentMedications?.length > 0 && (
          <div className="detail-section">
            <div className="detail-header">
              <Pill size={14} />
              <span>Home Medications</span>
            </div>
            <ul className="medication-list">
              {patient.currentMedications.map((med, i) => (
                <li key={i}>
                  <span className="med-name">{med.name}</span>
                  <span className="med-dose">{med.dose}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style>{`
        .patient-info-panel {
          overflow: hidden;
        }

        .patient-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-muted);
        }

        .patient-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-info), var(--color-communication));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.1rem;
          color: white;
        }

        .patient-name-block {
          flex: 1;
        }

        .patient-name {
          font-size: 1.1rem;
          margin-bottom: 2px;
        }

        .patient-meta {
          display: flex;
          gap: var(--space-xs);
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .code-status {
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .code-status[data-status="full-code"] {
          background: var(--color-success);
          color: white;
        }

        .code-status[data-status="dnr"] {
          background: var(--color-warning);
          color: var(--bg-primary);
        }

        .patient-vitals-summary {
          display: flex;
          gap: var(--space-sm);
          padding: var(--space-md);
          border-bottom: 1px solid var(--border-muted);
          overflow-x: auto;
        }

        .patient-details {
          padding: var(--space-md);
          max-height: 300px;
          overflow-y: auto;
        }

        .detail-section {
          margin-bottom: var(--space-md);
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section.allergies {
          background: rgba(248, 81, 73, 0.1);
          margin: calc(var(--space-md) * -1);
          margin-bottom: var(--space-md);
          padding: var(--space-md);
          border-bottom: 1px solid rgba(248, 81, 73, 0.3);
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-sm);
        }

        .allergies .detail-header {
          color: var(--color-danger);
        }

        .allergy-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
        }

        .allergy-tag {
          padding: 2px 8px;
          background: var(--color-danger);
          color: white;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .history-list, .medication-list {
          list-style: none;
          font-size: 0.9rem;
        }

        .history-list li {
          padding: var(--space-xs) 0;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-muted);
        }

        .history-list li:last-child {
          border-bottom: none;
        }

        .medication-list li {
          display: flex;
          justify-content: space-between;
          padding: var(--space-xs) 0;
          border-bottom: 1px solid var(--border-muted);
        }

        .medication-list li:last-child {
          border-bottom: none;
        }

        .med-name {
          color: var(--text-primary);
        }

        .med-dose {
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}

function VitalBadge({ label, value, unit, color }) {
  return (
    <div className="vital-badge">
      <span className="vital-badge-label">{label}</span>
      <span className="vital-badge-value" style={{ color }}>{value}</span>
      <span className="vital-badge-unit">{unit}</span>
      <style>{`
        .vital-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          min-width: 70px;
        }

        .vital-badge-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .vital-badge-value {
          font-family: var(--font-mono);
          font-size: 1.1rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .vital-badge-unit {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

export default PatientInfoPanel;
