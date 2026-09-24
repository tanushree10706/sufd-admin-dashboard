import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Users, UserPlus, Phone, X, Siren, TreePine } from 'lucide-react';
import type { ResponderStatus } from '../../types/dashboard';

export const PersonnelScreen: React.FC = () => {
  const { responders, stations, incidents, updateResponderStatus, setSelectedIncidentId, setActiveScreen } = useCommandCenter();

  const [selectedResponderId, setSelectedResponderId] = useState<string | null>(null);
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const selectedResponder = responders.find((r) => r.id === selectedResponderId);
  const pendingCount = incidents.filter(i => i.status !== 'resolved' && i.status !== 'cancelled').length;

  const filteredResponders = responders.filter((r) => {
    if (stationFilter !== 'all' && r.stationId !== stationFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

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
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-teal-600 text-white shadow-xs"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Field Responders</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-800 text-white">
            {responders.length}
          </span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Personnel & Responder Roster</h2>
            <p className="text-xs text-slate-500">Incident commanders, fire crew leads, hotshot crews, aerial observers, and drone operators.</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors">
          <UserPlus className="w-4 h-4" />
          <span>REGISTER NEW RESPONDER</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3 bg-white border border-slate-200 shadow-xs p-5 rounded-xl space-y-6 h-fit">
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Filter Station</h3>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Response Bases</option>
              {stations.map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Availability Status</h3>
            <div className="space-y-2.5">
              {['all', 'available', 'assigned', 'off_duty'].map((st) => (
                <label key={st} className="flex items-center space-x-3 text-xs text-slate-700 cursor-pointer hover:text-teal-700 font-medium">
                  <input
                    type="radio"
                    name="responderStatus"
                    checked={statusFilter === st}
                    onChange={() => setStatusFilter(st)}
                    className="text-teal-600 bg-white border-slate-300 focus:ring-teal-600"
                  />
                  <span className="capitalize">{st.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredResponders.map((resp) => {
            const stationObj = stations.find((st) => st.id === resp.stationId);

            return (
              <div
                key={resp.id}
                onClick={() => setSelectedResponderId(resp.id)}
                className="bg-white border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md rounded-xl p-5 space-y-4 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{resp.name}</h3>
                    <p className="text-xs text-teal-700 font-mono font-medium">{resp.rank}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      resp.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : resp.status === 'assigned'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {resp.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p>Badge: <span className="font-mono text-slate-800 font-semibold">{resp.badgeNumber}</span></p>
                  <p>Base: <span className="text-slate-800">{stationObj?.name || 'Gir Command Station'}</span></p>
                  <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-600" /> {resp.phone}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (resp.assignedIncidentId) {
                      setSelectedIncidentId(resp.assignedIncidentId);
                      setActiveScreen('incident_detail');
                    } else {
                      setActiveScreen('dispatch');
                    }
                  }}
                  className="w-full py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-teal-700 hover:bg-teal-600 hover:text-white rounded-lg transition-colors"
                >
                  {resp.assignedIncidentId ? `VIEW ASSIGNMENT (${resp.assignedIncidentId})` : 'ASSIGN TO INCIDENT'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Responder Drawer Modal with Backdrop overlay to fix overlap */}
      {selectedResponder && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end transition-opacity"
          onClick={() => setSelectedResponderId(null)}
        >
          <div
            className="h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedResponder.name}</h3>
                <p className="text-xs font-mono text-teal-700">{selectedResponder.badgeNumber} • {selectedResponder.rank}</p>
              </div>
              <button
                onClick={() => setSelectedResponderId(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Shift & Availability Control</p>
                <div className="flex space-x-2 pt-1">
                  {(['available', 'assigned', 'off_duty'] as ResponderStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateResponderStatus(selectedResponder.id, st)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all shadow-xs ${
                        selectedResponder.status === st
                          ? 'bg-teal-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

