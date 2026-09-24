import React from 'react';
import { useCommandCenter } from '../context/CommandCenterContext';
import type { UserRole } from '../types/dashboard';
import {
  LayoutDashboard,
  Siren,
  Plane,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  User,
  Camera
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeScreen, setActiveScreen, currentUser, setCurrentUserRole, logout } = useCommandCenter();

  // Consolidated 6 high-level navigation tabs
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      matchScreens: ['overview']
    },
    {
      id: 'ml_surveillance',
      label: 'AI Surveillance',
      icon: Camera,
      badge: 'LIVE ML',
      matchScreens: ['ml_surveillance', 'surveillance']
    },
    {
      id: 'dispatch',
      label: 'Dispatch & Units',
      icon: Siren,
      matchScreens: ['dispatch', 'stations', 'personnel', 'incident_detail']
    },
    {
      id: 'drones',
      label: 'Drone Fleet',
      icon: Plane,
      matchScreens: ['drones']
    },
    {
      id: 'analytics',
      label: 'Analytics & History',
      icon: BarChart3,
      matchScreens: ['analytics', 'history']
    },
    {
      id: 'settings',
      label: 'Settings & Access',
      icon: Settings,
      matchScreens: ['settings', 'users']
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-slate-200 shadow-xs flex flex-col py-5 z-50 select-none">
      {/* Brand Header */}
      <div
        className="px-5 mb-6 cursor-pointer group"
        onClick={() => setActiveScreen('overview')}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            A
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight group-hover:text-teal-700 transition-colors">
              Aranyak
            </h1>
            <p className="text-[10px] text-teal-700 font-semibold tracking-wider uppercase">
              Emergency Command
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchScreens.includes(activeScreen);

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-teal-50 text-teal-800 font-semibold border-r-4 border-teal-600 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center">
                <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Role Profile Widget */}
      <div className="px-3 pt-3 border-t border-slate-200 mt-auto">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border border-teal-200 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate text-slate-800">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-medium">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1 hover:bg-slate-200 text-slate-400 hover:text-rose-600 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Role Switcher for Demo Testing */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
            <span className="text-slate-500 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3 text-teal-600" /> ROLE:
            </span>
            <select
              value={currentUser.role}
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
              className="bg-white text-slate-700 border border-slate-300 rounded text-[10px] px-1.5 py-0.5 font-medium focus:outline-none focus:border-teal-600"
            >
              <option value="operator">Operator</option>
              <option value="admin">Supervisor</option>
              <option value="station_staff">Station Crew</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};

