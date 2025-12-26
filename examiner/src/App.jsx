import React, { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import SimulationDashboard from './components/SimulationDashboard';
import ScenarioBuilder from './components/ScenarioBuilder';
import SessionResults from './components/SessionResults';

function AppContent() {
  const { connected, sessionId, sessionData, simulationStatus, connect } = useSocket();
  const [view, setView] = useState('selector'); // 'selector' | 'dashboard' | 'builder' | 'results'
  const [editingScenario, setEditingScenario] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (sessionId) {
      setView('dashboard');
    }
  }, [sessionId]);

  // When simulation completes, show results
  useEffect(() => {
    if (simulationStatus === 'COMPLETED' && sessionData) {
      setCompletedSession({
        ...sessionData,
        elapsedTime: sessionData.elapsedTime || 0,
        actionLog: sessionData.actionLog || []
      });
    }
  }, [simulationStatus, sessionData]);

  const handleCreateScenario = () => {
    setEditingScenario(null);
    setView('builder');
  };

  const handleEditScenario = (scenario) => {
    setEditingScenario(scenario);
    setView('builder');
  };

  const handleSaveScenario = async (scenarioData) => {
    try {
      const method = editingScenario ? 'PUT' : 'POST';
      const url = editingScenario 
        ? `/api/scenarios/${editingScenario.scenarioId}`
        : '/api/scenarios';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenarioData)
      });

      if (!response.ok) throw new Error('Failed to save scenario');
      
      setView('selector');
      setEditingScenario(null);
    } catch (err) {
      console.error('Error saving scenario:', err);
      throw err;
    }
  };

  const handleViewResults = () => {
    if (completedSession) {
      setView('results');
    }
  };

  const handleCloseResults = () => {
    setView('selector');
    setCompletedSession(null);
  };

  const handleRestartSimulation = () => {
    // Reset and go back to selector to start same scenario
    setView('selector');
    setCompletedSession(null);
  };

  return (
    <div className="app">
      <Header 
        onCreateScenario={handleCreateScenario}
        showCreateButton={view === 'selector'}
      />
      <main className="main-content">
        {!connected ? (
          <div className="connecting-screen">
            <div className="spinner" />
            <p>Connecting to simulation server...</p>
          </div>
        ) : view === 'selector' ? (
          <ScenarioSelector 
            onEditScenario={handleEditScenario}
          />
        ) : view === 'dashboard' ? (
          <SimulationDashboard 
            onBack={() => setView('selector')} 
            onViewResults={handleViewResults}
          />
        ) : view === 'builder' ? (
          <ScenarioBuilder
            scenario={editingScenario}
            onSave={handleSaveScenario}
            onCancel={() => setView('selector')}
          />
        ) : view === 'results' ? (
          <SessionResults
            session={completedSession}
            onClose={handleCloseResults}
            onRestart={handleRestartSimulation}
          />
        ) : null}
      </main>
      <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .main-content {
          flex: 1;
          padding: var(--space-lg);
          max-width: 1800px;
          margin: 0 auto;
          width: 100%;
        }
        
        .connecting-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-md);
          height: 50vh;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;
