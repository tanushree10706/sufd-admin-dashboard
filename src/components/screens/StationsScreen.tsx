import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MapComponent } from '../MapComponent';
import {
  Building2,
  Plane,
  Users,
  Clock,
  Activity,
  ChevronRight
} from 'lucide-react';

export const StationsScreen: React.FC = () => {
  const { stations, drones, responders, setActiveScreen } = useCommandCenter();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#d4e4fa] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#6bd8cb]" />
            Fire Stations Control Panel
          </h2>
          <p className="text-xs text-[#bcc9c6] mt-1">
            Live operational overview of all active district fire stations, drone bays, and personnel deployment.
          </p>
        </div>
        <button
          onClick={() => setActiveScreen('personnel')}
          className="px-4 py-2 bg-[#0d1c2d] border border-[#3d4947] text-xs font-bold text-[#d4e4fa] rounded-lg hover:bg-[#273647] flex items-center gap-1"
        >
          <Users className="w-4 h-4" />
          Manage All Personnel
        </button>
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map((station) => {
          const stationDrones = drones.filter((d) => d.stationId === station.id);
          const activeDrones = stationDrones.filter((d) => d.status === 'en_route' || d.status === 'on_site');
          const stationResponders = responders.filter((r) => r.stationId === station.id);
          const availableResponders = stationResponders.filter((r) => r.status === 'available');
          const utilizationColor =
            station.utilizationPercent > 85
              ? 'text-[#ffb4ab]'
              : station.utilizationPercent > 60
              ? 'text-[#ffb95f]'
              : 'text-[#6bd8cb]';

          return (
            <div
              key={station.id}
              className="bg-[#122131] border border-[#3d4947] hover:border-[#6bd8cb]/50 rounded-xl overflow-hidden transition-colors group"
            >
              {/* Station Header */}
              <div className="bg-[#1c2b3c] px-6 py-4 border-b border-[#3d4947] flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#29a195]/20 border border-[#6bd8cb]/40 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#6bd8cb]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#d4e4fa]">{station.name}</h3>
                    <p className="text-[10px] text-[#bcc9c6]">{station.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveScreen('drones')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#6bd8cb] flex items-center gap-1"
                >
                  Manage <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Station Metrics Grid */}
              <div className="p-6 grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Drone Bay Status */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-[#6bd8cb]" /> Drone Dock
                      </span>
                      <span className="font-mono text-xs font-bold text-[#6bd8cb]">
                        {station.dockedDrones}/{station.totalDrones} Docked
                      </span>
                    </div>
                    <div className="w-full bg-[#0d1c2d] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6bd8cb] rounded-full transition-all"
                        style={{ width: `${(station.dockedDrones / station.totalDrones) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#bcc9c6]">
                      {activeDrones.length} unit{activeDrones.length !== 1 ? 's' : ''} currently deployed
                    </p>
                  </div>

                  {/* Responder Load */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#6bd8cb]" /> Personnel
                      </span>
                      <span className="font-mono text-xs font-bold text-[#d4e4fa]">
                        {availableResponders.length}/{station.totalResponders} Available
                      </span>
                    </div>
                    <div className="w-full bg-[#0d1c2d] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ffb95f] rounded-full transition-all"
                        style={{ width: `${(availableResponders.length / Math.max(station.totalResponders, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Avg Response Time */}
                  <div className="bg-[#0d1c2d] p-3 border border-[#3d4947] rounded-lg">
                    <p className="text-[10px] font-bold text-[#bcc9c6] uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Avg Response
                    </p>
                    <p className="text-xl font-mono font-bold text-[#d4e4fa]">
                      {Math.floor(station.avgResponseTimeSec / 60)}m {(station.avgResponseTimeSec % 60).toString().padStart(2, '0')}s
                    </p>
                  </div>

                  {/* Utilization */}
                  <div className="bg-[#0d1c2d] p-3 border border-[#3d4947] rounded-lg">
                    <p className="text-[10px] font-bold text-[#bcc9c6] uppercase mb-1 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" /> Utilization
                    </p>
                    <p className={`text-xl font-mono font-bold ${utilizationColor}`}>
                      {station.utilizationPercent}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Drone Icons Row */}
              <div className="px-6 pb-5 flex flex-wrap gap-2">
                {stationDrones.map((d) => (
                  <div
                    key={d.id}
                    className={`flex items-center space-x-1.5 px-2 py-1 rounded border text-[10px] font-mono font-bold ${
                      d.status === 'idle'
                        ? 'bg-[#29a195]/10 border-[#6bd8cb]/30 text-[#6bd8cb]'
                        : d.status === 'charging'
                        ? 'bg-[#273647] border-[#3d4947] text-[#bcc9c6]'
                        : d.status === 'maintenance'
                        ? 'bg-[#93000a]/20 border-[#ffb4ab]/30 text-[#ffb4ab]'
                        : 'bg-[#ca8100]/20 border-[#ffb95f]/30 text-[#ffb95f]'
                    }`}
                  >
                    <Plane className="w-3 h-3" />
                    <span>{d.id}</span>
                    <span className="opacity-60">({d.batteryPercent}%)</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coverage Map */}
      <div className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden">
        <div className="px-6 py-3 bg-[#1c2b3c] border-b border-[#3d4947] flex justify-between items-center">
          <h3 className="text-base font-bold text-[#d4e4fa]">📍 District Coverage & Station Map</h3>
          <div className="flex items-center space-x-4 text-xs font-mono text-[#bcc9c6]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#273647] border border-[#6bd8cb]" /> Station</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#6bd8cb]/20 border border-[#6bd8cb]" /> Coverage Radius</span>
          </div>
        </div>
        <div className="h-80">
          <MapComponent height="100%" />
        </div>
      </div>
    </div>
  );
};
