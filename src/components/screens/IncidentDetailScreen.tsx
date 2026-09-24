import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MapComponent } from '../MapComponent';
import type { IncidentStatus } from '../../types/dashboard';
import { 
  Flame, 
  CheckCircle2, 
  UserCheck, 
  Plus, 
  Camera, 
  X, 
  Eye, 
  Cpu, 
  User, 
  MapPin, 
  Thermometer, 
  Wind,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';

export const IncidentDetailScreen: React.FC = () => {
  const { 
    incidents, 
    drones, 
    stations, 
    responders, 
    updateIncidentStatus, 
    assignNearestDrone, 
    setActiveScreen, 
    selectedIncidentId 
  } = useCommandCenter();

  const [notes, setNotes] = useState('');
  const [operatorLogs, setOperatorLogs] = useState<string[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);

  const incident = incidents.find(i => i.id === selectedIncidentId);

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <Flame className="w-12 h-12 mb-3 text-slate-300" />
        <p className="text-sm font-semibold text-slate-600">No incident selected</p>
        <p className="text-xs text-slate-400 mt-1">Please select an active incident from the Dispatch Queue or Map.</p>
        <button 
          onClick={() => setActiveScreen('dispatch')} 
          className="mt-4 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-xs"
        >
          Return to Dispatch Queue
        </button>
      </div>
    );
  }

  const timelineSteps: {key: IncidentStatus, label: string}[] = [
    { key: 'idle', label: 'Idle' },
    { key: 'detecting', label: 'Detecting' },
    { key: 'alert_sent', label: 'Alert Sent' },
    { key: 'report_received', label: 'Report Rcvd' },
    { key: 'field_verification', label: 'Field Verify' },
    { key: 'sensor_confirmation', label: 'Sensor Conf' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'en_route', label: 'En Route' },
    { key: 'on_site', label: 'On Site' },
    { key: 'containment', label: 'Containment' },
    { key: 'monitoring', label: 'Monitoring' },
    { key: 'resolved', label: 'Resolved' }
  ];

  const currentStepIndex = timelineSteps.findIndex(s => s.key === incident.status);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setOperatorLogs(prev => [...prev, `[${timeStr}] OPERATOR: ${notes.trim()}`]);
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveScreen('dispatch')}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dispatch Queue</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h2 className="text-2xl font-bold font-mono text-teal-700">{incident.id}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
              incident.priority === 'critical' 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {incident.priority}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 border border-slate-200 text-slate-700">
              {incident.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-base text-slate-900 font-bold">{incident.title}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {incident.address}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => updateIncidentStatus(incident.id, 'cancelled')}
            className="px-3.5 py-2 border border-slate-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Cancel Incident
          </button>
          <button 
            onClick={() => {}}
            className="px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Escalate Priority
          </button>
          <button 
            onClick={() => updateIncidentStatus(incident.id, 'resolved')}
            className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-teal-700 shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> 
            <span>Mark Resolved</span>
          </button>
        </div>
      </div>

      {/* Incident Progression Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-x-auto">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Incident Response Stage Progression
        </h4>
        <div className="flex items-center justify-between min-w-[760px] relative px-4">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-4 h-1 bg-teal-600 -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${Math.max(0, (currentStepIndex / (timelineSteps.length - 1)) * 96)}%` }} 
          />
          
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center w-20">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                  isCurrent 
                    ? 'bg-teal-600 border-teal-600 ring-4 ring-teal-100' 
                    : isCompleted 
                    ? 'bg-teal-600 border-teal-600' 
                    : 'bg-white border-slate-300'
                }`}>
                  {isCompleted && !isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  {isCurrent && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
                </div>
                <span className={`text-[10px] mt-2 font-bold uppercase text-center tracking-tight ${
                  isCurrent 
                    ? 'text-teal-700 font-extrabold' 
                    : isCompleted 
                    ? 'text-slate-800' 
                    : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Viewer */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-[380px] shadow-xs">
            <MapComponent height="100%" center={[incident.location.latitude, incident.location.longitude]} zoom={15} />
          </div>

          {/* Evidence & Telemetry Viewer */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-600" /> Evidence & Telemetry Inspector
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="relative rounded-lg overflow-hidden border border-slate-200 cursor-pointer group shadow-xs" 
                onClick={() => setShowImageModal(true)}
              >
                <img 
                  src={incident.photoUrl || "https://images.unsplash.com/photo-1594892404283-a417614e5aeb?q=80&w=1200&auto=format&fit=crop"} 
                  alt="Incident Visual Evidence" 
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40 backdrop-blur-2xs">
                  <div className="p-2.5 rounded-full bg-white/90 text-slate-900 shadow-md">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-mono text-teal-300 font-bold">
                  OPTICAL CAM
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-rose-50/70 border border-rose-100 p-3 rounded-lg">
                    <p className="text-[10px] text-rose-800 uppercase font-bold mb-1 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-rose-600" /> Max Temp
                    </p>
                    <p className="font-mono text-lg font-bold text-rose-700">
                      {incident.temperatureMax || '--'} °C
                    </p>
                  </div>
                  <div className="bg-sky-50/70 border border-sky-100 p-3 rounded-lg">
                    <p className="text-[10px] text-sky-800 uppercase font-bold mb-1 flex items-center gap-1">
                      <Wind className="w-3 h-3 text-sky-600" /> Wind Vector
                    </p>
                    <p className="font-mono text-sm font-bold text-sky-700 mt-1">
                      SSE @ 14 km/h
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Report Verification</p>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[10px]">
                      VERIFIED ACCURATE
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-slate-500">Reporter:</span>
                    <span className="font-semibold text-slate-800">{incident.reporter}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-slate-500">Source:</span>
                    <span className="font-semibold text-slate-800 uppercase text-[11px]">
                      {incident.detectionSource.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="font-mono text-[11px] text-slate-700">{incident.reportedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Wildfire Telemetry Fields */}
            {(incident.spreadRateHa !== undefined || incident.containmentPercent !== undefined || incident.terrainType || incident.weatherRisk) && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {incident.spreadRateHa !== undefined && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Spread Rate</p>
                    <p className="font-mono text-sm font-bold text-amber-600">{incident.spreadRateHa} ha/hr</p>
                  </div>
                )}
                {incident.containmentPercent !== undefined && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Containment</p>
                    <p className="font-mono text-sm font-bold text-teal-700">{incident.containmentPercent}%</p>
                  </div>
                )}
                {incident.terrainType && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Terrain</p>
                    <p className="font-mono text-sm font-bold text-slate-800 uppercase">{incident.terrainType}</p>
                  </div>
                )}
                {incident.weatherRisk && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Weather Risk</p>
                    <p className={`font-mono text-sm font-bold uppercase ${
                      incident.weatherRisk === 'extreme' 
                        ? 'text-rose-600' 
                        : incident.weatherRisk === 'moderate' 
                        ? 'text-amber-600' 
                        : 'text-teal-700'
                    }`}>
                      {incident.weatherRisk}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Detection Source Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
              Origin & Detection Source
            </h3>
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              incident.detectionSource === 'citizen' 
                ? 'bg-teal-50/70 border-teal-200 text-teal-800' :
              incident.detectionSource === 'forest_officer' 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' :
                'bg-indigo-50/70 border-indigo-200 text-indigo-800'
            }`}>
              {incident.detectionSource === 'citizen' ? <User className="w-5 h-5 shrink-0 mt-0.5 text-teal-600" /> : 
               incident.detectionSource === 'forest_officer' ? <UserCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" /> : 
               <Cpu className="w-5 h-5 shrink-0 mt-0.5 text-indigo-600" />}
              
              <div>
                <p className="text-xs font-bold uppercase">
                  {incident.detectionSource === 'citizen' ? 'Citizen Incident Dispatch' :
                   incident.detectionSource === 'forest_officer' ? 'Forest Officer / Ranger Dispatch' : 
                   'Automated Drone & Satellite AI Stream'}
                </p>
                {incident.detectionSource === 'ml_drone' ? (
                  <>
                    <p className="text-xs text-slate-600 mt-1">Multi-spectral anomaly detected by autonomous patrol.</p>
                    {incident.surveillanceRecordId && (
                      <p className="text-[10px] font-mono text-indigo-600 font-bold mt-1">
                        Surveillance Ref: {incident.surveillanceRecordId}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-600 mt-1">Contact: {incident.reporter}</p>
                )}
              </div>
            </div>
          </div>

          {/* Unit Assignments */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Response Asset Allocation
            </h3>
            
            <div>
              <label className="text-[11px] text-slate-600 font-bold block mb-1">Assigned Drone</label>
              <div className="flex gap-2">
                <select className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white">
                  {incident.assignedDroneId ? (
                    <option>{incident.assignedDroneId}</option>
                  ) : (
                    <option>Select Drone...</option>
                  )}
                  {drones.map(d => <option key={d.id} value={d.id}>{d.id} ({d.model})</option>)}
                </select>
                <button 
                  onClick={() => assignNearestDrone(incident.id)}
                  className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Auto
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-bold block mb-1">Assigned Response Base</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white">
                {incident.assignedStationId ? (
                  <option>{stations.find(s => s.id === incident.assignedStationId)?.name}</option>
                ) : (
                  <option>Select Station...</option>
                )}
                {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.address})</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 font-bold block mb-1">Field Incident Commander</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white">
                <option>Assign Team Lead...</option>
                {responders.map(r => <option key={r.id} value={r.id}>{r.name} - {r.rank}</option>)}
              </select>
            </div>
          </div>

          {/* Operator Mission Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[270px]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
              Operator Log & Mission Notes
            </h3>
            
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3 overflow-y-auto text-xs font-mono text-slate-600 space-y-1.5">
              <p><span className="text-teal-700 font-bold">[SYSTEM]</span> {incident.reportedAt} — Incident initialized.</p>
              {incident.assignedDroneId && (
                <p><span className="text-teal-700 font-bold">[SYSTEM]</span> Drone unit {incident.assignedDroneId} assigned to scene.</p>
              )}
              {operatorLogs.map((log, i) => (
                <p key={i} className="text-slate-800">{log}</p>
              ))}
            </div>

            <form onSubmit={handleAddLog} className="flex gap-2">
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log note (e.g., Containment line established)..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
              <button 
                type="submit"
                className="px-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white p-2 rounded-2xl shadow-2xl border border-slate-200"
          >
            <button 
              onClick={() => setShowImageModal(false)} 
              className="absolute -top-10 right-0 text-white hover:text-teal-300 font-bold flex items-center gap-1 text-sm cursor-pointer"
            >
              <X className="w-6 h-6" /> Close
            </button>
            <img 
              src={incident.photoUrl || "https://images.unsplash.com/photo-1594892404283-a417614e5aeb?q=80&w=1200&auto=format&fit=crop"} 
              alt="Incident High Res" 
              className="w-full h-auto rounded-xl object-contain max-h-[80vh]" 
            />
          </div>
        </div>
      )}
    </div>
  );
};
