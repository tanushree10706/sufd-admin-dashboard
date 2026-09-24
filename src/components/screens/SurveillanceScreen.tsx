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
      case 'forest': return 'text-teal-700 bg-teal-50 border border-teal-200';
      case 'shrubland': return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'grassland': return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      default: return 'text-slate-700 bg-slate-100 border border-slate-200';
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
          <div className="p-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl">
            <ScanEye className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Forest Zone Patrol Coverage</h2>
            <p className="text-xs text-slate-500">Preventive forest zone monitoring. Track drone patrol coverage and schedule surveillance for overdue sectors.</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-white border border-slate-200 shadow-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
            <span className="text-sm font-mono font-bold text-slate-900">{forestZones.length}</span>
          </div>
          <div className="bg-white border border-slate-200 shadow-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Up to Date</span>
            <span className="text-sm font-mono font-bold text-emerald-600">{upToDateCount}</span>
          </div>
          <div className="bg-white border border-slate-200 shadow-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Due</span>
            <span className="text-sm font-mono font-bold text-amber-600">{dueCount}</span>
          </div>
          <div className="bg-white border border-slate-200 shadow-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Overdue</span>
            <span className="text-sm font-mono font-bold text-rose-600">{overdueCount}</span>
          </div>
        </div>
      </div>

      {/* THRESHOLD NOTICE */}
      <div className="bg-slate-50 border border-slate-200 shadow-xs rounded-xl p-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-slate-500" />
        <span className="text-xs text-slate-600 font-mono">Surveillance interval: Every {SURVEILLANCE_INTERVAL_DAYS} days | Overdue threshold: {SURVEILLANCE_OVERDUE_DAYS} days</span>
      </div>

      {/* ZONE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {forestZones.map(zone => {
          const isUpToDate = zone.surveillanceStatus === 'up_to_date';
          const isDue = zone.surveillanceStatus === 'due';
          const isOverdue = zone.surveillanceStatus === 'overdue';
          
          const statusBg = isOverdue ? 'bg-rose-50 border-rose-200 text-rose-700' : isDue ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700';
          const progressColor = isOverdue ? 'bg-rose-500' : isDue ? 'bg-amber-500' : 'bg-emerald-500';
          const progressPercent = Math.min((zone.daysSinceSurveillance / SURVEILLANCE_OVERDUE_DAYS) * 100, 100);

          return (
            <div key={zone.id} className="bg-white border border-slate-200 shadow-xs hover:shadow-md rounded-xl p-5 flex flex-col space-y-4 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{zone.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${getTerrainColor(zone.terrainType)}`}>
                      {zone.terrainType}
                    </span>
                    <span className="text-xs text-slate-500">{zone.areaHectares.toLocaleString()} ha</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 border rounded-md text-[10px] uppercase font-bold ${statusBg}`}>
                  {!isUpToDate ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  <span>{isOverdue ? 'Overdue' : isDue ? 'Surveillance Due' : 'Up to Date'}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Last Surveyed</span>
                  <span className="text-slate-800 font-medium">{zone.lastSurveillanceDate || 'Never'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Days Since Patrol</span>
                  <span className="font-mono text-slate-900 font-semibold">{zone.daysSinceSurveillance} days</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full overflow-hidden">
                  <div className={`h-full ${progressColor}`} style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {!isUpToDate && (
                <div className={`text-xs p-2 rounded-lg border ${isOverdue ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  ⚠ SURVEILLANCE DUE — Recommended: Dispatch drone surveillance for {zone.name}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                <button className="py-2 border border-teal-600 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-50 transition-colors">
                  Schedule Patrol
                </button>
                <button 
                  onClick={() => setActiveScreen('drones')}
                  className="py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  Dispatch Drone
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900 text-base">Surveillance Flight History</h3>
          <p className="text-xs text-slate-500 mt-1">Records of completed drone patrol missions over forest sectors.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Forest Zone</th>
                <th className="px-5 py-3">Drone ID</th>
                <th className="px-5 py-3">Operator</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Result / Status</th>
                <th className="px-5 py-3">Hazard Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedRecords.map(record => {
                const zone = forestZones.find(z => z.id === record.zoneId);
                const isFireDetected = record.status === 'fire_detected';
                
                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-700">{record.startedAt.substring(0, 16).replace('T', ' ')}</td>
                    <td className="px-5 py-3 text-xs text-slate-900 font-medium">{zone?.name || record.zoneId}</td>
                    <td className="px-5 py-3 font-mono text-xs text-teal-700 font-bold">{record.droneId}</td>
                    <td className="px-5 py-3 text-xs text-slate-600">{record.operator}</td>
                    <td className="px-5 py-3 text-xs font-mono text-slate-500">{formatDuration(record.startedAt, record.completedAt ?? undefined)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        record.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isFireDetected ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {record.status === 'completed' ? 'Completed' : isFireDetected ? '⚠ Threat Detected' : 'In Progress'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {isFireDetected && record.detectionIncidentId ? (
                        <button 
                          onClick={() => { setActiveScreen('dispatch'); }}
                          className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-[10px] font-mono hover:bg-rose-100 font-bold"
                        >
                          {record.detectionIncidentId}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

