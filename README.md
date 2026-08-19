#  Aranyak — AI-Powered Wildfire Detection & Response System

**A full-stack Command & Control dashboard for real-time wildfire monitoring, drone surveillance, and coordinated forest fire response across Indian National Parks and Tiger Reserves.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Live-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6B35)](https://ultralytics.com/)

---

##  Overview

**Aranyak** (Sanskrit: *of the forest*) is an intelligent, drone-integrated wildfire detection and command center dashboard built specifically for Indian forest zones and tiger reserves. The system combines:

-  **Autonomous UAV surveillance** with 900 MHz LoRa telemetry
-  **Edge AI + YOLOv8 ML inference** for fire & smoke detection
-  **Real-time Leaflet map** with live incident & drone tracking
-  **Dispatch & response coordination** for forest ranger units
-  **Supabase** backend for live data sync across field operators

> **Pilot Deployment:** Tadoba Andhari Tiger Reserve, Maharashtra

---

##  Key Features

###  Wildfire Incident Management
- Real-time incident cards with **Critical / High / Medium / Low** priority badges
- Full incident lifecycle: `Detecting → Alert Sent → Field Verification → Confirmed → En Route → Containment → Resolved`
- Automated **SLA breach detection** with pulsing red alerts
- Detection source tracking: `citizen`, `forest_officer`, `ml_drone`
- Wildfire telemetry: spread rate (ha/hr), containment %, terrain type, weather risk index

###  Drone Fleet Surveillance
- 3 UAV profiles: **Garuda-X1** (Edge AI Hexacopter), **Garuda-V2** (VTOL Long Endurance), **Trishul Scout** (Thermal Recon)
- Live battery %, altitude (m), speed (km/h), and 900 MHz LoRa signal strength
- Payload: Sony 4K Optical, FLIR Thermal, Jetson Orin Nano on-board compute

###  Interactive Command Map
- Dark-mode Leaflet map centered on Tadoba Andhari Tiger Reserve
- Distinct pins for 🔥 Incidents, ✈️ Drones, ⛺ Response Bases
- Click-to-navigate from map marker to incident detail

###  ML Surveillance Pipeline (Eye-in-the-Sky)
- **FastAPI** backend serving **YOLOv8** fire/smoke detection models
- Model sizes: Nano → Small → Medium → Large
- Simulated GPS drone telemetry injected per inference call
- Confidence threshold filtering (≥ 0.40) before logging to Supabase
- Returns: `telemetry`, `counts`, `latency_ms`, `image_base64`

###  Response Base & Personnel Management
- 3 Tadoba-region bases: Chandrapur HQ, Moharli Outpost, Chimur Station
- Personnel: Chief Fire Warden, Drone Operators, Field Squad Leaders, Telemetry Specialists

---

##  Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Leaflet, Supabase JS |
| **Backend** | FastAPI, Python 3.11+, Ultralytics YOLOv8, Pillow |
| **Database** | Supabase (PostgreSQL + Realtime) |
| **Comms** | 900 MHz LoRa telemetry (simulated), REST API |

---

##  Getting Started

### Prerequisites
- Node.js 18+
- Pyhon 3.11+
- [Supabase](https://supabase.com) project *(optional — app runs on rich mock data without it)*

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/aranyak.git
cd aranyak
```

### 2. Frontend Dashboard
```bash
cd sufd-admin-dashboard
npm install
npm run dev
```
Open → http://localhost:5173

### 3. ML Backend
```bash
cd Eye-in-the-Sky/backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
API → http://localhost:8000

### 4. Supabase (Optional)
Create `sufd-admin-dashboard/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
> Without Supabase, the app runs entirely on Tadoba mock data — perfect for demos.

---

##  Project Structure

```
aranyak/
├── sufd-admin-dashboard/           # React Frontend
│   └── src/
│       ├── components/screens/     # All dashboard screens
│       ├── context/
│       │   └── CommandCenterContext.tsx  # Global state + mock data
│       ├── types/dashboard.ts      # TypeScript interfaces
│       └── lib/supabaseClient.ts   # DB connection
│
└── Eye-in-the-Sky/                 # Python ML Backend
    └── backend/
        ├── app.py                  # FastAPI + YOLO inference
        ├── fire-models/            # Trained YOLOv8 weights (.pt)
        └── requirements.txt
```

---

##  ML API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/models` | List available YOLO model sizes |
| `GET` | `/api/demos` | List demo images |
| `POST` | `/api/predict/image` | Run fire/smoke detection |

**Sample Response:**
```json
{
  "telemetry": {
    "drone_id": "DRONE-GARUDA-01",
    "lat": 20.2450, "lng": 79.3038,
    "altitude_m": 135,
    "timestamp": "2026-08-20T02:03:53+05:30"
  },
  "counts": { "fire": 2, "smoke": 1 },
  "confidence_max": 0.94,
  "latency_ms": 312
}
```

---

##  Demo Data — Tadoba Andhari Tiger Reserve

| Entity | Count | Details |
|--------|-------|---------|
| 🔥 Active Incidents | 3 | Canopy Fire (Critical), Grassland Smoldering (High), Smoke Anomaly (Medium) |
| 🛸 UAVs | 3 | Garuda-X1, Garuda-V2, Trishul Scout |
| 🏕️ Response Bases | 3 | Chandrapur HQ, Moharli Outpost, Chimur Station |
| 🧑‍🚒 Personnel | 4 | Warden, Drone Pilot, Field Ranger, Telemetry Specialist |

All coordinates are real GPS locations within the **Tadoba-Andhari buffer zone (Maharashtra, India)**.

---

##  Monitored Sectors

| Zone | Coordinates | Status |
|------|-------------|--------|
| Tadoba Core Zone — Moharli Range | 20.2450°N, 79.3038°E | 🔴 Active Fire |
| Kolara Buffer Sector 7 | 20.4120°N, 79.3510°E | 🟡 En Route |
| Kolsa Range Corridor | 20.1205°N, 79.4120°E | 🟠 Monitoring |
| Chandrapur Division HQ | 19.9615°N, 79.2961°E | 🟢 Base |



