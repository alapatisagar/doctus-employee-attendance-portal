import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Mail, RefreshCw, Trash2, Copy, AlertTriangle, Edit } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { dbService } from '../../services/db';
import { Employee, AccountStatus } from '../../types';
import { AddEmployeeModal } from './AddEmployeeModal';
import { EditEmployeeModal } from './EditEmployeeModal';
import { useAuth } from '../../context/AuthContext';

export const EmployeeManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeInviteModal, setActiveInviteModal] = useState<{ emp: Employee; link: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Deletion state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    targets: Employee[];
  }>({ isOpen: false, targets: [] });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const list = await dbService.getEmployees();
    setEmployees(list);
    setSelectedIds([]);
  };

  const isPrimaryAdmin = (emp: Employee) => {
    const email = (emp.email || '').toLowerCase();
    const uid = (emp.firebaseUid || '').toLowerCase();
    return email === 'sagarlapati3695@gmail.com' || uid.includes('nwccqo54') || uid.includes('nwcqo54') || emp.employeeId === 'DBS-540';
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

  const promptSingleDelete = (emp: Employee) => {
    if (isPrimaryAdmin(emp)) {
      alert('Action blocked: The primary System Administrator account cannot be deleted.');
      return;
    }
    setDeleteModalState({ isOpen: true, targets: [emp] });
  };

  const promptBulkDelete = () => {
    const targets = employees.filter(e => selectedIds.includes(e.employeeId) && !isPrimaryAdmin(e));
    if (targets.length === 0) {
      alert('No deletable employees selected.');
      return;
    }
    setDeleteModalState({ isOpen: true, targets });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const ids = deleteModalState.targets.map(t => t.employeeId);
      const res = await dbService.deleteEmployeesBulk(ids, currentUser?.name || 'HR Admin');
      if (res.errors.length > 0) {
        alert(`Deletion finished with messages:\n${res.errors.join('\n')}`);
      }
      setDeleteModalState({ isOpen: false, targets: [] });
      await loadEmployees();
    } catch (e: any) {
      alert(e.message || 'Failed to delete employee account(s).');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const deletableFiltered = filteredEmployees.filter(e => !isPrimaryAdmin(e));
  const isAllSelected = deletableFiltered.length > 0 && deletableFiltered.every(e => selectedIds.includes(e.employeeId));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(deletableFiltered.map(e => e.employeeId));
    }
  };

  const toggleSelectRow = (employeeId: string) => {
    setSelectedIds(prev => 
      prev.includes(employeeId) ? prev.filter(id => id !== employeeId) : [...prev, employeeId]
    );
  };

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
              Manage organization accounts ({employees.length} employees), invitation statuses, deletion controls, and access rights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={promptBulkDelete}
                className="px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 animate-pulse"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 font-extrabold text-xs text-neutral-950 shadow-md hover:shadow-glow-yellow flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-doctus-red" />
              <span>Add New Employee</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Employee Name, ID (e.g. DBS-25132), or Email..."
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
            <option value="ALL">All Account Statuses ({employees.length})</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INVITED">INVITED (Pending Activation)</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-extrabold uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    disabled={deletableFiltered.length === 0}
                    className="rounded border-neutral-300 text-doctus-red focus:ring-doctus-red"
                  />
                </th>
                <th className="py-3 px-4">DBS ID</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department & Team</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
              {filteredEmployees.map(emp => {
                const isAdmin = isPrimaryAdmin(emp);
                const isSelected = selectedIds.includes(emp.employeeId);
                return (
                  <tr key={emp.id} className={`hover:bg-doctus-yellow/10 dark:hover:bg-neutral-800/40 transition-colors ${isSelected ? 'bg-red-50/50 dark:bg-red-950/20' : ''}`}>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(emp.employeeId)}
                        disabled={isAdmin}
                        className="rounded border-neutral-300 text-doctus-red focus:ring-doctus-red disabled:opacity-30"
                      />
                    </td>
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Role & Details Button */}
                        <button
                          onClick={() => setEditingEmployee(emp)}
                          className="px-2.5 py-1 rounded-lg bg-doctus-yellow/30 text-neutral-900 dark:text-white hover:bg-doctus-yellow font-bold text-[11px] flex items-center gap-1 transition-colors"
                          title="Edit Names, DBS ID, Role & Access"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

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

                        {!isAdmin ? (
                          <button
                            onClick={() => promptSingleDelete(emp)}
                            className="p-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/60 dark:text-red-300 font-bold transition-colors"
                            title="Delete Employee Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-400 font-bold px-1" title="Protected System Admin">
                            Protected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        employee={editingEmployee}
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSuccess={loadEmployees}
      />

      {/* Delete Employee Confirmation Modal */}
      {deleteModalState.isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-red-200 dark:border-red-900 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-950/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-neutral-950 dark:text-white">
                  Confirm Permanent Deletion
                </h3>
                <p className="text-xs text-neutral-500">
                  {deleteModalState.targets.length === 1 
                    ? `Delete employee account: ${deleteModalState.targets[0].name}?`
                    : `Delete ${deleteModalState.targets.length} selected employee accounts?`}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
              <p className="font-bold">The following employee account(s) will be removed:</p>
              <ul className="max-h-32 overflow-y-auto list-disc pl-4 space-y-0.5 font-mono text-[11px] text-red-700 dark:text-red-400">
                {deleteModalState.targets.map(t => (
                  <li key={t.employeeId}>{t.name} ({t.employeeId}) — {t.email}</li>
                ))}
              </ul>
              <p className="text-[11px] text-neutral-500 pt-1">
                ⚠️ This will purge access rights and remove their profile. Historical audit logs will remain intact.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteModalState({ isOpen: false, targets: [] })}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
