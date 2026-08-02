import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MapComponent } from '../MapComponent';
import {
  Flame,
  CheckCircle2,
  UserCheck,
  Plus,
  Send,
  Camera,
  Layers,
  X,
  Eye
} from 'lucide-react';
import type { IncidentStatus } from '../../types/dashboard';

export const IncidentDetailScreen: React.FC = () => {
  const {
    incidents,
    selectedIncidentId,
    drones,
    stations,
    responders,
    assignDroneToIncident,
    assignRespondersToIncident,
    updateIncidentStatus,
    updateIncidentPriority,
    addIncidentNote
  } = useCommandCenter();

  const incident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [selectedDroneId, setSelectedDroneId] = useState<string>(incident?.assignedDroneId || '');
  const [selectedStationId, setSelectedStationId] = useState<string>(incident?.assignedStationId || 'st-01');
  const [selectedResponderId, setSelectedResponderId] = useState<string>('');
  const [showThermalPhoto, setShowThermalPhoto] = useState<boolean>(true);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  if (!incident) return null;

  const timelineSteps: { key: IncidentStatus; label: string }[] = [
    { key: 'idle', label: 'Idle' },
    { key: 'detecting', label: 'Detecting' },
    { key: 'alert_sent', label: 'Alert Sent' },
    { key: 'awaiting_photo', label: 'Awaiting Photo' },
    { key: 'awaiting_otp', label: 'Awaiting OTP' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'en_route', label: 'En Route' },
    { key: 'on_site', label: 'On Site' },
    { key: 'resolved', label: 'Resolved' }
  ];

  const currentStepIndex = timelineSteps.findIndex(
    (step) => step.key === incident.status
  );

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addIncidentNote(incident.id, newNoteText.trim());
    setNewNoteText('');
  };

  const handleDroneAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDroneId(val);
    if (val) {
      assignDroneToIncident(incident.id, val);
    }
  };

  const handleAddResponder = () => {
    if (selectedResponderId) {
      assignRespondersToIncident(incident.id, [selectedResponderId]);
      setSelectedResponderId('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="bg-[#122131] border border-[#3d4947] p-6 rounded-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/40 flex items-center justify-center">
            <Flame className="w-6 h-6 text-[#ffb4ab]" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold font-mono text-[#d4e4fa]">{incident.id}</h1>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                incident.priority === 'critical'
                  ? 'bg-[#93000a] text-white animate-pulse'
                  : 'bg-[#ca8100] text-white'
              }`}>
                {incident.priority} PRIORITY
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#29a195]/20 border border-[#6bd8cb] text-[#6bd8cb]">
                {incident.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-[#bcc9c6] mt-1">{incident.address} • Reported at {incident.reportedAt}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => updateIncidentStatus(incident.id, 'cancelled')}
            className="px-4 py-2 bg-[#0d1c2d] border border-[#3d4947] text-xs font-bold text-[#bcc9c6] rounded-lg hover:bg-[#273647]"
          >
            CANCEL INCIDENT
          </button>
          <button
            onClick={() => updateIncidentPriority(incident.id, 'critical')}
            className="px-4 py-2 bg-[#ca8100] text-white text-xs font-bold rounded-lg hover:brightness-110"
          >
            ESCALATE
          </button>
          <button
            onClick={() => updateIncidentStatus(incident.id, 'resolved')}
            className="px-4 py-2 bg-[#6bd8cb] text-[#003732] text-xs font-bold rounded-lg hover:brightness-110 flex items-center space-x-1.5 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>MARK RESOLVED</span>
          </button>
        </div>
      </div>

      {/* Status Timeline Bar */}
      <div className="bg-[#122131] border border-[#3d4947] p-6 rounded-xl space-y-3">
        <p className="text-xs font-bold text-[#bcc9c6] uppercase tracking-wider">Incident Progression Timeline</p>
        <div className="flex items-center justify-between relative overflow-x-auto py-2">
          {timelineSteps.map((step, idx) => {
            const isCompleted = idx <= (currentStepIndex >= 0 ? currentStepIndex : 5);
            const isCurrent = idx === currentStepIndex || (incident.status === 'on_site' && idx === 7);

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center min-w-[70px] relative">
                {idx > 0 && (
                  <div
                    className={`absolute top-3 right-1/2 w-full h-1 -translate-y-1/2 z-0 ${
                      isCompleted ? 'bg-[#6bd8cb]' : 'bg-[#3d4947]'
                    }`}
                  />
                )}

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center z-10 text-[10px] font-bold font-mono transition-all ${
                    isCurrent
                      ? 'bg-[#6bd8cb] text-[#003732] ring-4 ring-[#6bd8cb]/30'
                      : isCompleted
                      ? 'bg-[#29a195] text-white'
                      : 'bg-[#0d1c2d] border border-[#3d4947] text-[#bcc9c6]'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[10px] mt-2 text-center font-medium ${
                  isCurrent ? 'text-[#6bd8cb] font-bold' : isCompleted ? 'text-[#d4e4fa]' : 'text-[#bcc9c6]/50'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden h-[340px] relative">
            <div className="absolute top-4 left-4 z-20 bg-[#1c2b3c]/90 backdrop-blur-md p-3 rounded-lg border border-[#3d4947]">
              <p className="text-[10px] font-bold text-[#bcc9c6] uppercase">Telemetry Snapshot</p>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div>
                  <span className="text-[10px] text-[#bcc9c6] uppercase">Thermal Reading</span>
                  <p className="text-base font-mono font-bold text-[#ffb4ab]">{incident.temperatureMax || 425}°C</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#bcc9c6] uppercase">Wind Vector</span>
                  <p className="text-base font-mono font-bold text-[#6bd8cb]">{incident.windSpeed || '12.0 km/h NW'}</p>
                </div>
              </div>
            </div>
            <MapComponent center={[incident.location.latitude, incident.location.longitude]} height="100%" />
          </div>

          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#bcc9c6] uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#6bd8cb]" />
                Field & Drone Evidence Viewer
              </h3>
              <button
                onClick={() => setShowThermalPhoto(!showThermalPhoto)}
                className="px-3 py-1 bg-[#1c2b3c] border border-[#3d4947] text-xs text-[#6bd8cb] font-bold rounded flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showThermalPhoto ? 'SHOW OPTICAL' : 'SHOW THERMAL'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div 
                onClick={() => setSelectedImageModal(showThermalPhoto ? incident.thermalPhotoUrl || incident.photoUrl || '' : incident.photoUrl || '')}
                className="aspect-video bg-[#0d1c2d] border border-[#3d4947] rounded-lg overflow-hidden relative group cursor-pointer"
              >
                <img
                  src={showThermalPhoto ? (incident.thermalPhotoUrl || incident.photoUrl) : incident.photoUrl}
                  alt="Drone Evidence Feed"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                  {showThermalPhoto ? 'THERMAL IR' : 'RGB VISUAL'}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="w-6 h-6 text-[#6bd8cb]" />
                </div>
              </div>

              <div className="aspect-video bg-[#0d1c2d] border border-[#3d4947] rounded-lg p-4 flex flex-col justify-between">
                <p className="text-[10px] font-bold text-[#bcc9c6] uppercase">OTP Verification Proof</p>
                <div className="space-y-1 font-mono">
                  <p className="text-xs text-[#6bd8cb] font-bold">STATUS: VERIFIED</p>
                  <p className="text-[10px] text-[#bcc9c6]">Reporter: {incident.reporter}</p>
                  <p className="text-[10px] text-[#bcc9c6]">Timestamp: {incident.reportedAt}</p>
                </div>
              </div>

              <div className="aspect-video bg-[#0d1c2d] border border-dashed border-[#3d4947] rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-[#1c2b3c] transition-colors">
                <Plus className="w-6 h-6 text-[#6bd8cb] mb-1" />
                <span className="text-[11px] font-bold text-[#bcc9c6]">Request Additional Drone Snapshot</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-6 space-y-5">
            <h3 className="text-xs font-bold text-[#bcc9c6] uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#6bd8cb]" />
              Asset & Dispatch Assignments
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-[#bcc9c6] uppercase mb-1">
                Assigned Fire Station
              </label>
              <select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-3 py-2 text-xs text-[#d4e4fa] focus:border-[#6bd8cb]"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.dockedDrones} Drones Available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#bcc9c6] uppercase mb-1">
                Assigned Aerial Drone
              </label>
              <select
                value={selectedDroneId}
                onChange={handleDroneAssign}
                className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-3 py-2 text-xs text-[#d4e4fa] focus:border-[#6bd8cb]"
              >
                <option value="">-- Select Drone Unit --</option>
                {drones.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id} ({d.model} - {d.batteryPercent}% Batt - {d.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#bcc9c6] uppercase mb-1">
                Assigned Personnel / Responders
              </label>
              <div className="space-y-2 mb-2">
                {incident.assignedResponderIds.length > 0 ? (
                  incident.assignedResponderIds.map((rId) => {
                    const resp = responders.find((r) => r.id === rId);
                    return (
                      <div key={rId} className="flex justify-between items-center p-2 bg-[#0d1c2d] border border-[#3d4947] rounded text-xs">
                        <span className="text-[#d4e4fa] font-medium">{resp?.name || rId}</span>
                        <span className="text-[10px] text-[#6bd8cb] font-mono">{resp?.rank}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#bcc9c6] italic">No ground personnel assigned yet.</p>
                )}
              </div>

              <div className="flex space-x-2">
                <select
                  value={selectedResponderId}
                  onChange={(e) => setSelectedResponderId(e.target.value)}
                  className="flex-1 bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-3 py-2 text-xs text-[#d4e4fa]"
                >
                  <option value="">-- Add Responder --</option>
                  {responders
                    .filter((r) => !incident.assignedResponderIds.includes(r.id))
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.rank})
                      </option>
                    ))}
                </select>
                <button
                  onClick={handleAddResponder}
                  className="px-3 py-2 bg-[#6bd8cb] text-[#003732] font-bold text-xs rounded-lg hover:brightness-110"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#bcc9c6] uppercase tracking-wider">
              Operator Log & Comments
            </h3>

            <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-1">
              {incident.notes.map((note) => (
                <div key={note.id} className="p-3 bg-[#0d1c2d] border border-[#3d4947] rounded-lg space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-[#6bd8cb]">{note.author} ({note.role})</span>
                    <span className="text-[#bcc9c6] font-mono">{note.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#d4e4fa] leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex space-x-2 pt-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log operator comment..."
                className="flex-1 bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-3 py-2 text-xs text-[#d4e4fa] focus:border-[#6bd8cb]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#6bd8cb] text-[#003732] rounded-lg hover:brightness-110"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {selectedImageModal && (
        <div 
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
        >
          <div className="relative max-w-4xl max-h-full bg-[#122131] p-4 border border-[#3d4947] rounded-xl">
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-2 right-2 p-2 bg-[#1c2b3c] text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedImageModal} alt="Expanded Evidence" className="max-h-[80vh] w-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};
