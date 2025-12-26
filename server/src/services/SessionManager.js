import { v4 as uuidv4 } from 'uuid';

// Generate a short join code
function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

class Session {
  constructor(scenario) {
    this.sessionId = uuidv4();
    this.joinCode = generateJoinCode();
    this.scenario = scenario;
    this.status = 'CREATED'; // CREATED, RUNNING, PAUSED, COMPLETED
    this.createdAt = new Date();
    this.startedAt = null;
    this.endedAt = null;
    this.elapsedTime = 0;
    
    // Participants
    this.participants = {
      examiner: null,
      examinee: null,
      manikin: null
    };

    // Current state
    this.currentState = {
      vitals: { ...scenario.initialVitals },
      findings: JSON.parse(JSON.stringify(scenario.initialFindings || {})),
      currentNodeId: scenario.progressionMap?.[0]?.nodeId || null
    };

    // Patient info
    this.patient = scenario.patient || {};

    // Action log
    this.actionLog = [];

    // Lab results (which ones are revealed)
    this.revealedLabs = {};

    // Critical actions tracking
    this.criticalActions = scenario.criticalActions || [];
    this.completedCriticalActions = new Set();

    // Sensor data from manikin
    this.sensorData = [];

    // Timer interval
    this._timerInterval = null;
  }

  addParticipant(userId, role, socketId) {
    this.participants[role] = {
      userId,
      socketId,
      connected: true,
      joinedAt: new Date()
    };
  }

  removeParticipant(userId) {
    for (const role of ['examiner', 'examinee', 'manikin']) {
      if (this.participants[role]?.userId === userId) {
        this.participants[role].connected = false;
      }
    }
  }

  start() {
    if (this.status !== 'CREATED') {
      throw new Error('Session already started');
    }
    this.status = 'RUNNING';
    this.startedAt = new Date();
    this._startTimer();
  }

  pause() {
    if (this.status !== 'RUNNING') {
      throw new Error('Session not running');
    }
    this.status = 'PAUSED';
    this._stopTimer();
  }

  resume() {
    if (this.status !== 'PAUSED') {
      throw new Error('Session not paused');
    }
    this.status = 'RUNNING';
    this._startTimer();
  }

  end(reason = 'COMPLETED') {
    this.status = 'COMPLETED';
    this.endedAt = new Date();
    this.endReason = reason;
    this._stopTimer();
  }

  _startTimer() {
    this._timerInterval = setInterval(() => {
      this.elapsedTime++;
    }, 1000);
  }

  _stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }

  updateVitals(vitals) {
    this.currentState.vitals = {
      ...this.currentState.vitals,
      ...vitals
    };
  }

  applyVitalsChange(changes) {
    const vitals = this.currentState.vitals;
    for (const [key, delta] of Object.entries(changes)) {
      if (key === 'bloodPressure') {
        if (delta.systolic) vitals.bloodPressure.systolic += delta.systolic;
        if (delta.diastolic) vitals.bloodPressure.diastolic += delta.diastolic;
      } else if (typeof vitals[key] === 'number') {
        vitals[key] += delta;
      }
    }
    // Clamp values to reasonable ranges
    vitals.heartRate = Math.max(0, Math.min(300, vitals.heartRate));
    vitals.oxygenSaturation = Math.max(0, Math.min(100, vitals.oxygenSaturation));
    vitals.respiratoryRate = Math.max(0, Math.min(60, vitals.respiratoryRate));
  }

  updateFinding(path, value) {
    const parts = path.split('.');
    let obj = this.currentState.findings;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
  }

  revealLab(labType, results) {
    this.revealedLabs[labType] = {
      revealed: true,
      results,
      revealedAt: new Date()
    };
  }

  getLabResult(labType) {
    return this.revealedLabs[labType] || null;
  }

  logAction(actionData) {
    const entry = {
      entryId: uuidv4(),
      ...actionData,
      timestamp: new Date(),
      elapsedTime: this.elapsedTime,
      success: true
    };

    // Check if it's a critical action
    const criticalAction = this.criticalActions.find(ca => ca.actionId === actionData.actionId);
    if (criticalAction) {
      entry.isCriticalAction = true;
      entry.criticalActionId = criticalAction.id;
      this.completedCriticalActions.add(criticalAction.id);
    }

    this.actionLog.push(entry);
    return entry;
  }

  logSensorData(data) {
    this.sensorData.push({
      ...data,
      timestamp: new Date(),
      elapsedTime: this.elapsedTime
    });
  }

  checkProgression(actionId) {
    if (!this.scenario.progressionMap) return null;

    const currentNode = this.scenario.progressionMap.find(
      n => n.nodeId === this.currentState.currentNodeId
    );

    if (!currentNode) return null;

    // Check if action matches waiting trigger
    if (currentNode.waitingFor?.type === 'ACTION' && 
        currentNode.waitingFor.trigger === actionId) {
      
      const successOutcome = currentNode.outcomes?.find(
        o => o.triggerCondition === 'SUCCESS'
      );

      if (successOutcome) {
        this.currentState.currentNodeId = successOutcome.nextStateId;
        return successOutcome.consequence;
      }
    }

    return null;
  }

  getResults() {
    return {
      sessionId: this.sessionId,
      scenario: this.scenario.title,
      duration: this.elapsedTime,
      totalActions: this.actionLog.length,
      criticalActionsCompleted: this.completedCriticalActions.size,
      criticalActionsTotal: this.criticalActions.length,
      actionLog: this.actionLog,
      endReason: this.endReason
    };
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      joinCode: this.joinCode,
      scenario: this.scenario,
      status: this.status,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      elapsedTime: this.elapsedTime,
      participants: this.participants,
      currentState: this.currentState,
      patient: this.patient,
      actionLog: this.actionLog,
      revealedLabs: this.revealedLabs
    };
  }
}

export class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.joinCodes = new Map();
  }

  createSession(scenario) {
    const session = new Session(scenario);
    this.sessions.set(session.sessionId, session);
    this.joinCodes.set(session.joinCode, session.sessionId);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  getSessionByCode(code) {
    const sessionId = this.joinCodes.get(code.toUpperCase());
    return sessionId ? this.sessions.get(sessionId) : null;
  }

  deleteSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.joinCodes.delete(session.joinCode);
      this.sessions.delete(sessionId);
    }
  }

  getAllSessions() {
    return Array.from(this.sessions.values()).map(s => s.toJSON());
  }
}
