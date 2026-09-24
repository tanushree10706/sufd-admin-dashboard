import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import {
  Plane,
  Grid,
  List,
  Plus,
  Battery,
  Wrench,
  X
} from 'lucide-react';

export const DroneFleetScreen: React.FC = () => {
  const { drones, updateDroneStatus, setSelectedIncidentId, setActiveScreen } = useCommandCenter();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [minBatteryFilter, setMinBatteryFilter] = useState<number>(0);

  const selectedDrone = drones.find((d) => d.id === selectedDroneId);

  const filteredDrones = drones.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (d.batteryPercent < minBatteryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Subheader & View Controls */}
      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Plane className="w-5 h-5" />
            </div>
            Drone Fleet Management <span className="text-xs font-mono font-normal text-slate-500">({drones.length} Total Units)</span>
          </h2>

          {/* Grid/Table Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>GRID</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'table' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>TABLE</span>
            </button>
          </div>
        </div>

        <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW DRONE UNIT</span>
        </button>
      </div>

      {/* Main Container: Sidebar Filters + Drone View */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Filters (Col 3) */}
        <aside className="col-span-12 lg:col-span-3 bg-white border border-slate-200 shadow-xs p-5 rounded-xl space-y-6 h-fit">
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Filter by Status</h3>
            <div className="space-y-2.5">
              {['all', 'idle', 'en_route', 'on_site', 'charging', 'maintenance'].map((st) => (
                <label key={st} className="flex items-center space-x-3 text-xs text-slate-700 cursor-pointer hover:text-teal-700 font-medium">
                  <input
                    type="radio"
                    name="statusFilter"
                    checked={statusFilter === st}
                    onChange={() => setStatusFilter(st)}
                    className="text-teal-600 bg-white border-slate-300 focus:ring-teal-600"
                  />
                  <span className="capitalize">{st.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
              <span>MIN BATTERY: {minBatteryFilter}%</span>
              <span>100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={minBatteryFilter}
              onChange={(e) => setMinBatteryFilter(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setStatusFilter('all');
                setMinBatteryFilter(0);
              }}
              className="w-full py-2 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
            >
              RESET FILTERS
            </button>
          </div>
        </aside>

        {/* Drone Cards / Table (Col 9) */}
        <div className="col-span-12 lg:col-span-9">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrones.map((drone) => (
                <div
                  key={drone.id}
                  onClick={() => setSelectedDroneId(drone.id)}
                  className="bg-white border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md rounded-xl overflow-hidden cursor-pointer transition-all space-y-4 group"
                >
                  <div className="h-32 bg-slate-100 relative p-4 flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-white px-2 py-0.5 rounded shadow-xs border border-slate-200">
                      {drone.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        drone.status === 'idle'
                          ? 'bg-emerald-100 text-emerald-800'
                          : drone.status === 'en_route' || drone.status === 'on_site'
                          ? 'bg-amber-100 text-amber-800'
                          : drone.status === 'charging'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {drone.status.replace('_', ' ')}
                    </span>

                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Plane className="w-20 h-20 text-teal-800" />
                    </div>
                  </div>

                  <div className="p-4 pt-0 space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">MODEL</p>
                        <p className="text-xs font-bold text-slate-800">{drone.model}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">BATTERY</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                drone.batteryPercent > 50
                                  ? 'bg-emerald-500'
                                  : drone.batteryPercent > 20
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${drone.batteryPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700">{drone.batteryPercent}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (drone.assignedIncidentId) {
                          setSelectedIncidentId(drone.assignedIncidentId);
                          setActiveScreen('incident_detail');
                        } else {
                          setActiveScreen('dispatch');
                        }
                      }}
                      className="w-full py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-teal-700 hover:bg-teal-600 hover:text-white rounded-lg transition-colors"
                    >
                      {drone.assignedIncidentId ? `TRACK INCIDENT (${drone.assignedIncidentId})` : 'ASSIGN TO DISPATCH'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                      <th className="px-4 py-3">Drone ID</th>
                      <th className="px-4 py-3">Model</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Battery</th>
                      <th className="px-4 py-3">Station</th>
                      <th className="px-4 py-3">Assigned Mission</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredDrones.map((drone) => (
                      <tr
                        key={drone.id}
                        onClick={() => setSelectedDroneId(drone.id)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-teal-700">{drone.id}</td>
                        <td className="px-4 py-3 text-slate-800 font-medium">{drone.model}</td>
                        <td className="px-4 py-3">
                          <span className={`capitalize font-bold text-xs px-2 py-0.5 rounded ${
                            drone.status === 'idle'
                              ? 'bg-emerald-50 text-emerald-700'
                              : drone.status === 'en_route' || drone.status === 'on_site'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {drone.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{drone.batteryPercent}%</td>
                        <td className="px-4 py-3 text-xs text-slate-500">Station Alpha</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                          {drone.assignedIncidentId || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDroneId(drone.id);
                            }}
                            className="text-xs text-teal-700 hover:text-teal-800 font-semibold hover:underline"
                          >
                            Inspect Telemetry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drone Telemetry Drawer Modal with Backdrop overlay */}
      {selectedDrone && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end transition-opacity"
          onClick={() => setSelectedDroneId(null)}
        >
          <div
            className="h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Drone Unit Telemetry</h3>
                <p className="text-xs font-mono text-teal-700">{selectedDrone.id} ({selectedDrone.model})</p>
              </div>
              <button
                onClick={() => setSelectedDroneId(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 pr-1">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Flight Stats & Utilization</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Altitude</span>
                    <p className="text-lg font-mono font-bold text-teal-700">{selectedDrone.altitudeMeters}m</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Velocity</span>
                    <p className="text-lg font-mono font-bold text-slate-800">{selectedDrone.speedKmh} km/h</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Battery & Health Status</p>
                <div className="flex items-center space-x-3">
                  <Battery className="w-6 h-6 text-teal-600" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-mono mb-1 font-semibold text-slate-700">
                      <span>Charge Level</span>
                      <span>{selectedDrone.batteryPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          selectedDrone.batteryPercent > 50 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${selectedDrone.batteryPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {selectedDrone.maintenanceReason && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4" /> Maintenance Required
                  </p>
                  <p className="text-xs text-rose-800">{selectedDrone.maintenanceReason}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => updateDroneStatus(selectedDrone.id, 'charging')}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                SEND TO CHARGING DOCK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

