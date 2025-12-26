/**
 * Praxis Medius - Additional Sample Scenarios
 * Comprehensive scenario library for medical training
 */

export const additionalScenarios = [
  // ===========================================
  // TRAUMA SCENARIOS
  // ===========================================
  {
    scenarioId: 'TRAUMA-MVC-001',
    title: 'Motor Vehicle Collision - Polytrauma',
    category: 'Trauma',
    difficulty: 'Advanced',
    estimatedDuration: 25,
    description: 'A 28-year-old male involved in high-speed MVC, unrestrained driver. GCS 12, complaining of abdominal pain and difficulty breathing.',
    objectives: [
      'Perform primary trauma survey (ABCDE)',
      'Identify life-threatening injuries',
      'Initiate massive transfusion protocol if indicated',
      'Coordinate trauma team activation'
    ],
    tags: ['trauma', 'MVC', 'polytrauma', 'emergency', 'ATLS'],
    patient: {
      firstName: 'Marcus',
      lastName: 'Rivera',
      age: 28,
      gender: 'Male',
      roomNumber: 'Trauma Bay 1',
      codeStatus: 'Full Code',
      allergies: ['None known'],
      chiefComplaint: 'Car accident - abdominal pain, trouble breathing',
      admissionDiagnosis: 'Polytrauma, r/o internal bleeding',
      medicalHistory: ['None'],
      currentMedications: ['None']
    },
    initialVitals: {
      heartRate: 128,
      bloodPressure: { systolic: 88, diastolic: 52 },
      respiratoryRate: 28,
      oxygenSaturation: 88,
      temperature: 36.0,
      painLevel: 8
    },
    initialFindings: {
      respiratory: {
        breathSounds: {
          rightUpperLobe: 'Clear',
          rightMiddleLobe: 'Clear',
          rightLowerLobe: 'Diminished',
          leftUpperLobe: 'Absent',
          leftLowerLobe: 'Absent'
        },
        breathingPattern: 'Labored, asymmetric chest rise',
        accessoryMuscleUse: true,
        trachealDeviation: 'Right'
      },
      cardiac: {
        rhythm: 'Sinus tachycardia',
        jvd: true
      },
      neurological: {
        levelOfConsciousness: 'Confused, follows commands',
        gcsEye: 3,
        gcsVerbal: 4,
        gcsMotor: 5,
        pupils: 'Left 4mm sluggish, Right 3mm reactive'
      },
      abdomen: {
        inspection: 'Seatbelt sign across abdomen',
        palpation: 'Rigid, guarding, rebound tenderness LUQ',
        bowelSounds: 'Absent'
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'check_airway', label: 'Assess Airway with C-spine protection', dimension: 'ASSESSMENT', required: true, timeLimit: 30 },
      { id: 'ca2', actionId: 'needle_decompression', label: 'Needle Decompression (Tension Pneumothorax)', dimension: 'INTERVENTION', required: true, timeLimit: 120 },
      { id: 'ca3', actionId: 'start_iv', label: 'Large Bore IV Access x2', dimension: 'DRUG_IV', required: true },
      { id: 'ca4', actionId: 'blood_transfusion', label: 'Initiate Blood Transfusion', dimension: 'DRUG_IV', required: true },
      { id: 'ca5', actionId: 'fast_exam', label: 'Perform FAST Exam', dimension: 'ASSESSMENT', required: true },
      { id: 'ca6', actionId: 'activate_trauma', label: 'Activate Trauma Team/OR', dimension: 'COMMUNICATION', required: true }
    ],
    progressionMap: [
      {
        nodeId: 'A1',
        waitingFor: { type: 'ACTION', trigger: 'needle_decompression' },
        outcomes: [
          {
            triggerCondition: 'SUCCESS',
            nextStateId: 'B1',
            consequence: {
              vitalsChange: { oxygenSaturation: 6, bloodPressure: { systolic: 10 } },
              iotAction: 'RESTORE_LEFT_BREATH_SOUNDS'
            }
          }
        ]
      }
    ]
  },

  // ===========================================
  // PEDIATRIC SCENARIOS
  // ===========================================
  {
    scenarioId: 'PEDS-CROUP-001',
    title: 'Pediatric Croup (Laryngotracheobronchitis)',
    category: 'Pediatric',
    difficulty: 'Intermediate',
    estimatedDuration: 15,
    description: 'A 2-year-old male presents with barking cough, stridor, and respiratory distress. URI symptoms for 2 days.',
    objectives: [
      'Recognize croup and assess severity',
      'Administer appropriate therapy',
      'Monitor for deterioration',
      'Determine disposition'
    ],
    tags: ['pediatric', 'respiratory', 'croup', 'stridor'],
    patient: {
      firstName: 'Ethan',
      lastName: 'Chen',
      age: 2,
      gender: 'Male',
      roomNumber: 'Peds ED 3',
      codeStatus: 'Full Code',
      allergies: ['None known'],
      chiefComplaint: 'Barking cough, noisy breathing',
      admissionDiagnosis: 'Croup',
      medicalHistory: ['Term delivery, no complications', 'Vaccines up to date'],
      currentMedications: ['None']
    },
    initialVitals: {
      heartRate: 142,
      bloodPressure: { systolic: 95, diastolic: 60 },
      respiratoryRate: 36,
      oxygenSaturation: 93,
      temperature: 38.4,
      painLevel: 0
    },
    initialFindings: {
      respiratory: {
        breathSounds: {
          rightUpperLobe: 'Transmitted upper airway sounds',
          leftUpperLobe: 'Transmitted upper airway sounds'
        },
        stridor: 'Inspiratory, at rest',
        breathingPattern: 'Suprasternal retractions',
        barking_cough: true
      },
      neurological: {
        levelOfConsciousness: 'Alert but irritable',
        orientation: 'Age appropriate'
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'assess_severity', label: 'Assess Croup Severity (Westley Score)', dimension: 'ASSESSMENT', required: true },
      { id: 'ca2', actionId: 'admin_dexamethasone', label: 'Administer Dexamethasone', dimension: 'DRUG_IV', required: true },
      { id: 'ca3', actionId: 'admin_racemic_epi', label: 'Administer Nebulized Epinephrine', dimension: 'DRUG_IV', required: true },
      { id: 'ca4', actionId: 'keep_child_calm', label: 'Keep Child Calm (Minimize agitation)', dimension: 'INTERVENTION', required: true }
    ]
  },

  {
    scenarioId: 'PEDS-SEIZ-001',
    title: 'Pediatric Status Epilepticus',
    category: 'Pediatric',
    difficulty: 'Advanced',
    estimatedDuration: 20,
    description: 'A 5-year-old girl with known epilepsy, actively seizing for 8 minutes. Parents gave home rescue medication.',
    objectives: [
      'Manage active seizure',
      'Follow status epilepticus protocol',
      'Identify and treat reversible causes',
      'Prepare for escalation if needed'
    ],
    tags: ['pediatric', 'neurological', 'seizure', 'status epilepticus', 'emergency'],
    patient: {
      firstName: 'Sofia',
      lastName: 'Martinez',
      age: 5,
      gender: 'Female',
      roomNumber: 'Resus Bay',
      codeStatus: 'Full Code',
      allergies: ['Phenytoin (rash)'],
      chiefComplaint: 'Seizure lasting >5 minutes',
      admissionDiagnosis: 'Status epilepticus',
      medicalHistory: ['Epilepsy diagnosed age 3', 'Last seizure 2 months ago'],
      currentMedications: ['Levetiracetam 250mg BID', 'Rectal diazepam PRN (given at home)']
    },
    initialVitals: {
      heartRate: 156,
      bloodPressure: { systolic: 110, diastolic: 70 },
      respiratoryRate: 8,
      oxygenSaturation: 85,
      temperature: 37.8,
      painLevel: 0
    },
    initialFindings: {
      neurological: {
        levelOfConsciousness: 'Unresponsive, actively seizing',
        seizureType: 'Generalized tonic-clonic',
        pupils: '4mm bilaterally, minimally reactive'
      },
      respiratory: {
        breathingPattern: 'Irregular, hypoventilation during seizure',
        secretions: true
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'position_airway', label: 'Position and Protect Airway', dimension: 'INTERVENTION', required: true },
      { id: 'ca2', actionId: 'apply_o2', label: 'Apply High-Flow Oxygen', dimension: 'INTERVENTION', required: true },
      { id: 'ca3', actionId: 'start_iv', label: 'Establish IV/IO Access', dimension: 'DRUG_IV', required: true },
      { id: 'ca4', actionId: 'fingerstick_glucose', label: 'Check Blood Glucose', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca5', actionId: 'admin_benzodiazepine', label: 'Administer Benzodiazepine (Lorazepam/Midazolam)', dimension: 'DRUG_IV', required: true, timeLimit: 180 },
      { id: 'ca6', actionId: 'admin_second_line', label: 'Second-line AED (Levetiracetam/Fosphenytoin)', dimension: 'DRUG_IV', required: true }
    ]
  },

  // ===========================================
  // CARDIAC SCENARIOS
  // ===========================================
  {
    scenarioId: 'CARDIAC-AFIB-RVR-001',
    title: 'Atrial Fibrillation with RVR',
    category: 'Cardiac',
    difficulty: 'Intermediate',
    estimatedDuration: 15,
    description: 'A 72-year-old male presents with palpitations, shortness of breath, and chest discomfort. New onset atrial fibrillation.',
    objectives: [
      'Identify atrial fibrillation with rapid ventricular response',
      'Assess hemodynamic stability',
      'Initiate rate control',
      'Consider anticoagulation'
    ],
    tags: ['cardiac', 'arrhythmia', 'atrial fibrillation', 'rate control'],
    patient: {
      firstName: 'Harold',
      lastName: 'Wilson',
      age: 72,
      gender: 'Male',
      roomNumber: '410',
      codeStatus: 'Full Code',
      allergies: ['Amiodarone (thyroid issues)'],
      chiefComplaint: 'Heart racing, short of breath',
      admissionDiagnosis: 'New onset atrial fibrillation with RVR',
      medicalHistory: ['Hypertension', 'Type 2 Diabetes', 'Mild CHF (EF 45%)'],
      currentMedications: ['Lisinopril 20mg daily', 'Metformin 500mg BID', 'Furosemide 20mg daily']
    },
    initialVitals: {
      heartRate: 148,
      bloodPressure: { systolic: 102, diastolic: 68 },
      respiratoryRate: 22,
      oxygenSaturation: 94,
      temperature: 36.8,
      painLevel: 3
    },
    initialFindings: {
      cardiac: {
        rhythm: 'Irregularly irregular',
        heartSounds: {
          aortic: 'Variable S1, S2',
          mitral: 'Variable S1'
        },
        jvd: true,
        edema: '1+ bilateral pedal'
      },
      respiratory: {
        breathSounds: {
          rightLowerLobe: 'Bibasilar crackles',
          leftLowerLobe: 'Bibasilar crackles'
        }
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'order_ekg', label: 'Obtain 12-Lead EKG', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca2', actionId: 'assess_stability', label: 'Assess Hemodynamic Stability', dimension: 'ASSESSMENT', required: true },
      { id: 'ca3', actionId: 'start_iv', label: 'Establish IV Access', dimension: 'DRUG_IV', required: true },
      { id: 'ca4', actionId: 'admin_rate_control', label: 'Administer Rate Control (Diltiazem/Metoprolol)', dimension: 'DRUG_IV', required: true },
      { id: 'ca5', actionId: 'calculate_chadsvasc', label: 'Calculate CHA2DS2-VASc Score', dimension: 'ASSESSMENT', required: true }
    ]
  },

  {
    scenarioId: 'CARDIAC-CHF-001',
    title: 'Acute Decompensated Heart Failure',
    category: 'Cardiac',
    difficulty: 'Intermediate',
    estimatedDuration: 20,
    description: 'A 68-year-old female with history of CHF presents with worsening dyspnea, orthopnea, and leg swelling over 3 days.',
    objectives: [
      'Recognize acute CHF exacerbation',
      'Initiate appropriate diuretic therapy',
      'Identify precipitating factors',
      'Optimize fluid status'
    ],
    tags: ['cardiac', 'heart failure', 'CHF', 'pulmonary edema'],
    patient: {
      firstName: 'Patricia',
      lastName: 'Anderson',
      age: 68,
      gender: 'Female',
      roomNumber: '302',
      codeStatus: 'Full Code',
      allergies: ['Sulfa drugs'],
      chiefComplaint: "Can't breathe lying down, legs swollen",
      admissionDiagnosis: 'Acute decompensated heart failure',
      medicalHistory: ['CHF (EF 30%)', 'Hypertension', 'Atrial fibrillation', 'CKD Stage 3'],
      currentMedications: ['Carvedilol 25mg BID', 'Lisinopril 10mg daily', 'Furosemide 40mg daily', 'Spironolactone 25mg daily', 'Warfarin 5mg daily']
    },
    initialVitals: {
      heartRate: 98,
      bloodPressure: { systolic: 168, diastolic: 92 },
      respiratoryRate: 26,
      oxygenSaturation: 88,
      temperature: 36.6,
      painLevel: 2
    },
    initialFindings: {
      cardiac: {
        rhythm: 'Irregularly irregular (A-fib)',
        jvd: true,
        s3Gallop: true,
        edema: '3+ bilateral lower extremity to knees'
      },
      respiratory: {
        breathSounds: {
          rightUpperLobe: 'Clear',
          rightMiddleLobe: 'Crackles',
          rightLowerLobe: 'Crackles',
          leftUpperLobe: 'Clear',
          leftLowerLobe: 'Crackles'
        },
        breathingPattern: 'Labored, tripod positioning'
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'apply_o2', label: 'Apply Supplemental Oxygen', dimension: 'INTERVENTION', required: true },
      { id: 'ca2', actionId: 'elevate_hob', label: 'Position Upright (Elevate HOB)', dimension: 'INTERVENTION', required: true },
      { id: 'ca3', actionId: 'start_iv', label: 'Establish IV Access', dimension: 'DRUG_IV', required: true },
      { id: 'ca4', actionId: 'admin_diuretic', label: 'Administer IV Diuretic (Furosemide)', dimension: 'DRUG_IV', required: true },
      { id: 'ca5', actionId: 'order_bnp', label: 'Order BNP/NT-proBNP', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca6', actionId: 'order_cxr', label: 'Order Chest X-Ray', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca7', actionId: 'fluid_restrict', label: 'Implement Fluid Restriction', dimension: 'INTERVENTION', required: true }
    ]
  },

  // ===========================================
  // METABOLIC/ENDOCRINE SCENARIOS
  // ===========================================
  {
    scenarioId: 'ENDO-DKA-001',
    title: 'Diabetic Ketoacidosis (DKA)',
    category: 'Other',
    difficulty: 'Advanced',
    estimatedDuration: 25,
    description: 'A 24-year-old female with Type 1 Diabetes presents with nausea, vomiting, abdominal pain, and altered mental status.',
    objectives: [
      'Diagnose DKA (glucose, pH, ketones)',
      'Initiate IV fluid resuscitation',
      'Start insulin infusion',
      'Monitor and replace electrolytes'
    ],
    tags: ['endocrine', 'DKA', 'diabetes', 'metabolic', 'emergency'],
    patient: {
      firstName: 'Ashley',
      lastName: 'Thompson',
      age: 24,
      gender: 'Female',
      roomNumber: 'ED 8',
      codeStatus: 'Full Code',
      allergies: ['None known'],
      chiefComplaint: 'Nausea, vomiting, stomach pain for 2 days',
      admissionDiagnosis: 'Diabetic ketoacidosis',
      medicalHistory: ['Type 1 Diabetes since age 12', 'Previous DKA admission 2 years ago'],
      currentMedications: ['Insulin glargine 20 units at bedtime', 'Insulin lispro sliding scale with meals']
    },
    initialVitals: {
      heartRate: 118,
      bloodPressure: { systolic: 92, diastolic: 58 },
      respiratoryRate: 28,
      oxygenSaturation: 98,
      temperature: 37.2,
      painLevel: 6
    },
    initialFindings: {
      neurological: {
        levelOfConsciousness: 'Drowsy, arousable, confused',
        orientation: 'Oriented x1 (person)',
        speech: 'Slow, slurred'
      },
      respiratory: {
        breathingPattern: 'Kussmaul respirations (deep, rapid)',
        breathOdor: 'Fruity (acetone)'
      },
      abdomen: {
        palpation: 'Diffuse tenderness, no guarding',
        bowelSounds: 'Hypoactive'
      },
      skin: {
        turgor: 'Poor (tenting)',
        mucousMembranes: 'Dry'
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'fingerstick_glucose', label: 'Check Blood Glucose (POC)', dimension: 'TESTS_DIAGNOSTICS', required: true, timeLimit: 60 },
      { id: 'ca2', actionId: 'order_bmp', label: 'Order BMP (Electrolytes, BUN/Cr)', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca3', actionId: 'order_abg', label: 'Order ABG/VBG', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca4', actionId: 'start_iv', label: 'Establish Large Bore IV Access', dimension: 'DRUG_IV', required: true },
      { id: 'ca5', actionId: 'iv_fluids', label: 'Start IV NS Bolus (1-2L)', dimension: 'DRUG_IV', required: true },
      { id: 'ca6', actionId: 'insulin_drip', label: 'Start Insulin Infusion', dimension: 'DRUG_IV', required: true },
      { id: 'ca7', actionId: 'replace_potassium', label: 'Potassium Replacement (if K < 5.3)', dimension: 'DRUG_IV', required: true },
      { id: 'ca8', actionId: 'identify_precipitant', label: 'Identify Precipitating Factor', dimension: 'ASSESSMENT', required: true }
    ]
  },

  // ===========================================
  // OVERDOSE/TOXICOLOGY SCENARIOS
  // ===========================================
  {
    scenarioId: 'TOX-OPIOID-001',
    title: 'Opioid Overdose',
    category: 'Other',
    difficulty: 'Intermediate',
    estimatedDuration: 15,
    description: 'A 32-year-old male found unresponsive by EMS, needle and drug paraphernalia nearby. Slow, shallow breathing.',
    objectives: [
      'Recognize opioid toxidrome',
      'Support airway and breathing',
      'Administer naloxone',
      'Monitor for re-sedation'
    ],
    tags: ['toxicology', 'overdose', 'opioid', 'naloxone', 'emergency'],
    patient: {
      firstName: 'Kevin',
      lastName: 'Brooks',
      age: 32,
      gender: 'Male',
      roomNumber: 'Resus 2',
      codeStatus: 'Full Code',
      allergies: ['Unknown'],
      chiefComplaint: 'Found unresponsive, suspected overdose',
      admissionDiagnosis: 'Opioid overdose',
      medicalHistory: ['Opioid use disorder', 'Hepatitis C', 'Previous overdoses x2'],
      currentMedications: ['Unknown']
    },
    initialVitals: {
      heartRate: 52,
      bloodPressure: { systolic: 88, diastolic: 50 },
      respiratoryRate: 6,
      oxygenSaturation: 78,
      temperature: 36.2,
      painLevel: 0
    },
    initialFindings: {
      neurological: {
        levelOfConsciousness: 'Unresponsive to pain',
        gcs: 3,
        pupils: 'Pinpoint (1mm) bilaterally, reactive'
      },
      respiratory: {
        breathSounds: {
          rightUpperLobe: 'Diminished',
          leftUpperLobe: 'Diminished'
        },
        breathingPattern: 'Shallow, agonal'
      },
      skin: {
        color: 'Cyanotic (lips, nail beds)',
        temperature: 'Cool'
      }
    },
    criticalActions: [
      { id: 'ca1', actionId: 'bag_mask', label: 'Initiate Bag-Mask Ventilation', dimension: 'INTERVENTION', required: true, timeLimit: 60 },
      { id: 'ca2', actionId: 'apply_o2', label: 'Apply High-Flow Oxygen', dimension: 'INTERVENTION', required: true },
      { id: 'ca3', actionId: 'admin_narcan', label: 'Administer Naloxone (Narcan)', dimension: 'DRUG_IV', required: true, timeLimit: 120 },
      { id: 'ca4', actionId: 'start_iv', label: 'Establish IV Access', dimension: 'DRUG_IV', required: true },
      { id: 'ca5', actionId: 'fingerstick_glucose', label: 'Check Blood Glucose', dimension: 'TESTS_DIAGNOSTICS', required: true },
      { id: 'ca6', actionId: 'continuous_monitoring', label: 'Place on Continuous Monitoring', dimension: 'ASSESSMENT', required: true }
    ],
    progressionMap: [
      {
        nodeId: 'A1',
        waitingFor: { type: 'ACTION', trigger: 'admin_narcan' },
        outcomes: [
          {
            triggerCondition: 'SUCCESS',
            nextStateId: 'B1',
            consequence: {
              vitalsChange: { heartRate: 30, respiratoryRate: 10, oxygenSaturation: 15 },
              findingsChange: { 'neurological.levelOfConsciousness': 'Awakening, agitated' }
            }
          }
        ]
      }
    ]
  }
];

export default additionalScenarios;
