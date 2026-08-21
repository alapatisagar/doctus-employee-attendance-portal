import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Mail, RefreshCw, ShieldAlert, CheckCircle, Ban, Edit, Copy } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { dbService } from '../../services/db';
import { Employee, AccountStatus } from '../../types';
import { AddEmployeeModal } from './AddEmployeeModal';
import { useAuth } from '../../context/AuthContext';

export const EmployeeManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeInviteModal, setActiveInviteModal] = useState<{ emp: Employee; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const list = await dbService.getEmployees();
    setEmployees(list);
  };

  const handleResendInvite = async (emp: Employee) => {
    try {
      const res = await dbService.resendInvitation(emp.employeeId, currentUser?.name || 'HR Admin');
      setActiveInviteModal({ emp, link: res.link || '' });
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleStatusChange = async (emp: Employee, newStatus: AccountStatus) => {
    if (!window.confirm(`Are you sure you want to change account status for ${emp.name} to ${newStatus}? Historical attendance and leave records will be preserved.`)) return;
    try {
      await dbService.setAccountStatus(emp.employeeId, newStatus as any, currentUser?.name || 'HR Admin');
      loadEmployees();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <GlassCard className="space-y-4">
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-doctus-red" />
              Employee Directory & HR Account Provisioning
            </h2>
            <p className="text-xs text-neutral-500">
              Manage organization accounts, invitation statuses, roles, and access controls.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 font-extrabold text-xs text-neutral-950 shadow-md hover:shadow-glow-yellow flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-doctus-red" />
            <span>Add New Employee</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Employee Name, ID (e.g. DBS-1001), or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INVITED">INVITED (Pending Activation)</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department & Team</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-doctus-yellow/10 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-doctus-red">{emp.employeeId}</td>
                  <td className="py-3 px-4 font-bold text-neutral-950 dark:text-white">
                    <div>{emp.name}</div>
                    <div className="text-[10px] font-normal text-neutral-500">{emp.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div>{emp.departmentName}</div>
                    <div className="text-[10px] text-neutral-500">{emp.teamName}</div>
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-xs">{emp.role}</td>
                  <td className="py-3 px-4"><Badge status={emp.status} size="sm" /></td>
                  <td className="py-3 px-4 text-[10px] text-neutral-400">
                    {emp.lastLoginAt ? new Date(emp.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {emp.status === 'INVITED' && (
                        <button
                          onClick={() => handleResendInvite(emp)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold text-[11px] hover:bg-indigo-200 flex items-center gap-1"
                          title="Resend Activation Invitation Link"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Resend Link</span>
                        </button>
                      )}

                      {emp.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(emp, 'SUSPENDED')}
                          className="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[11px] hover:bg-amber-200"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(emp, 'ACTIVE')}
                          className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[11px] hover:bg-emerald-200"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadEmployees}
      />

      {/* Resend Link Modal */}
      {activeInviteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-neutral-950 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-doctus-red" />
              Invitation Link Dispatched
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              A new time-limited activation link was generated for <strong>{activeInviteModal.emp.name}</strong>.
            </p>
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-doctus-red truncate">
              {activeInviteModal.link}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeInviteModal.link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-4 py-2 rounded-xl bg-doctus-yellow font-extrabold text-xs text-neutral-950 hover:bg-doctus-yellow-600 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Activation Link'}</span>
              </button>
              <button
                onClick={() => setActiveInviteModal(null)}
                className="px-4 py-2 rounded-xl border text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
