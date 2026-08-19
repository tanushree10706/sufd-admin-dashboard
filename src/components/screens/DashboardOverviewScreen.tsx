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
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-4 stat-card-glow cursor-pointer" onClick={() => setActiveScreen('dispatch')}>
          <div className="flex justify-between items-start mb-2">
            <Flame className="w-5 h-5 text-[#6bd8cb]" />
            <span className="text-2xl font-mono font-bold text-[#d4e4fa]">{activeIncidents.length}</span>
          </div>
          <p className="text-[10px] text-[#bcc9c6] uppercase font-bold tracking-wider">Active Wildfires</p>
        </div>
        
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-4 stat-card-glow cursor-pointer" onClick={() => setActiveScreen('dispatch')}>
          <div className="flex justify-between items-start mb-2">
            <AlertTriangle className="w-5 h-5 text-[#ffb4ab]" />
            <span className="text-2xl font-mono font-bold text-[#ffb4ab]">{criticalCount}</span>
          </div>
          <p className="text-[10px] text-[#bcc9c6] uppercase font-bold tracking-wider">Critical</p>
        </div>
        
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-4 stat-card-glow cursor-pointer" onClick={() => setActiveScreen('drones')}>
          <div className="flex justify-between items-start mb-2">
            <Activity className="w-5 h-5 text-[#6bd8cb]" />
            <span className="text-2xl font-mono font-bold text-[#d4e4fa]">{deployedDrones}</span>
          </div>
          <p className="text-[10px] text-[#bcc9c6] uppercase font-bold tracking-wider">Drones Deployed</p>
        </div>
        
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-4 stat-card-glow">
          <div className="flex justify-between items-start mb-2">
            <Shield className="w-5 h-5 text-[#6bd8cb]" />
            <span className="text-2xl font-mono font-bold text-[#d4e4fa]">{avgContainment.toFixed(1)}%</span>
          </div>
          <p className="text-[10px] text-[#bcc9c6] uppercase font-bold tracking-wider">Avg Containment</p>
        </div>
        
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-4 stat-card-glow cursor-pointer" onClick={() => setActiveScreen('surveillance')}>
          <div className="flex justify-between items-start mb-2">
            <ScanEye className="w-5 h-5 text-[#6bd8cb]" />
            <span className="text-2xl font-mono font-bold text-[#d4e4fa]">{forestZones.length}</span>
          </div>
          <p className="text-[10px] text-[#bcc9c6] uppercase font-bold tracking-wider">Zones Monitored</p>
        </div>
      </div>

      {/* MAP LEGEND */}
      <div className="flex items-center space-x-6 text-xs text-[#bcc9c6] bg-[#0d1c2d] p-2 rounded-lg border border-[#3d4947] w-fit">
        <div className="flex items-center space-x-2"><span className="text-lg">🔥</span><span>Wildfire Incident</span></div>
        <div className="flex items-center space-x-2"><span className="text-lg">✈️</span><span>Active Drone</span></div>
        <div className="flex items-center space-x-2"><span className="text-lg">⛺</span><span>Response Base</span></div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Col */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden p-2">
            <MapComponent height="380px" />
          </div>
          
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#3d4947] flex justify-between items-center">
              <h3 className="font-bold text-sm text-[#d4e4fa]">Active Wildfire Incidents</h3>
              <button onClick={() => setActiveScreen('dispatch')} className="text-xs text-[#6bd8cb] hover:underline flex items-center">View All <ChevronRight className="w-3 h-3" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0d1c2d] text-[10px] font-bold uppercase text-[#bcc9c6]">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Location / Sector</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3d4947]/50 text-sm">
                  {activeIncidents.slice(0, 5).map(inc => {
                    const srcBadge = inc.detectionSource === 'citizen' ? 'bg-[#29a195]/20 text-[#6bd8cb]' : 
                                     inc.detectionSource === 'forest_officer' ? 'bg-[#ca8100]/20 text-[#ffb95f]' : 
                                     'bg-[#8b5cf6]/20 text-[#c4b5fd]';
                    
                    return (
                      <tr 
                        key={inc.id} 
                        onClick={() => { setSelectedIncidentId(inc.id); setActiveScreen('incident_detail'); }}
                        className={`hover:bg-[#1c2b3c] cursor-pointer transition-colors ${inc.slaBreached ? 'sla-red-pulse' : ''}`}
                      >
                        <td className="px-5 py-3 font-mono text-xs text-[#6bd8cb] font-bold">{inc.id}</td>
                        <td className="px-5 py-3 text-xs text-[#d4e4fa]">{inc.title}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inc.priority === 'critical' ? 'bg-[#93000a] text-white' : 'bg-[#ca8100] text-white'}`}>
                            {inc.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-[#bcc9c6] capitalize">{inc.status.replace('_', ' ')}</td>
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
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ScanEye className="w-5 h-5 text-[#6bd8cb]" />
              <h3 className="font-bold text-sm text-[#d4e4fa]">SURVEILLANCE STATUS</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0d1c2d] border border-[#3d4947] rounded-lg p-3 text-center">
                <p className="text-[10px] text-[#bcc9c6] uppercase font-bold">Total Zones</p>
                <p className="text-xl font-mono font-bold text-[#d4e4fa]">{forestZones.length}</p>
              </div>
              <div 
                className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                  dueZones > 0 || overdueZones > 0 ? 'bg-[#ca8100]/20 border-[#ca8100]/40 hover:bg-[#ca8100]/30' : 'bg-[#0d1c2d] border-[#3d4947] hover:bg-[#1c2b3c]'
                }`}
                onClick={() => setActiveScreen('surveillance')}
              >
                <p className={`text-[10px] uppercase font-bold ${dueZones > 0 || overdueZones > 0 ? 'text-[#ffb95f]' : 'text-[#bcc9c6]'}`}>Surveillance Due</p>
                <p className={`text-xl font-mono font-bold ${dueZones > 0 || overdueZones > 0 ? 'text-[#ffb95f]' : 'text-[#d4e4fa]'}`}>{dueZones + overdueZones}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs mb-4 px-1">
              <span className="text-[#bcc9c6] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#29a195]" /> Up to Date: {upToDateZones}</span>
              <span className="text-[#ffb4ab] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ffb4ab]" /> Overdue: {overdueZones}</span>
            </div>
            
            {urgentZone && (
              <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 p-3 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ffb4ab] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-[#ffb4ab] uppercase">Urgent Zone: {urgentZone.name}</p>
                  <p className="text-[10px] text-[#ffb4ab]/80">Not surveyed for {urgentZone.daysSinceSurveillance} days. Recommend immediate drone patrol.</p>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVITY FEED */}
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-[#6bd8cb]" />
              <h3 className="font-bold text-sm text-[#d4e4fa]">LIVE ACTIVITY</h3>
            </div>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {activityFeed.map((entry, idx) => {
                const color = entry.type === 'alert' ? 'text-[#ffb4ab] border-[#ffb4ab]' : 
                              entry.type === 'success' ? 'text-[#6bd8cb] border-[#6bd8cb]' : 
                              'text-[#d4e4fa] border-[#3d4947]';
                return (
                  <div key={idx} className="flex gap-3 items-start relative before:content-[''] before:absolute before:left-2.5 before:top-6 before:bottom-[-16px] before:w-px before:bg-[#3d4947] last:before:hidden">
                    <div className={`w-5 h-5 rounded-full border-2 bg-[#051424] flex items-center justify-center shrink-0 z-10 ${color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${entry.type === 'alert' ? 'bg-[#ffb4ab]' : entry.type === 'success' ? 'bg-[#6bd8cb]' : 'bg-[#bcc9c6]'}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-[#bcc9c6] mb-0.5">{entry.time} UTC</p>
                      <p className={`text-xs ${entry.type === 'alert' ? 'font-bold text-[#ffb4ab]' : 'text-[#d4e4fa]'}`}>{entry.text}</p>
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
