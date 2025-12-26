import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  Shield, MessageCircle, Stethoscope, Hand, Pill, TestTube,
  ChevronRight, Check, X, Clock, Search, Star
} from 'lucide-react';

// Action categories with their actions
const actionCategories = {
  SAFETY: {
    label: 'Safety',
    icon: Shield,
    color: '#f0883e',
    actions: [
      { id: 'hand_hygiene', label: 'Perform Hand Hygiene', critical: true },
      { id: 'don_ppe', label: 'Don PPE (Gloves, Gown, etc.)' },
      { id: 'verify_patient', label: 'Verify Patient Identity', critical: true },
      { id: 'check_allergies', label: 'Confirm Allergies', critical: true },
      { id: 'call_for_help', label: 'Call for Help/Rapid Response', critical: true },
      { id: 'raise_bed_rails', label: 'Raise Bed Rails' },
      { id: 'position_patient', label: 'Position Patient Safely' }
    ]
  },
  COMMUNICATION: {
    label: 'Communication',
    icon: MessageCircle,
    color: '#a371f7',
    actions: [
      { id: 'introduce_self', label: 'Introduce Self to Patient' },
      { id: 'explain_procedure', label: 'Explain Procedure to Patient' },
      { id: 'obtain_consent', label: 'Obtain Consent' },
      { id: 'assess_understanding', label: 'Assess Patient Understanding' },
      { id: 'sbar_report', label: 'Give SBAR Report', critical: true },
      { id: 'notify_physician', label: 'Notify Physician', critical: true },
      { id: 'document_findings', label: 'Document Findings' }
    ]
  },
  ASSESSMENT: {
    label: 'Assessment',
    icon: Stethoscope,
    color: '#58a6ff',
    actions: [
      { id: 'check_vitals', label: 'Check Vital Signs', critical: true },
      { id: 'auscultate_lungs', label: 'Auscultate Lung Sounds', critical: true },
      { id: 'auscultate_heart', label: 'Auscultate Heart Sounds' },
      { id: 'assess_neuro', label: 'Perform Neuro Assessment' },
      { id: 'check_pupils', label: 'Check Pupil Response' },
      { id: 'assess_pain', label: 'Assess Pain Level' },
      { id: 'palpate_abdomen', label: 'Palpate Abdomen' },
      { id: 'check_skin', label: 'Assess Skin (Color, Temp, Moisture)' },
      { id: 'check_pulses', label: 'Check Peripheral Pulses' },
      { id: 'check_cap_refill', label: 'Check Capillary Refill' }
    ]
  },
  INTERVENTION: {
    label: 'Interventions',
    icon: Hand,
    color: '#3fb950',
    actions: [
      { id: 'apply_o2', label: 'Apply Oxygen (NC, Mask)', critical: true },
      { id: 'increase_o2', label: 'Increase O2 Flow Rate' },
      { id: 'suction_airway', label: 'Suction Airway' },
      { id: 'insert_opa', label: 'Insert OPA/NPA' },
      { id: 'bag_mask', label: 'Bag-Mask Ventilation', critical: true },
      { id: 'start_cpr', label: 'Initiate CPR', critical: true },
      { id: 'apply_aed', label: 'Apply AED/Defibrillator' },
      { id: 'elevate_hob', label: 'Elevate Head of Bed' },
      { id: 'insert_foley', label: 'Insert Foley Catheter' },
      { id: 'insert_ng', label: 'Insert NG Tube' }
    ]
  },
  DRUG_IV: {
    label: 'Drugs & IV',
    icon: Pill,
    color: '#f778ba',
    actions: [
      { id: 'start_iv', label: 'Start IV Access', critical: true },
      { id: 'verify_med', label: 'Verify Medication (5 Rights)' },
      { id: 'admin_albuterol', label: 'Administer Albuterol (Nebulizer)', critical: true },
      { id: 'admin_epi', label: 'Administer Epinephrine', critical: true },
      { id: 'admin_narcan', label: 'Administer Naloxone (Narcan)' },
      { id: 'admin_aspirin', label: 'Administer Aspirin' },
      { id: 'admin_nitro', label: 'Administer Nitroglycerin' },
      { id: 'admin_dextrose', label: 'Administer Dextrose (D50)' },
      { id: 'iv_fluids', label: 'Start IV Fluids (NS/LR)', critical: true },
      { id: 'admin_steroid', label: 'Administer Corticosteroid' }
    ]
  },
  TESTS_DIAGNOSTICS: {
    label: 'Tests & Diagnostics',
    icon: TestTube,
    color: '#79c0ff',
    actions: [
      { id: 'order_cbc', label: 'Order CBC' },
      { id: 'order_bmp', label: 'Order BMP' },
      { id: 'order_abg', label: 'Order ABG', critical: true },
      { id: 'order_troponin', label: 'Order Troponin' },
      { id: 'order_lactate', label: 'Order Lactate' },
      { id: 'order_cxr', label: 'Order Chest X-Ray' },
      { id: 'order_ekg', label: 'Order 12-Lead EKG', critical: true },
      { id: 'order_ct', label: 'Order CT Scan' },
      { id: 'fingerstick_glucose', label: 'Check Fingerstick Glucose' },
      { id: 'obtain_cultures', label: 'Obtain Blood Cultures' }
    ]
  }
};

function ActionMenu() {
  const { performAction, simulationStatus, actionHistory } = useSocket();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [recentSuccess, setRecentSuccess] = useState(null);

  const isDisabled = simulationStatus !== 'RUNNING';

  // Get completed action IDs
  const completedActions = new Set(actionHistory.map(a => a.actionId));

  const handleSelectAction = (action, dimension) => {
    if (isDisabled || pendingAction) return;
    setConfirmAction({ ...action, dimension });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction || pendingAction) return;
    
    setPendingAction(confirmAction.id);
    setConfirmAction(null);

    try {
      await performAction(confirmAction);
      setRecentSuccess(confirmAction.id);
      setTimeout(() => setRecentSuccess(null), 1500);
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setPendingAction(null);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmAction(null);
  };

  // Filter actions based on search
  const filterActions = (actions) => {
    if (!searchQuery) return actions;
    const query = searchQuery.toLowerCase();
    return actions.filter(a => a.label.toLowerCase().includes(query));
  };

  // Render category buttons
  const renderCategories = () => (
    <div className="categories-grid">
      {Object.entries(actionCategories).map(([key, cat]) => {
        const Icon = cat.icon;
        return (
          <button
            key={key}
            className="category-btn ripple"
            style={{ '--cat-color': cat.color }}
            onClick={() => setSelectedCategory(key)}
            disabled={isDisabled}
          >
            <div className="cat-icon">
              <Icon size={24} />
            </div>
            <span className="cat-label">{cat.label}</span>
            <ChevronRight size={20} className="cat-arrow" />
          </button>
        );
      })}
    </div>
  );

  // Render action list for selected category
  const renderActions = () => {
    const cat = actionCategories[selectedCategory];
    const Icon = cat.icon;
    const filteredActions = filterActions(cat.actions);

    return (
      <div className="actions-panel">
        <div className="actions-header" style={{ '--cat-color': cat.color }}>
          <button className="back-btn" onClick={() => setSelectedCategory(null)}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <Icon size={20} />
          <span>{cat.label}</span>
        </div>

        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="actions-list">
          {filteredActions.map(action => {
            const isCompleted = completedActions.has(action.id);
            const isPending = pendingAction === action.id;
            const isSuccess = recentSuccess === action.id;

            return (
              <button
                key={action.id}
                className={`action-btn ripple ${isCompleted ? 'completed' : ''} ${isPending ? 'pending' : ''} ${isSuccess ? 'success' : ''}`}
                onClick={() => handleSelectAction(action, selectedCategory)}
                disabled={isDisabled || isPending}
              >
                <div className="action-content">
                  <span className="action-label">
                    {action.label}
                    {action.critical && <Star size={14} className="critical-star" />}
                  </span>
                </div>
                <div className="action-status">
                  {isPending ? (
                    <div className="spinner-sm" />
                  ) : isCompleted ? (
                    <Check size={20} className="check-icon" />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>
              </button>
            );
          })}

          {filteredActions.length === 0 && (
            <div className="no-results">
              <p>No actions match your search</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="action-menu">
      <div className="menu-header">
        <h2>Clinical Actions</h2>
        {isDisabled && (
          <span className="disabled-notice">Waiting for simulation to start</span>
        )}
      </div>

      {selectedCategory ? renderActions() : renderCategories()}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <div className="confirm-header">
              <span>Confirm Action</span>
            </div>
            <div className="confirm-body">
              <p>Are you sure you want to perform:</p>
              <p className="confirm-action">{confirmAction.label}</p>
            </div>
            <div className="confirm-footer">
              <button className="btn btn-ghost" onClick={handleCancelConfirm}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleConfirmAction}>
                <Check size={18} />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .action-menu {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .menu-header {
          padding: var(--space-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .menu-header h2 {
          font-size: 1.25rem;
        }

        .disabled-notice {
          font-size: 0.8rem;
          color: var(--color-warning);
          background: rgba(210, 153, 34, 0.15);
          padding: 4px 12px;
          border-radius: var(--radius-full);
        }

        .categories-grid {
          flex: 1;
          overflow: auto;
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .category-btn {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-lg);
          text-align: left;
          transition: all var(--transition-fast);
        }

        .category-btn:active:not(:disabled) {
          transform: scale(0.98);
          background: var(--bg-elevated);
        }

        .category-btn:disabled {
          opacity: 0.5;
        }

        .cat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--cat-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .cat-label {
          flex: 1;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .cat-arrow {
          color: var(--text-muted);
        }

        .actions-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .actions-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--cat-color);
          color: white;
          font-weight: 600;
        }

        .back-btn {
          color: white;
          padding: var(--space-xs);
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-muted);
        }

        .search-bar svg {
          color: var(--text-muted);
        }

        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-primary);
          min-height: 36px;
          padding: 0;
        }

        .search-bar input:focus {
          outline: none;
          box-shadow: none;
        }

        .clear-search {
          color: var(--text-muted);
          padding: var(--space-xs);
        }

        .actions-list {
          flex: 1;
          overflow: auto;
          padding: var(--space-sm);
        }

        .action-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-sm);
          transition: all var(--transition-fast);
        }

        .action-btn:active:not(:disabled) {
          transform: scale(0.98);
          background: var(--bg-elevated);
        }

        .action-btn:disabled {
          opacity: 0.5;
        }

        .action-btn.completed {
          border-color: var(--color-success);
          background: rgba(63, 185, 80, 0.05);
        }

        .action-btn.success {
          border-color: var(--color-success);
          background: rgba(63, 185, 80, 0.15);
          animation: flash-success 0.3s;
        }

        @keyframes flash-success {
          0%, 100% { background: rgba(63, 185, 80, 0.15); }
          50% { background: rgba(63, 185, 80, 0.3); }
        }

        .action-content {
          text-align: left;
        }

        .action-label {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-weight: 500;
        }

        .critical-star {
          color: var(--color-warning);
          fill: var(--color-warning);
        }

        .action-status {
          display: flex;
          align-items: center;
          color: var(--text-muted);
        }

        .check-icon {
          color: var(--color-success);
        }

        .spinner-sm {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-muted);
          border-top-color: var(--color-info);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .no-results {
          text-align: center;
          padding: var(--space-xl);
          color: var(--text-muted);
        }

        .confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          z-index: 300;
        }

        .confirm-dialog {
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 400px;
          overflow: hidden;
        }

        .confirm-header {
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-tertiary);
          font-weight: 600;
          border-bottom: 1px solid var(--border-muted);
        }

        .confirm-body {
          padding: var(--space-lg);
          text-align: center;
        }

        .confirm-body p:first-child {
          color: var(--text-muted);
          margin-bottom: var(--space-sm);
        }

        .confirm-action {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-info);
        }

        .confirm-footer {
          display: flex;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          border-top: 1px solid var(--border-muted);
        }

        .confirm-footer .btn {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

export default ActionMenu;
