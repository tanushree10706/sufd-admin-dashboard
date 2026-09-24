import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Incident,
  Drone,
  Responder,
  FireStation,
  AuditLogEntry,
  UserAccount,
  UserRole,
  SystemSettings,
  ForestZone,
  SurveillanceRecord,
} from '../types/dashboard';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';


// ── Context Interface ────────────────────────────────────────

interface CommandCenterContextType {
  // Navigation State
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;

  // Role & Authentication State
  currentUser: UserAccount;
  setCurrentUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;

  // Data Collections
  incidents: Incident[];
  drones: Drone[];
  responders: Responder[];
  stations: FireStation[];
  auditLogs: AuditLogEntry[];
  users: UserAccount[];
  settings: SystemSettings;

  // Surveillance Data
  forestZones: ForestZone[];
  surveillanceRecords: SurveillanceRecord[];

  // Realtime & Telemetry State
  isSimulating: boolean;
  toggleSimulation: () => void;
  soundAlerts: boolean;
  toggleSoundAlerts: () => void;
  unreadAlertCount: number;
  clearAlerts: () => void;

  // Operations / Actions
  assignDroneToIncident: (incidentId: string, droneId: string) => void;
  assignRespondersToIncident: (incidentId: string, responderIds: string[]) => void;
  assignNearestDrone: (incidentId: string) => void;
  updateIncidentStatus: (incidentId: string, status: Incident['status']) => void;
  updateIncidentPriority: (incidentId: string, priority: Incident['priority']) => void;
  addIncidentNote: (incidentId: string, text: string) => void;
  updateDroneStatus: (droneId: string, status: Drone['status']) => void;
  updateResponderStatus: (responderId: string, status: Responder['status']) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateUserStatus: (userId: string, status: 'active' | 'disabled') => void;
  addUser: (name: string, email: string, role: UserRole) => void;
  exportAuditLogsCSV: () => void;
}

// ── Default User ─────────────────────────────────────────────

const defaultUser: UserAccount = {
  id: 'usr-01',
  name: 'Cmdr. Reyes',
  email: 'reyes@aranyak.ops',
  role: 'admin',
  status: 'active',
  lastLogin: '2026-08-19 08:45:00',
};

// ── Response Bases / Fire Camps ──────────────────────────────
// Northern California Sierra Nevada / Shasta region coordinates

const initialStations: FireStation[] = [
  {
    id: 'BASE-TAD-01',
    name: 'Chandrapur Central Forest Fire HQ',
    address: 'Chandrapur City Division',
    location: { latitude: 19.9615, longitude: 79.2961 },
    totalResponders: 36,
    availableResponders: 28,
    totalDrones: 8,
    dockedDrones: 6,
    avgResponseTimeSec: 210,
    utilizationPercent: 88,
  },
  {
    id: 'BASE-TAD-02',
    name: 'Moharli Rapid Response Outpost',
    address: 'Moharli Gate, Tadoba',
    location: { latitude: 20.2520, longitude: 79.3100 },
    totalResponders: 18,
    availableResponders: 14,
    totalDrones: 4,
    dockedDrones: 3,
    avgResponseTimeSec: 265,
    utilizationPercent: 72,
  },
  {
    id: 'BASE-TAD-03',
    name: 'Chimur Forest Support Station',
    address: 'North Tadoba Corridor, Chimur',
    location: { latitude: 20.4850, longitude: 79.3620 },
    totalResponders: 14,
    availableResponders: 11,
    totalDrones: 3,
    dockedDrones: 3,
    avgResponseTimeSec: 180,
    utilizationPercent: 95,
  }
];

// ── Wildfire Incidents ───────────────────────────────────────

const initialIncidents: Incident[] = [
  {
    id: 'INC-TAD-001',
    title: 'Canopy Fire - Tadoba Core Zone (Moharli Range)',
    address: 'Moharli Sector 3, Tadoba Reserve',
    location: { latitude: 20.2450, longitude: 79.3038 },
    reportedAt: '14:22:05',
    timestamp: Date.now() - 520000,
    priority: 'critical',
    status: 'detecting',
    reporter: 'DRONE-GARUDA-01',
    photoUrl: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=600&q=80',
    thermalPhotoUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80',
    otpVerified: true,
    assignedStationId: 'BASE-TAD-02',
    assignedDroneId: 'DRONE-GARUDA-01',
    assignedResponderIds: ['resp-01', 'resp-03'],
    temperatureMax: 618,
    windSpeed: '22 km/h NE',
    notes: [],
    waitTimeSeconds: 522,
    slaBreached: true,
    detectionSource: 'ml_drone',
    terrainType: 'forest',
    weatherRisk: 'extreme',
    spreadRateHa: 11.5,
    containmentPercent: 8,
    satelliteDetected: true,
  },
  {
    id: 'INC-TAD-002',
    title: 'Dry Grassland Smoldering - Buffer Zone (Kolara Gate)',
    address: 'Kolara Buffer Sector 7',
    location: { latitude: 20.4120, longitude: 79.3510 },
    reportedAt: '14:18:12',
    timestamp: Date.now() - 315000,
    priority: 'high',
    status: 'en_route',
    reporter: 'DRONE-GARUDA-02',
    photoUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=600&q=80',
    thermalPhotoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    otpVerified: true,
    assignedStationId: 'BASE-TAD-01',
    assignedDroneId: 'DRONE-GARUDA-02',
    assignedResponderIds: [],
    temperatureMax: 280,
    windSpeed: '14 km/h E',
    notes: [],
    waitTimeSeconds: 315,
    slaBreached: false,
    detectionSource: 'ml_drone',
    terrainType: 'grassland',
    weatherRisk: 'moderate',
    spreadRateHa: 4.8,
    containmentPercent: 0,
    satelliteDetected: false,
  },
  {
    id: 'INC-TAD-003',
    title: 'Smoke Anomaly Detected - Kolsa Range Corridor',
    address: 'Kolsa Southern Dense Forest',
    location: { latitude: 20.1205, longitude: 79.4120 },
    reportedAt: '14:05:44',
    timestamp: Date.now() - 600000,
    priority: 'medium',
    status: 'monitoring',
    reporter: 'DRONE-TRISHUL-01',
    otpVerified: false,
    assignedStationId: 'BASE-TAD-01',
    assignedDroneId: 'DRONE-TRISHUL-01',
    assignedResponderIds: [],
    temperatureMax: 195,
    windSpeed: '9 km/h N',
    notes: [],
    waitTimeSeconds: 600,
    slaBreached: false,
    detectionSource: 'ml_drone',
    terrainType: 'forest',
    weatherRisk: 'moderate',
    spreadRateHa: 1.7,
    containmentPercent: 0,
    satelliteDetected: false,
  }
];

// ── Drone Fleet ──────────────────────────────────────────────

const initialDrones: Drone[] = [
  {
    id: 'DRONE-GARUDA-01',
    model: 'Garuda-X1 (Edge AI Hexacopter)',
    status: 'on_site',
    batteryPercent: 86,
    currentLocation: { latitude: 20.2450, longitude: 79.3038 },
    stationId: 'BASE-TAD-02',
    assignedIncidentId: 'INC-TAD-001',
    flightTimeHours: 142.5,
    totalIncidents: 48,
    utilizationPercent: 92,
    altitudeMeters: 135,
    speedKmh: 38,
  },
  {
    id: 'DRONE-GARUDA-02',
    model: 'Garuda-V2 (VTOL Long Endurance)',
    status: 'en_route',
    batteryPercent: 64,
    currentLocation: { latitude: 20.4120, longitude: 79.3510 },
    stationId: 'BASE-TAD-01',
    assignedIncidentId: 'INC-TAD-002',
    flightTimeHours: 98.2,
    totalIncidents: 31,
    utilizationPercent: 78,
    altitudeMeters: 150,
    speedKmh: 0,
  },
  {
    id: 'DRONE-TRISHUL-01',
    model: 'Trishul Scout (Thermal Recon)',
    status: 'returning',
    batteryPercent: 32,
    currentLocation: { latitude: 20.1205, longitude: 79.4120 },
    stationId: 'BASE-TAD-01',
    assignedIncidentId: 'INC-TAD-003',
    flightTimeHours: 210.0,
    totalIncidents: 74,
    utilizationPercent: 95,
    altitudeMeters: 110,
    speedKmh: 45,
  }
];

// ── Responders / Field Crews ──────────────────────────────────

const initialResponders: Responder[] = [
  {
    id: 'resp-01',
    name: 'Officer Rajesh Shinde',
    rank: 'Chief Fire Warden',
    stationId: 'BASE-TAD-01',
    status: 'assigned',
    assignedIncidentId: 'INC-TAD-001',
    phone: '+91 98765 11111',
    badgeNumber: 'WG-1042',
  },
  {
    id: 'resp-02',
    name: 'Pilot Priya Deshmukh',
    rank: 'Lead Drone Operator',
    stationId: 'BASE-TAD-02',
    status: 'assigned',
    assignedIncidentId: 'INC-TAD-002',
    phone: '+91 98765 22222',
    badgeNumber: 'WG-2094',
  },
  {
    id: 'resp-03',
    name: 'Ranger Amit Verma',
    rank: 'Field Squad Leader',
    stationId: 'BASE-TAD-02',
    status: 'assigned',
    assignedIncidentId: 'INC-TAD-001',
    phone: '+91 98765 33333',
    badgeNumber: 'WG-1102',
  },
  {
    id: 'resp-04',
    name: 'Operator Sneha Patil',
    rank: 'Telemetry Specialist',
    stationId: 'BASE-TAD-01',
    status: 'available',
    phone: '+91 98765 44444',
    badgeNumber: 'WG-3301',
  }
];

// ── Audit Logs ───────────────────────────────────────────────

const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud-wf-001',
    incidentId: 'INC-IND-999',
    date: 'Aug 15, 2026',
    time: '11:34:10',
    address: 'Gir National Park, Core Zone',
    finalStatus: 'resolved',
    assignedDrone: 'DRONE-GARUDA-01 (Thermal Scout MkII)',
    assignedStation: 'Gir Command Station',
    assignedResponders: ['IC. Rajesh Kumar', 'Lead Priya Sharma'],
    responseTimeFormatted: '06:18',
    operatorId: 'Ops. Karev',
    postMissionNote: 'Ground crew confirmed full perimeter containment. Drone thermal confirmed no residual hotspots. Sector cleared.',
    timeline: [
      {
        time: '11:34:10',
        action: 'Incident Reported',
        details: 'Forest Officer patrol detected smoke column. Incident INC-IND-999 created.',
      },
      {
        time: '11:35:22',
        action: 'Drone Dispatched',
        details: 'DRONE-GARUDA-01 launched from Gir Command Station.',
      },
      {
        time: '11:38:45',
        action: 'On-Site Confirmed',
        details: 'Drone thermal feed streaming. Ground crew en route.',
      },
      {
        time: '11:52:28',
        action: 'Incident Resolved',
        details: 'Fire fully contained. All units cleared.',
      },
    ],
  },
  {
    id: 'aud-wf-002',
    incidentId: 'INC-IND-888',
    date: 'Aug 12, 2026',
    time: '09:11:44',
    address: 'Silent Valley National Park',
    finalStatus: 'cancelled',
    assignedDrone: 'DRONE-GARUDA-03 (Quad-VTOL)',
    assignedStation: 'Silent Valley Outpost',
    assignedResponders: ['Observer D. Patel'],
    responseTimeFormatted: '02:05',
    operatorId: 'Ops. Karev',
    postMissionNote: 'Citizen report of smoke was local village burning dry leaves outside the park boundary. False alarm.',
    timeline: [
      {
        time: '09:11:44',
        action: 'Citizen Report Received',
        details: 'Smoke observed from Silent Valley Trail. Citizen report logged.',
      },
      {
        time: '09:12:30',
        action: 'Drone En Route',
        details: 'DRONE-GARUDA-03 dispatched from Outpost.',
      },
      {
        time: '09:13:49',
        action: 'Incident Cancelled',
        details: 'Drone visual confirmed non-fire source. Incident cancelled.',
      },
    ],
  },
  {
    id: 'aud-wf-003',
    incidentId: 'INC-IND-777',
    date: 'Aug 08, 2026',
    time: '16:55:00',
    address: 'Kaziranga National Park, Range 4',
    finalStatus: 'resolved',
    assignedDrone: 'DRONE-TRISHUL-01 (Long-Endurance UAV)',
    assignedStation: 'Kaziranga HQ',
    assignedResponders: ['Lead Priya Sharma', 'Crew Vikram Rathore'],
    responseTimeFormatted: '08:42',
    operatorId: 'Cmdr. Reyes',
    postMissionNote: 'Containment achieved before fire reached rhino grazing zone. Post-mission sweep confirmed 0 hotspots.',
    timeline: [
      {
        time: '16:55:00',
        action: 'Alert Triggered',
        details: 'Ranger Sanjay Gupta reported ground fire near Range 4 junction.',
      },
      {
        time: '16:56:15',
        action: 'Units Dispatched',
        details: 'DRONE-TRISHUL-01 and Hotshot crew mobilised from HQ.',
      },
      {
        time: '17:03:42',
        action: 'Resolved',
        details: 'Full containment achieved. Rhino grazing zone protected.',
      },
    ],
  },
];

// ── Users ────────────────────────────────────────────────────

const initialUsers: UserAccount[] = [
  defaultUser,
  {
    id: 'usr-02',
    name: 'Ops. Karev',
    email: 'karev@aranyak.ops',
    role: 'operator',
    status: 'active',
    lastLogin: '2026-08-19 07:30:00',
  },
  {
    id: 'usr-03',
    name: 'Ranger Sanjay',
    email: 's.gupta@forestops.demo',
    role: 'station_staff',
    status: 'active',
    lastLogin: '2026-08-18 14:22:00',
    stationId: 'BASE-MH-01',
  },
];

// ── System Settings ──────────────────────────────────────────

const defaultSettings: SystemSettings = {
  darkModeDefault: true,
  soundAlertsEnabled: true,
  slaThresholdMinutes: 5,
  autoDispatchEnabled: false,
  refreshIntervalSec: 3,
};

// ── Forest Zones ─────────────────────────────────────────────
// daysSinceSurveillance is computed from lastSurveillanceDate at load time.
// Hardcoded here for demo; in production these would be computed server-side.

const initialForestZones: ForestZone[] = [
  {
    id: 'fz-01',
    name: 'Western Ghats Reserve',
    terrainType: 'forest',
    location: { latitude: 19.0330, longitude: 73.0297 },
    lastSurveillanceDate: '2026-08-01',
    daysSinceSurveillance: 18,
    surveillanceStatus: 'overdue',
    areaHectares: 4800,
  },
  {
    id: 'fz-02',
    name: 'Tadoba Andhari Tiger Reserve',
    terrainType: 'forest',
    location: { latitude: 20.2450, longitude: 79.3038 },
    lastSurveillanceDate: '2026-08-07',
    daysSinceSurveillance: 12,
    surveillanceStatus: 'up_to_date',
    areaHectares: 3200,
  },
  {
    id: 'fz-03',
    name: 'Bandipur Tiger Reserve',
    terrainType: 'forest',
    location: { latitude: 11.6664, longitude: 76.6291 },
    lastSurveillanceDate: '2026-08-05',
    daysSinceSurveillance: 14,
    surveillanceStatus: 'due',
    areaHectares: 2100,
  },
  {
    id: 'fz-04',
    name: 'Jim Corbett National Park',
    terrainType: 'forest',
    location: { latitude: 29.5300, longitude: 78.7747 },
    lastSurveillanceDate: '2026-08-13',
    daysSinceSurveillance: 6,
    surveillanceStatus: 'up_to_date',
    areaHectares: 5600,
  },
  {
    id: 'fz-05',
    name: 'Sundarbans Biosphere',
    terrainType: 'forest',
    location: { latitude: 21.9497, longitude: 89.1833 },
    lastSurveillanceDate: '2026-07-29',
    daysSinceSurveillance: 21,
    surveillanceStatus: 'overdue',
    areaHectares: 1800,
  },
];

// ── Surveillance Records ──────────────────────────────────────

const initialSurveillanceRecords: SurveillanceRecord[] = [
  {
    id: 'sr-001',
    zoneId: 'fz-02',
    zoneName: 'Tadoba Andhari Tiger Reserve',
    droneId: 'DRONE-GARUDA-03',
    operator: 'Ops. Karev',
    startedAt: '2026-08-07T09:15:00',
    completedAt: '2026-08-07T10:42:00',
    latitude: 20.2450,
    longitude: 79.3038,
    status: 'completed',
    detectionIncidentId: null,
  },
  {
    id: 'sr-002',
    zoneId: 'fz-03',
    zoneName: 'Bandipur Tiger Reserve',
    droneId: 'DRONE-PAWAN-02',
    operator: 'Op. Amit Singh',
    startedAt: '2026-08-05T07:00:00',
    completedAt: '2026-08-05T08:18:00',
    latitude: 11.6664,
    longitude: 76.6291,
    status: 'completed',
    detectionIncidentId: null,
  },
  {
    id: 'sr-003',
    zoneId: 'fz-04',
    zoneName: 'Jim Corbett National Park',
    droneId: 'DRONE-TRISHUL-01',
    operator: 'Ops. Karev',
    startedAt: '2026-08-13T06:30:00',
    completedAt: '2026-08-13T08:05:00',
    latitude: 29.5300,
    longitude: 78.7747,
    status: 'completed',
    detectionIncidentId: null,
  },
  {
    id: 'sr-004',
    zoneId: 'fz-01',
    zoneName: 'Western Ghats Reserve',
    droneId: 'DRONE-GARUDA-01',
    operator: 'Ops. Karev',
    startedAt: '2026-08-01T05:45:00',
    completedAt: '2026-08-01T07:20:00',
    latitude: 19.0330,
    longitude: 73.0297,
    status: 'fire_detected',
    detectionIncidentId: 'INC-IND-101',
  },
  {
    id: 'sr-005',
    zoneId: 'fz-05',
    zoneName: 'Sundarbans Biosphere',
    droneId: 'DRONE-PAWAN-04',
    operator: 'Ops. Karev',
    startedAt: '2026-07-29T08:00:00',
    completedAt: '2026-07-29T09:30:00',
    latitude: 21.9497,
    longitude: 89.1833,
    status: 'completed',
    detectionIncidentId: null,
  },
];

// ── Context & Provider ────────────────────────────────────────

const CommandCenterContext = createContext<CommandCenterContextType | undefined>(undefined);

export const CommandCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<string>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('INC-TAD-001');
  const [currentUser, setCurrentUser] = useState<UserAccount>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [drones, setDrones] = useState<Drone[]>(initialDrones);
  const [responders, setResponders] = useState<Responder[]>(initialResponders);
  const [stations, setStations] = useState<FireStation[]>(initialStations);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  const [forestZones] = useState<ForestZone[]>(initialForestZones);
  const [surveillanceRecords] = useState<SurveillanceRecord[]>(initialSurveillanceRecords);

  const [isSimulating, setIsSimulating] = useState<boolean>(!isSupabaseConfigured);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(3);

  // ── Supabase Integration ────────────────────────────────────
  useEffect(() => {
    const sb = supabase;
    if (!isSupabaseConfigured || !sb) return;

    const fetchData = async () => {
      try {
        const [incRes, dronesRes, stationsRes, respRes] = await Promise.all([
          sb.from('incidents').select('*'),
          sb.from('fleet_units').select('*'),
          sb.from('fire_stations').select('*'),
          sb.from('responders').select('*')
        ]);

        if (incRes.data && incRes.data.length > 0) {
          setIncidents(() => {
            const existingIds = new Set(initialIncidents.map(i => i.id));
            const newIncidents = incRes.data.filter((row: any) => !existingIds.has(row.id)).map((row: any) => ({
              id: row.id,
              title: row.title || 'Unknown Incident',
              address: row.address || '',
              location: { latitude: row.lat, longitude: row.lng },
              reportedAt: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              timestamp: new Date(row.created_at).getTime(),
              priority: row.priority || 'medium',
              status: row.status || 'idle',
              reporter: 'System',
              photoUrl: row.photo_url,
              thermalPhotoUrl: row.thermal_photo_url,
              otpVerified: true,
              assignedStationId: row.assigned_station_id,
              assignedDroneId: row.assigned_drone_id,
              assignedResponderIds: [],
              notes: [],
              temperatureMax: row.temperature_max,
              windSpeed: row.wind_speed,
              waitTimeSeconds: row.wait_time_seconds || 0,
              slaBreached: row.sla_breached || false,
              detectionSource: 'ml_drone' as const
            }));
            return [...initialIncidents, ...newIncidents];
          });
        }

        if (dronesRes.data && dronesRes.data.length > 0) {
          setDrones(() => {
            const existingIds = new Set(initialDrones.map(d => d.id));
            const newDrones = dronesRes.data.filter((row: any) => !existingIds.has(row.display_id || row.id)).map((row: any) => ({
              id: row.display_id || row.id,
              model: row.model || 'Drone',
              status: row.status || 'idle',
              batteryPercent: row.battery_pct || 100,
              currentLocation: { latitude: row.lat || 0, longitude: row.lng || 0 },
              stationId: row.station_id || '',
              assignedIncidentId: row.assigned_incident_id,
              flightTimeHours: row.flight_time_hours || 0,
              totalIncidents: row.total_incidents || 0,
              utilizationPercent: 0,
              altitudeMeters: row.altitude_meters || 0,
              speedKmh: row.speed_kmh || 0
            }));
            return [...initialDrones, ...newDrones];
          });
        }

        if (stationsRes.data && stationsRes.data.length > 0) {
          setStations(() => {
            const existingIds = new Set(initialStations.map(s => s.id));
            const newStations = stationsRes.data.filter((row: any) => !existingIds.has(row.id)).map((row: any) => ({
              id: row.id,
              name: row.name,
              address: row.address || '',
              location: { latitude: row.lat || 0, longitude: row.lng || 0 },
              totalResponders: row.total_responders || 0,
              availableResponders: row.available_responders || 0,
              totalDrones: row.total_drones || 0,
              dockedDrones: row.docked_drones || 0,
              avgResponseTimeSec: row.avg_response_time_sec || 0,
              utilizationPercent: row.utilization_percent || 0
            }));
            return [...initialStations, ...newStations];
          });
        }

        if (respRes.data && respRes.data.length > 0) {
          setResponders(() => {
            const existingIds = new Set(initialResponders.map(r => r.id));
            const newResponders = respRes.data.filter((row: any) => !existingIds.has(row.id)).map((row: any) => ({
              id: row.id,
              name: row.name,
              rank: row.rank || 'Responder',
              stationId: row.station_id,
              status: row.status || 'available',
              assignedIncidentId: row.assigned_incident_id,
              phone: row.phone || '',
              badgeNumber: row.badge_number || ''
            }));
            return [...initialResponders, ...newResponders];
          });
        }
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
      }
    };

    fetchData();

    // Realtime Subscriptions
    const incidentSub = sb.channel('incidents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchData(); // Simplest approach: refetch to maintain relationships/notes easily
      })
      .subscribe();

    const droneSub = sb.channel('drones-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fleet_units' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      sb.removeChannel(incidentSub);
      sb.removeChannel(droneSub);
    };
  }, []);


  // ── Simulation Engine ──────────────────────────────────────
  // Simulates: drone battery, drone GPS jitter, incident wait timers, SLA flags,
  // and wildfire spread metrics (containment fluctuation).
  // IMPORTANT: Does NOT simulate ML predictions, YOLO bounding boxes,
  // AI confidence values, or any fake detection events.

  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.status === 'resolved' || inc.status === 'cancelled') return inc;

          const newWait = inc.waitTimeSeconds + 1;
          const slaBreached = newWait > settings.slaThresholdMinutes * 60;

          let newTemp = inc.temperatureMax;
          if (newTemp) {
            newTemp += Math.floor(Math.random() * 3) - 1;
          }

          // Slowly increment containment for on_site incidents (simulation only)
          let newContainment = inc.containmentPercent ?? 0;
          if (inc.status === 'on_site' || inc.status === 'containment') {
            newContainment = Math.min(100, newContainment + 0.01);
          }

          return {
            ...inc,
            waitTimeSeconds: newWait,
            slaBreached,
            temperatureMax: newTemp,
            containmentPercent: parseFloat(newContainment.toFixed(1)),
          };
        })
      );

      setDrones((prev) =>
        prev.map((drone) => {
          if (drone.status === 'en_route' || drone.status === 'on_site') {
            const newBatt = Math.max(5, drone.batteryPercent - 0.05);
            const latJitter = (Math.random() - 0.5) * 0.0004;
            const lngJitter = (Math.random() - 0.5) * 0.0004;
            return {
              ...drone,
              batteryPercent: Math.round(newBatt),
              currentLocation: {
                latitude: drone.currentLocation.latitude + latJitter,
                longitude: drone.currentLocation.longitude + lngJitter,
              },
            };
          }
          if (drone.status === 'charging') {
            const newBatt = Math.min(100, drone.batteryPercent + 0.5);
            return {
              ...drone,
              batteryPercent: Math.round(newBatt),
              status: newBatt >= 100 ? 'idle' : 'charging',
            };
          }
          return drone;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [isSimulating, settings.slaThresholdMinutes]);

  // ── Auth ────────────────────────────────────────────────────

  const login = (user: string, _pass: string) => {
    setIsAuthenticated(true);
    const foundUser = users.find((u) => u.email.toLowerCase() === user.toLowerCase()) || defaultUser;
    setCurrentUser(foundUser);
    return true;
  };

  const logout = () => setIsAuthenticated(false);

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  // ── Simulation Controls ─────────────────────────────────────

  const toggleSimulation = () => setIsSimulating(!isSimulating);
  const toggleSoundAlerts = () => setSoundAlerts(!soundAlerts);
  const clearAlerts = () => setUnreadAlertCount(0);

  // ── Dispatch / Assignment ───────────────────────────────────

  const assignDroneToIncident = (incidentId: string, droneId: string) => {
    const drone = drones.find((d) => d.id === droneId);
    if (!drone) return;

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              assignedDroneId: droneId,
              status: 'en_route',
              notes: [
                ...inc.notes,
                {
                  id: `n-${Date.now()}`,
                  author: currentUser.name,
                  role: currentUser.role,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  text: `Drone ${drone.id} (${drone.model}) assigned and dispatched to incident coordinates.`,
                },
              ],
            }
          : inc
      )
    );

    setDrones((prev) =>
      prev.map((d) =>
        d.id === droneId ? { ...d, status: 'en_route', assignedIncidentId: incidentId } : d
      )
    );
  };

  const assignRespondersToIncident = (incidentId: string, responderIds: string[]) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              assignedResponderIds: Array.from(
                new Set([...inc.assignedResponderIds, ...responderIds])
              ),
            }
          : inc
      )
    );

    setResponders((prev) =>
      prev.map((resp) =>
        responderIds.includes(resp.id)
          ? { ...resp, status: 'assigned', assignedIncidentId: incidentId }
          : resp
      )
    );
  };

  const assignNearestDrone = (incidentId: string) => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident) return;

    const idleDrones = drones.filter((d) => d.status === 'idle' && d.batteryPercent > 20);
    if (idleDrones.length === 0) return;

    const nearest = idleDrones.reduce((closest, current) => {
      const distCurrent = Math.hypot(
        current.currentLocation.latitude - incident.location.latitude,
        current.currentLocation.longitude - incident.location.longitude
      );
      const distClosest = Math.hypot(
        closest.currentLocation.latitude - incident.location.latitude,
        closest.currentLocation.longitude - incident.location.longitude
      );
      return distCurrent < distClosest ? current : closest;
    }, idleDrones[0]);

    assignDroneToIncident(incidentId, nearest.id);
  };

  // ── Incident Lifecycle ──────────────────────────────────────

  const updateIncidentStatus = (incidentId: string, status: Incident['status']) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;

        const updated = {
          ...inc,
          status,
          notes: [
            ...inc.notes,
            {
              id: `n-${Date.now()}`,
              author: currentUser.name,
              role: currentUser.role,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: `Status updated to ${status.toUpperCase().replace(/_/g, ' ')}.`,
            },
          ],
        };

        if (status === 'resolved' || status === 'cancelled') {
          const auditEntry: AuditLogEntry = {
            id: `aud-${Date.now()}`,
            incidentId: inc.id,
            date: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            time: new Date().toLocaleTimeString(),
            address: inc.address,
            finalStatus: status as 'resolved' | 'cancelled',
            assignedDrone: inc.assignedDroneId || 'None',
            assignedStation: stations.find((s) => s.id === inc.assignedStationId)?.name || 'Unassigned',
            assignedResponders: inc.assignedResponderIds.map((rId) => {
              const r = responders.find((resp) => resp.id === rId);
              return r ? r.name : rId;
            }),
            responseTimeFormatted: `${Math.floor(inc.waitTimeSeconds / 60)}:${(
              inc.waitTimeSeconds % 60
            )
              .toString()
              .padStart(2, '0')}`,
            operatorId: currentUser.name,
            postMissionNote: `Wildfire incident ${inc.id} concluded as ${status.toUpperCase()}. All units cleared.`,
            timeline: inc.notes.map((n) => ({
              time: n.timestamp,
              action: `${n.author} (${n.role})`,
              details: n.text,
            })),
          };
          setAuditLogs((prevLogs) => [auditEntry, ...prevLogs]);
        }

        return updated;
      })
    );
  };

  const updateIncidentPriority = (incidentId: string, priority: Incident['priority']) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, priority } : inc))
    );
  };

  const addIncidentNote = (incidentId: string, text: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              notes: [
                ...inc.notes,
                {
                  id: `n-${Date.now()}`,
                  author: currentUser.name,
                  role: currentUser.role,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  text,
                },
              ],
            }
          : inc
      )
    );
  };

  // ── Unit Controls ───────────────────────────────────────────

  const updateDroneStatus = (droneId: string, status: Drone['status']) => {
    setDrones((prev) => prev.map((d) => (d.id === droneId ? { ...d, status } : d)));
  };

  const updateResponderStatus = (responderId: string, status: Responder['status']) => {
    setResponders((prev) =>
      prev.map((r) => (r.id === responderId ? { ...r, status } : r))
    );
  };

  // ── Settings & User Management ──────────────────────────────

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  const updateUserStatus = (userId: string, status: 'active' | 'disabled') => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
  };

  const addUser = (name: string, email: string, role: UserRole) => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      status: 'active',
      lastLogin: 'Never',
    };
    setUsers((prev) => [...prev, newUser]);
  };

  // ── CSV Export ──────────────────────────────────────────────

  const exportAuditLogsCSV = () => {
    const headers = [
      'Incident ID',
      'Date',
      'Time',
      'Location',
      'Final Status',
      'Assigned Drone',
      'Response Base',
      'Response Time',
      'Operator',
    ];
    const rows = auditLogs.map((log) => [
      log.incidentId,
      log.date,
      log.time,
      `"${log.address}"`,
      log.finalStatus.toUpperCase(),
      log.assignedDrone,
      log.assignedStation,
      log.responseTimeFormatted,
      log.operatorId,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Aranyak_Wildfire_Incident_Report_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Provider Value ──────────────────────────────────────────

  return (
    <CommandCenterContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        selectedIncidentId,
        setSelectedIncidentId,
        currentUser,
        setCurrentUserRole,
        isAuthenticated,
        login,
        logout,
        incidents,
        drones,
        responders,
        stations,
        auditLogs,
        users,
        settings,
        forestZones,
        surveillanceRecords,
        isSimulating,
        toggleSimulation,
        soundAlerts,
        toggleSoundAlerts,
        unreadAlertCount,
        clearAlerts,
        assignDroneToIncident,
        assignRespondersToIncident,
        assignNearestDrone,
        updateIncidentStatus,
        updateIncidentPriority,
        addIncidentNote,
        updateDroneStatus,
        updateResponderStatus,
        updateSettings,
        updateUserRole,
        updateUserStatus,
        addUser,
        exportAuditLogsCSV,
      }}
    >
      {children}
    </CommandCenterContext.Provider>
  );
};

export const useCommandCenter = () => {
  const context = useContext(CommandCenterContext);
  if (!context) {
    throw new Error('useCommandCenter must be used within a CommandCenterProvider');
  }
  return context;
};
