import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MapComponent } from '../MapComponent';
import { TreePine, Plane, Users, Clock, Activity, ChevronRight, Siren } from 'lucide-react';

export const StationsScreen: React.FC = () => {
  const { stations, incidents, responders, setActiveScreen } = useCommandCenter();

  const totalBases = stations.length;
  const totalDronesDocked = stations.reduce((acc, st) => acc + st.dockedDrones, 0);
  const totalPersonnel = stations.reduce((acc, st) => acc + st.totalResponders, 0);
  const pendingCount = incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Sub-navigation tabs for Consolidated Operations */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveScreen('dispatch')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Siren className="w-3.5 h-3.5 text-slate-500" />
          <span>Incident Triage Queue</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {pendingCount}
          </span>
        </button>
        <button
          onClick={() => setActiveScreen('stations')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-teal-600 text-white shadow-xs"
        >
          <TreePine className="w-3.5 h-3.5" />
          <span>Response Bases</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-800 text-white">
            {stations.length}
          </span>
        </button>
        <button
          onClick={() => setActiveScreen('personnel')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>Field Responders</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {responders.length}
          </span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl">
            <TreePine className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Response Bases & Fire Camps</h2>
            <p className="text-xs text-slate-500">Operational wildland firefighting bases, drone staging areas, and field crew camps.</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 shadow-xs px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Bases</p>
            <p className="text-lg font-mono font-bold text-slate-900">{totalBases}</p>
          </div>
          <div className="bg-white border border-slate-200 shadow-xs px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Drones Docked</p>
            <p className="text-lg font-mono font-bold text-teal-700">{totalDronesDocked}</p>
          </div>
          <div className="bg-white border border-slate-200 shadow-xs px-4 py-2 rounded-xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Personnel</p>
            <p className="text-lg font-mono font-bold text-slate-900">{totalPersonnel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Station cards grid */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.map(st => {
            const utilizationColor = st.utilizationPercent > 85 ? 'bg-rose-500' : st.utilizationPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500';
            const avgMins = Math.floor(st.avgResponseTimeSec / 60);
            const avgSecs = st.avgResponseTimeSec % 60;

            return (
              <div key={st.id} className="bg-white border border-slate-200 shadow-xs hover:shadow-md rounded-xl p-5 flex flex-col transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TreePine className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-slate-900 text-sm">{st.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{st.id}</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{st.address}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1 mb-1">
                      <Plane className="w-3 h-3 text-teal-600" /> Drones Docked
                    </p>
                    <p className="text-sm font-mono font-bold text-slate-900">{st.dockedDrones}/{st.totalDrones}</p>
                    <div className="w-full bg-slate-200 h-1.5 mt-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600" style={{ width: `${(st.dockedDrones / st.totalDrones) * 100}%` }} />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1 mb-1">
                      <Users className="w-3 h-3 text-sky-600" /> Available Crew
                    </p>
                    <p className="text-sm font-mono font-bold text-slate-900">{st.availableResponders}/{st.totalResponders}</p>
                    <div className="w-full bg-slate-200 h-1.5 mt-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-600" style={{ width: `${(st.availableResponders / st.totalResponders) * 100}%` }} />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-amber-600" /> Avg Response
                    </p>
                    <p className="text-sm font-mono font-bold text-amber-700">{avgMins}m {avgSecs}s</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1 mb-1">
                      <Activity className="w-3 h-3 text-teal-600" /> Utilization
                    </p>
                    <p className="text-sm font-mono font-bold text-slate-900">{st.utilizationPercent}%</p>
                    <div className="w-full bg-slate-200 h-1.5 mt-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${utilizationColor}`} style={{ width: `${st.utilizationPercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => setActiveScreen('dispatch')}
                    className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 transition-colors rounded-lg text-xs font-bold text-teal-700 flex items-center justify-center gap-1 shadow-xs"
                  >
                    View Assigned Incidents <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Map and Incidents */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl h-64 overflow-hidden relative p-1.5">
            <MapComponent height="100%" showDrones={false} />
          </div>
          
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Active Incidents by Base</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {stations.map(st => {
                const baseIncidents = incidents.filter(i => i.assignedStationId === st.id && i.status !== 'resolved' && i.status !== 'cancelled');
                
                return (
                  <div key={st.id} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                    <p className="text-xs font-bold text-slate-700 mb-1">{st.name}</p>
                    {baseIncidents.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">No active incidents</p>
                    ) : (
                      <div className="space-y-1">
                        {baseIncidents.map(inc => (
                          <div key={inc.id} className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <span
                              className="text-[10px] font-mono text-teal-700 font-bold cursor-pointer hover:underline"
                              onClick={() => setActiveScreen('incident_detail')}
                            >
                              {inc.id}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              inc.priority === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {inc.priority}
                            </span>
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

