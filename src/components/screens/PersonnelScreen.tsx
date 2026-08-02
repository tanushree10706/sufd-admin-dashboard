import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Users, UserPlus, Phone, X } from 'lucide-react';
import type { ResponderStatus } from '../../types/dashboard';

export const PersonnelScreen: React.FC = () => {
  const { responders, stations, updateResponderStatus, setSelectedIncidentId, setActiveScreen } = useCommandCenter();

  const [selectedResponderId, setSelectedResponderId] = useState<string | null>(null);
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const selectedResponder = responders.find((r) => r.id === selectedResponderId);

  const filteredResponders = responders.filter((r) => {
    if (stationFilter !== 'all' && r.stationId !== stationFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-[#122131] border border-[#3d4947] p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-[#6bd8cb]" />
          <div>
            <h2 className="text-xl font-bold text-[#d4e4fa]">Personnel & Responder Roster</h2>
            <p className="text-xs text-[#bcc9c6]">Station ground crews, captain leads, and aerial drone tech specialists.</p>
          </div>
        </div>

        <button className="px-4 py-2 bg-[#6bd8cb] text-[#003732] font-bold text-xs rounded-lg hover:brightness-110 flex items-center space-x-1">
          <UserPlus className="w-4 h-4" />
          <span>REGISTER NEW RESPONDER</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3 bg-[#122131] border border-[#3d4947] p-5 rounded-xl space-y-6 h-fit">
          <div>
            <h3 className="text-xs font-bold text-[#bcc9c6] uppercase tracking-wider mb-3">Filter Station</h3>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-3 py-2 text-xs text-[#d4e4fa]"
            >
              <option value="all">All Stations</option>
              {stations.map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#bcc9c6] uppercase tracking-wider mb-3">Availability Status</h3>
            <div className="space-y-2">
              {['all', 'available', 'assigned', 'off_duty'].map((st) => (
                <label key={st} className="flex items-center space-x-3 text-xs text-[#d4e4fa] cursor-pointer">
                  <input
                    type="radio"
                    name="responderStatus"
                    checked={statusFilter === st}
                    onChange={() => setStatusFilter(st)}
                    className="text-[#6bd8cb] bg-[#0d1c2d] border-[#3d4947] focus:ring-0"
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
                className="bg-[#122131] border border-[#3d4947] hover:border-[#6bd8cb] rounded-xl p-5 space-y-4 cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[#d4e4fa]">{resp.name}</h3>
                    <p className="text-xs text-[#6bd8cb] font-mono">{resp.rank}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      resp.status === 'available'
                        ? 'bg-[#29a195]/20 text-[#6bd8cb]'
                        : resp.status === 'assigned'
                        ? 'bg-[#ca8100]/20 text-[#ffb95f]'
                        : 'bg-[#273647] text-[#bcc9c6]'
                    }`}
                  >
                    {resp.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-[#bcc9c6]">
                  <p>Badge: <span className="font-mono text-[#d4e4fa]">{resp.badgeNumber}</span></p>
                  <p>Base: <span className="text-[#d4e4fa]">{stationObj?.name || 'Station Alpha'}</span></p>
                  <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#6bd8cb]" /> {resp.phone}</p>
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
                  className="w-full py-2 bg-[#0d1c2d] border border-[#3d4947] text-xs font-bold text-[#6bd8cb] hover:bg-[#6bd8cb] hover:text-[#003732] rounded-lg transition-colors"
                >
                  {resp.assignedIncidentId ? `VIEW ASSIGNMENT (${resp.assignedIncidentId})` : 'ASSIGN TO INCIDENT'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedResponder && (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-[#1c2b3c] border-l border-[#3d4947] shadow-2xl z-50 flex flex-col p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-[#d4e4fa]">{selectedResponder.name}</h3>
              <p className="text-xs font-mono text-[#6bd8cb]">{selectedResponder.badgeNumber} • {selectedResponder.rank}</p>
            </div>
            <button
              onClick={() => setSelectedResponderId(null)}
              className="p-1 hover:bg-[#273647] rounded text-[#bcc9c6]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            <div className="bg-[#122131] border border-[#3d4947] p-4 rounded-lg space-y-2">
              <p className="text-[11px] font-bold text-[#bcc9c6] uppercase">Shift & Availability Control</p>
              <div className="flex space-x-2 pt-1">
                {(['available', 'assigned', 'off_duty'] as ResponderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateResponderStatus(selectedResponder.id, st)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                      selectedResponder.status === st
                        ? 'bg-[#6bd8cb] text-[#003732]'
                        : 'bg-[#0d1c2d] text-[#bcc9c6] border border-[#3d4947]'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
