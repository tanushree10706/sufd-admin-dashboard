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
    <div className="min-h-screen bg-[#051424] bg-grid text-[#d4e4fa] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#122131] border border-[#3d4947] rounded-xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#051424] via-[#6bd8cb] to-[#051424]" />
        
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#0d1c2d] rounded-full border border-[#3d4947] flex items-center justify-center">
                <Flame className="w-8 h-8 text-[#6bd8cb]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#d4e4fa]">Aranyak Command Center</h1>
            <p className="text-sm text-[#bcc9c6] uppercase tracking-widest font-bold">Wildfire Detection & Response</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#bcc9c6] uppercase mb-1">Email / Operator ID</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aranyak.ops"
                  className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] focus:outline-none focus:border-[#6bd8cb]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#bcc9c6] uppercase mb-1">Password / PIN</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] focus:outline-none focus:border-[#6bd8cb]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#bcc9c6] uppercase mb-1">Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] focus:outline-none focus:border-[#6bd8cb]"
                >
                  <option value="operator">Operator</option>
                  <option value="admin">Admin / Supervisor</option>
                  <option value="station_staff">Response Base Staff</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#6bd8cb] text-[#051424] font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>AUTHENTICATE</span>
            </button>
            
            <p className="text-[10px] text-center text-[#bcc9c6]/50 uppercase">
              Demo System: Use any email and password to access.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
