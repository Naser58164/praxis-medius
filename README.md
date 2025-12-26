# Praxis Medius - Medical Simulation Platform

A comprehensive, real-time medical simulation platform for clinical training. Built with React, Node.js, Socket.IO, and IoT integration.

## 🏥 Overview

Praxis Medius bridges the gap between passive training manikins and dynamic, realistic clinical simulations. The platform enables:

- **Examiners** to create scenarios, control patient vitals and responses, and evaluate student performance
- **Examinees** (students) to interact with virtual patients, perform clinical actions, and receive real-time feedback
- **IoT Integration** for connecting physical manikins to the digital simulation
- **Docker Deployment** for easy production setup

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Praxis Medius Server                        │
│                     (Node.js + Express + Socket.IO)                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  SessionManager  │  ScenarioManager  │  Real-time Events    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ WebSocket (Socket.IO)
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Examiner App   │   │  Examinee App   │   │   IoT Gateway   │
│   (React Web)   │   │ (React Mobile)  │   │  (Raspberry Pi) │
│                 │   │                 │   │                 │
│ • Scenario Mgmt │   │ • Vitals View   │   │ • Sensor Input  │
│ • Vitals Ctrl   │   │ • Patient Chart │   │ • Actuator Ctrl │
│ • Findings Ctrl │   │ • Actions Menu  │   │ • Feedback Loop │
│ • Action Log    │   │ • Lab Results   │   │                 │
│ • Results View  │   │ • Communication │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

## 📦 Project Structure

```
praxis-medius/
├── praxis-medius-server/           # Backend server
│   ├── src/
│   │   ├── index.js                # Main server with Socket.IO
│   │   └── services/
│   │       ├── SessionManager.js   # Simulation session management
│   │       └── ScenarioManager.js  # Scenario CRUD & sample data
│   └── package.json
│
├── praxis-medius-examiner/         # Examiner web application
│   ├── src/
│   │   ├── App.jsx                 # Main app with navigation
│   │   ├── context/
│   │   │   └── SocketContext.jsx   # Real-time communication
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── ScenarioSelector.jsx
│   │   │   ├── SimulationDashboard.jsx
│   │   │   ├── VitalsControlPanel.jsx
│   │   │   ├── FindingsControlPanel.jsx
│   │   │   ├── PatientVoicePanel.jsx
│   │   │   ├── LabsOrdersPanel.jsx
│   │   │   ├── ActionLogPanel.jsx
│   │   │   ├── ScenarioBuilder.jsx
│   │   │   └── SessionResults.jsx
│   │   └── styles/
│   │       └── globals.css
│   └── package.json
│
└── praxis-medius-examinee/         # Examinee mobile/web application
    ├── src/
    │   ├── App.jsx                 # Main app with bottom nav
    │   ├── context/
    │   │   └── SocketContext.jsx   # Real-time communication
    │   ├── components/
    │   │   ├── JoinSession.jsx
    │   │   ├── VitalsMonitor.jsx
    │   │   ├── PatientChart.jsx
    │   │   ├── ActionMenu.jsx
    │   │   ├── LabResultsPanel.jsx
    │   │   ├── PatientCommunication.jsx
    │   │   └── ActionHistory.jsx
    │   └── styles/
    │       └── globals.css
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone and setup each package:**

```bash
# Server
cd praxis-medius-server
npm install

# Examiner App
cd ../praxis-medius-examiner
npm install

# Examinee App
cd ../praxis-medius-examinee
npm install
```

2. **Start the server:**
```bash
cd praxis-medius-server
npm start
# Server runs on http://localhost:3000
```

3. **Start the Examiner app:**
```bash
cd praxis-medius-examiner
npm run dev
# Opens on http://localhost:5173
```

4. **Start the Examinee app:**
```bash
cd praxis-medius-examinee
npm run dev
# Opens on http://localhost:5174
```

## 🎮 How to Use

### For Examiners (Instructors)

1. **Select a Scenario** from the pre-built library or create your own
2. **Share the Session Code** with students (displayed in the header)
3. **Control the Simulation:**
   - Adjust vital signs in real-time
   - Toggle physical findings (breath sounds, heart sounds, etc.)
   - Make the patient "speak" with different moods
   - Reveal lab results when students order them
4. **Monitor Student Actions** in the Action Log panel
5. **End Simulation** and review results with performance analytics

### For Examinees (Students)

1. **Enter Session Code** provided by your instructor
2. **Wait for Simulation** to start
3. **Monitor Vitals** on the real-time display
4. **Review Patient Chart** for history, allergies, medications
5. **Perform Clinical Actions:**
   - Safety checks (hand hygiene, patient verification)
   - Assessments (vitals, lung sounds, neuro exam)
   - Interventions (oxygen, IV access, CPR)
   - Medications (albuterol, epinephrine, fluids)
   - Order tests (labs, imaging, EKG)
6. **Track Your Progress** in the Action History

## 🔌 Socket.IO Events

### Client → Server
| Event | Emitter | Purpose |
|-------|---------|---------|
| `join_simulation` | All | Join a simulation room |
| `examiner_start_simulation` | Examiner | Start the simulation |
| `examiner_update_vitals` | Examiner | Change vital signs |
| `examiner_update_findings` | Examiner | Update physical findings |
| `examiner_reveal_labs` | Examiner | Reveal lab results |
| `examiner_patient_speak` | Examiner | Make patient talk |
| `examinee_action` | Examinee | Perform clinical action |
| `examinee_request_lab` | Examinee | Request lab results |

### Server → Client
| Event | Purpose |
|-------|---------|
| `simulation_started` | Simulation has begun |
| `vitals_update` | Vital signs changed |
| `findings_update` | Physical findings changed |
| `lab_results_revealed` | Lab results available |
| `patient_speak` | Patient says something |
| `action_performed` | Student performed an action |
| `simulation_ended` | Simulation completed |

## 📊 Scenario Structure

```json
{
  "scenarioId": "ASTHMA-SEV-001",
  "title": "Severe Asthma Exacerbation",
  "category": "Respiratory",
  "difficulty": "Intermediate",
  "patient": {
    "firstName": "Maria",
    "lastName": "Santos",
    "age": 39,
    "allergies": ["Penicillin"],
    "chiefComplaint": "I can't breathe!"
  },
  "initialVitals": {
    "heartRate": 112,
    "bloodPressure": { "systolic": 138, "diastolic": 88 },
    "respiratoryRate": 28,
    "oxygenSaturation": 91
  },
  "criticalActions": [
    { "id": "ca1", "actionId": "apply_o2", "label": "Apply Oxygen" },
    { "id": "ca2", "actionId": "admin_albuterol", "label": "Give Albuterol" }
  ],
  "progressionMap": [
    {
      "nodeId": "A1",
      "waitingFor": { "type": "ACTION", "trigger": "admin_albuterol" },
      "outcomes": [{
        "triggerCondition": "SUCCESS",
        "consequence": { "vitalsChange": { "oxygenSaturation": 4 } }
      }]
    }
  ]
}
```

## 📱 Clinical Action Categories

| Category | Color | Examples |
|----------|-------|----------|
| **Safety** | Orange | Hand hygiene, patient ID, PPE |
| **Communication** | Purple | Introduce self, SBAR, notify MD |
| **Assessment** | Blue | Vitals, auscultation, neuro exam |
| **Intervention** | Green | Oxygen, CPR, positioning |
| **Drugs & IV** | Pink | IV access, medications, fluids |
| **Tests & Diagnostics** | Cyan | Labs, imaging, EKG |

## 🎯 Sample Scenarios Included

1. **Severe Asthma Exacerbation** - Respiratory emergency
2. **Acute STEMI** - Cardiac emergency with cath lab activation
3. **Acute Ischemic Stroke** - Stroke recognition and tPA eligibility
4. **Sepsis (Pneumonia)** - Sepsis bundle implementation

## 🔧 Technology Stack

- **Frontend:** React 18, Vite, Lucide Icons
- **Backend:** Node.js, Express, Socket.IO
- **Styling:** CSS Variables, Mobile-first design
- **Real-time:** WebSocket (Socket.IO)

## 📄 License

MIT License - Built for educational purposes.

---

**Praxis Medius** - *Bridging theory and practice in medical education*
