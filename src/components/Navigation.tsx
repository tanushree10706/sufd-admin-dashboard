import React from 'react';
import { useCommandCenter } from '../context/CommandCenterContext';
import type { UserRole } from '../types/dashboard';
import {
  LayoutDashboard,
  Siren,
  Plane,
  Users,
  Building2,
  History,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeScreen, setActiveScreen, currentUser, setCurrentUserRole, logout } = useCommandCenter();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'dispatch', label: 'Dispatch Queue', icon: Siren },
    { id: 'drones', label: 'Drones', icon: Plane },
    { id: 'personnel', label: 'Personnel', icon: Users },
    { id: 'stations', label: 'Stations', icon: Building2 },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'User Access', icon: UserCog, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-[#0d1c2d] border-r border-[#3d4947] flex flex-col py-6 z-50 select-none">
      {/* Brand Header */}
      <div className="px-6 mb-8 cursor-pointer" onClick={() => setActiveScreen('overview')}>
        <h1 className="font-bold text-[#6bd8cb] text-[20px] leading-[28px] tracking-tight">SmartFlame</h1>
        <p className="text-[10px] text-[#bcc9c6] tracking-[0.2em] uppercase font-bold">SUFD Command Center</p>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          if (item.adminOnly && currentUser.role !== 'admin') return null;

          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-[#6bd8cb] border-r-2 border-[#6bd8cb] bg-[#1c2b3c]'
                  : 'text-[#bcc9c6] hover:bg-[#273647] hover:text-[#d4e4fa]'
              }`}
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User / Role Profile Widget */}
      <div className="px-4 pt-4 border-t border-[#3d4947] mt-auto">
        <div className="bg-[#122131] border border-[#3d4947] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#273647] flex items-center justify-center border border-[#3d4947]">
                <User className="w-4 h-4 text-[#6bd8cb]" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate text-[#d4e4fa]">{currentUser.name}</p>
                <p className="text-[10px] text-[#bcc9c6] uppercase font-bold">{currentUser.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button 
              onClick={logout} 
              title="Log out"
              className="p-1 hover:bg-[#273647] text-[#bcc9c6] hover:text-[#ffb4ab] rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Role Switcher for Demo Testing */}
          <div className="pt-2 border-t border-[#3d4947]/50 flex items-center justify-between text-[10px]">
            <span className="text-[#bcc9c6] flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3 text-[#6bd8cb]" /> ROLE DEMO:
            </span>
            <select
              value={currentUser.role}
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
              className="bg-[#051424] text-[#6bd8cb] border border-[#3d4947] rounded text-[10px] px-1 py-0.5 font-mono focus:outline-none"
            >
              <option value="operator">Operator</option>
              <option value="admin">Admin/Supervisor</option>
              <option value="station_staff">Station Staff</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};
