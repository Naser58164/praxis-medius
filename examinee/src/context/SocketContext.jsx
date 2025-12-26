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
  const [patientInfo, setPatientInfo] = useState(null);
  const [labResults, setLabResults] = useState({});
  const [patientMessages, setPatientMessages] = useState([]);
  const [simulationStatus, setSimulationStatus] = useState('WAITING');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [actionHistory, setActionHistory] = useState([]);
  
  const timerRef = useRef(null);

  // Connect to server
  const connect = useCallback((userId = `EXAMINEE_${Date.now()}`) => {
    const newSocket = io(SERVER_URL, {
      auth: {
        userId,
        userRole: 'examinee'
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

    // Vitals update from examiner
    newSocket.on('vitals_update', (data) => {
      setCurrentVitals(data.vitals);
    });

    // Findings update from examiner
    newSocket.on('findings_update', (data) => {
      setCurrentFindings(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        const pathParts = data.path.split('.');
        let obj = updated;
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!obj[pathParts[i]]) obj[pathParts[i]] = {};
          obj = obj[pathParts[i]];
        }
        obj[pathParts[pathParts.length - 1]] = data.value;
        return updated;
      });
    });

    // Lab results revealed
    newSocket.on('lab_results_revealed', (data) => {
      setLabResults(prev => ({
        ...prev,
        [data.labType]: { revealed: true, results: data.results }
      }));
    });

    // Patient speaks
    newSocket.on('patient_speak', (data) => {
      setPatientMessages(prev => [{
        id: Date.now(),
        text: data.text,
        mood: data.mood,
        timestamp: new Date()
      }, ...prev].slice(0, 20)); // Keep last 20 messages
    });

    // Simulation control events
    newSocket.on('simulation_started', (data) => {
      setSimulationStatus('RUNNING');
      setCurrentVitals(data.initialState?.vitals);
      setCurrentFindings(data.initialState?.findings);
      // Start timer
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    });

    newSocket.on('simulation_paused', () => {
      setSimulationStatus('PAUSED');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    });

    newSocket.on('simulation_resumed', () => {
      setSimulationStatus('RUNNING');
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    });

    newSocket.on('simulation_ended', (data) => {
      setSimulationStatus('COMPLETED');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    });

    // State changes from progression logic
    newSocket.on('state_change', (data) => {
      if (data.vitals) setCurrentVitals(data.vitals);
      if (data.findings) setCurrentFindings(data.findings);
      if (data.symptoms) {
        // Handle symptom changes
      }
    });

    // Action confirmation
    newSocket.on('action_confirmed', (data) => {
      setActionHistory(prev => [data, ...prev]);
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
          setPatientInfo(response.session.patient);
          setCurrentVitals(response.session.currentState?.vitals);
          setCurrentFindings(response.session.currentState?.findings);
          setSimulationStatus(response.session.status);
          
          // Initialize lab results structure
          if (response.session.scenario?.labCategories) {
            const initialLabs = {};
            response.session.scenario.labCategories.forEach(cat => {
              initialLabs[cat] = { revealed: false, results: null };
            });
            setLabResults(initialLabs);
          }
          
          resolve(response.session);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Perform a clinical action
  const performAction = useCallback((action) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));
      if (simulationStatus !== 'RUNNING') return reject(new Error('Simulation not running'));
      
      const actionData = {
        actionId: action.id,
        actionLabel: action.label,
        dimension: action.dimension,
        parameters: action.parameters || {},
        elapsedTime
      };

      socket.emit('examinee_action', actionData, (response) => {
        if (response.success) {
          // Add to local history
          setActionHistory(prev => [{
            ...actionData,
            timestamp: new Date(),
            result: response.result,
            success: true
          }, ...prev]);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, simulationStatus, elapsedTime]);

  // Request lab results
  const requestLab = useCallback((labType) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));
      
      socket.emit('examinee_request_lab', { labType }, (response) => {
        if (response.success) {
          if (response.revealed) {
            setLabResults(prev => ({
              ...prev,
              [labType]: { revealed: true, results: response.results }
            }));
          }
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
    patientInfo,
    labResults,
    patientMessages,
    simulationStatus,
    elapsedTime,
    actionHistory,
    connect,
    joinSession,
    performAction,
    requestLab
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
