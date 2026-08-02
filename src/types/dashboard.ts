export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 
  | 'idle'
  | 'detecting'
  | 'alert_sent'
  | 'awaiting_photo'
  | 'awaiting_otp'
  | 'confirmed'
  | 'en_route'
  | 'on_site'
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

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface Incident {
  id: string;
  title: string;
  address: string;
  location: LocationCoordinates;
  reportedAt: string; // HH:mm:ss
  timestamp: number;
  priority: IncidentPriority;
  status: IncidentStatus;
  reporter: string;
  photoUrl?: string;
  thermalPhotoUrl?: string;
  otpVerified: boolean;
  assignedStationId?: string | null;
  assignedDroneId?: string | null;
  assignedResponderIds: string[];
  notes: IncidentNote[];
  temperatureMax?: number; // e.g. 412
  windSpeed?: string; // e.g. "14.2 km/h NW"
  waitTimeSeconds: number;
  slaBreached: boolean;
}

export interface IncidentNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
}

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

export interface FireStation {
  id: string;
  name: string;
  address: string;
  location: LocationCoordinates;
  totalResponders: number;
  availableResponders: number;
  totalDrones: number;
  dockedDrones: number;
  avgResponseTimeSec: number;
  utilizationPercent: number;
}

export interface Assignment {
  id: string;
  incidentId: string;
  droneId?: string;
  responderIds: string[];
  assignedBy: string;
  assignedAt: string;
}

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

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'disabled';
  lastLogin: string;
  stationId?: string;
}

export interface SystemSettings {
  darkModeDefault: boolean;
  soundAlertsEnabled: boolean;
  slaThresholdMinutes: number;
  autoDispatchEnabled: boolean;
  refreshIntervalSec: number;
}
