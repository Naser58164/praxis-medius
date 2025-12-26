import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  MessageCircle, Send, Smile, Meh, Frown, AlertCircle, 
  Volume2, Clock, User
} from 'lucide-react';

const presetResponses = [
  {
    category: 'Pain & Discomfort',
    responses: [
      { text: "It hurts... right here...", mood: 'uncomfortable' },
      { text: "The pain is getting worse.", mood: 'distressed' },
      { text: "I feel a little better now.", mood: 'relieved' },
      { text: "Can I get something for the pain?", mood: 'uncomfortable' },
      { text: "It's a sharp pain... comes and goes...", mood: 'uncomfortable' }
    ]
  },
  {
    category: 'Breathing',
    responses: [
      { text: "I can't... catch my breath...", mood: 'distressed' },
      { text: "It's hard to breathe when I lie down.", mood: 'anxious' },
      { text: "I'm breathing better now, thank you.", mood: 'relieved' },
      { text: "My chest feels tight...", mood: 'anxious' }
    ]
  },
  {
    category: 'General Status',
    responses: [
      { text: "I'm feeling okay.", mood: 'neutral' },
      { text: "I'm tired... didn't sleep well.", mood: 'tired' },
      { text: "I feel dizzy when I stand up.", mood: 'anxious' },
      { text: "I'm feeling nauseous...", mood: 'uncomfortable' },
      { text: "When can I go home?", mood: 'restless' }
    ]
  },
  {
    category: 'Emotional',
    responses: [
      { text: "I'm scared... what's happening to me?", mood: 'anxious' },
      { text: "Thank you for taking care of me.", mood: 'grateful' },
      { text: "I just want to see my family.", mood: 'sad' },
      { text: "I don't understand what's going on.", mood: 'confused' }
    ]
  },
  {
    category: 'Non-responsive',
    responses: [
      { text: "*groans*", mood: 'distressed' },
      { text: "*no response - eyes closed*", mood: 'unresponsive' },
      { text: "*mumbles incoherently*", mood: 'confused' },
      { text: "*moans in pain*", mood: 'distressed' }
    ]
  }
];

const moodOptions = [
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'var(--text-muted)' },
  { value: 'cooperative', label: 'Cooperative', icon: Smile, color: 'var(--color-success)' },
  { value: 'anxious', label: 'Anxious', icon: AlertCircle, color: 'var(--color-warning)' },
  { value: 'distressed', label: 'Distressed', icon: Frown, color: 'var(--color-danger)' },
  { value: 'tired', label: 'Tired', icon: Meh, color: 'var(--text-secondary)' },
  { value: 'confused', label: 'Confused', icon: AlertCircle, color: 'var(--color-communication)' },
  { value: 'uncomfortable', label: 'Uncomfortable', icon: Frown, color: 'var(--color-drug-iv)' },
  { value: 'relieved', label: 'Relieved', icon: Smile, color: 'var(--color-info)' }
];

function PatientVoicePanel() {
  const { patientSpeak, simulationStatus, sessionData } = useSocket();
  const [customText, setCustomText] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [recentMessages, setRecentMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const isDisabled = simulationStatus !== 'RUNNING';

  const handleSend = async (text, mood) => {
    if (!text.trim() || isDisabled) return;
    
    setSending(true);
    try {
      await patientSpeak(text, mood);
      setRecentMessages(prev => [
        { text, mood, timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ]);
      setCustomText('');
    } catch (err) {
      console.error('Failed to send patient response:', err);
    } finally {
      setSending(false);
    }
  };

  const handlePresetClick = (response) => {
    handleSend(response.text, response.mood);
  };

  const handleCustomSend = () => {
    handleSend(customText, selectedMood);
  };

  return (
    <div className="patient-voice-panel">
      <div className="panel-header">
        <h3>Patient Voice Control</h3>
        <p className="text-muted">Send verbal responses from the patient to the student</p>
      </div>

      {/* Custom Message Input */}
      <div className="custom-message-section">
        <h4>Custom Response</h4>
        <div className="message-composer">
          <div className="mood-selector">
            <label>Patient Mood:</label>
            <div className="mood-options">
              {moodOptions.map(mood => (
                <button
                  key={mood.value}
                  className={`mood-option ${selectedMood === mood.value ? 'selected' : ''}`}
                  onClick={() => setSelectedMood(mood.value)}
                  title={mood.label}
                  disabled={isDisabled}
                  style={{ '--mood-color': mood.color }}
                >
                  <mood.icon size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="message-input-row">
            <div className="patient-avatar-small">
              <User size={16} />
            </div>
            <input
              type="text"
              placeholder="Type what the patient says..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomSend()}
              disabled={isDisabled}
            />
            <button 
              className="btn btn-primary"
              onClick={handleCustomSend}
              disabled={!customText.trim() || isDisabled || sending}
            >
              {sending ? <div className="spinner" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Preset Responses */}
      <div className="preset-responses-section">
        <h4>Quick Responses</h4>
        <div className="preset-categories">
          {presetResponses.map(category => (
            <div key={category.category} className="preset-category">
              <div className="category-label">{category.category}</div>
              <div className="preset-buttons">
                {category.responses.map((response, i) => (
                  <button
                    key={i}
                    className={`preset-btn mood-${response.mood}`}
                    onClick={() => handlePresetClick(response)}
                    disabled={isDisabled || sending}
                  >
                    <span className="preset-text">{response.text}</span>
                    <span className="preset-mood">{response.mood}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      {recentMessages.length > 0 && (
        <div className="recent-messages-section">
          <h4>
            <Clock size={14} />
            Recent Patient Responses
          </h4>
          <div className="recent-list">
            {recentMessages.map((msg, i) => (
              <div key={i} className="recent-message">
                <div className={`recent-mood mood-${msg.mood}`}>
                  {moodOptions.find(m => m.value === msg.mood)?.label || msg.mood}
                </div>
                <div className="recent-text">"{msg.text}"</div>
                <div className="recent-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .patient-voice-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .panel-header h3 {
          margin-bottom: var(--space-xs);
        }

        .custom-message-section, .preset-responses-section, .recent-messages-section {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: var(--space-md);
        }

        .custom-message-section h4, 
        .preset-responses-section h4,
        .recent-messages-section h4 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-md);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .message-composer {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .mood-selector {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .mood-selector label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .mood-options {
          display: flex;
          gap: var(--space-xs);
        }

        .mood-option {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-elevated);
          color: var(--text-muted);
          border: 2px solid transparent;
          transition: all var(--transition-fast);
        }

        .mood-option:hover:not(:disabled) {
          color: var(--mood-color);
          border-color: var(--mood-color);
        }

        .mood-option.selected {
          background: var(--mood-color);
          color: white;
          border-color: var(--mood-color);
        }

        .message-input-row {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .patient-avatar-small {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-communication);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .message-input-row input {
          flex: 1;
        }

        .preset-categories {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .category-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-sm);
        }

        .preset-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .preset-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-elevated);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          text-align: left;
          transition: all var(--transition-fast);
          max-width: 200px;
        }

        .preset-btn:hover:not(:disabled) {
          border-color: var(--color-communication);
          transform: translateY(-1px);
        }

        .preset-btn:disabled {
          opacity: 0.5;
        }

        .preset-text {
          font-size: 0.85rem;
          color: var(--text-primary);
          font-style: italic;
        }

        .preset-mood {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .recent-message {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm);
          background: var(--bg-elevated);
          border-radius: var(--radius-sm);
        }

        .recent-mood {
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          color: var(--text-muted);
        }

        .recent-mood.mood-anxious { color: var(--color-warning); }
        .recent-mood.mood-distressed { color: var(--color-danger); }
        .recent-mood.mood-relieved { color: var(--color-success); }
        .recent-mood.mood-cooperative { color: var(--color-success); }

        .recent-text {
          flex: 1;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-style: italic;
        }

        .recent-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
}

export default PatientVoicePanel;
