import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { SURVEILLANCE_INTERVAL_DAYS, SURVEILLANCE_OVERDUE_DAYS } from '../../types/dashboard';
import { ScanEye, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const SurveillanceScreen: React.FC = () => {
  const { forestZones, surveillanceRecords, setActiveScreen } = useCommandCenter();

  const upToDateCount = forestZones.filter(z => z.surveillanceStatus === 'up_to_date').length;
  const dueCount = forestZones.filter(z => z.surveillanceStatus === 'due').length;
  const overdueCount = forestZones.filter(z => z.surveillanceStatus === 'overdue').length;

  const sortedRecords = [...surveillanceRecords].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const getTerrainColor = (terrain: string) => {
    switch(terrain) {
      case 'forest': return 'text-[#6bd8cb] bg-[#29a195]/20';
      case 'shrubland': return 'text-[#ffb95f] bg-[#ca8100]/20';
      case 'grassland': return 'text-[#d4e4fa] bg-[#273647]';
      default: return 'text-[#d4e4fa] bg-[#273647]';
    }
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'N/A';
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diffMs = e - s;
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#122131] border border-[#3d4947] rounded-xl">
            <ScanEye className="w-6 h-6 text-[#6bd8cb]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#d4e4fa]">Last Surveillance</h2>
            <p className="text-xs text-[#bcc9c6]">Preventive forest zone monitoring. Track drone patrol coverage and schedule surveillance for overdue sectors.</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-[#122131] border border-[#3d4947] px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="text-[10px] font-bold text-[#bcc9c6] uppercase">Total</span>
            <span className="text-sm font-mono font-bold text-[#d4e4fa]">{forestZones.length}</span>
          </div>
          <div className="bg-[#122131] border border-[#3d4947] px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="text-[10px] font-bold text-[#bcc9c6] uppercase">Up to Date</span>
            <span className="text-sm font-mono font-bold text-[#6bd8cb]">{upToDateCount}</span>
          </div>
          <div className="bg-[#122131] border border-[#3d4947] px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="text-[10px] font-bold text-[#bcc9c6] uppercase">Due</span>
            <span className="text-sm font-mono font-bold text-[#ffb95f]">{dueCount}</span>
          </div>
          <div className="bg-[#122131] border border-[#3d4947] px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="text-[10px] font-bold text-[#bcc9c6] uppercase">Overdue</span>
            <span className="text-sm font-mono font-bold text-[#ffb4ab]">{overdueCount}</span>
          </div>
        </div>
      </div>

      {/* THRESHOLD NOTICE */}
      <div className="bg-[#0d1c2d] border border-[#3d4947] rounded-lg p-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#bcc9c6]" />
        <span className="text-xs text-[#bcc9c6] font-mono">Surveillance threshold: Every {SURVEILLANCE_INTERVAL_DAYS} days | Overdue after {SURVEILLANCE_OVERDUE_DAYS} days</span>
      </div>

      {/* ZONE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {forestZones.map(zone => {
          const isUpToDate = zone.surveillanceStatus === 'up_to_date';
          const isDue = zone.surveillanceStatus === 'due';
          const isOverdue = zone.surveillanceStatus === 'overdue';
          
          const statusBg = isOverdue ? 'bg-[#93000a]/20 border-[#ffb4ab]/30' : isDue ? 'bg-[#ca8100]/20 border-[#ca8100]/30' : 'bg-[#29a195]/20 border-[#6bd8cb]/30';
          const statusText = isOverdue ? 'text-[#ffb4ab]' : isDue ? 'text-[#ffb95f]' : 'text-[#6bd8cb]';
          const progressColor = isOverdue ? 'bg-[#ffb4ab]' : isDue ? 'bg-[#ffb95f]' : 'bg-[#6bd8cb]';
          const progressPercent = Math.min((zone.daysSinceSurveillance / SURVEILLANCE_OVERDUE_DAYS) * 100, 100);

          return (
            <div key={zone.id} className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[#d4e4fa] text-base">{zone.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${getTerrainColor(zone.terrainType)}`}>
                      {zone.terrainType}
                    </span>
                    <span className="text-xs text-[#bcc9c6]">{zone.areaHectares.toLocaleString()} ha</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 border rounded text-[10px] uppercase font-bold ${statusBg} ${statusText} ${!isUpToDate ? 'animate-pulse' : ''}`}>
                  {!isUpToDate ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  <span>{isOverdue ? 'Overdue' : isDue ? 'Surveillance Due' : 'Up to Date'}</span>
                </div>
              </div>

              <div className="bg-[#0d1c2d] p-3 rounded border border-[#3d4947]/50 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#bcc9c6]">Last Surveyed</span>
                  <span className="text-[#d4e4fa]">{zone.lastSurveillanceDate || 'Never'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#bcc9c6]">Days Since</span>
                  <span className="font-mono text-[#d4e4fa]">{zone.daysSinceSurveillance} days</span>
                </div>
                <div className="w-full bg-[#1c2b3c] h-1.5 mt-2 rounded-full overflow-hidden">
                  <div className={`h-full ${progressColor}`} style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {!isUpToDate && (
                <div className={`text-xs p-2 rounded border ${isOverdue ? 'bg-[#93000a]/10 border-[#ffb4ab]/20 text-[#ffb4ab]' : 'bg-[#ca8100]/10 border-[#ca8100]/20 text-[#ffb95f]'}`}>
                  ⚠ SURVEILLANCE DUE — Recommended: Schedule drone surveillance for {zone.name}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                <button className="py-2 border border-[#6bd8cb] text-[#6bd8cb] text-xs font-bold rounded-lg hover:bg-[#6bd8cb]/10 transition-colors">
                  Schedule Surveillance
                </button>
                <button 
                  onClick={() => setActiveScreen('drones')}
                  className="py-2 bg-[#6bd8cb] text-[#051424] text-xs font-bold rounded-lg hover:brightness-110 transition-colors"
                >
                  Dispatch Drone
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden mt-6">
        <div className="p-5 border-b border-[#3d4947]">
          <h3 className="font-bold text-[#d4e4fa] text-base">Surveillance Flight History</h3>
          <p className="text-xs text-[#bcc9c6] mt-1">Records of completed drone patrol missions over forest zones.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0d1c2d] border-b border-[#3d4947] text-[10px] font-bold uppercase text-[#bcc9c6]">
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Forest Zone</th>
                <th className="px-5 py-3">Drone ID</th>
                <th className="px-5 py-3">Operator</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Result / Status</th>
                <th className="px-5 py-3">Fire Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3d4947]/50 text-sm">
              {sortedRecords.map(record => {
                const zone = forestZones.find(z => z.id === record.zoneId);
                const isFireDetected = record.status === 'fire_detected';
                
                return (
                  <tr key={record.id} className="hover:bg-[#1c2b3c] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-[#d4e4fa]">{record.startedAt.substring(0, 16).replace('T', ' ')}</td>
                    <td className="px-5 py-3 text-xs text-[#d4e4fa]">{zone?.name || record.zoneId}</td>
                    <td className="px-5 py-3 font-mono text-xs text-[#6bd8cb]">{record.droneId}</td>
                    <td className="px-5 py-3 text-xs text-[#bcc9c6]">{record.operator}</td>
                    <td className="px-5 py-3 text-xs font-mono text-[#bcc9c6]">{formatDuration(record.startedAt, record.completedAt ?? undefined)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        record.status === 'completed' ? 'bg-[#29a195]/20 text-[#6bd8cb] border border-[#6bd8cb]/30' :
                        isFireDetected ? 'bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30' :
                        'bg-[#ca8100]/20 text-[#ffb95f] border border-[#ca8100]/30'
                      }`}>
                        {record.status === 'completed' ? 'Completed' : isFireDetected ? '⚠ Fire Detected' : 'In Progress'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {isFireDetected && record.detectionIncidentId ? (
                        <button 
                          onClick={() => { /* Navigate to incident detail if needed */ }}
                          className="px-2 py-0.5 bg-[#122131] border border-[#6bd8cb] text-[#6bd8cb] rounded-full text-[10px] font-mono hover:bg-[#6bd8cb]/20"
                        >
                          {record.detectionIncidentId}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#bcc9c6]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-[#0d1c2d] border-t border-[#3d4947] text-xs text-[#bcc9c6] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#6bd8cb] shrink-0" />
          <p><strong>IMPORTANT:</strong> A surveillance record tracks when a zone was patrolled. If fire is detected during patrol, a separate Wildfire Incident is created and linked here.</p>
        </div>
      </div>
    </div>
  );
};
