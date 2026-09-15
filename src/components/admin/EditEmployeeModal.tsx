import React, { useState, useEffect } from 'react';
import { Edit, Save, AlertTriangle, X, Shield } from 'lucide-react';
import { Employee, UserRole, AccountStatus } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface EditEmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ employee, isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [status, setStatus] = useState<AccountStatus>('ACTIVE');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (employee) {
      setEmployeeId(employee.employeeId || '');
      setFirstName(employee.firstName || employee.name.split(' ')[0] || '');
      setLastName(employee.lastName || employee.name.split(' ').slice(1).join(' ') || '');
      setEmail(employee.email || '');
      setPhone(employee.phone || '');
      setDesignation(employee.designation || 'AR Calling Specialist');
      setDepartmentName(employee.departmentName || 'AR Calling & Billing');
      setTeamName(employee.teamName || 'AR Calling Team Alpha');
      setRole(employee.role || 'employee');
      setStatus(employee.status || 'ACTIVE');
      setErrorMessage('');
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const isPrimaryAdmin = Boolean(
    employee.email.toLowerCase() === 'sagarlapati3695@gmail.com' || 
    employee.employeeId === 'DBS-540' || 
    (employee.firebaseUid && employee.firebaseUid.toLowerCase().includes('nwccqo54'))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !firstName.trim()) {
      setErrorMessage('Employee ID and First Name are required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const fullName = lastName.trim() ? `${firstName.trim()} ${lastName.trim()}` : firstName.trim();
      const cleanId = employeeId.trim();

      await dbService.updateEmployee(
        employee.id,
        {
          employeeId: cleanId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: fullName,
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          designation,
          departmentName,
          teamName,
          role: isPrimaryAdmin ? 'admin' : role,
          status: isPrimaryAdmin ? 'ACTIVE' : status,
        },
        currentUser?.name || 'HR Admin'
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update employee details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-doctus-yellow/40 dark:border-neutral-800 shadow-2xl space-y-5 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-doctus-yellow/20 text-doctus-red font-black">
              <Edit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white flex items-center gap-2">
                Edit Employee Details & Role Access
                {isPrimaryAdmin && (
                  <span title="Protected System Admin">
                    <Shield className="w-4 h-4 text-amber-500" />
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-500">Update First Name, Last Name, DBS ID, Role, and Access Controls</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* DBS ID & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-neutral-950 dark:text-white">DBS Employee ID *</label>
              <input
                type="text"
                required
                disabled={isPrimaryAdmin}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white font-mono font-bold disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-neutral-950 dark:text-white">Assigned Role & Access *</label>
              <select
                disabled={isPrimaryAdmin}
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white font-bold disabled:opacity-60"
              >
                <option value="employee">Employee (Standard Access)</option>
                <option value="tl">Team Lead (TL)</option>
                <option value="manager">Manager (Departmental Scope)</option>
                <option value="hr">HR Manager (Organization Scope)</option>
                <option value="admin">System Administrator (Full Control)</option>
              </select>
            </div>
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-neutral-950 dark:text-white">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Siva Naga"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-neutral-950 dark:text-white">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Kurra"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-neutral-950 dark:text-white">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@doctus.com"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-neutral-950 dark:text-white">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Designation & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-neutral-950 dark:text-white">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-neutral-950 dark:text-white">Department</label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="block font-bold mb-1 text-neutral-950 dark:text-white">Account Portal Status</label>
            <select
              disabled={isPrimaryAdmin}
              value={status}
              onChange={(e) => setStatus(e.target.value as AccountStatus)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white font-bold disabled:opacity-60"
            >
              <option value="ACTIVE">ACTIVE (Full Portal Access)</option>
              <option value="SUSPENDED">SUSPENDED (Access Blocked)</option>
              <option value="INACTIVE">INACTIVE (Deactivated)</option>
              <option value="INVITED">INVITED (Pending Link)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 font-black text-neutral-950 shadow-md hover:shadow-glow-yellow flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Employee Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
