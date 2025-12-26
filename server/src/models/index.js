/**
 * Praxis Medius - Database Models
 * MongoDB/Mongoose schemas for data persistence
 */

// Note: These are schema definitions for use with Mongoose
// Install mongoose: npm install mongoose

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ===========================================
// User Schema
// ===========================================
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'examiner', 'examinee'],
    default: 'examinee'
  },
  institution: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    trim: true
  },
  profileImage: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// ===========================================
// Scenario Schema
// ===========================================
const vitalRangeSchema = new Schema({
  min: Number,
  max: Number,
  normal: { min: Number, max: Number }
}, { _id: false });

const criticalActionSchema = new Schema({
  actionId: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  dimension: {
    type: String,
    enum: ['SAFETY', 'COMMUNICATION', 'ASSESSMENT', 'INTERVENTION', 'DRUG_IV', 'TESTS_DIAGNOSTICS'],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  timeLimit: Number, // seconds
  order: Number
}, { _id: true });

const progressionNodeSchema = new Schema({
  nodeId: {
    type: String,
    required: true
  },
  waitingFor: {
    type: {
      type: String,
      enum: ['ACTION', 'TIME', 'VITAL_THRESHOLD', 'MANUAL']
    },
    trigger: Schema.Types.Mixed
  },
  outcomes: [{
    triggerCondition: String,
    nextStateId: String,
    consequence: {
      vitalsChange: Schema.Types.Mixed,
      findingsChange: Schema.Types.Mixed,
      symptomsChange: [String],
      iotAction: String
    }
  }]
}, { _id: false });

const scenarioSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Respiratory', 'Cardiac', 'Neurological', 'Trauma', 'Pediatric', 'OB/GYN', 'Psychiatric', 'Other'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  estimatedDuration: {
    type: Number, // minutes
    default: 15
  },
  description: {
    type: String,
    trim: true
  },
  objectives: [String],
  tags: [String],
  
  // Patient information
  patient: {
    firstName: String,
    lastName: String,
    age: Number,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    weight: Number, // kg
    height: Number, // cm
    roomNumber: String,
    codeStatus: {
      type: String,
      enum: ['Full Code', 'DNR', 'DNR/DNI', 'Comfort Care'],
      default: 'Full Code'
    },
    allergies: [String],
    chiefComplaint: String,
    admissionDiagnosis: String,
    medicalHistory: [String],
    surgicalHistory: [String],
    socialHistory: String,
    familyHistory: String,
    currentMedications: [String]
  },
  
  // Initial state
  initialVitals: {
    heartRate: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    respiratoryRate: Number,
    oxygenSaturation: Number,
    temperature: Number,
    painLevel: Number
  },
  initialFindings: Schema.Types.Mixed,
  initialLabs: Schema.Types.Mixed,
  
  // Simulation logic
  criticalActions: [criticalActionSchema],
  progressionMap: [progressionNodeSchema],
  
  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  institution: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

scenarioSchema.index({ title: 'text', description: 'text', tags: 'text' });
scenarioSchema.index({ category: 1, difficulty: 1 });
scenarioSchema.index({ createdBy: 1 });

// ===========================================
// Session Schema
// ===========================================
const actionLogEntrySchema = new Schema({
  actionId: String,
  actionLabel: String,
  dimension: String,
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  parameters: Schema.Types.Mixed,
  elapsedTime: Number, // seconds since start
  isCriticalAction: Boolean,
  criticalActionId: String,
  result: {
    type: String,
    enum: ['success', 'failure', 'partial'],
    default: 'success'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const sessionSchema = new Schema({
  joinCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  scenario: {
    type: Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true
  },
  status: {
    type: String,
    enum: ['CREATED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED'],
    default: 'CREATED'
  },
  
  // Participants
  examiner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  examinees: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date
  }],
  manikinId: String,
  
  // Current state (snapshot)
  currentState: {
    vitals: Schema.Types.Mixed,
    findings: Schema.Types.Mixed,
    labs: Schema.Types.Mixed,
    currentNodeId: String
  },
  
  // Logs
  actionLog: [actionLogEntrySchema],
  vitalHistory: [{
    vitals: Schema.Types.Mixed,
    timestamp: Date
  }],
  sensorData: [{
    type: String,
    data: Schema.Types.Mixed,
    timestamp: Date
  }],
  
  // Results
  results: {
    totalActions: Number,
    criticalActionsCompleted: Number,
    criticalActionsTotal: Number,
    scoreByDimension: Schema.Types.Mixed,
    passFailStatus: String,
    notes: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  endedAt: Date,
  pausedAt: Date,
  totalPausedTime: {
    type: Number,
    default: 0
  }
});

sessionSchema.index({ joinCode: 1 });
sessionSchema.index({ examiner: 1, createdAt: -1 });
sessionSchema.index({ 'examinees.user': 1 });

// ===========================================
// Performance Record Schema
// ===========================================
const performanceRecordSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  scenario: {
    type: Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true
  },
  
  // Scores
  overallScore: Number, // 0-100
  dimensionScores: {
    safety: Number,
    communication: Number,
    assessment: Number,
    intervention: Number,
    drugIv: Number,
    testsDiagnostics: Number
  },
  
  // Details
  criticalActionsMissed: [String],
  criticalActionsCompleted: [String],
  timeToCriticalActions: Schema.Types.Mixed, // actionId -> seconds
  
  // Feedback
  examinerNotes: String,
  strengthAreas: [String],
  improvementAreas: [String],
  
  // Meta
  duration: Number, // seconds
  completedAt: {
    type: Date,
    default: Date.now
  }
});

performanceRecordSchema.index({ user: 1, completedAt: -1 });
performanceRecordSchema.index({ scenario: 1 });

// ===========================================
// Export Models
// ===========================================
module.exports = {
  User: mongoose.model('User', userSchema),
  Scenario: mongoose.model('Scenario', scenarioSchema),
  Session: mongoose.model('Session', sessionSchema),
  PerformanceRecord: mongoose.model('PerformanceRecord', performanceRecordSchema)
};
