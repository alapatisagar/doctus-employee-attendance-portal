import React, { useState } from 'react';
import { UserPlus, Send, CheckCircle2, Copy, AlertTriangle, X } from 'lucide-react';
import { UserRole } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [employeeId, setEmployeeId] = useState(`DBS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('AR Calling Specialist');
  const [departmentId, setDepartmentId] = useState('dept-ar');
  const [departmentName, setDepartmentName] = useState('AR Calling & Billing');
  const [teamId, setTeamId] = useState('team-ar-alpha');
  const [teamName, setTeamName] = useState('AR Calling Team Alpha');
  const [role, setRole] = useState<UserRole>('employee');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<{ link: string; token: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setErrorMessage('Please fill in all required fields marked with *.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const newEmp = await dbService.addEmployee(
        {
          employeeId: employeeId.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          joiningDate: new Date().toISOString().split('T')[0],
          designation,
          departmentId,
          departmentName,
          teamId,
          teamName,
          role,
          status: 'INVITED',
          workLocation: 'Hyderabad HQ',
          employmentType: 'Full-Time',
        },
        currentUser?.name || 'HR Admin'
      );

      const link = `${window.location.origin}/activate?token=${newEmp.activationToken}`;
      setCreatedInvite({ link, token: newEmp.activationToken! });
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error provisioning employee account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = () => {
    if (createdInvite) {
      navigator.clipboard.writeText(createdInvite.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-doctus-yellow/40 dark:border-neutral-800 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-doctus-yellow/20 text-doctus-red font-black">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white">
                Add New Employee (HR Provisioning)
              </h2>
              <p className="text-xs text-neutral-500">Secure Account Provisioning & Invitation Dispatch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Invitation Banner */}
        {createdInvite ? (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Employee Account Created (Status: INVITED)</span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300">
              An activation invitation link has been generated. The employee must click this link to set their secure password and activate their account.
            </p>
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border font-mono text-xs flex items-center justify-between gap-2">
              <span className="truncate text-doctus-red font-bold">{createdInvite.link}</span>
              <button
                onClick={copyInviteLink}
                className="px-3 py-1 rounded-lg bg-doctus-yellow font-extrabold text-neutral-950 hover:bg-doctus-yellow-600 flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <button
              onClick={() => { setCreatedInvite(null); onClose(); }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Employee ID *</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Assigned Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white font-bold"
                >
                  <option value="employee">Employee</option>
                  <option value="tl">Team Lead (TL)</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR Manager</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Meera"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Joshi"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Work Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="meera.joshi@doctus.com"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Department</label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border font-bold text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 font-black text-neutral-950 shadow-md hover:shadow-glow-yellow"
              >
                {isSubmitting ? 'Creating...' : 'Create Employee & Generate Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
