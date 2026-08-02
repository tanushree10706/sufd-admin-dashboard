import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Flame, ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';
import type { UserRole } from '../../types/dashboard';

export const LoginScreen: React.FC = () => {
  const { login, setCurrentUserRole, setActiveScreen } = useCommandCenter();
  const [username, setUsername] = useState<string>('sterling@sufd.gov');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter valid operator credentials and security key.');
      return;
    }

    setCurrentUserRole(selectedRole);
    const success = login(username, password);
    if (success) {
      setActiveScreen('overview');
    } else {
      setErrorMsg('Invalid operator identifier or security key.');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#051424] flex items-center justify-center z-50 p-6 select-none overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#6bd8cb 1px, transparent 1px), linear-gradient(90deg, #6bd8cb 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="scanline" />

      <div className="relative w-full max-w-md bg-[#122131] border border-[#3d4947] rounded-xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-[#29a195]/20 border border-[#6bd8cb]/40 rounded-xl flex items-center justify-center mb-2">
            <Flame className="w-10 h-10 text-[#6bd8cb]" />
          </div>
          <h1 className="text-2xl font-bold text-[#6bd8cb] tracking-tight">SmartFlame</h1>
          <p className="text-xs font-bold text-[#bcc9c6] uppercase tracking-[0.2em]">SUFD Command Center Protocol</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#93000a]/20 border border-[#ffb4ab] rounded-lg flex items-center space-x-2 text-xs text-[#ffb4ab]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#bcc9c6] mb-1.5">
              Operator Identifier
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#bcc9c6]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="operator@sufd.gov"
                className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#d4e4fa] focus:outline-none focus:border-[#6bd8cb]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#bcc9c6] mb-1.5">
              Secure Access Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#bcc9c6]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#d4e4fa] focus:outline-none focus:border-[#6bd8cb]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#bcc9c6] mb-1.5">
              Role Authority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['operator', 'admin', 'station_staff'] as UserRole[]).map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`py-2 px-1 rounded border text-[11px] font-bold uppercase transition-all ${
                    selectedRole === role
                      ? 'bg-[#6bd8cb] text-[#003732] border-[#6bd8cb]'
                      : 'bg-[#0d1c2d] text-[#bcc9c6] border-[#3d4947] hover:border-[#6bd8cb]/50'
                  }`}
                >
                  {role.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-2 text-xs text-[#bcc9c6] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#3d4947] bg-[#0d1c2d] text-[#6bd8cb] focus:ring-0"
              />
              <span>Keep workstation authenticated</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#6bd8cb] text-[#003732] font-bold text-sm rounded-lg hover:brightness-110 transition-all flex items-center justify-center space-x-2 shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATE OPERATOR</span>
          </button>
        </form>

        <p className="text-[10px] text-center text-[#bcc9c6]/60 uppercase tracking-widest font-mono">
          Authorized Emergency Access Only — Security Protocol v4.2
        </p>
      </div>
    </div>
  );
};
