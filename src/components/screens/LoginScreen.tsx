import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Flame, ShieldCheck } from 'lucide-react';
import type { UserRole } from '../../types/dashboard';

export const LoginScreen: React.FC = () => {
  const { login } = useCommandCenter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('operator');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
  };

  return (
    <div className="min-h-screen bg-slate-100 bg-grid flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />
        
        <div className="p-8 space-y-7">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl border border-teal-100 flex items-center justify-center shadow-xs">
                <Flame className="w-7 h-7 text-teal-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Aranyak Command Center</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              Wildfire AI Aerial Response Division
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Email / Operator ID
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aranyak.ops"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Password / PIN
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Access Authority Level
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                >
                  <option value="operator">Operator (Field & Flight Dispatch)</option>
                  <option value="admin">Admin / Supervisor (Full Authority)</option>
                  <option value="station_staff">Response Base Staff</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer text-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>AUTHENTICATE & ENTER</span>
            </button>
            
            <p className="text-[11px] text-center text-slate-400 font-medium">
              Demo System: Use any email and password to access.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
