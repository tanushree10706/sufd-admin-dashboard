import React, { useState, useEffect } from 'react';
import { useCommandCenter } from '../context/CommandCenterContext';
import {
  Search,
  AlertTriangle,
  Bell,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Clock
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    incidents,
    setActiveScreen,
    setSelectedIncidentId,
    soundAlerts,
    toggleSoundAlerts,
    isSimulating,
    toggleSimulation,
    unreadAlertCount,
    clearAlerts
  } = useCommandCenter();

  const [utcTime, setUtcTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = incidents.filter(
    (i) => i.priority === 'critical' && i.status !== 'resolved' && i.status !== 'cancelled'
  ).length;

  const searchResults = searchQuery.trim()
    ? incidents.filter(
        (i) =>
          i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-40 shadow-xs">
      {/* Search Input with Autocomplete */}
      <div className="relative w-72 sm:w-80 md:w-96">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wildfire ID, location, terrain..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white placeholder:text-slate-400 font-sans transition-all"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {searchResults.map((inc) => (
              <button
                key={inc.id}
                onClick={() => {
                  setSelectedIncidentId(inc.id);
                  setActiveScreen('incident_detail');
                  setSearchQuery('');
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 flex justify-between items-center transition-colors"
              >
                <div>
                  <span className="font-mono text-teal-700 text-xs font-bold mr-2">{inc.id}</span>
                  <span className="text-xs text-slate-700 truncate">{inc.address}</span>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    inc.priority === 'critical'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {inc.priority}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center Status Controls */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Critical Alert Indicator */}
        {criticalCount > 0 && (
          <button
            onClick={() => setActiveScreen('dispatch')}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg cursor-pointer hover:bg-rose-100 transition-colors animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
              {criticalCount} CRITICAL
            </span>
          </button>
        )}

        {/* UTC Clock */}
        <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span className="font-mono text-xs font-semibold text-slate-700">{utcTime}</span>
        </div>

        {/* Simulation Play/Pause Toggle */}
        <button
          onClick={toggleSimulation}
          title={isSimulating ? 'Pause real-time telemetry simulation' : 'Resume simulation'}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
            isSimulating
              ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
        >
          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isSimulating ? 'SIM ACTIVE' : 'PAUSED'}</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        {/* Sound Toggle */}
        <button
          onClick={toggleSoundAlerts}
          title={soundAlerts ? 'Mute audio alarms' : 'Enable audio alarms'}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          {soundAlerts ? (
            <Volume2 className="w-4 h-4 text-teal-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              clearAlerts();
            }}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Wildfire Alerts
                </h4>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded">
                  REALTIME
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {incidents.slice(0, 4).map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      setActiveScreen('incident_detail');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs space-y-1 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between font-mono text-teal-700 font-semibold">
                      <span>{inc.id}</span>
                      <span className="text-[10px] text-slate-400">{inc.reportedAt}</span>
                    </div>
                    <p className="text-slate-800 text-xs font-medium leading-tight">{inc.title}</p>
                    <p className="text-[10px] text-slate-500">{inc.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Operational Status Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SYS ONLINE</span>
        </div>
      </div>
    </header>
  );
};

