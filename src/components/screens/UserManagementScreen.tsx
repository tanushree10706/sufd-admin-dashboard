import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import {
  Shield,
  UserPlus,
  X,
  CheckCircle2,
  XCircle,
  Mail
} from 'lucide-react';
import type { UserRole } from '../../types/dashboard';

export const UserManagementScreen: React.FC = () => {
  const { users, updateUserRole, updateUserStatus, addUser, currentUser } = useCommandCenter();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('operator');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    addUser(newName, newEmail, newRole);
    setNewName('');
    setNewEmail('');
    setNewRole('operator');
    setShowAddModal(false);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#d4e4fa] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#6bd8cb]" />
            User & Access Management
          </h2>
          <p className="text-xs text-[#bcc9c6] mt-1">
            Manage operator accounts, assign role authority levels, and control system access.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#6bd8cb] text-[#003732] font-bold text-xs rounded-lg hover:brightness-110 flex items-center gap-1.5 shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            ADD NEW OPERATOR
          </button>
        )}
      </div>

      {/* Access stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#122131] border border-[#3d4947] p-4 rounded-lg">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-2">Total Operators</p>
          <p className="text-3xl font-mono font-bold text-[#d4e4fa]">{users.length.toString().padStart(2, '0')}</p>
        </div>
        <div className="bg-[#122131] border border-[#3d4947] p-4 rounded-lg">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-2">Active Accounts</p>
          <p className="text-3xl font-mono font-bold text-[#6bd8cb]">
            {users.filter((u) => u.status === 'active').length.toString().padStart(2, '0')}
          </p>
        </div>
        <div className="bg-[#122131] border border-[#3d4947] p-4 rounded-lg">
          <p className="text-[11px] font-bold text-[#bcc9c6] uppercase tracking-wider mb-2">Admins / Supervisors</p>
          <p className="text-3xl font-mono font-bold text-[#ffb95f]">
            {users.filter((u) => u.role === 'admin').length.toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* User table */}
      <div className="bg-[#122131] border border-[#3d4947] rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#1c2b3c] border-b border-[#3d4947]">
          <h3 className="text-sm font-bold text-[#d4e4fa]">Operator Account Roster</h3>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0d1c2d] border-b border-[#3d4947] text-[11px] font-bold uppercase text-[#bcc9c6]">
              <th className="px-6 py-3">Operator Name</th>
              <th className="px-6 py-3">Email / Identifier</th>
              <th className="px-6 py-3">Role Authority</th>
              <th className="px-6 py-3">Account Status</th>
              <th className="px-6 py-3">Last Login</th>
              {isAdmin && <th className="px-6 py-3 text-right">Manage</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3d4947] text-sm">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#273647] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#29a195]/20 border border-[#6bd8cb]/30 flex items-center justify-center text-xs font-bold text-[#6bd8cb]">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#d4e4fa]">{user.name}</p>
                      {user.id === currentUser.id && (
                        <p className="text-[10px] text-[#6bd8cb] font-bold">CURRENT SESSION</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-[#bcc9c6] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#6bd8cb]" />
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  {isAdmin ? (
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                      className="bg-[#0d1c2d] border border-[#3d4947] rounded px-2 py-1 text-xs text-[#d4e4fa] focus:border-[#6bd8cb]"
                    >
                      <option value="operator">Operator</option>
                      <option value="admin">Admin / Supervisor</option>
                      <option value="station_staff">Station Staff</option>
                    </select>
                  ) : (
                    <span className="text-xs text-[#d4e4fa] capitalize">{user.role.replace('_', ' ')}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 bg-[#29a195]/20 text-[#6bd8cb] border border-[#6bd8cb]/30 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                      <XCircle className="w-3 h-3" /> Disabled
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs font-mono text-[#bcc9c6]">{user.lastLogin}</td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        updateUserStatus(user.id, user.status === 'active' ? 'disabled' : 'active')
                      }
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase border transition-colors ${
                        user.status === 'active'
                          ? 'border-[#ffb4ab]/40 text-[#ffb4ab] hover:bg-[#93000a]/20'
                          : 'border-[#6bd8cb]/40 text-[#6bd8cb] hover:bg-[#29a195]/20'
                      }`}
                    >
                      {user.status === 'active' ? 'Disable Access' : 'Re-enable Access'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Operator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-[#122131] border border-[#3d4947] rounded-xl p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#d4e4fa]">Register New Operator Account</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-[#bcc9c6]" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#bcc9c6] mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Lt. Alex Chen"
                  className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] focus:border-[#6bd8cb]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#bcc9c6] mb-1">Email / Identifier</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="operator@sufd.gov"
                  className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] focus:border-[#6bd8cb]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#bcc9c6] mb-1">Role Authority</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-[#0d1c2d] border border-[#3d4947] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] focus:border-[#6bd8cb]"
                >
                  <option value="operator">Operator</option>
                  <option value="admin">Admin / Supervisor</option>
                  <option value="station_staff">Station Staff</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#6bd8cb] text-[#003732] font-bold text-xs rounded-lg hover:brightness-110"
                >
                  CREATE ACCOUNT
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-[#0d1c2d] border border-[#3d4947] text-xs font-bold text-[#bcc9c6] rounded-lg"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
