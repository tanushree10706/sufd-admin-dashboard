import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MapComponent } from '../MapComponent';
import { TreePine, Plane, Users, Clock, Activity, ChevronRight } from 'lucide-react';

export const StationsScreen: React.FC = () => {
  const { stations, incidents, setActiveScreen } = useCommandCenter();

  const totalBases = stations.length;
  const totalDronesDocked = stations.reduce((acc, st) => acc + st.dockedDrones, 0);
  const totalPersonnel = stations.reduce((acc, st) => acc + st.totalResponders, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#122131] border border-[#3d4947] rounded-xl">
            <TreePine className="w-6 h-6 text-[#6bd8cb]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#d4e4fa]">Response Bases & Fire Camps</h2>
            <p className="text-xs text-[#bcc9c6]">Operational wildland firefighting bases, drone staging areas, and field crew camps.</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-[#122131] border border-[#3d4947] px-4 py-2 rounded-lg text-center">
            <p className="text-[10px] font-bold text-[#bcc9c6] uppercase">Total Bases</p>
            <p className="text-lg font-mono font-bold text-[#d4e4fa]">{totalBases}</p>
          </div>
          <div className="bg-[#122131] border border-[#3d4947] px-4 py-2 rounded-lg text-center">
            <p className="text-[10px] font-bold text-[#bcc9c6] uppercase">Drones Docked</p>
            <p className="text-lg font-mono font-bold text-[#6bd8cb]">{totalDronesDocked}</p>
          </div>
          <div className="bg-[#122131] border border-[#3d4947] px-4 py-2 rounded-lg text-center">
            <p className="text-[10px] font-bold text-[#bcc9c6] uppercase">Total Personnel</p>
            <p className="text-lg font-mono font-bold text-[#d4e4fa]">{totalPersonnel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Station cards grid */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.map(st => {
            const utilizationColor = st.utilizationPercent > 85 ? 'bg-[#93000a]' : st.utilizationPercent > 60 ? 'bg-[#ca8100]' : 'bg-[#6bd8cb]';
            const avgMins = Math.floor(st.avgResponseTimeSec / 60);
            const avgSecs = st.avgResponseTimeSec % 60;

            return (
              <div key={st.id} className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TreePine className="w-5 h-5 text-[#6bd8cb]" />
                    <h3 className="font-bold text-[#d4e4fa] text-sm">{st.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#bcc9c6]">{st.id}</span>
                </div>
                <p className="text-xs text-[#bcc9c6] mb-4">{st.address}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#0d1c2d] p-2 rounded border border-[#3d4947]/50">
                    <p className="text-[10px] text-[#bcc9c6] uppercase flex items-center gap-1 mb-1"><Plane className="w-3 h-3" /> Drones Docked</p>
                    <p className="text-sm font-mono font-bold text-[#d4e4fa]">{st.dockedDrones}/{st.totalDrones}</p>
                    <div className="w-full bg-[#1c2b3c] h-1.5 mt-1 rounded-full overflow-hidden">
                      <div className="h-full bg-[#6bd8cb]" style={{ width: `${(st.dockedDrones / st.totalDrones) * 100}%` }} />
                    </div>
                  </div>
                  <div className="bg-[#0d1c2d] p-2 rounded border border-[#3d4947]/50">
                    <p className="text-[10px] text-[#bcc9c6] uppercase flex items-center gap-1 mb-1"><Users className="w-3 h-3" /> Available Crew</p>
                    <p className="text-sm font-mono font-bold text-[#d4e4fa]">{st.availableResponders}/{st.totalResponders}</p>
                    <div className="w-full bg-[#1c2b3c] h-1.5 mt-1 rounded-full overflow-hidden">
                      <div className="h-full bg-[#d4e4fa]" style={{ width: `${(st.availableResponders / st.totalResponders) * 100}%` }} />
                    </div>
                  </div>
                  <div className="bg-[#0d1c2d] p-2 rounded border border-[#3d4947]/50">
                    <p className="text-[10px] text-[#bcc9c6] uppercase flex items-center gap-1 mb-1"><Clock className="w-3 h-3" /> Avg Response</p>
                    <p className="text-sm font-mono font-bold text-[#ffb95f]">{avgMins}m {avgSecs}s</p>
                  </div>
                  <div className="bg-[#0d1c2d] p-2 rounded border border-[#3d4947]/50">
                    <p className="text-[10px] text-[#bcc9c6] uppercase flex items-center gap-1 mb-1"><Activity className="w-3 h-3" /> Utilization</p>
                    <p className="text-sm font-mono font-bold text-[#d4e4fa]">{st.utilizationPercent}%</p>
                    <div className="w-full bg-[#1c2b3c] h-1.5 mt-1 rounded-full overflow-hidden">
                      <div className={`h-full ${utilizationColor}`} style={{ width: `${st.utilizationPercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-[#3d4947]/50">
                  <button 
                    onClick={() => setActiveScreen('dispatch')}
                    className="w-full py-1.5 border border-[#3d4947] hover:bg-[#1c2b3c] transition-colors rounded text-xs font-bold text-[#d4e4fa] flex items-center justify-center gap-1"
                  >
                    View Incidents <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Map and Incidents */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl h-64 overflow-hidden relative">
            <MapComponent height="100%" showDrones={false} />
          </div>
          
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-4">
            <h3 className="font-bold text-sm text-[#d4e4fa] mb-3">Active Incidents by Base</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {stations.map(st => {
                const baseIncidents = incidents.filter(i => i.assignedStationId === st.id && i.status !== 'resolved' && i.status !== 'cancelled');
                
                return (
                  <div key={st.id} className="border-b border-[#3d4947]/50 pb-2 last:border-0 last:pb-0">
                    <p className="text-xs font-bold text-[#bcc9c6] mb-1">{st.name}</p>
                    {baseIncidents.length === 0 ? (
                      <p className="text-[10px] text-[#bcc9c6]/50 italic">No active incidents</p>
                    ) : (
                      <div className="space-y-1">
                        {baseIncidents.map(inc => (
                          <div key={inc.id} className="flex justify-between items-center bg-[#0d1c2d] px-2 py-1 rounded">
                            <span className="text-[10px] font-mono text-[#6bd8cb] cursor-pointer hover:underline" onClick={() => setActiveScreen('incident_detail')}>{inc.id}</span>
                            <span className={`text-[9px] px-1 py-0.5 rounded font-bold uppercase ${inc.priority === 'critical' ? 'bg-[#93000a] text-[#ffb4ab]' : 'bg-[#ca8100] text-[#ffb95f]'}`}>{inc.priority}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
