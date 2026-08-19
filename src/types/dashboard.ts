// ============================================================
// Aranyak — Wildfire Detection & Response System
// Type Definitions
// ============================================================

/** Configurable surveillance threshold — single source of truth */
export const SURVEILLANCE_INTERVAL_DAYS = 14;
export const SURVEILLANCE_OVERDUE_DAYS = 21;

// ── Core Enums / Union Types ─────────────────────────────────

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'idle'
  | 'detecting'
  | 'alert_sent'
  | 'report_received'     // replaces: awaiting_photo — report/image has been received
  | 'field_verification'  // replaces: awaiting_otp  — ranger/officer verifying on ground
  | 'sensor_confirmation' // satellite/sensor cross-check
  | 'confirmed'
  | 'en_route'
  | 'on_site'
  | 'containment'         // active fire suppression in progress
  | 'monitoring'          // fire under control, being watched
  | 'resolved'
  | 'cancelled';

export type DroneStatus =
  | 'idle'
  | 'en_route'
  | 'on_site'
  | 'returning'
  | 'charging'
  | 'maintenance';

export type ResponderStatus = 'available' | 'assigned' | 'off_duty';

export type UserRole = 'operator' | 'admin' | 'station_staff';

/** Wildfire terrain categories */
export type TerrainType = 'forest' | 'shrubland' | 'grassland';

/** Weather-driven fire risk level */
export type WeatherRisk = 'low' | 'moderate' | 'extreme';

/**
 * Source through which a wildfire incident was first detected/reported.
 * Three valid sources:
 *   citizen       — member of public via app/phone/web
 *   forest_officer — ranger / forest officer on patrol
 *   ml_drone      — ML inference from drone camera feed (future integration)
 */
export type DetectionSource = 'citizen' | 'forest_officer' | 'ml_drone';

/** Forest zone surveillance health status */
export type SurveillanceStatus = 'up_to_date' | 'due' | 'overdue';

// ── Shared ───────────────────────────────────────────────────

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// ── Incident ─────────────────────────────────────────────────

export interface Incident {
  id: string;
  title: string;
  /** Human-readable terrain/location description (not an urban street address) */
  address: string;
  location: LocationCoordinates;
  reportedAt: string;    // HH:mm:ss
  timestamp: number;
  priority: IncidentPriority;
  status: IncidentStatus;
  reporter: string;
  photoUrl?: string;
  thermalPhotoUrl?: string;
  /** General verification flag (not OTP-specific); true = incident verified */
  otpVerified: boolean;
  assignedStationId?: string | null;
  assignedDroneId?: string | null;
  assignedResponderIds: string[];
  notes: IncidentNote[];
  temperatureMax?: number;   // °C measured by drone thermal sensor
  windSpeed?: string;        // e.g. "22.4 km/h NW"
  waitTimeSeconds: number;
  slaBreached: boolean;

  // ── Wildfire-specific ──────────────────────────────────────
  detectionSource: DetectionSource;
  terrainType?: TerrainType;
  weatherRisk?: WeatherRisk;
  /** Estimated fire spread rate in hectares/hour */
  spreadRateHa?: number;
  /** Percentage of fire perimeter under containment (0–100) */
  containmentPercent?: number;
  /** True if a satellite sensor corroborated this detection */
  satelliteDetected?: boolean;
  /**
   * ID of the SurveillanceRecord that produced this incident
   * (set only when detectionSource = 'ml_drone' during a patrol)
   */
  surveillanceRecordId?: string | null;
}

export interface IncidentNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
}

// ── Drone ────────────────────────────────────────────────────

export interface Drone {
  id: string;
  model: string;
  status: DroneStatus;
  batteryPercent: number;
  currentLocation: LocationCoordinates;
  stationId: string;
  assignedIncidentId?: string | null;
  flightTimeHours: number;
  totalIncidents: number;
  utilizationPercent: number;
  maintenanceReason?: string;
  altitudeMeters: number;
  speedKmh: number;
}

// ── Responder ────────────────────────────────────────────────

export interface Responder {
  id: string;
  name: string;
  rank: string;
  stationId: string;
  status: ResponderStatus;
  assignedIncidentId?: string | null;
  phone: string;
  badgeNumber: string;
}

// ── Fire Station → Response Base / Fire Camp ─────────────────
// Interface name kept as FireStation for component compatibility;
// semantically represents a wildfire Response Base or Fire Camp.

export interface FireStation {
  id: string;
  name: string;
  /** Terrain/sector description (not an urban street address) */
  address: string;
  location: LocationCoordinates;
  totalResponders: number;
  availableResponders: number;
  totalDrones: number;
  dockedDrones: number;
  avgResponseTimeSec: number;
  utilizationPercent: number;
}

// ── Assignment ───────────────────────────────────────────────

export interface Assignment {
  id: string;
  incidentId: string;
  droneId?: string;
  responderIds: string[];
  assignedBy: string;
  assignedAt: string;
}

// ── Audit Log ────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  incidentId: string;
  date: string;
  time: string;
  address: string;
  finalStatus: 'resolved' | 'cancelled';
  assignedDrone: string;
  assignedStation: string;
  assignedResponders: string[];
  responseTimeFormatted: string;
  operatorId: string;
  timeline: { time: string; action: string; details: string }[];
  postMissionNote?: string;
}

// ── User ─────────────────────────────────────────────────────

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'disabled';
  lastLogin: string;
  stationId?: string;
}

// ── System Settings ──────────────────────────────────────────

export interface SystemSettings {
  darkModeDefault: boolean;
  soundAlertsEnabled: boolean;
  slaThresholdMinutes: number;
  autoDispatchEnabled: boolean;
  refreshIntervalSec: number;
}

// ── Forest Surveillance ──────────────────────────────────────

/**
 * A monitored forest/terrain zone tracked for routine drone surveillance.
 * Tracks when it was last surveyed and whether a new survey is overdue.
 */
export interface ForestZone {
  id: string;
  name: string;
  terrainType: TerrainType;
  location: LocationCoordinates;
  /** ISO date string YYYY-MM-DD of the last completed surveillance, or null if never surveyed */
  lastSurveillanceDate: string | null;
  /** Computed: days elapsed since lastSurveillanceDate */
  daysSinceSurveillance: number;
  surveillanceStatus: SurveillanceStatus;
  /** Total area of the zone in hectares */
  areaHectares: number;
}

/**
 * A record of a single drone surveillance flight over a ForestZone.
 *
 * A SurveillanceRecord answers: "When was this zone surveyed?"
 * A wildfire Incident answers:  "What wildfire was detected?"
 *
 * If fire is detected during a routine patrol:
 *   1. The SurveillanceRecord.status is set to 'fire_detected'
 *   2. A new Incident is created (detectionSource = 'ml_drone')
 *   3. The Incident.surveillanceRecordId links back to this record
 *   4. This record's detectionIncidentId links to the created incident
 */
export interface SurveillanceRecord {
  id: string;
  zoneId: string;
  zoneName: string;
  droneId: string;
  operator: string;
  startedAt: string;          // ISO datetime string
  completedAt: string | null; // null if in_progress
  latitude: number;
  longitude: number;
  status: 'in_progress' | 'completed' | 'fire_detected';
  /** Populated if a wildfire incident was created from this surveillance session */
  detectionIncidentId?: string | null;
}

// ── Future ML Detection (structurally ready — not yet populated) ─

/**
 * A bounding box produced by the YOLOv8-Nano object detection model.
 * Coordinates are relative (0.0–1.0) to the detection image dimensions.
 * This interface is structurally defined for future ML integration.
 */
export interface BoundingBox {
  label: string;      // e.g. 'fire', 'smoke', 'person'
  confidence: number; // 0.0–1.0
  x: number;          // top-left x (relative)
  y: number;          // top-left y (relative)
  width: number;      // relative width
  height: number;     // relative height
}

/**
 * Result produced by the ML pipeline (MobileNetV2 + YOLOv8-Nano).
 * This type is structurally defined for future integration.
 * DO NOT populate with fabricated values — only use with real ML output.
 *
 * Pipeline:
 *   Drone Camera → MobileNetV2 (Fire/No-Fire) →
 *   if Fire → YOLOv8-Nano (Fire/Smoke/Person + Bounding Boxes) →
 *   Severity Analysis → Wildfire Incident
 */
export interface MLDetectionResult {
  id: string;
  droneId: string;
  surveillanceRecordId: string;
  /** e.g. 'MobileNetV2 + YOLOv8-Nano' */
  modelName: string;
  detectionTimestamp: string;
  latitude: number;
  longitude: number;
  /** Fire classification confidence from MobileNetV2 (0.0–1.0) */
  fireConfidence: number;
  /** Smoke detection confidence (0.0–1.0) */
  smokeConfidence: number;
  /** Object labels detected by YOLOv8-Nano, e.g. ['fire', 'smoke'] */
  detectedObjects: string[];
  boundingBoxes: BoundingBox[];
  detectionImageUrl?: string;
  severity: IncidentPriority;
  /** Set once a wildfire Incident is created from this detection */
  incidentId?: string | null;
}
