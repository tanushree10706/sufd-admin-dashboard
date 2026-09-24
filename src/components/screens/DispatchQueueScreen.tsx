import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MapComponent } from '../MapComponent';
import {
  Siren,
  AlertTriangle,
  Filter,
  ArrowUpDown,
  Send,
  TreePine,
  Users
} from 'lucide-react';

export const DispatchQueueScreen: React.FC = () => {
  const {
    incidents,
    drones,
    stations,
    responders,
    assignNearestDrone,
    setSelectedIncidentId,
    setActiveScreen
  } = useCommandCenter();

  const pendingList = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'cancelled'
  );

  const slaBreaches = pendingList.filter((i) => i.slaBreached);
  const activeDronesCount = drones.filter((d) => d.status === 'idle').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Sub-navigation tabs for Consolidated Operations */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveScreen('dispatch')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-teal-600 text-white shadow-xs"
        >
          <Siren className="w-3.5 h-3.5" />
          <span>Incident Triage Queue</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-800 text-white">
            {pendingList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveScreen('stations')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <TreePine className="w-3.5 h-3.5 text-slate-500" />
          <span>Response Bases</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
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

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-slate-200 shadow-xs rounded-xl">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Queue</p>
          <p className="text-3xl font-mono font-bold text-slate-900">
            {pendingList.length.toString().padStart(2, '0')}
          </p>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs rounded-xl">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Average Wait Time</p>
          <p className="text-3xl font-mono font-bold text-amber-600">04m 12s</p>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs rounded-xl">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">SLA Breaches</p>
          <p className="text-3xl font-mono font-bold text-rose-600">
            {slaBreaches.length.toString().padStart(2, '0')}
          </p>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs rounded-xl">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ready Drones</p>
          <p className="text-3xl font-mono font-bold text-teal-700">
            {activeDronesCount}/{drones.length}
          </p>
        </div>
      </div>

      {/* Main Dispatch Queue Table */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-teal-50 text-teal-700">
              <Siren className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Active Wildfire Incident Triage Queue</h2>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1 shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter
            </button>
            <button className="px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" /> Sort: SLA Wait Time
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <th className="px-6 py-3">Incident ID</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Wait Time</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Suggested Unit</th>
                <th className="px-6 py-3">Station</th>
                <th className="px-6 py-3 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pendingList.map((inc) => {
                const isSlaBreached = inc.slaBreached;
                const isWarning = inc.waitTimeSeconds > 180 && !isSlaBreached;

                return (
                  <tr
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      setActiveScreen('incident_detail');
                    }}
                    className={`transition-colors cursor-pointer hover:bg-slate-50 ${
                      isSlaBreached
                        ? 'bg-rose-50/50'
                        : isWarning
                        ? 'bg-amber-50/40'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-teal-700 font-bold">{inc.id}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">{inc.address}</td>
                    <td className="px-6 py-4 font-mono font-bold">
                      <span className={isSlaBreached ? 'text-rose-600 flex items-center gap-1' : 'text-amber-600'}>
                        {Math.floor(inc.waitTimeSeconds / 60)}m {(inc.waitTimeSeconds % 60).toString().padStart(2, '0')}s
                        {isSlaBreached && <AlertTriangle className="w-3.5 h-3.5 inline text-rose-600" />}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inc.priority === 'critical'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {inc.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                      {inc.assignedDroneId || 'DRONE-GARUDA-01 (Suggested)'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {stations.find((s) => s.id === inc.assignedStationId)?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => assignNearestDrone(inc.id)}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 ml-auto transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Assign Nearest Drone</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asymmetric Bottom Layout: Map Surveillance + Station Load Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-xs rounded-xl h-80 relative overflow-hidden p-2">
          <MapComponent height="100%" />
        </div>

        {/* Station Readiness Status */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TreePine className="w-4 h-4 text-teal-600" /> Response Base Readiness
          </h3>

          <div className="space-y-4">
            {stations.map((st) => (
              <div key={st.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold">{st.name}</span>
                  <span className="font-mono text-teal-700 font-bold">{st.dockedDrones}/{st.totalDrones} Ready</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600"
                    style={{ width: `${(st.dockedDrones / st.totalDrones) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveScreen('stations')}
            className="w-full mt-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 uppercase hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            Manage Response Bases
          </button>
        </div>
      </div>
    </div>
  );
};

