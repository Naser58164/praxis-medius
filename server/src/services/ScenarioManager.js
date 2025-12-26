import { v4 as uuidv4 } from 'uuid';

// Sample scenarios
const defaultScenarios = [
  {
    scenarioId: 'ASTHMA-SEV-001',
    title: 'Severe Asthma Exacerbation',
    category: 'Respiratory',
    difficulty: 'Intermediate',
    estimatedDuration: 15,
    description: 'A 39-year-old female presents with severe shortness of breath and wheezing. History of asthma since childhood.',
    objectives: [
      'Recognize signs of severe asthma exacerbation',
      'Initiate appropriate bronchodilator therapy',
      'Monitor patient response to treatment',
      'Escalate care if needed'
    ],
    tags: ['asthma', 'respiratory', 'emergency'],
    patient: {
      firstName: 'Maria',
      lastName: 'Santos',
      age: 39,
      gender: 'Female',
      roomNumber: '301A',
      codeStatus: 'Full Code',
      allergies: ['Penicillin', 'Sulfa drugs'],
      admissionDiagnosis: 'Acute asthma exacerbation',
      chiefComplaint: 'I can\'t breathe!',
      medicalHistory: ['Asthma since age 8', 'Seasonal allergies', 'Previous ICU admission for asthma'],
      currentMedications: ['Albuterol inhaler PRN', 'Fluticasone 250mcg BID', 'Montelukast 10mg daily']
    },
    initialVitals: {
      heartRate: 112,
      bloodPressure: { systolic: 138, diastolic: 88 },
      respiratoryRate: 28,
      oxygenSaturation: 91,
      temperature: 37.2,
      painLevel: 2
    },
    initialFindings: {
      respiratory: {
        breathSounds: {
          rightUpperLobe: 'Expiratory wheezes',
          rightMiddleLobe: 'Expiratory wheezes',
          rightLowerLobe: 'Diminished with wheezes',
          leftUpperLobe: 'Expiratory wheezes',
          leftLowerLobe: 'Diminished with wheezes'
        },
        breathingPattern: 'Labored, using accessory muscles',
        accessoryMuscleUse: true,
        oxygenDevice: 'Room air'
      },
      cardiac: {
        heartSounds: {
          aortic: 'S1, S2 normal, tachycardic',
          pulmonic: 'S1, S2 normal',
          erbs: 'S1, S2 normal',
          tricuspid: 'S1, S2 normal',
          mitral: 'S1, S2 normal'
        },
        rhythm: 'Regular but tachycardic',
        jvd: false
      },
      neurological: {
        levelOfConsciousness: 'Alert but anxious',
        orientation: 'Oriented x4',
        pupils: 'PERRLA, 3mm bilaterally',
        speech: 'Speaking in short phrases only'
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'hand_hygiene', label: 'Perform Hand Hygiene', dimension: 'SAFETY', required: true },
      { id: 'ca2', actionId: 'check_vitals', label: 'Check Vital Signs', dimension: 'ASSESSMENT', required: true },
      { id: 'ca3', actionId: 'apply_o2', label: 'Apply Supplemental Oxygen', dimension: 'INTERVENTION', required: true },
      { id: 'ca4', actionId: 'auscultate_lungs', label: 'Auscultate Lung Sounds', dimension: 'ASSESSMENT', required: true },
      { id: 'ca5', actionId: 'admin_albuterol', label: 'Administer Albuterol Nebulizer', dimension: 'DRUG_IV', required: true },
      { id: 'ca6', actionId: 'notify_physician', label: 'Notify Physician', dimension: 'COMMUNICATION', required: true }
    ],
    progressionMap: [
      {
        nodeId: 'A1',
        waitingFor: { type: 'ACTION', trigger: 'admin_albuterol' },
        outcomes: [
          {
            triggerCondition: 'SUCCESS',
            nextStateId: 'B1',
            consequence: { 
              vitalsChange: { heartRate: -15, oxygenSaturation: 4, respiratoryRate: -4 },
              iotAction: 'DECREASE_WHEEZE_VOLUME'
            }
          }
        ]
      },
      {
        nodeId: 'B1',
        waitingFor: { type: 'TIME', trigger: 300 },
        outcomes: [
          {
            triggerCondition: 'TIMEOUT',
            nextStateId: 'C1',
            consequence: { vitalsChange: { heartRate: 5, oxygenSaturation: -2 } }
          }
        ]
      }
    ]
  },
  {
    scenarioId: 'MI-STEMI-001',
    title: 'Acute STEMI',
    category: 'Cardiac',
    difficulty: 'Advanced',
    estimatedDuration: 20,
    description: 'A 62-year-old male presents with crushing chest pain radiating to left arm. History of hypertension and diabetes.',
    objectives: [
      'Recognize signs of acute MI',
      'Initiate MONA protocol',
      'Obtain 12-lead EKG',
      'Activate cath lab'
    ],
    tags: ['cardiac', 'STEMI', 'emergency', 'chest pain'],
    patient: {
      firstName: 'Robert',
      lastName: 'Johnson',
      age: 62,
      gender: 'Male',
      roomNumber: '512',
      codeStatus: 'Full Code',
      allergies: ['Morphine'],
      admissionDiagnosis: 'Chest pain, rule out MI',
      chiefComplaint: 'Crushing chest pain for 45 minutes',
      medicalHistory: ['Hypertension x 15 years', 'Type 2 Diabetes', 'Hyperlipidemia', 'Former smoker'],
      currentMedications: ['Metoprolol 50mg BID', 'Lisinopril 20mg daily', 'Metformin 1000mg BID', 'Atorvastatin 40mg daily']
    },
    initialVitals: {
      heartRate: 92,
      bloodPressure: { systolic: 168, diastolic: 98 },
      respiratoryRate: 22,
      oxygenSaturation: 94,
      temperature: 36.8,
      painLevel: 9
    },
    initialFindings: {
      respiratory: {
        breathSounds: {
          rightUpperLobe: 'Clear',
          rightMiddleLobe: 'Clear',
          rightLowerLobe: 'Clear',
          leftUpperLobe: 'Clear',
          leftLowerLobe: 'Clear'
        },
        breathingPattern: 'Shallow, guarded',
        accessoryMuscleUse: false
      },
      cardiac: {
        heartSounds: {
          aortic: 'S1, S2 normal',
          pulmonic: 'S1, S2 normal',
          erbs: 'S1, S2 normal',
          tricuspid: 'S1, S2 normal',
          mitral: 'S4 gallop'
        },
        rhythm: 'Regular',
        jvd: false,
        peripheralPulses: '2+ bilaterally',
        edema: 'None'
      },
      neurological: {
        levelOfConsciousness: 'Alert, anxious, diaphoretic',
        orientation: 'Oriented x4',
        pupils: 'PERRLA, 3mm bilaterally'
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'order_ekg', label: 'Order 12-Lead EKG', dimension: 'TESTS_DIAGNOSTICS', required: true, timeLimit: 180 },
      { id: 'ca2', actionId: 'admin_aspirin', label: 'Administer Aspirin 324mg', dimension: 'DRUG_IV', required: true },
      { id: 'ca3', actionId: 'start_iv', label: 'Establish IV Access', dimension: 'DRUG_IV', required: true },
      { id: 'ca4', actionId: 'apply_o2', label: 'Apply Oxygen', dimension: 'INTERVENTION', required: true },
      { id: 'ca5', actionId: 'order_troponin', label: 'Order Troponin', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca6', actionId: 'notify_physician', label: 'Notify Physician/Activate Cath Lab', dimension: 'COMMUNICATION', required: true }
    ]
  },
  {
    scenarioId: 'STROKE-CVA-001',
    title: 'Acute Ischemic Stroke',
    category: 'Neurological',
    difficulty: 'Advanced',
    estimatedDuration: 15,
    description: 'A 71-year-old female found by family with right-sided weakness and slurred speech. Last known well 2 hours ago.',
    objectives: [
      'Perform rapid stroke assessment',
      'Calculate NIH Stroke Scale',
      'Determine tPA eligibility',
      'Activate stroke team'
    ],
    tags: ['stroke', 'neurological', 'emergency', 'tPA'],
    patient: {
      firstName: 'Eleanor',
      lastName: 'Thompson',
      age: 71,
      gender: 'Female',
      roomNumber: '201',
      codeStatus: 'Full Code',
      allergies: ['Codeine'],
      admissionDiagnosis: 'Acute stroke',
      chiefComplaint: 'Right-sided weakness, difficulty speaking',
      medicalHistory: ['Atrial fibrillation', 'Hypertension', 'Hyperlipidemia'],
      currentMedications: ['Warfarin 5mg daily', 'Diltiazem 120mg BID', 'Simvastatin 20mg daily']
    },
    initialVitals: {
      heartRate: 88,
      bloodPressure: { systolic: 178, diastolic: 94 },
      respiratoryRate: 18,
      oxygenSaturation: 96,
      temperature: 36.9,
      painLevel: 0
    },
    initialFindings: {
      neurological: {
        levelOfConsciousness: 'Alert but confused',
        orientation: 'Oriented to person only',
        pupils: 'Left 3mm, Right 3mm, both reactive',
        motorStrength: 'Left 5/5, Right upper 1/5, Right lower 2/5',
        sensation: 'Diminished right side',
        speech: 'Dysarthric, word-finding difficulty'
      },
      cardiac: {
        rhythm: 'Irregularly irregular (A-fib)'
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'assess_neuro', label: 'Perform Neurological Assessment', dimension: 'ASSESSMENT', required: true },
      { id: 'ca2', actionId: 'fingerstick_glucose', label: 'Check Blood Glucose', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca3', actionId: 'order_ct', label: 'Order CT Head (STAT)', dimension: 'TESTS_DIAGNOSTICS', required: true, timeLimit: 300 },
      { id: 'ca4', actionId: 'start_iv', label: 'Establish IV Access', dimension: 'DRUG_IV', required: true },
      { id: 'ca5', actionId: 'notify_physician', label: 'Activate Stroke Team', dimension: 'COMMUNICATION', required: true }
    ]
  },
  {
    scenarioId: 'SEPSIS-001',
    title: 'Sepsis - Pneumonia',
    category: 'Respiratory',
    difficulty: 'Intermediate',
    estimatedDuration: 20,
    description: 'A 68-year-old male with productive cough, fever, and altered mental status. Suspected pneumonia with sepsis.',
    objectives: [
      'Recognize sepsis criteria',
      'Initiate sepsis bundle',
      'Obtain cultures before antibiotics',
      'Administer IV fluids'
    ],
    tags: ['sepsis', 'pneumonia', 'infection', 'emergency'],
    patient: {
      firstName: 'William',
      lastName: 'Davis',
      age: 68,
      gender: 'Male',
      roomNumber: '405',
      codeStatus: 'Full Code',
      allergies: ['None known'],
      admissionDiagnosis: 'Pneumonia, possible sepsis',
      chiefComplaint: 'Cough, fever, confusion',
      medicalHistory: ['COPD', 'Hypertension', 'BPH'],
      currentMedications: ['Tiotropium 18mcg daily', 'Amlodipine 5mg daily', 'Tamsulosin 0.4mg daily']
    },
    initialVitals: {
      heartRate: 118,
      bloodPressure: { systolic: 88, diastolic: 54 },
      respiratoryRate: 26,
      oxygenSaturation: 89,
      temperature: 39.2,
      painLevel: 3
    },
    initialFindings: {
      respiratory: {
        breathSounds: {
          rightUpperLobe: 'Clear',
          rightMiddleLobe: 'Crackles',
          rightLowerLobe: 'Crackles, diminished',
          leftUpperLobe: 'Clear',
          leftLowerLobe: 'Clear'
        },
        cough: 'Productive, yellow-green sputum',
        accessoryMuscleUse: true
      },
      neurological: {
        levelOfConsciousness: 'Drowsy, arousable',
        orientation: 'Oriented x1 (person only)',
        speech: 'Slow, confused'
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'check_vitals', label: 'Check Vital Signs', dimension: 'ASSESSMENT', required: true },
      { id: 'ca2', actionId: 'start_iv', label: 'Establish IV Access (x2)', dimension: 'DRUG_IV', required: true },
      { id: 'ca3', actionId: 'order_lactate', label: 'Order Serum Lactate', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca4', actionId: 'obtain_cultures', label: 'Obtain Blood Cultures', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca5', actionId: 'iv_fluids', label: 'Start IV Fluid Bolus (30mL/kg)', dimension: 'DRUG_IV', required: true },
      { id: 'ca6', actionId: 'apply_o2', label: 'Apply Supplemental Oxygen', dimension: 'INTERVENTION', required: true },
      { id: 'ca7', actionId: 'notify_physician', label: 'Notify Physician', dimension: 'COMMUNICATION', required: true }
    ]
  }
];

export class ScenarioManager {
  constructor() {
    this.scenarios = new Map();
    
    // Load default scenarios
    for (const scenario of defaultScenarios) {
      this.scenarios.set(scenario.scenarioId, scenario);
    }
  }

  getAllScenarios() {
    return Array.from(this.scenarios.values());
  }

  getScenario(id) {
    return this.scenarios.get(id);
  }

  createScenario(data) {
    const scenario = {
      scenarioId: uuidv4(),
      createdAt: new Date(),
      ...data
    };
    this.scenarios.set(scenario.scenarioId, scenario);
    return scenario;
  }

  updateScenario(id, data) {
    const existing = this.scenarios.get(id);
    if (!existing) {
      throw new Error('Scenario not found');
    }
    const updated = {
      ...existing,
      ...data,
      scenarioId: id,
      updatedAt: new Date()
    };
    this.scenarios.set(id, updated);
    return updated;
  }

  deleteScenario(id) {
    return this.scenarios.delete(id);
  }
}
