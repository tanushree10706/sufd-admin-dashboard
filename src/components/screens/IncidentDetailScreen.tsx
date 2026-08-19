import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MapComponent } from '../MapComponent';
import type { IncidentStatus } from '../../types/dashboard';
import { Flame, CheckCircle2, UserCheck, Plus, Camera, X, Eye, Cpu, User, MapPin, Thermometer, Wind } from 'lucide-react';

export const IncidentDetailScreen: React.FC = () => {
  const { incidents, drones, stations, responders, updateIncidentStatus, assignNearestDrone, setActiveScreen, selectedIncidentId } = useCommandCenter();

  const [notes, setNotes] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  const incident = incidents.find(i => i.id === selectedIncidentId);

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-[#bcc9c6]">
        <Flame className="w-12 h-12 mb-4 opacity-50" />
        <p>No incident selected.</p>
        <button onClick={() => setActiveScreen('overview')} className="mt-4 text-[#6bd8cb] hover:underline">Return to Overview</button>
      </div>
    );
  }

  const timelineSteps: {key: IncidentStatus, label: string}[] = [
    { key: 'idle', label: 'Idle' },
    { key: 'detecting', label: 'Detecting' },
    { key: 'alert_sent', label: 'Alert Sent' },
    { key: 'report_received', label: 'Report Received' },
    { key: 'field_verification', label: 'Field Verify' },
    { key: 'sensor_confirmation', label: 'Sensor Confirm' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'en_route', label: 'En Route' },
    { key: 'on_site', label: 'On Site' },
    { key: 'containment', label: 'Containment' },
    { key: 'monitoring', label: 'Monitoring' },
    { key: 'resolved', label: 'Resolved' }
  ];

  const currentStepIndex = timelineSteps.findIndex(s => s.key === incident.status);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#122131] p-5 rounded-xl border border-[#3d4947]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold font-mono text-[#6bd8cb]">{incident.id}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${incident.priority === 'critical' ? 'bg-[#93000a] text-white' : 'bg-[#ca8100] text-white'}`}>
              {incident.priority}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#0d1c2d] border border-[#3d4947] text-[#bcc9c6]">
              {incident.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-[#d4e4fa] font-bold">{incident.title}</p>
          <p className="text-xs text-[#bcc9c6] flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {incident.address}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-[#3d4947] text-[#ffb4ab] text-xs font-bold rounded hover:bg-[#273647] transition-colors">
            Cancel Incident
          </button>
          <button className="px-4 py-2 bg-[#93000a] text-white text-xs font-bold rounded hover:brightness-110 transition-colors">
            Escalate Priority
          </button>
          <button 
            onClick={() => updateIncidentStatus(incident.id, 'resolved')}
            className="px-4 py-2 bg-[#6bd8cb] text-[#051424] text-xs font-bold rounded flex items-center gap-2 hover:brightness-110 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark Resolved
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[800px] relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#3d4947] -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-[#6bd8cb] -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${Math.max(0, (currentStepIndex / (timelineSteps.length - 1)) * 100)}%` }} 
          />
          
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center w-24">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isCompleted ? 'bg-[#6bd8cb] border-[#6bd8cb]' : 'bg-[#051424] border-[#3d4947]'}`}>
                  {isCompleted && !isCurrent && <CheckCircle2 className="w-3 h-3 text-[#051424]" />}
                  {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-[#051424] animate-pulse" />}
                </div>
                <span className={`text-[10px] mt-2 font-bold uppercase text-center ${isCurrent ? 'text-[#6bd8cb]' : isCompleted ? 'text-[#d4e4fa]' : 'text-[#bcc9c6]/50'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden h-[400px]">
            <MapComponent height="100%" center={[incident.location.latitude, incident.location.longitude]} zoom={15} />
          </div>

          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5">
            <h3 className="font-bold text-sm text-[#d4e4fa] mb-4 flex items-center gap-2"><Camera className="w-4 h-4 text-[#6bd8cb]" /> Evidence & Telemetry Viewer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative rounded overflow-hidden border border-[#3d4947] cursor-pointer group" onClick={() => setShowImageModal(true)}>
                <img src={incident.photoUrl || "https://images.unsplash.com/photo-1594892404283-a417614e5aeb?q=80&w=1200&auto=format&fit=crop"} alt="Incident" className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-[#6bd8cb]">LIVE CAM</div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-[#0d1c2d] p-3 rounded border border-[#3d4947]/50 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-[#bcc9c6] uppercase font-bold mb-1 flex items-center gap-1"><Thermometer className="w-3 h-3 text-[#ffb4ab]" /> Thermal Reading</p>
                    <p className="font-mono text-lg text-[#ffb4ab]">{incident.temperatureMax || '--'} °C</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#bcc9c6] uppercase font-bold mb-1 flex items-center gap-1"><Wind className="w-3 h-3 text-[#6bd8cb]" /> Wind Vector</p>
                    <p className="font-mono text-sm text-[#d4e4fa]">SSE @ 14km/h</p>
                  </div>
                </div>

                <div className="bg-[#0d1c2d] p-3 rounded border border-[#3d4947]/50">
                  <p className="text-[10px] text-[#bcc9c6] uppercase font-bold mb-2">Report Verification</p>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#bcc9c6]">Status:</span>
                    <span className="text-xs font-bold text-[#6bd8cb]">VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#bcc9c6]">Reporter:</span>
                    <span className="text-xs text-[#d4e4fa]">{incident.reporter}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#bcc9c6]">Source:</span>
                    <span className="text-xs text-[#d4e4fa] uppercase">{incident.detectionSource.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#bcc9c6]">Time:</span>
                    <span className="text-[10px] font-mono text-[#d4e4fa]">{incident.reportedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Wildfire Telemetry Fields */}
            {(incident.spreadRateHa !== undefined || incident.containmentPercent !== undefined || incident.terrainType || incident.weatherRisk) && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {incident.spreadRateHa !== undefined && (
                  <div className="bg-[#0d1c2d] p-3 rounded border border-[#3d4947]/50">
                    <p className="text-[10px] text-[#bcc9c6] uppercase font-bold mb-1">Spread Rate</p>
                    <p className="font-mono text-sm text-[#ffb95f]">{incident.spreadRateHa} ha/hr</p>
                  </div>
                )}
                {incident.containmentPercent !== undefined && (
                  <div className="bg-[#0d1c2d] p-3 rounded border border-[#3d4947]/50">
                    <p className="text-[10px] text-[#bcc9c6] uppercase font-bold mb-1">Containment</p>
                    <p className="font-mono text-sm text-[#6bd8cb]">{incident.containmentPercent}%</p>
                  </div>
                )}
                {incident.terrainType && (
                  <div className="bg-[#0d1c2d] p-3 rounded border border-[#3d4947]/50">
                    <p className="text-[10px] text-[#bcc9c6] uppercase font-bold mb-1">Terrain</p>
                    <p className="font-mono text-sm text-[#d4e4fa] uppercase">{incident.terrainType}</p>
                  </div>
                )}
                {incident.weatherRisk && (
                  <div className="bg-[#0d1c2d] p-3 rounded border border-[#3d4947]/50">
                    <p className="text-[10px] text-[#bcc9c6] uppercase font-bold mb-1">Weather Risk</p>
                    <p className={`font-mono text-sm font-bold uppercase ${incident.weatherRisk === 'extreme' ? 'text-[#ffb4ab]' : incident.weatherRisk === 'moderate' ? 'text-[#ffb95f]' : 'text-[#6bd8cb]'}`}>
                      {incident.weatherRisk}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* DETECTION SOURCE */}
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5">
            <h3 className="font-bold text-sm text-[#d4e4fa] mb-4 uppercase tracking-wider">Detection Source</h3>
            <div className={`p-4 rounded-lg border flex items-start gap-3 ${
              incident.detectionSource === 'citizen' ? 'bg-[#29a195]/10 border-[#6bd8cb]/30 text-[#6bd8cb]' :
              incident.detectionSource === 'forest_officer' ? 'bg-[#ca8100]/10 border-[#ffb95f]/30 text-[#ffb95f]' :
              'bg-[#8b5cf6]/10 border-[#c4b5fd]/30 text-[#c4b5fd]'
            }`}>
              {incident.detectionSource === 'citizen' ? <User className="w-6 h-6 shrink-0 mt-0.5" /> : 
               incident.detectionSource === 'forest_officer' ? <UserCheck className="w-6 h-6 shrink-0 mt-0.5" /> : 
               <Cpu className="w-6 h-6 shrink-0 mt-0.5" />}
              
              <div>
                <p className="text-xs font-bold uppercase mb-1">
                  {incident.detectionSource === 'citizen' ? 'Citizen Report' :
                   incident.detectionSource === 'forest_officer' ? 'Forest Officer / Ranger' : 
                   'ML / Drone Detection'}
                </p>
                {incident.detectionSource === 'ml_drone' ? (
                  <>
                    <p className="text-xs opacity-90 mb-2">Automated AI Detection</p>
                    {incident.surveillanceRecordId && (
                      <p className="text-[10px] font-mono opacity-80">Surveillance ID: {incident.surveillanceRecordId}</p>
                    )}
                    <div className="mt-2 text-[10px] bg-black/20 p-2 rounded italic opacity-80 border border-current">
                      AI model results will appear here when ML integration is active.
                    </div>
                  </>
                ) : (
                  <p className="text-xs opacity-90">Reporter: {incident.reporter}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#d4e4fa] uppercase tracking-wider">Unit Assignments</h3>
            
            <div>
              <label className="text-[10px] text-[#bcc9c6] uppercase font-bold block mb-1">Assigned Drone</label>
              <div className="flex gap-2">
                <select className="flex-1 bg-[#0d1c2d] border border-[#3d4947] rounded p-2 text-xs text-[#d4e4fa]">
                  {incident.assignedDroneId ? (
                    <option>{incident.assignedDroneId}</option>
                  ) : (
                    <option>Select Drone...</option>
                  )}
                  {drones.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                </select>
                <button 
                  onClick={() => assignNearestDrone(incident.id)}
                  className="px-3 bg-[#273647] hover:bg-[#3d4947] border border-[#3d4947] rounded text-xs text-[#d4e4fa]"
                >
                  Auto
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#bcc9c6] uppercase font-bold block mb-1">Assigned Response Base</label>
              <select className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded p-2 text-xs text-[#d4e4fa]">
                {incident.assignedStationId ? (
                  <option>{stations.find(s => s.id === incident.assignedStationId)?.name}</option>
                ) : (
                  <option>Select Base...</option>
                )}
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#bcc9c6] uppercase font-bold block mb-1">Field Personnel</label>
              <select className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded p-2 text-xs text-[#d4e4fa]">
                <option>Assign Leader...</option>
                {responders.map(r => <option key={r.id} value={r.id}>{r.name} - {r.rank}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 flex flex-col h-[250px]">
            <h3 className="font-bold text-sm text-[#d4e4fa] mb-4 uppercase tracking-wider">Operator Log</h3>
            <div className="flex-1 bg-[#0d1c2d] border border-[#3d4947] rounded p-3 mb-3 overflow-y-auto text-xs text-[#bcc9c6] font-mono space-y-2">
              <p><span className="text-[#6bd8cb]">[SYSTEM]</span> {incident.reportedAt} - Incident created.</p>
              {incident.assignedDroneId && <p><span className="text-[#6bd8cb]">[SYSTEM]</span> Drone {incident.assignedDroneId} assigned.</p>}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add log entry..." 
                className="flex-1 bg-[#0d1c2d] border border-[#3d4947] rounded px-3 py-1 text-xs text-[#d4e4fa] focus:outline-none focus:border-[#6bd8cb]"
              />
              <button 
                onClick={() => setNotes('')}
                className="p-1.5 bg-[#6bd8cb] text-[#051424] rounded hover:brightness-110"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-4xl w-full">
            <button onClick={() => setShowImageModal(false)} className="absolute -top-12 right-0 text-white hover:text-[#6bd8cb]">
              <X className="w-8 h-8" />
            </button>
            <img src={incident.photoUrl || "https://images.unsplash.com/photo-1594892404283-a417614e5aeb?q=80&w=1200&auto=format&fit=crop"} alt="Incident Full" className="w-full h-auto rounded-lg border border-[#3d4947]" />
          </div>
        </div>
      )}
    </div>
  );
};
