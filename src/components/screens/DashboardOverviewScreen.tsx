import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MapComponent } from '../MapComponent';
import {
  AlertOctagon,
  Plane,
  Clock,
  Building2,
  AlertCircle,
  List,
  Rss,
  X,
  Thermometer,
  Wind,
  ShieldCheck
} from 'lucide-react';

export const DashboardOverviewScreen: React.FC = () => {
  const {
    incidents,
    drones,
    stations,
    selectedIncidentId,
    setSelectedIncidentId,
    setActiveScreen,
    assignNearestDrone
  } = useCommandCenter();

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved' && i.status !== 'cancelled');
  const activeDrones = drones.filter((d) => d.status === 'en_route' || d.status === 'on_site');
  const pendingIncidents = incidents.filter((i) => !i.assignedDroneId && i.status !== 'resolved' && i.status !== 'cancelled');

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || activeIncidents[0];

  const handleRowClick = (id: string) => {
    setSelectedIncidentId(id);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 5-Metric Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0d1c2d] border border-[#3d4947] p-4 rounded-lg stat-card-glow flex flex-col justify-between">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-1">Active Incidents</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-bold text-[#ffb4ab]">
              {activeIncidents.length.toString().padStart(2, '0')}
            </span>
            <AlertOctagon className="w-8 h-8 text-[#ffb4ab]/40" />
          </div>
        </div>

        <div className="bg-[#0d1c2d] border border-[#3d4947] p-4 rounded-lg stat-card-glow flex flex-col justify-between">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-1">Drones Deployed</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-bold text-[#6bd8cb]">
              {activeDrones.length.toString().padStart(2, '0')}
            </span>
            <Plane className="w-8 h-8 text-[#6bd8cb]/40" />
          </div>
        </div>

        <div className="bg-[#0d1c2d] border border-[#3d4947] p-4 rounded-lg stat-card-glow flex flex-col justify-between">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-1">Avg Response</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-bold text-[#ffb95f]">4m 12s</span>
            <Clock className="w-8 h-8 text-[#ffb95f]/40" />
          </div>
        </div>

        <div className="bg-[#0d1c2d] border border-[#3d4947] p-4 rounded-lg stat-card-glow flex flex-col justify-between">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-1">Stations Online</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-bold text-[#d4e4fa]">
              {stations.length}
            </span>
            <Building2 className="w-8 h-8 text-[#bcc9c6]/40" />
          </div>
        </div>

        <div className="bg-[#0d1c2d] border border-[#3d4947] p-4 rounded-lg stat-card-glow flex flex-col justify-between">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-1">Pending Assignments</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-mono font-bold text-[#d4e4fa]">
              {pendingIncidents.length.toString().padStart(2, '0')}
            </span>
            <AlertCircle className="w-8 h-8 text-[#bcc9c6]/40" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Table + Map), Right (Activity Feed) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Side (Col 9) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Live Incident Queue */}
          <section className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden">
            <div className="px-6 py-3 bg-[#1c2b3c] border-b border-[#3d4947] flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <List className="w-5 h-5 text-[#6bd8cb]" />
                <h2 className="text-base font-bold text-[#d4e4fa]">Live Incident Queue</h2>
              </div>
              <button
                onClick={() => setActiveScreen('dispatch')}
                className="text-xs font-bold text-[#6bd8cb] hover:underline"
              >
                View Dispatch Queue →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0d1c2d] border-b border-[#3d4947] text-[11px] font-bold uppercase text-[#bcc9c6]">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned Drone</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3d4947]/50 text-sm">
                  {incidents.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => handleRowClick(inc.id)}
                      className={`hover:bg-[#273647] transition-colors cursor-pointer ${
                        inc.slaBreached ? 'sla-red-pulse' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-[#6bd8cb] font-bold">{inc.id}</td>
                      <td className="px-4 py-3 font-medium text-[#d4e4fa]">{inc.address}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#bcc9c6]">{inc.reportedAt}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inc.priority === 'critical'
                              ? 'bg-[#93000a] text-white'
                              : inc.priority === 'high'
                              ? 'bg-[#ca8100] text-white'
                              : 'bg-[#273647] text-[#bcc9c6]'
                          }`}
                        >
                          {inc.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              inc.status === 'on_site'
                                ? 'bg-[#ffb4ab] animate-pulse'
                                : inc.status === 'en_route'
                                ? 'bg-[#6bd8cb]'
                                : 'bg-[#bcc9c6]'
                            }`}
                          />
                          <span className="capitalize text-xs text-[#d4e4fa]">
                            {inc.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#bcc9c6]">
                        {inc.assignedDroneId || <span className="text-[#ffb4ab]">UNASSIGNED</span>}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {!inc.assignedDroneId ? (
                          <button
                            onClick={() => assignNearestDrone(inc.id)}
                            className="px-3 py-1 bg-[#6bd8cb] text-[#003732] text-xs font-bold rounded hover:brightness-110"
                          >
                            Assign Nearest
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRowClick(inc.id)}
                            className="text-xs text-[#6bd8cb] hover:underline"
                          >
                            Inspect
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mini Live Map Section */}
          <section className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden h-[380px] flex flex-col">
            <div className="px-6 py-3 bg-[#1c2b3c] border-b border-[#3d4947] flex justify-between items-center">
              <h2 className="text-base font-bold text-[#d4e4fa] flex items-center gap-2">
                <span>📍</span> Live Operations Map
              </h2>
              <div className="flex items-center space-x-4 text-xs font-mono text-[#bcc9c6]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]" /> Fire Incident</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6bd8cb]" /> Active Drone</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#273647]" /> Fire Station</span>
              </div>
            </div>
            <div className="flex-1 relative">
              <MapComponent height="100%" />
            </div>
          </section>
        </div>

        {/* Right Side Activity Feed (Col 3) */}
        <aside className="col-span-12 lg:col-span-3">
          <section className="bg-[#122131] border border-[#3d4947] rounded-xl h-full flex flex-col">
            <div className="px-4 py-3 bg-[#1c2b3c] border-b border-[#3d4947] flex items-center space-x-2">
              <Rss className="w-4 h-4 text-[#6bd8cb]" />
              <h2 className="text-base font-bold text-[#d4e4fa]">Activity Feed</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div className="relative pl-6 pb-4 border-l border-[#3d4947]">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#6bd8cb]" />
                <p className="text-[10px] font-mono text-[#6bd8cb]">14:22:15</p>
                <p className="text-xs text-[#d4e4fa] leading-snug">Drone DR-402 arrived at Oak Ridge. Visual thermal confirmed.</p>
                <p className="text-[10px] uppercase text-[#bcc9c6] mt-0.5">Disp-09: Unit On-Site</p>
              </div>

              <div className="relative pl-6 pb-4 border-l border-[#3d4947]">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#ffb4ab]" />
                <p className="text-[10px] font-mono text-[#ffb4ab]">14:22:05</p>
                <p className="text-xs text-[#d4e4fa] leading-snug">Emergency IoT sensor #882 activated at Oak Ridge Sector 4.</p>
                <p className="text-[10px] uppercase text-[#bcc9c6] mt-0.5">Sys-Auto: Critical Alert</p>
              </div>

              <div className="relative pl-6 pb-4 border-l border-[#3d4947]">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#bcc9c6]" />
                <p className="text-[10px] font-mono text-[#bcc9c6]">14:18:30</p>
                <p className="text-xs text-[#d4e4fa] leading-snug">Drone DR-901 launch sequence initiated from Station 02.</p>
                <p className="text-[10px] uppercase text-[#bcc9c6] mt-0.5">Disp-02: Deployment</p>
              </div>

              <div className="relative pl-6 pb-4 border-l border-[#3d4947]">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#ffb95f]" />
                <p className="text-[10px] font-mono text-[#ffb95f]">14:18:12</p>
                <p className="text-xs text-[#d4e4fa] leading-snug">New high-priority smoke report at Harbor Vista Dr. (OTP Verified).</p>
                <p className="text-[10px] uppercase text-[#bcc9c6] mt-0.5">Sys-External: 911 Link</p>
              </div>

              <div className="relative pl-6 pb-4 border-l border-[#3d4947]">
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#bcc9c6]" />
                <p className="text-[10px] font-mono text-[#bcc9c6]">14:15:00</p>
                <p className="text-xs text-[#d4e4fa] leading-snug">Scheduled battery swap completed for Drone DR-405.</p>
                <p className="text-[10px] uppercase text-[#bcc9c6] mt-0.5">Maint: Fleet Status</p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Slide-in Incident Detail Drawer */}
      {isDrawerOpen && selectedIncident && (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-[#1c2b3c] border-l border-[#3d4947] shadow-2xl z-50 flex flex-col p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-[#d4e4fa]">Incident Details</h3>
              <p className="text-xs font-mono text-[#6bd8cb]">{selectedIncident.id}</p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 hover:bg-[#273647] rounded text-[#bcc9c6]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
            <div className="bg-[#122131] p-4 border border-[#3d4947] rounded-lg space-y-2">
              <p className="text-[11px] font-bold uppercase text-[#bcc9c6]">Live Telemetry Snapshot</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-[#6bd8cb]" />
                  <div>
                    <p className="text-[10px] text-[#bcc9c6]">Wind Speed</p>
                    <p className="text-xs font-mono font-bold text-[#d4e4fa]">{selectedIncident.windSpeed || '12.0 km/h NW'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-[#ffb4ab]" />
                  <div>
                    <p className="text-[10px] text-[#bcc9c6]">Max Temp</p>
                    <p className="text-xs font-mono font-bold text-[#ffb4ab]">{selectedIncident.temperatureMax || 412}°C</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase text-[#bcc9c6]">Assigned Unit</p>
              <div className="p-3 bg-[#0d1c2d] border border-[#3d4947] rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Plane className="w-5 h-5 text-[#6bd8cb]" />
                  <span className="text-sm text-[#d4e4fa] font-mono">
                    {selectedIncident.assignedDroneId || 'None Assigned'}
                  </span>
                </div>
                <span className="text-xs text-[#bcc9c6]">Active</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase text-[#bcc9c6]">Location Address</p>
              <p className="text-xs text-[#d4e4fa] bg-[#0d1c2d] p-3 border border-[#3d4947] rounded-lg">
                {selectedIncident.address}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#3d4947] space-y-2">
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setActiveScreen('incident_detail');
              }}
              className="w-full py-3 bg-[#6bd8cb] text-[#003732] font-bold text-xs rounded-lg hover:brightness-110 flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>FULL INCIDENT INSPECTOR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
