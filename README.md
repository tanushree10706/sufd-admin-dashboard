# SUFD WildGuard: Autonomous UAV Fire Surveillance & Command Dashboard

An end-to-end intelligent wildfire early-detection and rapid dispatch ecosystem. The platform pairs real-time aerial computer vision (YOLO) on drone feeds with an interactive GIS command dashboard for forest protection squads and ranger divisions.

---

## Key Features

- **AI Aerial Surveillance:** Real-time object detection for early wildfire and smoke detection using fine-tuned YOLO models (`fire_n`, `fire_s`, `fire_m`, `fire_l`).
- **Telemetry & Off-Grid Edge Design:** Emulates on-device UAV edge processing transmitting compact JSON telemetry alerts (`< 200 bytes`) over long-range 900 MHz LoRa links.
- **Tadoba Sector Command Map:** Interactive GIS map centered over high-risk wildlife reserves (Tadoba Andhari Tiger Reserve / Western Ghats) with dynamic incident pins, UAV flight paths, and response base perimeters.
- **Automated Incident Logging:** Real-time synchronization of high-confidence fire detections to Supabase for automated dispatch queue updates.
- **Fleet & Response Management:** Active tracking of UAV telemetry (altitude, battery, link quality, coordinates) alongside station depots, tankers, and field personnel readiness.

---

## System Architecture

$$\text{Aerial Video Capture} \longrightarrow \underset{\text{(NVIDIA Jetson / YOLO)}}{\text{Edge AI Inference}} \longrightarrow \underset{\text{(900 MHz LoRa Telemetry)}}{\text{JSON Alert Packet}} \longrightarrow \underset{\text{(FastAPI + Supabase)}}{\text{Central API Gateway}} \longrightarrow \underset{\text{(React + Leaflet)}}{\text{Command Dashboard}}$$

---

## Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Dashboard** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet / GIS Maps |
| **Computer Vision Backend** | Python 3.10+, FastAPI, Ultralytics YOLOv8/v11, OpenCV, PyTorch |
| **Database & Realtime Sync** | Supabase (PostgreSQL, Realtime Subscriptions) |
| **Edge & UAV Telemetry (Design)** | MAVLink, 900 MHz RFD900x / LoRa, NVIDIA Jetson Linux |

---

## Project Structure

```text
sufd-admin-dashboard/
├── Eye-in-the-Sky/
│   └── backend/
│       ├── app.py                 # FastAPI ML inference & telemetry service
│       ├── fire-models/           # Fine-tuned wildfire YOLO weights (.pt)
│       └── general-models/        # General aerial object models
├── src/
│   ├── components/
│   │   ├── screens/
│   │   │   ├── DashboardOverviewScreen.tsx
│   │   │   ├── MLSurveillanceScreen.tsx
│   │   │   ├── DispatchQueueScreen.tsx
│   │   │   ├── StationsScreen.tsx
│   │   │   └── PersonnelScreen.tsx
│   │   └── MapComponent.tsx
│   ├── context/
│   │   └── CommandCenterContext.tsx
│   └── types/
└── package.json

Quick Start Guide
1. Prerequisites
Node.js: v18.x or later

Python: 3.10+

PyTorch & Ultralytics: For running local inference

2. Frontend Setup
Bash
# Install dependencies
npm install

# Start local development server
npm run dev
Dashboard will be available at http://localhost:5173.

3. Backend ML Service Setup
Bash
# Navigate to backend directory
cd Eye-in-the-Sky/backend

# Install Python requirements
pip install fastapi uvicorn ultralytics opencv-python-headless python-multipart

# Start the inference server
python app.py
FastAPI backend will run at http://localhost:8000.
