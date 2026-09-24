import React, { useState } from 'react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import {
  Shield,
  UserPlus,
  X,
  CheckCircle2,
  XCircle,
  Mail,
  Settings,
  Users
} from 'lucide-react';
import type { UserRole } from '../../types/dashboard';

export const UserManagementScreen: React.FC = () => {
  const { users, updateUserRole, updateUserStatus, addUser, currentUser, setActiveScreen } = useCommandCenter();

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
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveScreen('settings')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>System & Sensor Configuration</span>
        </button>
        <button
          onClick={() => setActiveScreen('users')}
          className="px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 bg-teal-600 text-white shadow-xs"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>User & Access Roles</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-700/60 text-white">
            {users.length}
          </span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Shield className="w-5 h-5" />
            </div>
            User & Access Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage operator accounts, assign role authority levels, and control command center access permissions.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>ADD NEW OPERATOR</span>
          </button>
        )}
      </div>

      {/* Access stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Operators</p>
          <p className="text-3xl font-mono font-bold text-slate-900">{users.length.toString().padStart(2, '0')}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Accounts</p>
          <p className="text-3xl font-mono font-bold text-teal-700">
            {users.filter((u) => u.status === 'active').length.toString().padStart(2, '0')}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Admins / Supervisors</p>
          <p className="text-3xl font-mono font-bold text-amber-600">
            {users.filter((u) => u.role === 'admin').length.toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* User table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            Operator Account Roster
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {users.length} Active Records
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <th className="px-6 py-3.5">Operator Name</th>
              <th className="px-6 py-3.5">Email / Identifier</th>
              <th className="px-6 py-3.5">Role Authority</th>
              <th className="px-6 py-3.5">Account Status</th>
              <th className="px-6 py-3.5">Last Login</th>
              {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-xs font-bold text-teal-700">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{user.name}</p>
                      {user.id === currentUser.id && (
                        <p className="text-[10px] text-teal-600 font-bold">CURRENT SESSION</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {isAdmin ? (
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                      className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    >
                      <option value="operator">Operator</option>
                      <option value="admin">Admin / Supervisor</option>
                      <option value="station_staff">Station Staff</option>
                    </select>
                  ) : (
                    <span className="text-xs text-slate-800 capitalize font-medium">
                      {user.role.replace('_', ' ')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase">
                      <XCircle className="w-3 h-3 text-rose-600" /> Disabled
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{user.lastLogin}</td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        updateUserStatus(user.id, user.status === 'active' ? 'disabled' : 'active')
                      }
                      className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase border transition-colors cursor-pointer ${
                        user.status === 'active'
                          ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                          : 'border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100'
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
        <div 
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-teal-50 text-teal-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                Register New Operator Account
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Lt. Alex Chen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email / Identifier
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="operator@sufd.gov"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Role Authority
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                >
                  <option value="operator">Operator</option>
                  <option value="admin">Admin / Supervisor</option>
                  <option value="station_staff">Station Staff</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  CREATE ACCOUNT
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-lg transition-colors cursor-pointer"
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
