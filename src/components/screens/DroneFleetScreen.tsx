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
      <div className="bg-[#122131] border border-[#3d4947] p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-[#d4e4fa] flex items-center gap-2">
            <Plane className="w-5 h-5 text-[#6bd8cb]" />
            Drone Fleet Management <span className="text-xs font-mono text-[#bcc9c6]">({drones.length} Total Units)</span>
          </h2>

          {/* Grid/Table Toggle */}
          <div className="flex items-center bg-[#0d1c2d] border border-[#3d4947] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center space-x-1 transition-all ${
                viewMode === 'grid' ? 'bg-[#6bd8cb] text-[#003732]' : 'text-[#bcc9c6] hover:text-[#d4e4fa]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>GRID</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center space-x-1 transition-all ${
                viewMode === 'table' ? 'bg-[#6bd8cb] text-[#003732]' : 'text-[#bcc9c6] hover:text-[#d4e4fa]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>TABLE</span>
            </button>
          </div>
        </div>

        <button className="px-4 py-2 bg-[#6bd8cb] text-[#003732] font-bold text-xs rounded-lg hover:brightness-110 flex items-center space-x-1">
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW DRONE UNIT</span>
        </button>
      </div>

      {/* Main Container: Sidebar Filters + Drone View */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Filters (Col 3) */}
        <aside className="col-span-12 lg:col-span-3 bg-[#122131] border border-[#3d4947] p-5 rounded-xl space-y-6 h-fit">
          <div>
            <h3 className="text-xs font-bold text-[#bcc9c6] uppercase tracking-wider mb-3">Filter Status</h3>
            <div className="space-y-2">
              {['all', 'idle', 'en_route', 'on_site', 'charging', 'maintenance'].map((st) => (
                <label key={st} className="flex items-center space-x-3 text-xs text-[#d4e4fa] cursor-pointer hover:text-[#6bd8cb]">
                  <input
                    type="radio"
                    name="statusFilter"
                    checked={statusFilter === st}
                    onChange={() => setStatusFilter(st)}
                    className="text-[#6bd8cb] bg-[#0d1c2d] border-[#3d4947] focus:ring-0"
                  />
                  <span className="capitalize">{st.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#bcc9c6] mb-2">
              <span>MIN BATTERY: {minBatteryFilter}%</span>
              <span>100%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={minBatteryFilter}
              onChange={(e) => setMinBatteryFilter(Number(e.target.value))}
              className="w-full h-1.5 bg-[#0d1c2d] rounded-lg appearance-none cursor-pointer accent-[#6bd8cb]"
            />
          </div>

          <div className="pt-4 border-t border-[#3d4947]">
            <button
              onClick={() => {
                setStatusFilter('all');
                setMinBatteryFilter(0);
              }}
              className="w-full py-2 border border-[#3d4947] text-xs font-bold text-[#bcc9c6] hover:bg-[#273647] rounded-lg"
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
                  className="bg-[#122131] border border-[#3d4947] hover:border-[#6bd8cb] rounded-xl overflow-hidden cursor-pointer transition-all space-y-4 group"
                >
                  <div className="h-32 bg-[#0d1c2d] relative p-4 flex justify-between items-start">
                    <span className="font-mono text-sm font-bold text-[#6bd8cb] bg-[#051424]/80 px-2 py-0.5 rounded border border-[#3d4947]">
                      {drone.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        drone.status === 'idle'
                          ? 'bg-[#6bd8cb]/20 text-[#6bd8cb]'
                          : drone.status === 'en_route' || drone.status === 'on_site'
                          ? 'bg-[#ffb95f]/20 text-[#ffb95f]'
                          : drone.status === 'charging'
                          ? 'bg-[#273647] text-[#bcc9c6]'
                          : 'bg-[#93000a] text-white'
                      }`}
                    >
                      {drone.status.replace('_', ' ')}
                    </span>

                    <div className="absolute inset-0 flex items-center justify-center opacity-15">
                      <Plane className="w-20 h-20 text-[#6bd8cb]" />
                    </div>
                  </div>

                  <div className="p-4 pt-0 space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-[#bcc9c6] uppercase">MODEL</p>
                        <p className="text-xs font-bold text-[#d4e4fa]">{drone.model}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#bcc9c6] uppercase">BATTERY</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-1.5 bg-[#0d1c2d] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                drone.batteryPercent > 50
                                  ? 'bg-[#6bd8cb]'
                                  : drone.batteryPercent > 20
                                  ? 'bg-[#ffb95f]'
                                  : 'bg-[#ffb4ab]'
                              }`}
                              style={{ width: `${drone.batteryPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#d4e4fa]">{drone.batteryPercent}%</span>
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
                      className="w-full py-2 bg-[#1c2b3c] border border-[#3d4947] text-xs font-bold text-[#6bd8cb] hover:bg-[#6bd8cb] hover:text-[#003732] rounded-lg transition-colors"
                    >
                      {drone.assignedIncidentId ? `TRACK INCIDENT (${drone.assignedIncidentId})` : 'ASSIGN TO DISPATCH'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0d1c2d] border-b border-[#3d4947] text-[11px] font-bold uppercase text-[#bcc9c6]">
                    <th className="px-4 py-3">Drone ID</th>
                    <th className="px-4 py-3">Model</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Battery</th>
                    <th className="px-4 py-3">Station</th>
                    <th className="px-4 py-3">Assigned Mission</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3d4947]/50 text-sm">
                  {filteredDrones.map((drone) => (
                    <tr
                      key={drone.id}
                      onClick={() => setSelectedDroneId(drone.id)}
                      className="hover:bg-[#273647] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#6bd8cb]">{drone.id}</td>
                      <td className="px-4 py-3 text-[#d4e4fa]">{drone.model}</td>
                      <td className="px-4 py-3">
                        <span className="capitalize font-bold text-xs text-[#d4e4fa]">{drone.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[#6bd8cb]">{drone.batteryPercent}%</td>
                      <td className="px-4 py-3 text-xs text-[#bcc9c6]">Station Alpha</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#bcc9c6]">
                        {drone.assignedIncidentId || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDroneId(drone.id);
                          }}
                          className="text-xs text-[#6bd8cb] hover:underline"
                        >
                          Inspect Telemetry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Drone Telemetry Drawer */}
      {selectedDrone && (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-[#1c2b3c] border-l border-[#3d4947] shadow-2xl z-50 flex flex-col p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-[#d4e4fa]">Drone Unit Telemetry</h3>
              <p className="text-xs font-mono text-[#6bd8cb]">{selectedDrone.id} ({selectedDrone.model})</p>
            </div>
            <button
              onClick={() => setSelectedDroneId(null)}
              className="p-1 hover:bg-[#273647] rounded text-[#bcc9c6]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
            <div className="bg-[#122131] border border-[#3d4947] p-4 rounded-lg space-y-3">
              <p className="text-[11px] font-bold text-[#bcc9c6] uppercase">Flight Stats & Utilization</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0d1c2d] p-3 rounded border border-[#3d4947]">
                  <span className="text-[10px] text-[#bcc9c6] uppercase">Altitude</span>
                  <p className="text-lg font-mono font-bold text-[#6bd8cb]">{selectedDrone.altitudeMeters}m</p>
                </div>
                <div className="bg-[#0d1c2d] p-3 rounded border border-[#3d4947]">
                  <span className="text-[10px] text-[#bcc9c6] uppercase">Velocity</span>
                  <p className="text-lg font-mono font-bold text-[#d4e4fa]">{selectedDrone.speedKmh} km/h</p>
                </div>
              </div>
            </div>

            <div className="bg-[#122131] border border-[#3d4947] p-4 rounded-lg space-y-2">
              <p className="text-[11px] font-bold text-[#bcc9c6] uppercase">Battery & Health Status</p>
              <div className="flex items-center space-x-3">
                <Battery className="w-6 h-6 text-[#6bd8cb]" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span>Charge</span>
                    <span>{selectedDrone.batteryPercent}%</span>
                  </div>
                  <div className="w-full bg-[#0d1c2d] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6bd8cb]"
                      style={{ width: `${selectedDrone.batteryPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {selectedDrone.maintenanceReason && (
              <div className="p-3 bg-[#93000a]/20 border border-[#ffb4ab] rounded-lg space-y-1">
                <p className="text-xs font-bold text-[#ffb4ab] flex items-center gap-1">
                  <Wrench className="w-4 h-4" /> Maintenance Required
                </p>
                <p className="text-xs text-[#d4e4fa]">{selectedDrone.maintenanceReason}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#3d4947]">
            <button
              onClick={() => updateDroneStatus(selectedDrone.id, 'charging')}
              className="w-full py-3 bg-[#6bd8cb] text-[#003732] font-bold text-xs rounded-lg hover:brightness-110"
            >
              SEND TO CHARGING DOCK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
