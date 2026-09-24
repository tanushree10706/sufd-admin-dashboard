import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MapComponent } from '../MapComponent';
import { Flame, Shield, Activity, AlertTriangle, ChevronRight, ScanEye } from 'lucide-react';

export const DashboardOverviewScreen: React.FC = () => {
  const { incidents, drones, forestZones, setActiveScreen, setSelectedIncidentId } = useCommandCenter();

  const activeIncidents = incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled');
  const criticalCount = activeIncidents.filter(i => i.priority === 'critical').length;
  const deployedDrones = drones.filter(d => d.status === 'en_route' || d.status === 'on_site').length;
  
  const incidentsWithContainment = activeIncidents.filter(i => i.containmentPercent !== undefined);
  const avgContainment = incidentsWithContainment.length > 0
    ? incidentsWithContainment.reduce((acc, i) => acc + (i.containmentPercent || 0), 0) / incidentsWithContainment.length
    : 0;

  const upToDateZones = forestZones.filter(z => z.surveillanceStatus === 'up_to_date').length;
  const dueZones = forestZones.filter(z => z.surveillanceStatus === 'due').length;
  const overdueZones = forestZones.filter(z => z.surveillanceStatus === 'overdue').length;

  const urgentZone = [...forestZones]
    .filter(z => z.surveillanceStatus !== 'up_to_date')
    .sort((a, b) => b.daysSinceSurveillance - a.daysSinceSurveillance)[0];

  const activityFeed = [
    { time: '14:22', text: 'Forest Officer reported wildfire — Western Ghats Reserve', type: 'alert' },
    { time: '14:18', text: 'Wildfire report received from citizen — Tadoba Andhari Tiger Reserve', type: 'info' },
    { time: '14:05', text: 'Response Base assigned to INC-IND-103', type: 'info' },
    { time: '13:58', text: 'Drone DRONE-GARUDA-03 reached incident coordinates', type: 'success' },
    { time: '13:45', text: 'Wildfire severity escalated to HIGH — INC-IND-102', type: 'alert' },
    { time: '13:30', text: 'Containment increased to 15% — INC-IND-104', type: 'success' },
    { time: '13:10', text: '⚠ Surveillance due: Sundarbans Biosphere (21 days)', type: 'alert' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* TOP STAT CARDS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-teal-300 cursor-pointer transition-all"
          onClick={() => setActiveScreen('dispatch')}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-2xl font-mono font-bold text-slate-900">{activeIncidents.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Active Wildfires</p>
        </div>
        
        <div
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-rose-300 cursor-pointer transition-all"
          onClick={() => setActiveScreen('dispatch')}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-2xl font-mono font-bold text-rose-600">{criticalCount}</span>
          </div>
          <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Critical Priority</p>
        </div>
        
        <div
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-teal-300 cursor-pointer transition-all"
          onClick={() => setActiveScreen('drones')}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-2xl font-mono font-bold text-slate-900">{deployedDrones}</span>
          </div>
          <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Drones Deployed</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-2xl font-mono font-bold text-slate-900">{avgContainment.toFixed(1)}%</span>
          </div>
          <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Avg Containment</p>
        </div>
        
        <div
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-teal-300 cursor-pointer transition-all col-span-2 md:col-span-1"
          onClick={() => setActiveScreen('ml_surveillance')}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <ScanEye className="w-5 h-5" />
            </div>
            <span className="text-2xl font-mono font-bold text-slate-900">{forestZones.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Zones Monitored</p>
        </div>
      </div>

      {/* MAP LEGEND */}
      <div className="flex items-center space-x-6 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs w-fit">
        <div className="flex items-center space-x-2 font-medium"><span className="text-base">🔥</span><span>Wildfire Incident</span></div>
        <div className="flex items-center space-x-2 font-medium"><span className="text-base">✈️</span><span>Active Drone</span></div>
        <div className="flex items-center space-x-2 font-medium"><span className="text-base">⛺</span><span>Response Base</span></div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Col */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden p-2">
            <MapComponent height="380px" />
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-900">Active Wildfire Incidents</h3>
              <button
                onClick={() => setActiveScreen('dispatch')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline"
              >
                View Full Queue <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Location / Sector</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {activeIncidents.slice(0, 5).map(inc => {
                    const srcBadge =
                      inc.detectionSource === 'citizen'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : inc.detectionSource === 'forest_officer'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200';
                    
                    return (
                      <tr 
                        key={inc.id} 
                        onClick={() => { setSelectedIncidentId(inc.id); setActiveScreen('incident_detail'); }}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${inc.slaBreached ? 'bg-rose-50/40' : ''}`}
                      >
                        <td className="px-5 py-3 font-mono text-xs text-teal-700 font-bold">{inc.id}</td>
                        <td className="px-5 py-3 text-xs font-medium text-slate-800">{inc.title}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inc.priority === 'critical'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inc.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-600 capitalize font-medium">{inc.status.replace('_', ' ')}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${srcBadge}`}>
                            {inc.detectionSource.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* SURVEILLANCE STATUS WIDGET */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-teal-50 text-teal-700">
                <ScanEye className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">SURVEILLANCE STATUS</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Zones</p>
                <p className="text-xl font-mono font-bold text-slate-800">{forestZones.length}</p>
              </div>
              <div 
                className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                  dueZones > 0 || overdueZones > 0
                    ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/70'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
                onClick={() => setActiveScreen('ml_surveillance')}
              >
                <p className={`text-[10px] uppercase font-bold ${dueZones > 0 || overdueZones > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                  Surveillance Due
                </p>
                <p className={`text-xl font-mono font-bold ${dueZones > 0 || overdueZones > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                  {dueZones + overdueZones}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs mb-4 px-1">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Up to Date: {upToDateZones}
              </span>
              <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Overdue: {overdueZones}
              </span>
            </div>
            
            {urgentZone && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-rose-800 uppercase">Urgent Zone: {urgentZone.name}</p>
                  <p className="text-[10px] text-rose-700 mt-0.5">
                    Not surveyed for {urgentZone.daysSinceSurveillance} days. Immediate drone patrol recommended.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVITY FEED */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-teal-50 text-teal-700">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">LIVE ACTIVITY FEED</h3>
            </div>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {activityFeed.map((entry, idx) => {
                const isAlert = entry.type === 'alert';
                const isSuccess = entry.type === 'success';
                return (
                  <div key={idx} className="flex gap-3 items-start relative before:content-[''] before:absolute before:left-2.5 before:top-6 before:bottom-[-16px] before:w-px before:bg-slate-200 last:before:hidden">
                    <div className={`w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center shrink-0 z-10 ${
                      isAlert ? 'border-rose-400' : isSuccess ? 'border-teal-500' : 'border-slate-300'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isAlert ? 'bg-rose-500' : isSuccess ? 'bg-teal-500' : 'bg-slate-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 mb-0.5">{entry.time} UTC</p>
                      <p className={`text-xs ${isAlert ? 'font-semibold text-rose-700' : 'text-slate-700'}`}>
                        {entry.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

