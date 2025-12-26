import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { MessageCircle, Send, User, AlertCircle } from 'lucide-react';

const quickResponses = [
  { id: 'pain', text: 'Can you describe your pain?' },
  { id: 'history', text: 'Tell me about your medical history.' },
  { id: 'allergies', text: 'Do you have any allergies?' },
  { id: 'meds', text: 'What medications are you taking?' },
  { id: 'symptoms', text: 'When did your symptoms start?' },
  { id: 'worse', text: 'What makes it worse?' },
  { id: 'better', text: 'What makes it better?' },
  { id: 'reassure', text: 'I\'m here to help you.' }
];

function PatientCommunication() {
  const { patientMessages, patientInfo, simulationStatus } = useSocket();
  const [customMessage, setCustomMessage] = useState('');
  const messagesEndRef = useRef(null);

  const isDisabled = simulationStatus !== 'RUNNING';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [patientMessages]);

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'distressed': return 'var(--color-danger)';
      case 'anxious': return 'var(--color-warning)';
      case 'calm': return 'var(--color-success)';
      case 'confused': return 'var(--color-info)';
      default: return 'var(--text-secondary)';
    }
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'distressed': return '😰';
      case 'anxious': return '😟';
      case 'calm': return '😌';
      case 'confused': return '😕';
      case 'pain': return '😣';
      default: return '🗣️';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="patient-communication">
      <div className="comm-header">
        <h2>Patient Communication</h2>
        <p className="text-muted">Listen to patient responses</p>
      </div>

      {/* Patient Info */}
      {patientInfo && (
        <div className="patient-badge">
          <div className="patient-avatar">
            <User size={20} />
          </div>
          <div className="patient-name">
            <span className="name">{patientInfo.firstName} {patientInfo.lastName}</span>
            <span className="info">{patientInfo.age} y/o {patientInfo.gender}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="messages-container">
        {patientMessages.length === 0 ? (
          <div className="no-messages">
            <MessageCircle size={32} />
            <p>Patient hasn't spoken yet</p>
            <p className="hint">The examiner will control patient responses</p>
          </div>
        ) : (
          <div className="messages-list">
            {[...patientMessages].reverse().map((msg) => (
              <div 
                key={msg.id} 
                className={`message-bubble ${msg.mood}`}
                style={{ '--mood-color': getMoodColor(msg.mood) }}
              >
                <div className="message-header">
                  <span className="mood-indicator">
                    {getMoodEmoji(msg.mood)}
                    <span className="mood-label">{msg.mood || 'neutral'}</span>
                  </span>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="message-text">"{msg.text}"</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Response Suggestions */}
      <div className="quick-responses">
        <p className="section-label">Suggested Questions:</p>
        <div className="quick-responses-grid">
          {quickResponses.slice(0, 4).map((response) => (
            <button
              key={response.id}
              className="quick-response-btn"
              disabled={isDisabled}
            >
              {response.text}
            </button>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="comm-notice">
        <AlertCircle size={16} />
        <span>Patient responses are controlled by your examiner in real-time</span>
      </div>

      <style>{`
        .patient-communication {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .comm-header {
          padding: var(--space-md);
        }

        .comm-header h2 {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .text-muted {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .patient-badge {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin: 0 var(--space-md) var(--space-md);
          padding: var(--space-md);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
        }

        .patient-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--color-info);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .patient-name .name {
          display: block;
          font-weight: 600;
        }

        .patient-name .info {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .messages-container {
          flex: 1;
          overflow: auto;
          padding: 0 var(--space-md);
        }

        .no-messages {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          text-align: center;
          gap: var(--space-sm);
        }

        .no-messages .hint {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          padding-bottom: var(--space-md);
        }

        .message-bubble {
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-left: 4px solid var(--mood-color);
          border-radius: var(--radius-lg);
          padding: var(--space-md);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-bubble.distressed {
          background: rgba(248, 81, 73, 0.08);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-sm);
        }

        .mood-indicator {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.85rem;
        }

        .mood-label {
          color: var(--mood-color);
          text-transform: capitalize;
          font-weight: 500;
        }

        .timestamp {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .message-text {
          font-size: 1rem;
          line-height: 1.5;
          font-style: italic;
        }

        .quick-responses {
          padding: var(--space-md);
          border-top: 1px solid var(--border-muted);
        }

        .section-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: var(--space-sm);
        }

        .quick-responses-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-xs);
        }

        .quick-response-btn {
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-align: left;
          transition: all var(--transition-fast);
        }

        .quick-response-btn:active:not(:disabled) {
          background: var(--bg-elevated);
        }

        .quick-response-btn:disabled {
          opacity: 0.5;
        }

        .comm-notice {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--bg-tertiary);
          color: var(--text-muted);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}

export default PatientCommunication;
