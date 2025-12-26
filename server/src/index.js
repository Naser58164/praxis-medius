import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { SessionManager } from './services/SessionManager.js';
import { ScenarioManager } from './services/ScenarioManager.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Initialize managers
const sessionManager = new SessionManager();
const scenarioManager = new ScenarioManager();

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all scenarios
app.get('/api/scenarios', (req, res) => {
  const scenarios = scenarioManager.getAllScenarios();
  res.json(scenarios);
});

// Get single scenario
app.get('/api/scenarios/:id', (req, res) => {
  const scenario = scenarioManager.getScenario(req.params.id);
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  res.json(scenario);
});

// Create scenario
app.post('/api/scenarios', (req, res) => {
  try {
    const scenario = scenarioManager.createScenario(req.body);
    res.status(201).json(scenario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update scenario
app.put('/api/scenarios/:id', (req, res) => {
  try {
    const scenario = scenarioManager.updateScenario(req.params.id, req.body);
    res.json(scenario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create session from scenario
app.post('/api/sessions', (req, res) => {
  const { scenarioId } = req.body;
  const scenario = scenarioManager.getScenario(scenarioId);
  
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  const session = sessionManager.createSession(scenario);
  res.status(201).json({
    sessionId: session.sessionId,
    joinCode: session.joinCode
  });
});

// Get session
app.get('/api/sessions/:id', (req, res) => {
  const session = sessionManager.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session.toJSON());
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  const { userId, userRole } = socket.handshake.auth;
  console.log(`User connected: ${userId} (${userRole})`);

  // Store user info on socket
  socket.userId = userId;
  socket.userRole = userRole;
  socket.currentSession = null;

  // Join simulation room
  socket.on('join_simulation', (data, callback) => {
    const { sessionId } = data;
    let session = sessionManager.getSession(sessionId);
    
    // Also check by join code
    if (!session) {
      session = sessionManager.getSessionByCode(sessionId);
    }

    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    // Join the socket room
    socket.join(session.sessionId);
    socket.currentSession = session.sessionId;

    // Register participant
    session.addParticipant(userId, userRole, socket.id);

    // Notify others
    socket.to(session.sessionId).emit('participant_joined', {
      userId,
      role: userRole
    });

    callback({
      success: true,
      session: session.toJSON()
    });
  });

  // Examiner: Start simulation
  socket.on('examiner_start_simulation', (data, callback) => {
    if (socket.userRole !== 'examiner') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    try {
      session.start();
      
      // Broadcast to all participants
      io.to(session.sessionId).emit('simulation_started', {
        initialState: session.currentState,
        startedAt: session.startedAt
      });

      callback({ success: true });
    } catch (err) {
      callback({ success: false, error: err.message });
    }
  });

  // Examiner: Pause simulation
  socket.on('examiner_pause_simulation', (data, callback) => {
    if (socket.userRole !== 'examiner') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    session.pause();
    io.to(session.sessionId).emit('simulation_paused');
    callback({ success: true });
  });

  // Examiner: Resume simulation
  socket.on('examiner_resume_simulation', (data, callback) => {
    if (socket.userRole !== 'examiner') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    session.resume();
    io.to(session.sessionId).emit('simulation_resumed');
    callback({ success: true });
  });

  // Examiner: End simulation
  socket.on('examiner_end_simulation', (data, callback) => {
    if (socket.userRole !== 'examiner') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    session.end(data.reason || 'COMPLETED');
    io.to(session.sessionId).emit('simulation_ended', {
      reason: data.reason,
      endedAt: session.endedAt,
      results: session.getResults()
    });
    callback({ success: true });
  });

  // Examiner: Update vitals
  socket.on('examiner_update_vitals', (data, callback) => {
    if (socket.userRole !== 'examiner') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    session.updateVitals(data.vitals);
    
    // Broadcast to all
    io.to(session.sessionId).emit('vitals_update', {
      vitals: session.currentState.vitals
    });

    callback({ success: true, vitals: session.currentState.vitals });
  });

  // Examiner: Update findings
  socket.on('examiner_update_findings', (data, callback) => {
    if (socket.userRole !== 'examiner') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    session.updateFinding(data.path, data.value);
    
    io.to(session.sessionId).emit('findings_update', {
      path: data.path,
      value: data.value
    });

    callback({ success: true });
  });

  // Examiner: Reveal lab results
  socket.on('examiner_reveal_labs', (data, callback) => {
    if (socket.userRole !== 'examiner') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    session.revealLab(data.labType, data.results);
    
    io.to(session.sessionId).emit('lab_results_revealed', {
      labType: data.labType,
      results: data.results
    });

    callback({ success: true });
  });

  // Examiner: Patient speak
  socket.on('examiner_patient_speak', (data, callback) => {
    if (socket.userRole !== 'examiner') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    io.to(session.sessionId).emit('patient_speak', {
      text: data.text,
      mood: data.mood || 'neutral'
    });

    callback({ success: true });
  });

  // Examinee: Perform action
  socket.on('examinee_action', (data, callback) => {
    if (socket.userRole !== 'examinee') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    if (session.status !== 'RUNNING') {
      return callback({ success: false, error: 'Simulation not running' });
    }

    // Log the action
    const actionEntry = session.logAction({
      actionId: data.actionId,
      actionLabel: data.actionLabel,
      dimension: data.dimension,
      parameters: data.parameters,
      performedBy: socket.userId,
      elapsedTime: data.elapsedTime
    });

    // Check if it triggers progression
    const progression = session.checkProgression(data.actionId);

    // Broadcast to examiner
    socket.to(session.sessionId).emit('action_performed', actionEntry);

    // If progression triggered, apply state changes
    if (progression) {
      if (progression.vitalsChange) {
        session.applyVitalsChange(progression.vitalsChange);
        io.to(session.sessionId).emit('vitals_update', {
          vitals: session.currentState.vitals
        });
      }

      if (progression.iotAction) {
        io.to(session.sessionId).emit('manikin_command', {
          action: progression.iotAction
        });
      }

      io.to(session.sessionId).emit('state_change', {
        nodeId: progression.nextStateId,
        vitals: session.currentState.vitals
      });
    }

    callback({ 
      success: true, 
      result: actionEntry.result,
      isCritical: actionEntry.isCriticalAction
    });
  });

  // Examinee: Request lab results
  socket.on('examinee_request_lab', (data, callback) => {
    if (socket.userRole !== 'examinee') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    const labResult = session.getLabResult(data.labType);
    
    // Log as an action
    session.logAction({
      actionId: `request_${data.labType}`,
      actionLabel: `Requested ${data.labType}`,
      dimension: 'TESTS_DIAGNOSTICS',
      performedBy: socket.userId
    });

    // Notify examiner
    socket.to(session.sessionId).emit('action_performed', {
      actionId: `request_${data.labType}`,
      actionLabel: `Requested ${data.labType}`,
      dimension: 'TESTS_DIAGNOSTICS'
    });

    callback({ 
      success: true, 
      revealed: labResult?.revealed || false,
      results: labResult?.results || null
    });
  });

  // Manikin: Physical feedback
  socket.on('manikin_feedback', (data, callback) => {
    if (socket.userRole !== 'manikin') {
      return callback({ success: false, error: 'Not authorized' });
    }

    const session = sessionManager.getSession(socket.currentSession);
    if (!session) {
      return callback({ success: false, error: 'Session not found' });
    }

    // Log sensor data
    session.logSensorData(data);

    // Broadcast to examiner
    socket.to(session.sessionId).emit('manikin_feedback', data);

    callback({ success: true });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    if (socket.currentSession) {
      const session = sessionManager.getSession(socket.currentSession);
      if (session) {
        session.removeParticipant(socket.userId);
        socket.to(socket.currentSession).emit('participant_left', {
          userId: socket.userId,
          role: socket.userRole
        });
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Praxis Medius Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
