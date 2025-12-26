import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Plus, Trash2, Save, Play, ArrowRight, Clock, Zap, AlertTriangle,
  ChevronDown, ChevronRight, Link, Unlink, Move, Copy, Settings,
  Activity, Pill, Stethoscope, MessageCircle, Shield, TestTube
} from 'lucide-react';

const nodeTypes = {
  START: { label: 'Start', color: '#3fb950', icon: Play },
  WAIT_ACTION: { label: 'Wait for Action', color: '#58a6ff', icon: Clock },
  WAIT_TIME: { label: 'Wait for Time', color: '#d29922', icon: Clock },
  CHANGE_VITALS: { label: 'Change Vitals', color: '#f85149', icon: Activity },
  CHANGE_FINDINGS: { label: 'Change Findings', color: '#a371f7', icon: Stethoscope },
  PATIENT_SPEAK: { label: 'Patient Speaks', color: '#f0883e', icon: MessageCircle },
  IOT_ACTION: { label: 'Manikin Action', color: '#79c0ff', icon: Zap },
  BRANCH: { label: 'Branch', color: '#8b949e', icon: ArrowRight },
  END: { label: 'End Scenario', color: '#f85149', icon: AlertTriangle }
};

const actionCategories = [
  { id: 'SAFETY', label: 'Safety', icon: Shield, actions: ['Hand Hygiene', 'Check Patient ID', 'Verify Allergies', 'Don PPE'] },
  { id: 'ASSESSMENT', label: 'Assessment', icon: Stethoscope, actions: ['Check Vitals', 'Auscultate Lungs', 'Auscultate Heart', 'Check Pupils', 'Assess Pain'] },
  { id: 'INTERVENTION', label: 'Intervention', icon: Activity, actions: ['Position Patient', 'Apply O2', 'Suction', 'CPR', 'Defibrillation'] },
  { id: 'DRUG_IV', label: 'Drug & IV', icon: Pill, actions: ['Start IV', 'Administer Albuterol', 'Give Epinephrine', 'Push Adenosine', 'Hang Fluids'] },
  { id: 'TESTS', label: 'Tests', icon: TestTube, actions: ['Order Labs', 'Order ECG', 'Order X-Ray', 'Order CT'] }
];

function ProgressionMapEditor({ scenario, onChange, onSave }) {
  const [nodes, setNodes] = useState([
    { id: 'start', type: 'START', x: 100, y: 200, label: 'Start', connections: [] }
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Load existing progression map
  useEffect(() => {
    if (scenario?.progressionMap?.length > 0) {
      setNodes(scenario.progressionMap);
    }
  }, [scenario]);

  const handleMouseDown = useCallback((e, nodeId) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (connecting) {
      // Complete connection
      if (connecting !== nodeId) {
        setNodes(prev => prev.map(n => 
          n.id === connecting 
            ? { ...n, connections: [...(n.connections || []), { to: nodeId, condition: 'default' }] }
            : n
        ));
      }
      setConnecting(null);
    } else {
      // Start dragging
      const rect = e.currentTarget.getBoundingClientRect();
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setDragging(nodeId);
      setSelectedNode(nodeId);
    }
  }, [connecting, nodes]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x - pan.x) / zoom;
    const y = (e.clientY - rect.top - offset.y - pan.y) / zoom;
    
    setNodes(prev => prev.map(n => 
      n.id === dragging ? { ...n, x: Math.max(0, x), y: Math.max(0, y) } : n
    ));
  }, [dragging, offset, pan, zoom]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const addNode = (type) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      x: 300 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      label: nodeTypes[type].label,
      connections: [],
      config: getDefaultConfig(type)
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
    setShowAddMenu(false);
  };

  const getDefaultConfig = (type) => {
    switch (type) {
      case 'WAIT_ACTION': return { actionId: '', timeout: 60 };
      case 'WAIT_TIME': return { seconds: 30 };
      case 'CHANGE_VITALS': return { changes: {} };
      case 'CHANGE_FINDINGS': return { changes: {} };
      case 'PATIENT_SPEAK': return { text: '', mood: 'neutral' };
      case 'IOT_ACTION': return { action: '', params: {} };
      case 'BRANCH': return { conditions: [] };
      default: return {};
    }
  };

  const deleteNode = (nodeId) => {
    if (nodeId === 'start') return;
    setNodes(prev => prev
      .filter(n => n.id !== nodeId)
      .map(n => ({
        ...n,
        connections: (n.connections || []).filter(c => c.to !== nodeId)
      }))
    );
    setSelectedNode(null);
  };

  const startConnecting = (nodeId) => {
    setConnecting(nodeId);
  };

  const updateNodeConfig = (nodeId, config) => {
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n
    ));
  };

  const updateNodeLabel = (nodeId, label) => {
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, label } : n
    ));
  };

  const removeConnection = (fromId, toId) => {
    setNodes(prev => prev.map(n => 
      n.id === fromId 
        ? { ...n, connections: (n.connections || []).filter(c => c.to !== toId) }
        : n
    ));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(nodes);
    }
    if (onChange) {
      onChange(nodes);
    }
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div className="progression-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className="btn btn-primary" onClick={() => setShowAddMenu(!showAddMenu)}>
            <Plus size={16} /> Add Node
          </button>
          {showAddMenu && (
            <div className="add-menu">
              {Object.entries(nodeTypes).filter(([k]) => k !== 'START').map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button 
                    key={key} 
                    className="add-menu-item"
                    onClick={() => addNode(key)}
                    style={{ '--node-color': config.color }}
                  >
                    <Icon size={16} />
                    {config.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="toolbar-center">
          <span className="zoom-label">Zoom: {Math.round(zoom * 100)}%</span>
          <input 
            type="range" 
            min="0.5" 
            max="1.5" 
            step="0.1" 
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
        </div>
        <div className="toolbar-right">
          <button className="btn btn-success" onClick={handleSave}>
            <Save size={16} /> Save Map
          </button>
        </div>
      </div>

      <div className="editor-main">
        {/* Canvas */}
        <div 
          className="editor-canvas"
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg className="connections-layer" style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}>
            {nodes.map(node => 
              (node.connections || []).map(conn => {
                const toNode = nodes.find(n => n.id === conn.to);
                if (!toNode) return null;
                
                const fromX = node.x + 120;
                const fromY = node.y + 30;
                const toX = toNode.x;
                const toY = toNode.y + 30;
                const midX = (fromX + toX) / 2;
                
                return (
                  <g key={`${node.id}-${conn.to}`}>
                    <path
                      d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                      fill="none"
                      stroke={nodeTypes[node.type]?.color || '#58a6ff'}
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    {conn.condition !== 'default' && (
                      <text x={midX} y={(fromY + toY) / 2 - 10} className="connection-label">
                        {conn.condition}
                      </text>
                    )}
                  </g>
                );
              })
            )}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#58a6ff" />
              </marker>
            </defs>
          </svg>

          <div className="nodes-layer" style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}>
            {nodes.map(node => {
              const nodeType = nodeTypes[node.type];
              const Icon = nodeType?.icon || Zap;
              return (
                <div
                  key={node.id}
                  className={`flow-node ${selectedNode === node.id ? 'selected' : ''} ${connecting === node.id ? 'connecting' : ''}`}
                  style={{ 
                    left: node.x, 
                    top: node.y,
                    '--node-color': nodeType?.color || '#58a6ff'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                >
                  <div className="node-header">
                    <Icon size={14} />
                    <span className="node-type">{nodeType?.label}</span>
                  </div>
                  <div className="node-label">{node.label}</div>
                  <div className="node-actions">
                    <button 
                      className="node-btn connect"
                      onClick={(e) => { e.stopPropagation(); startConnecting(node.id); }}
                      title="Connect to another node"
                    >
                      <Link size={12} />
                    </button>
                    {node.id !== 'start' && (
                      <button 
                        className="node-btn delete"
                        onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                        title="Delete node"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {connecting && (
            <div className="connecting-hint">
              Click on another node to connect, or click canvas to cancel
            </div>
          )}
        </div>

        {/* Properties Panel */}
        <div className="properties-panel">
          <h3>Node Properties</h3>
          {selectedNodeData ? (
            <div className="properties-content">
              <div className="property-group">
                <label>Label</label>
                <input
                  type="text"
                  value={selectedNodeData.label}
                  onChange={(e) => updateNodeLabel(selectedNode, e.target.value)}
                />
              </div>

              {selectedNodeData.type === 'WAIT_ACTION' && (
                <>
                  <div className="property-group">
                    <label>Expected Action</label>
                    <select
                      value={selectedNodeData.config?.actionId || ''}
                      onChange={(e) => updateNodeConfig(selectedNode, { actionId: e.target.value })}
                    >
                      <option value="">Select action...</option>
                      {actionCategories.map(cat => (
                        <optgroup key={cat.id} label={cat.label}>
                          {cat.actions.map(action => (
                            <option key={action} value={action}>{action}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="property-group">
                    <label>Timeout (seconds)</label>
                    <input
                      type="number"
                      value={selectedNodeData.config?.timeout || 60}
                      onChange={(e) => updateNodeConfig(selectedNode, { timeout: parseInt(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {selectedNodeData.type === 'WAIT_TIME' && (
                <div className="property-group">
                  <label>Wait Duration (seconds)</label>
                  <input
                    type="number"
                    value={selectedNodeData.config?.seconds || 30}
                    onChange={(e) => updateNodeConfig(selectedNode, { seconds: parseInt(e.target.value) })}
                  />
                </div>
              )}

              {selectedNodeData.type === 'CHANGE_VITALS' && (
                <div className="property-group">
                  <label>Vital Changes</label>
                  <div className="vital-changes">
                    {['heartRate', 'respiratoryRate', 'oxygenSaturation'].map(vital => (
                      <div key={vital} className="vital-change-row">
                        <span>{vital}</span>
                        <input
                          type="number"
                          placeholder="+/-"
                          value={selectedNodeData.config?.changes?.[vital] || ''}
                          onChange={(e) => updateNodeConfig(selectedNode, { 
                            changes: { 
                              ...selectedNodeData.config?.changes, 
                              [vital]: parseInt(e.target.value) || 0 
                            }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNodeData.type === 'PATIENT_SPEAK' && (
                <>
                  <div className="property-group">
                    <label>Patient Says</label>
                    <textarea
                      value={selectedNodeData.config?.text || ''}
                      onChange={(e) => updateNodeConfig(selectedNode, { text: e.target.value })}
                      placeholder="Enter patient dialogue..."
                    />
                  </div>
                  <div className="property-group">
                    <label>Mood</label>
                    <select
                      value={selectedNodeData.config?.mood || 'neutral'}
                      onChange={(e) => updateNodeConfig(selectedNode, { mood: e.target.value })}
                    >
                      <option value="neutral">Neutral</option>
                      <option value="distressed">Distressed</option>
                      <option value="calm">Calm</option>
                      <option value="confused">Confused</option>
                      <option value="angry">Angry</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNodeData.type === 'IOT_ACTION' && (
                <div className="property-group">
                  <label>Manikin Action</label>
                  <select
                    value={selectedNodeData.config?.action || ''}
                    onChange={(e) => updateNodeConfig(selectedNode, { action: e.target.value })}
                  >
                    <option value="">Select action...</option>
                    <option value="play_wheeze">Play Wheeze Sound</option>
                    <option value="play_crackles">Play Crackles Sound</option>
                    <option value="play_stridor">Play Stridor Sound</option>
                    <option value="stop_breath_sounds">Stop Breath Sounds</option>
                    <option value="led_cyanosis">Show Cyanosis (LED)</option>
                    <option value="led_normal">Normal Skin Color</option>
                    <option value="pulse_weak">Weak Pulse</option>
                    <option value="pulse_normal">Normal Pulse</option>
                    <option value="seizure">Trigger Seizure</option>
                  </select>
                </div>
              )}

              <div className="property-group">
                <label>Connections ({(selectedNodeData.connections || []).length})</label>
                <div className="connections-list">
                  {(selectedNodeData.connections || []).map(conn => {
                    const toNode = nodes.find(n => n.id === conn.to);
                    return (
                      <div key={conn.to} className="connection-item">
                        <ArrowRight size={12} />
                        <span>{toNode?.label || conn.to}</span>
                        <button onClick={() => removeConnection(selectedNode, conn.to)}>
                          <Unlink size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a node to edit its properties</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .progression-editor {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-primary);
        }

        .editor-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md);
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-muted);
        }

        .toolbar-left {
          position: relative;
        }

        .add-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: var(--space-xs);
          background: var(--bg-card);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-md);
          padding: var(--space-xs);
          z-index: 100;
          min-width: 180px;
        }

        .add-menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          cursor: pointer;
          text-align: left;
        }

        .add-menu-item:hover {
          background: var(--bg-elevated);
          color: var(--node-color);
        }

        .toolbar-center {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .zoom-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .editor-main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .editor-canvas {
          flex: 1;
          position: relative;
          background: var(--bg-secondary);
          background-image: 
            radial-gradient(circle, var(--border-muted) 1px, transparent 1px);
          background-size: 20px 20px;
          overflow: hidden;
        }

        .connections-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          transform-origin: 0 0;
        }

        .connection-label {
          fill: var(--text-muted);
          font-size: 10px;
        }

        .nodes-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform-origin: 0 0;
        }

        .flow-node {
          position: absolute;
          width: 140px;
          background: var(--bg-card);
          border: 2px solid var(--node-color);
          border-radius: var(--radius-md);
          cursor: grab;
          user-select: none;
          transition: box-shadow var(--transition-fast);
        }

        .flow-node:active {
          cursor: grabbing;
        }

        .flow-node.selected {
          box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
        }

        .flow-node.connecting {
          box-shadow: 0 0 0 3px rgba(63, 185, 80, 0.4);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .node-header {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-sm);
          background: var(--node-color);
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        }

        .node-label {
          padding: var(--space-sm);
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .node-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-xs);
          padding: var(--space-xs);
          border-top: 1px solid var(--border-muted);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .flow-node:hover .node-actions {
          opacity: 1;
        }

        .node-btn {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-muted);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
        }

        .node-btn:hover {
          background: var(--bg-elevated);
        }

        .node-btn.connect:hover {
          color: var(--color-success);
          border-color: var(--color-success);
        }

        .node-btn.delete:hover {
          color: var(--color-danger);
          border-color: var(--color-danger);
        }

        .connecting-hint {
          position: absolute;
          bottom: var(--space-md);
          left: 50%;
          transform: translateX(-50%);
          padding: var(--space-sm) var(--space-md);
          background: var(--color-info);
          color: white;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
        }

        .properties-panel {
          width: 280px;
          background: var(--bg-card);
          border-left: 1px solid var(--border-muted);
          display: flex;
          flex-direction: column;
        }

        .properties-panel h3 {
          padding: var(--space-md);
          border-bottom: 1px solid var(--border-muted);
          font-size: 0.9rem;
        }

        .properties-content {
          flex: 1;
          overflow: auto;
          padding: var(--space-md);
        }

        .property-group {
          margin-bottom: var(--space-md);
        }

        .property-group label {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: var(--space-xs);
        }

        .property-group input,
        .property-group select,
        .property-group textarea {
          width: 100%;
          padding: var(--space-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .property-group textarea {
          min-height: 80px;
          resize: vertical;
        }

        .vital-changes {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .vital-change-row {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .vital-change-row span {
          flex: 1;
          font-size: 0.85rem;
        }

        .vital-change-row input {
          width: 80px;
        }

        .connections-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .connection-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-xs) var(--space-sm);
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
        }

        .connection-item span {
          flex: 1;
        }

        .connection-item button {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
        }

        .connection-item button:hover {
          color: var(--color-danger);
        }

        .no-selection {
          padding: var(--space-lg);
          text-align: center;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

export default ProgressionMapEditor;
