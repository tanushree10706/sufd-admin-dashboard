import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import {
  Settings,
  Volume2,
  VolumeX,
  Zap,
  Clock,
  RefreshCw,
  Save,
  Shield,
  Check
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, setActiveScreen } = useCommandCenter();
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveScreen('settings')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-teal-600 text-white shadow-xs"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>System & Sensor Configuration</span>
        </button>
        <button
          onClick={() => setActiveScreen('users')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>User & Access Roles</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <Settings className="w-5 h-5" />
          </div>
          System Configuration & Parameters
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Adjust command center behavior, sensor alert thresholds, and automated drone dispatch rules.
        </p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* Audio Alerts */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs flex justify-between items-start gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center shrink-0">
              {settings.soundAlertsEnabled ? (
                <Volume2 className="w-5 h-5 text-teal-700" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Audio Alert System</h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-md leading-relaxed">
                Play audible alarm tones when a new critical incident arrives or when an SLA timer breaches threshold.
              </p>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ soundAlertsEnabled: !settings.soundAlertsEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              settings.soundAlertsEnabled ? 'bg-teal-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.soundAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Auto-Dispatch */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs flex justify-between items-start gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Automatic Drone Dispatch</h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-md leading-relaxed">
                Automatically assign the nearest available drone to any new confirmed incident without operator manual dispatch.
              </p>
              {settings.autoDispatchEnabled && (
                <div className="mt-2.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 font-bold inline-block">
                  ⚠ AUTO-DISPATCH ACTIVE — Operating under Automated SOP
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => updateSettings({ autoDispatchEnabled: !settings.autoDispatchEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              settings.autoDispatchEnabled ? 'bg-amber-500' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.autoDispatchEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* SLA Threshold Slider */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">SLA Response Breach Threshold</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Incidents waiting longer than this time will trigger visual and audio breach alarms in the dispatch queue.
              </p>
            </div>
          </div>

          <div className="pl-14 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">1 minute</span>
              <span className="text-xl font-mono font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-md border border-rose-200">
                {settings.slaThresholdMinutes} min
              </span>
              <span className="text-xs font-semibold text-slate-500">15 minutes</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={settings.slaThresholdMinutes}
              onChange={(e) => updateSettings({ slaThresholdMinutes: Number(e.target.value) })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-rose-600 bg-slate-100"
            />
          </div>
        </div>

        {/* Refresh Interval */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">Telemetry Refresh Interval</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frequency at which live drone position, battery, and incident data is polled from the telemetry servers.
              </p>
            </div>
          </div>

          <div className="pl-14 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">1 sec</span>
              <span className="text-xl font-mono font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
                {settings.refreshIntervalSec}s
              </span>
              <span className="text-xs font-semibold text-slate-500">30 sec</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={settings.refreshIntervalSec}
              onChange={(e) => updateSettings({ refreshIntervalSec: Number(e.target.value) })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 bg-slate-100"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedNotification ? (
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <Check className="w-4 h-4" />
              <span>Settings updated and saved successfully!</span>
            </div>
          ) : <div />}

          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>SAVE CONFIGURATION</span>
          </button>
        </div>
      </div>

      {/* Version Info */}
      <div className="pt-6 border-t border-slate-200 text-xs font-mono text-slate-400 space-y-1">
        <p>SUFD Command Center — Aegis Command v4.2.1</p>
        <p>SmartFlame FIRE SAFE Protocol Engine — Build 2026.08.02</p>
        <p>© SUFD Emergency Aerial Response Division. All systems operational.</p>
      </div>
    </div>
  );
};
