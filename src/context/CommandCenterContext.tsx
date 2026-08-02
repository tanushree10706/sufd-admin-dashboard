import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Incident,
  Drone,
  Responder,
  FireStation,
  AuditLogEntry,
  UserAccount,
  UserRole,
  SystemSettings
} from '../types/dashboard';

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

const defaultUser: UserAccount = {
  id: 'usr-01',
  name: 'Cmdr. Sterling',
  email: 'sterling@sufd.gov',
  role: 'admin',
  status: 'active',
  lastLogin: '2026-08-02 16:15:00',
};

const initialStations: FireStation[] = [
  {
    id: 'st-01',
    name: 'Station Alpha (Downtown)',
    address: '492 Industrial Way, Sector 4',
    location: { latitude: 34.053, longitude: -118.245 },
    totalResponders: 8,
    availableResponders: 3,
    totalDrones: 6,
    dockedDrones: 4,
    avgResponseTimeSec: 202,
    utilizationPercent: 85,
  },
  {
    id: 'st-02',
    name: 'Station Beta (West Port)',
    address: '1200 Market Street, West Port',
    location: { latitude: 34.04, longitude: -118.26 },
    totalResponders: 6,
    availableResponders: 2,
    totalDrones: 4,
    dockedDrones: 2,
    avgResponseTimeSec: 255,
    utilizationPercent: 65,
  },
  {
    id: 'st-03',
    name: 'Station Gamma (Reservoir)',
    address: '800 Northern Ridge Rd',
    location: { latitude: 34.07, longitude: -118.23 },
    totalResponders: 5,
    availableResponders: 1,
    totalDrones: 4,
    dockedDrones: 1,
    avgResponseTimeSec: 404,
    utilizationPercent: 98,
  },
  {
    id: 'st-04',
    name: 'Station Delta (Airstrip)',
    address: '150 Runway Way, East Sector',
    location: { latitude: 34.03, longitude: -118.22 },
    totalResponders: 10,
    availableResponders: 7,
    totalDrones: 8,
    dockedDrones: 6,
    avgResponseTimeSec: 238,
    utilizationPercent: 54,
  },
];

const initialIncidents: Incident[] = [
  {
    id: '#FIRE-9921',
    title: 'Industrial Warehouse Spot Fire',
    address: 'Oak Ridge, Sector 4',
    location: { latitude: 34.052, longitude: -118.243 },
    reportedAt: '14:22:05',
    timestamp: Date.now() - 520000,
    priority: 'critical',
    status: 'on_site',
    reporter: 'IoT Thermal Sensor #882',
    photoUrl: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=600&q=80',
    thermalPhotoUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80',
    otpVerified: true,
    assignedStationId: 'st-01',
    assignedDroneId: 'DR-402',
    assignedResponderIds: ['resp-01', 'resp-02'],
    temperatureMax: 482,
    windSpeed: '14.2 km/h NW',
    notes: [
      { id: 'n1', author: 'Disp-09', role: 'Operator', timestamp: '14:22:15', text: 'Drone DR-402 arrived at Oak Ridge. Visual thermal spike confirmed.' },
      { id: 'n2', author: 'Sys-Auto', role: 'System', timestamp: '14:22:05', text: 'Emergency sensor #882 activated at Oak Ridge Sector 4.' }
    ],
    waitTimeSeconds: 522,
    slaBreached: true,
  },
  {
    id: '#SMOKE-8822',
    title: 'Residential Vegetation Smoke Plume',
    address: 'Harbor Vista Dr.',
    location: { latitude: 34.045, longitude: -118.252 },
    reportedAt: '14:18:12',
    timestamp: Date.now() - 315000,
    priority: 'high',
    status: 'en_route',
    reporter: 'Mobile App (OTP Verified)',
    photoUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=600&q=80',
    thermalPhotoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    otpVerified: true,
    assignedStationId: 'st-02',
    assignedDroneId: 'DR-901',
    assignedResponderIds: ['resp-03'],
    temperatureMax: 240,
    windSpeed: '9.8 km/h W',
    notes: [
      { id: 'n3', author: 'Disp-02', role: 'Operator', timestamp: '14:18:30', text: 'Drone DR-901 launch sequence initiated from Station 02.' }
    ],
    waitTimeSeconds: 315,
    slaBreached: false,
  },
  {
    id: '#HAZ-7731',
    title: 'Chemical Storage Tank Heat Warning',
    address: 'Industrial District 3',
    location: { latitude: 34.062, longitude: -118.238 },
    reportedAt: '14:05:44',
    timestamp: Date.now() - 600000,
    priority: 'low',
    status: 'alert_sent',
    reporter: '911 Dispatch Link',
    otpVerified: false,
    assignedResponderIds: [],
    temperatureMax: 110,
    windSpeed: '6.4 km/h SW',
    notes: [],
    waitTimeSeconds: 600,
    slaBreached: true,
  },
  {
    id: '#FIRE-9918',
    title: 'Park Ridge Brush Fire',
    address: 'Greenway Park N.',
    location: { latitude: 34.068, longitude: -118.225 },
    reportedAt: '13:58:10',
    timestamp: Date.now() - 900000,
    priority: 'medium',
    status: 'confirmed',
    reporter: 'Thermal Drone Survey',
    photoUrl: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&w=600&q=80',
    otpVerified: true,
    assignedStationId: 'st-03',
    assignedDroneId: 'DR-202',
    assignedResponderIds: ['resp-04'],
    temperatureMax: 310,
    windSpeed: '12.0 km/h N',
    notes: [
      { id: 'n4', author: 'Maint', role: 'System', timestamp: '14:00:10', text: 'Perimeter containment line established.' }
    ],
    waitTimeSeconds: 130,
    slaBreached: false,
  },
  {
    id: '#SF-8829-X',
    title: 'Sutton Ridge Factory Fire Surge',
    address: 'Sutton Ridge Industrial Park',
    location: { latitude: 34.058, longitude: -118.249 },
    reportedAt: '14:15:00',
    timestamp: Date.now() - 480000,
    priority: 'critical',
    status: 'on_site',
    reporter: 'SmartFlame Emergency IoT #77-B',
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80',
    thermalPhotoUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=600&q=80',
    otpVerified: true,
    assignedStationId: 'st-04',
    assignedDroneId: 'DR-112',
    assignedResponderIds: ['resp-01', 'resp-05'],
    temperatureMax: 425,
    windSpeed: '12.0 km/h NW',
    notes: [
      { id: 'n5', author: 'Cmdr. Sterling', role: 'Admin', timestamp: '14:16:00', text: 'Class-B chemical foam dispatch authorized.' }
    ],
    waitTimeSeconds: 522,
    slaBreached: true,
  }
];

const initialDrones: Drone[] = [
  {
    id: 'DR-402',
    model: 'Interceptor-X4',
    status: 'on_site',
    batteryPercent: 84,
    currentLocation: { latitude: 34.052, longitude: -118.243 },
    stationId: 'st-01',
    assignedIncidentId: '#FIRE-9921',
    flightTimeHours: 142.5,
    totalIncidents: 48,
    utilizationPercent: 92,
    altitudeMeters: 124,
    speedKmh: 42,
  },
  {
    id: 'DR-901',
    model: 'Surveyor-V2',
    status: 'en_route',
    batteryPercent: 65,
    currentLocation: { latitude: 34.047, longitude: -118.25 },
    stationId: 'st-02',
    assignedIncidentId: '#SMOKE-8822',
    flightTimeHours: 98.2,
    totalIncidents: 31,
    utilizationPercent: 78,
    altitudeMeters: 180,
    speedKmh: 58,
  },
  {
    id: 'DR-112',
    model: 'Tanker-Heavy Vulcan-9',
    status: 'on_site',
    batteryPercent: 72,
    currentLocation: { latitude: 34.058, longitude: -118.249 },
    stationId: 'st-04',
    assignedIncidentId: '#SF-8829-X',
    flightTimeHours: 210.0,
    totalIncidents: 74,
    utilizationPercent: 95,
    altitudeMeters: 95,
    speedKmh: 35,
  },
  {
    id: 'DR-202',
    model: 'Surveyor-V2',
    status: 'en_route',
    batteryPercent: 54,
    currentLocation: { latitude: 34.066, longitude: -118.228 },
    stationId: 'st-03',
    assignedIncidentId: '#FIRE-9918',
    flightTimeHours: 85.0,
    totalIncidents: 22,
    utilizationPercent: 62,
    altitudeMeters: 150,
    speedKmh: 50,
  },
  {
    id: 'DR-305',
    model: 'Scout-09',
    status: 'idle',
    batteryPercent: 100,
    currentLocation: { latitude: 34.053, longitude: -118.245 },
    stationId: 'st-01',
    flightTimeHours: 45.1,
    totalIncidents: 14,
    utilizationPercent: 40,
    altitudeMeters: 0,
    speedKmh: 0,
  },
  {
    id: 'DR-405',
    model: 'Interceptor-X4',
    status: 'charging',
    batteryPercent: 28,
    currentLocation: { latitude: 34.04, longitude: -118.26 },
    stationId: 'st-02',
    flightTimeHours: 160.4,
    totalIncidents: 55,
    utilizationPercent: 88,
    altitudeMeters: 0,
    speedKmh: 0,
  },
  {
    id: 'DR-220',
    model: 'Suppressor-HD',
    status: 'maintenance',
    batteryPercent: 12,
    currentLocation: { latitude: 34.07, longitude: -118.23 },
    stationId: 'st-03',
    flightTimeHours: 320.0,
    totalIncidents: 110,
    utilizationPercent: 99,
    maintenanceReason: 'Engine Rotor Sensor Recalibration Required',
    altitudeMeters: 0,
    speedKmh: 0,
  }
];

const initialResponders: Responder[] = [
  {
    id: 'resp-01',
    name: 'Capt. Marcus Vance',
    rank: 'Station Captain',
    stationId: 'st-01',
    status: 'assigned',
    assignedIncidentId: '#FIRE-9921',
    phone: '+1 (555) 019-2831',
    badgeNumber: 'SF-1042',
  },
  {
    id: 'resp-02',
    name: 'Eng. Sarah Chen',
    rank: 'Drone Systems Tech',
    stationId: 'st-01',
    status: 'assigned',
    assignedIncidentId: '#FIRE-9921',
    phone: '+1 (555) 019-4820',
    badgeNumber: 'SF-2094',
  },
  {
    id: 'resp-03',
    name: 'Lt. David Ross',
    rank: 'First Responder Lead',
    stationId: 'st-02',
    status: 'assigned',
    assignedIncidentId: '#SMOKE-8822',
    phone: '+1 (555) 018-9210',
    badgeNumber: 'SF-1102',
  },
  {
    id: 'resp-04',
    name: 'Tech Maya Lin',
    rank: 'Aerial Surveillance Op',
    stationId: 'st-03',
    status: 'available',
    phone: '+1 (555) 017-3819',
    badgeNumber: 'SF-3301',
  },
  {
    id: 'resp-05',
    name: 'Officer Alex Rivera',
    rank: 'Hazmat Specialist',
    stationId: 'st-04',
    status: 'assigned',
    assignedIncidentId: '#SF-8829-X',
    phone: '+1 (555) 016-5544',
    badgeNumber: 'SF-4412',
  },
  {
    id: 'resp-06',
    name: 'Chief Daniel Brody',
    rank: 'District Commander',
    stationId: 'st-01',
    status: 'available',
    phone: '+1 (555) 015-8811',
    badgeNumber: 'SF-0001',
  }
];

const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud-8829',
    incidentId: '#SF-8829-A',
    date: 'Oct 24, 2023',
    time: '14:22:10',
    address: '492 Industrial Way, Sector 4',
    finalStatus: 'resolved',
    assignedDrone: 'DR-402 (Interceptor-X)',
    assignedStation: 'Station Alpha (Downtown)',
    assignedResponders: ['Capt. Marcus Vance', 'Eng. Sarah Chen'],
    responseTimeFormatted: '04:12',
    operatorId: 'Op. Miller',
    postMissionNote: 'Minor sensor drift noted on DR-402 during return flight. Thermal containment confirmed.',
    timeline: [
      { time: '14:22:10', action: 'Incident Reported', details: 'AI Analysis: Class 2 Heat Signature detected.' },
      { time: '14:22:45', action: 'Unit Dispatched', details: 'DR-402 launched from Station Alpha.' },
      { time: '14:25:22', action: 'Arrived at Location', details: 'Streaming 4K Thermal video feed to Command Center.' },
      { time: '14:26:22', action: 'Incident Resolved', details: 'Manual override confirmed threat suppression.' },
    ]
  },
  {
    id: 'aud-8827',
    incidentId: '#SF-8827-Y',
    date: 'Oct 24, 2023',
    time: '12:05:44',
    address: '1200 Market Street, Financial District',
    finalStatus: 'cancelled',
    assignedDrone: 'DR-901 (Surveyor-V2)',
    assignedStation: 'Station Beta (West Port)',
    assignedResponders: ['Lt. David Ross'],
    responseTimeFormatted: '01:45',
    operatorId: 'Cmdr. Sterling',
    postMissionNote: 'False alarm triggered by HVAC steam exhaust vent flare.',
    timeline: [
      { time: '12:05:44', action: 'Incident Triggered', details: 'Public citizen OTP report.' },
      { time: '12:06:10', action: 'Drone En Route', details: 'DR-901 en route.' },
      { time: '12:07:29', action: 'Cancelled', details: 'Operator verified false alarm via visual feed.' },
    ]
  },
  {
    id: 'aud-8821',
    incidentId: '#SF-8821-B',
    date: 'Oct 23, 2023',
    time: '23:12:00',
    address: 'Pier 39 Waterfront Sector',
    finalStatus: 'resolved',
    assignedDrone: 'DR-202 (Surveyor-V2)',
    assignedStation: 'Station Gamma (Reservoir)',
    assignedResponders: ['Tech Maya Lin'],
    responseTimeFormatted: '06:58',
    operatorId: 'Op. Miller',
    postMissionNote: 'Containment successful before boat dock ignition.',
    timeline: [
      { time: '23:12:00', action: 'Alert Sent', details: 'IoT Sensor waterfront alarm.' },
      { time: '23:18:58', action: 'Resolved', details: 'Station Gamma crew doused flare.' }
    ]
  }
];

const initialUsers: UserAccount[] = [
  defaultUser,
  {
    id: 'usr-02',
    name: 'Op. Miller',
    email: 'miller@sufd.gov',
    role: 'operator',
    status: 'active',
    lastLogin: '2026-08-02 15:40:00',
  },
  {
    id: 'usr-03',
    name: 'Officer Alex Rivera',
    email: 'rivera@station4.sufd.gov',
    role: 'station_staff',
    status: 'active',
    lastLogin: '2026-08-01 09:12:00',
    stationId: 'st-04'
  }
];

const defaultSettings: SystemSettings = {
  darkModeDefault: true,
  soundAlertsEnabled: true,
  slaThresholdMinutes: 5,
  autoDispatchEnabled: false,
  refreshIntervalSec: 3,
};

const CommandCenterContext = createContext<CommandCenterContextType | undefined>(undefined);

export const CommandCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<string>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('#FIRE-9921');
  const [currentUser, setCurrentUser] = useState<UserAccount>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [drones, setDrones] = useState<Drone[]>(initialDrones);
  const [responders, setResponders] = useState<Responder[]>(initialResponders);
  const [stations] = useState<FireStation[]>(initialStations);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(3);

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

          return {
            ...inc,
            waitTimeSeconds: newWait,
            slaBreached,
            temperatureMax: newTemp,
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

  const login = (user: string, _pass: string) => {
    setIsAuthenticated(true);
    const foundUser = users.find((u) => u.email.toLowerCase() === user.toLowerCase()) || defaultUser;
    setCurrentUser(foundUser);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  const toggleSimulation = () => setIsSimulating(!isSimulating);
  const toggleSoundAlerts = () => setSoundAlerts(!soundAlerts);
  const clearAlerts = () => setUnreadAlertCount(0);

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
                  text: `Assigned Drone ${drone.id} (${drone.model}) to dispatch route.`
                }
              ]
            }
          : inc
      )
    );

    setDrones((prev) =>
      prev.map((d) =>
        d.id === droneId
          ? { ...d, status: 'en_route', assignedIncidentId: incidentId }
          : d
      )
    );
  };

  const assignRespondersToIncident = (incidentId: string, responderIds: string[]) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              assignedResponderIds: Array.from(new Set([...inc.assignedResponderIds, ...responderIds]))
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
              text: `Status updated to ${status.toUpperCase().replace('_', ' ')}.`
            }
          ]
        };

        if (status === 'resolved' || status === 'cancelled') {
          const auditEntry: AuditLogEntry = {
            id: `aud-${Date.now()}`,
            incidentId: inc.id,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString(),
            address: inc.address,
            finalStatus: status as 'resolved' | 'cancelled',
            assignedDrone: inc.assignedDroneId || 'None',
            assignedStation: 'Station Alpha',
            assignedResponders: inc.assignedResponderIds.map((rId) => {
              const r = responders.find((resp) => resp.id === rId);
              return r ? r.name : rId;
            }),
            responseTimeFormatted: `${Math.floor(inc.waitTimeSeconds / 60)}:${(inc.waitTimeSeconds % 60).toString().padStart(2, '0')}`,
            operatorId: currentUser.name,
            postMissionNote: `Mission concluded as ${status.toUpperCase()}. All units cleared.`,
            timeline: inc.notes.map((n) => ({
              time: n.timestamp,
              action: `${n.author} (${n.role})`,
              details: n.text
            }))
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
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  text,
                }
              ]
            }
          : inc
      )
    );
  };

  const updateDroneStatus = (droneId: string, status: Drone['status']) => {
    setDrones((prev) =>
      prev.map((d) => (d.id === droneId ? { ...d, status } : d))
    );
  };

  const updateResponderStatus = (responderId: string, status: Responder['status']) => {
    setResponders((prev) =>
      prev.map((r) => (r.id === responderId ? { ...r, status } : r))
    );
  };

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

  const exportAuditLogsCSV = () => {
    const headers = ['Incident ID', 'Date', 'Time', 'Address', 'Final Status', 'Assigned Drone', 'Assigned Station', 'Response Time', 'Operator'];
    const rows = auditLogs.map((log) => [
      log.incidentId,
      log.date,
      log.time,
      `"${log.address}"`,
      log.finalStatus.toUpperCase(),
      log.assignedDrone,
      log.assignedStation,
      log.responseTimeFormatted,
      log.operatorId
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SUFD_Incident_Audit_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
