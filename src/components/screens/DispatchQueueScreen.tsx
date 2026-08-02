import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MapComponent } from '../MapComponent';
import {
  Siren,
  AlertTriangle,
  Filter,
  ArrowUpDown,
  Send,
  Building2
} from 'lucide-react';

export const DispatchQueueScreen: React.FC = () => {
  const {
    incidents,
    drones,
    stations,
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
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1c2d] p-4 border border-[#3d4947] rounded-lg">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-1">Pending Queue</p>
          <p className="text-3xl font-mono font-bold text-[#d4e4fa]">
            {pendingList.length.toString().padStart(2, '0')}
          </p>
        </div>

        <div className="bg-[#0d1c2d] p-4 border border-[#3d4947] rounded-lg">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-1">Average Wait Time</p>
          <p className="text-3xl font-mono font-bold text-[#ffb95f]">04m 12s</p>
        </div>

        <div className="bg-[#0d1c2d] p-4 border border-[#3d4947] rounded-lg">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-1">SLA Breaches</p>
          <p className="text-3xl font-mono font-bold text-[#ffb4ab]">
            {slaBreaches.length.toString().padStart(2, '0')}
          </p>
        </div>

        <div className="bg-[#0d1c2d] p-4 border border-[#3d4947] rounded-lg">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-1">Ready Drones</p>
          <p className="text-3xl font-mono font-bold text-[#6bd8cb]">
            {activeDronesCount}/{drones.length}
          </p>
        </div>
      </div>

      {/* Main Dispatch Queue Table */}
      <div className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#1c2b3c] border-b border-[#3d4947] flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Siren className="w-5 h-5 text-[#6bd8cb]" />
            <h2 className="text-base font-bold text-[#d4e4fa]">Active Dispatch Queue Triage</h2>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-[#0d1c2d] border border-[#3d4947] text-xs font-bold text-[#d4e4fa] rounded flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button className="px-3 py-1 bg-[#0d1c2d] border border-[#3d4947] text-xs font-bold text-[#d4e4fa] rounded flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort: SLA Wait Time
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0d1c2d] border-b border-[#3d4947] text-[11px] font-bold uppercase text-[#bcc9c6]">
                <th className="px-6 py-3">Incident ID</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Wait Time</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Suggested Unit</th>
                <th className="px-6 py-3">Station</th>
                <th className="px-6 py-3 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3d4947]/50 text-sm">
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
                    className={`transition-colors cursor-pointer hover:bg-[#273647] ${
                      isSlaBreached
                        ? 'sla-red-pulse'
                        : isWarning
                        ? 'sla-amber'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-[#6bd8cb] font-bold">{inc.id}</td>
                    <td className="px-6 py-4 text-[#d4e4fa]">{inc.address}</td>
                    <td className="px-6 py-4 font-mono font-bold">
                      <span className={isSlaBreached ? 'text-[#ffb4ab] flex items-center gap-1' : 'text-[#ffb95f]'}>
                        {Math.floor(inc.waitTimeSeconds / 60)}m {(inc.waitTimeSeconds % 60).toString().padStart(2, '0')}s
                        {isSlaBreached && <AlertTriangle className="w-3.5 h-3.5 inline" />}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inc.priority === 'critical'
                            ? 'bg-[#93000a] text-white'
                            : 'bg-[#ca8100] text-white'
                        }`}
                      >
                        {inc.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#d4e4fa]">
                      {inc.assignedDroneId || 'Vulcan-9 (Suggested)'}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#bcc9c6]">Station Alpha (Downtown)</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => assignNearestDrone(inc.id)}
                        className="px-4 py-1.5 bg-[#6bd8cb] text-[#003732] text-xs font-bold rounded-lg hover:brightness-110 flex items-center space-x-1 ml-auto"
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
        <div className="lg:col-span-2 bg-[#122131] border border-[#3d4947] rounded-xl h-80 relative overflow-hidden">
          <MapComponent height="100%" />
        </div>

        {/* Station Readiness Status */}
        <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-[#d4e4fa] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#6bd8cb]" /> Station Unit Readiness
          </h3>

          <div className="space-y-4">
            {stations.map((st) => (
              <div key={st.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#d4e4fa] font-medium">{st.name}</span>
                  <span className="font-mono text-[#6bd8cb]">{st.dockedDrones}/{st.totalDrones} Ready</span>
                </div>
                <div className="w-full bg-[#0d1c2d] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6bd8cb]"
                    style={{ width: `${(st.dockedDrones / st.totalDrones) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveScreen('stations')}
            className="w-full mt-4 py-2 border border-[#3d4947] text-xs font-bold text-[#bcc9c6] uppercase hover:bg-[#273647] rounded-lg transition-colors"
          >
            Manage Station Fleets
          </button>
        </div>
      </div>
    </div>
  );
};
