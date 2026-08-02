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
  Clock,
  Sun,
  Moon
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = incidents.filter((i) => i.priority === 'critical' && i.status !== 'resolved' && i.status !== 'cancelled').length;

  const searchResults = searchQuery.trim()
    ? incidents.filter(
        (i) =>
          i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-16 bg-[#051424] border-b border-[#3d4947] flex items-center justify-between px-6 z-40">
      {/* Search Input with Autocomplete */}
      <div className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#bcc9c6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident ID, address, or drone unit..."
            className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg pl-9 pr-4 py-1.5 text-sm text-[#d4e4fa] focus:outline-none focus:border-[#6bd8cb] placeholder:text-[#bcc9c6]/50 font-sans"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-[#122131] border border-[#3d4947] rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {searchResults.map((inc) => (
              <button
                key={inc.id}
                onClick={() => {
                  setSelectedIncidentId(inc.id);
                  setActiveScreen('incident_detail');
                  setSearchQuery('');
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-[#1c2b3c] border-b border-[#3d4947]/40 flex justify-between items-center"
              >
                <div>
                  <span className="font-mono text-[#6bd8cb] text-xs font-bold mr-2">{inc.id}</span>
                  <span className="text-xs text-[#d4e4fa] truncate">{inc.address}</span>
                </div>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  inc.priority === 'critical' ? 'bg-[#93000a] text-white' : 'bg-[#ca8100] text-white'
                }`}>
                  {inc.priority}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center Status Controls */}
      <div className="flex items-center space-x-4">
        {/* Critical Alert Indicator */}
        {criticalCount > 0 && (
          <div 
            onClick={() => setActiveScreen('dispatch')}
            className="flex items-center space-x-2 px-3 py-1 bg-[#93000a]/30 border border-[#ffb4ab]/40 rounded-lg cursor-pointer animate-pulse hover:bg-[#93000a]/50 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {criticalCount} CRITICAL ALERT{criticalCount > 1 ? 'S' : ''}
            </span>
          </div>
        )}

        {/* UTC Clock */}
        <div className="flex items-center space-x-2 bg-[#0d1c2d] px-3 py-1.5 rounded-lg border border-[#3d4947]">
          <Clock className="w-4 h-4 text-[#6bd8cb]" />
          <span className="font-mono text-xs font-semibold text-[#6bd8cb]">{utcTime}</span>
        </div>

        {/* Simulation Play/Pause Toggle */}
        <button
          onClick={toggleSimulation}
          title={isSimulating ? "Pause real-time telemetry simulation" : "Resume simulation"}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-colors ${
            isSimulating
              ? 'bg-[#6bd8cb]/10 text-[#6bd8cb] border-[#6bd8cb]/40 hover:bg-[#6bd8cb]/20'
              : 'bg-[#ca8100]/20 text-[#ffb95f] border-[#ca8100]/40'
          }`}
        >
          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimulating ? 'SIM RUNNING' : 'PAUSED'}</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Sound Toggle */}
        <button
          onClick={toggleSoundAlerts}
          title={soundAlerts ? "Mute audio alarms" : "Enable audio alarms"}
          className="p-2 text-[#bcc9c6] hover:bg-[#273647] rounded-full transition-colors"
        >
          {soundAlerts ? <Volume2 className="w-4 h-4 text-[#6bd8cb]" /> : <VolumeX className="w-4 h-4 text-[#bcc9c6]" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              clearAlerts();
            }}
            className="p-2 text-[#bcc9c6] hover:bg-[#273647] rounded-full transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ffb4ab] rounded-full animate-ping" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#122131] border border-[#3d4947] rounded-lg shadow-2xl z-50 p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-[#3d4947] pb-2">
                <h4 className="text-xs font-bold text-[#d4e4fa] uppercase tracking-wider">Live System Alerts</h4>
                <span className="text-[10px] text-[#6bd8cb] font-mono">REALTIME</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {incidents.slice(0, 4).map((inc) => (
                  <div key={inc.id} className="p-2 bg-[#0d1c2d] border border-[#3d4947] rounded text-xs space-y-1">
                    <div className="flex justify-between font-mono text-[#6bd8cb]">
                      <span>{inc.id}</span>
                      <span className="text-[10px] text-[#bcc9c6]">{inc.reportedAt}</span>
                    </div>
                    <p className="text-[#d4e4fa] text-xs leading-tight">{inc.title}</p>
                    <p className="text-[10px] text-[#bcc9c6]">{inc.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Indicator Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Command Center Theme"
          className="p-2 text-[#bcc9c6] hover:bg-[#273647] rounded-full transition-colors"
        >
          {isDarkMode ? <Moon className="w-4 h-4 text-[#6bd8cb]" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
