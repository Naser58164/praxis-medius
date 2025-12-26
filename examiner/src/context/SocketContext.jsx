import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [currentVitals, setCurrentVitals] = useState(null);
  const [currentFindings, setCurrentFindings] = useState(null);
  const [actionLog, setActionLog] = useState([]);
  const [participants, setParticipants] = useState({
    examiner: { connected: false },
    examinee: { connected: false },
    manikin: { connected: false }
  });
  const [simulationStatus, setSimulationStatus] = useState('CREATED');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const timerRef = useRef(null);

  // Connect to server
  const connect = useCallback((userId = 'EXAMINER_001') => {
    const newSocket = io(SERVER_URL, {
      auth: {
        userId,
        userRole: 'examiner'
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // Listen for events
    newSocket.on('vitals_update', (data) => {
      setCurrentVitals(data.vitals);
    });

    newSocket.on('findings_update', (data) => {
      setCurrentFindings(prev => {
        const updated = { ...prev };
        const pathParts = data.path.split('.');
        let obj = updated;
        for (let i = 0; i < pathParts.length - 1; i++) {
          obj = obj[pathParts[i]];
        }
        obj[pathParts[pathParts.length - 1]] = data.value;
        return updated;
      });
    });

    newSocket.on('action_performed', (data) => {
      setActionLog(prev => [data, ...prev]);
    });

    newSocket.on('participant_joined', (data) => {
      setParticipants(prev => ({
        ...prev,
        [data.role]: { connected: true, userId: data.userId }
      }));
    });

    newSocket.on('participant_left', (data) => {
      setParticipants(prev => ({
        ...prev,
        [data.role]: { connected: false }
      }));
    });

    newSocket.on('simulation_started', (data) => {
      setSimulationStatus('RUNNING');
      setCurrentVitals(data.initialState.vitals);
    });

    newSocket.on('simulation_paused', () => {
      setSimulationStatus('PAUSED');
    });

    newSocket.on('simulation_resumed', () => {
      setSimulationStatus('RUNNING');
    });

    newSocket.on('simulation_ended', (data) => {
      setSimulationStatus('COMPLETED');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    });

    newSocket.on('state_change', (data) => {
      console.log('State change:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join a simulation session
  const joinSession = useCallback((id) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Not connected'));
        return;
      }

      socket.emit('join_simulation', { sessionId: id }, (response) => {
        if (response.success) {
          setSessionId(id);
          setSessionData(response.session);
          setCurrentVitals(response.session.currentState.vitals);
          setCurrentFindings(response.session.currentState.findings);
          setSimulationStatus(response.session.status);
          setParticipants(prev => ({
            ...prev,
            examiner: { connected: true }
          }));
          resolve(response.session);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Start simulation
  const startSimulation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));
      
      socket.emit('examiner_start_simulation', {}, (response) => {
        if (response.success) {
          setSimulationStatus('RUNNING');
          // Start timer
          timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
          }, 1000);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Pause simulation
  const pauseSimulation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));
      
      socket.emit('examiner_pause_simulation', {}, (response) => {
        if (response.success) {
          setSimulationStatus('PAUSED');
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Resume simulation
  const resumeSimulation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));
      
      socket.emit('examiner_resume_simulation', {}, (response) => {
        if (response.success) {
          setSimulationStatus('RUNNING');
          timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
          }, 1000);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // End simulation
  const endSimulation = useCallback((reason = 'COMPLETED') => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));
      
      socket.emit('examiner_end_simulation', { reason }, (response) => {
        if (response.success) {
          setSimulationStatus('COMPLETED');
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Update vitals
  const updateVitals = useCallback((vitals) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));
      
      socket.emit('examiner_update_vitals', { vitals }, (response) => {
        if (response.success) {
          setCurrentVitals(response.vitals);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Update findings
  const updateFindings = useCallback((path, value) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));
      
      socket.emit('examiner_update_findings', { path, value }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Reveal lab results
  const revealLabResults = useCallback((labType, results) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));
      
      socket.emit('examiner_reveal_labs', { labType, results }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Patient speak
  const patientSpeak = useCallback((text, mood = 'neutral') => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));
      
      socket.emit('examiner_patient_speak', { text, mood }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const value = {
    socket,
    connected,
    sessionId,
    sessionData,
    currentVitals,
    currentFindings,
    actionLog,
    participants,
    simulationStatus,
    elapsedTime,
    connect,
    joinSession,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    endSimulation,
    updateVitals,
    updateFindings,
    revealLabResults,
    patientSpeak
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
