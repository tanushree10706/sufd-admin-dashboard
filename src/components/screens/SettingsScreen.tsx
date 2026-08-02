import React from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import {
  Settings,
  Volume2,
  VolumeX,
  Zap,
  Clock,
  RefreshCw,
  Save
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useCommandCenter();

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#d4e4fa] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#6bd8cb]" />
          System Configuration
        </h2>
        <p className="text-xs text-[#bcc9c6] mt-1">
          Adjust command center behavior, alert thresholds, and dispatch automation rules.
        </p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* Audio Alerts */}
        <div className="bg-[#122131] border border-[#3d4947] p-6 rounded-xl flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-[#29a195]/20 border border-[#6bd8cb]/40 rounded-xl flex items-center justify-center">
              {settings.soundAlertsEnabled ? (
                <Volume2 className="w-5 h-5 text-[#6bd8cb]" />
              ) : (
                <VolumeX className="w-5 h-5 text-[#bcc9c6]" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#d4e4fa]">Audio Alert System</h3>
              <p className="text-xs text-[#bcc9c6] mt-0.5 max-w-sm">
                Play audible alarm tones when a new critical incident arrives or when an SLA timer breaches threshold.
              </p>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ soundAlertsEnabled: !settings.soundAlertsEnabled })}
            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              settings.soundAlertsEnabled ? 'bg-[#6bd8cb]' : 'bg-[#3d4947]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                settings.soundAlertsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Auto-Dispatch */}
        <div className="bg-[#122131] border border-[#3d4947] p-6 rounded-xl flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-[#29a195]/20 border border-[#6bd8cb]/40 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#ffb95f]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#d4e4fa]">Automatic Drone Dispatch</h3>
              <p className="text-xs text-[#bcc9c6] mt-0.5 max-w-sm">
                Automatically assign the nearest available drone to any new confirmed incident without operator action required.
              </p>
              {settings.autoDispatchEnabled && (
                <div className="mt-2 px-3 py-1 bg-[#ca8100]/20 border border-[#ffb95f]/30 rounded text-xs text-[#ffb95f] font-bold inline-block">
                  ⚠ AUTO-DISPATCH ACTIVE — Requires Supervisor approval
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => updateSettings({ autoDispatchEnabled: !settings.autoDispatchEnabled })}
            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              settings.autoDispatchEnabled ? 'bg-[#ffb95f]' : 'bg-[#3d4947]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                settings.autoDispatchEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* SLA Threshold Slider */}
        <div className="bg-[#122131] border border-[#3d4947] p-6 rounded-xl space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-[#29a195]/20 border border-[#6bd8cb]/40 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#ffb4ab]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#d4e4fa]">SLA Response Breach Threshold</h3>
              <p className="text-xs text-[#bcc9c6] mt-0.5">
                Incidents waiting longer than this time will trigger visual and audio breach alarms in the dispatch queue.
              </p>
            </div>
          </div>

          <div className="pl-14 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#bcc9c6]">0 minutes</span>
              <span className="text-xl font-mono font-bold text-[#ffb4ab]">
                {settings.slaThresholdMinutes} min
              </span>
              <span className="text-xs text-[#bcc9c6]">15 minutes</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={settings.slaThresholdMinutes}
              onChange={(e) => updateSettings({ slaThresholdMinutes: Number(e.target.value) })}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#ffb4ab] bg-[#0d1c2d]"
            />
          </div>
        </div>

        {/* Refresh Interval */}
        <div className="bg-[#122131] border border-[#3d4947] p-6 rounded-xl space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-[#29a195]/20 border border-[#6bd8cb]/40 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[#6bd8cb]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#d4e4fa]">Telemetry Refresh Interval</h3>
              <p className="text-xs text-[#bcc9c6] mt-0.5">
                Frequency at which live drone position, battery, and incident data is polled from the telemetry servers.
              </p>
            </div>
          </div>

          <div className="pl-14 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#bcc9c6]">1 sec</span>
              <span className="text-xl font-mono font-bold text-[#6bd8cb]">
                {settings.refreshIntervalSec}s
              </span>
              <span className="text-xs text-[#bcc9c6]">30 sec</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={settings.refreshIntervalSec}
              onChange={(e) => updateSettings({ refreshIntervalSec: Number(e.target.value) })}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#6bd8cb] bg-[#0d1c2d]"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button className="px-6 py-3 bg-[#6bd8cb] text-[#003732] font-bold text-sm rounded-lg hover:brightness-110 flex items-center space-x-2 shadow-lg">
            <Save className="w-4 h-4" />
            <span>SAVE CONFIGURATION</span>
          </button>
        </div>
      </div>

      {/* Version Info */}
      <div className="pt-6 border-t border-[#3d4947] text-xs font-mono text-[#bcc9c6]/60 space-y-1">
        <p>SUFD Command Center — Aegis Command v4.2.1</p>
        <p>SmartFlame FIRE SAFE Protocol Engine — Build 2026.08.02</p>
        <p>© SUFD Emergency Aerial Response Division. All systems encrypted.</p>
      </div>
    </div>
  );
};
