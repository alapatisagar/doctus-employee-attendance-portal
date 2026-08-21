import React, { useState } from 'react';
import { CalendarPlus, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { LeaveType } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [contactDuringLeave, setContactDuringLeave] = useState(currentUser?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !currentUser) return null;

  // Calculate working days
  const calculateDays = () => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const daysCount = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Please provide a reason for your leave request.');
      return;
    }
    if (daysCount <= 0) {
      setErrorMessage('To Date must be equal to or after From Date.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await dbService.applyLeave({
        employeeId: currentUser.employeeId,
        employeeName: currentUser.name,
        employeeCode: currentUser.employeeId,
        departmentId: currentUser.departmentId,
        teamId: currentUser.teamId,
        leaveType,
        fromDate,
        toDate,
        days: daysCount,
        reason,
        contactDuringLeave,
        emergencyContact,
        tlId: currentUser.tlId,
        managerId: currentUser.managerId,
      });

      confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const leaveOptions: LeaveType[] = [
    'Casual Leave',
    'Sick Leave',
    'Earned Leave',
    'Annual Leave',
    'Emergency Leave',
    'Unpaid Leave',
    'Optional Holiday',
    'Comp Off',
    'Work From Home'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-doctus-yellow/40 dark:border-neutral-800 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-doctus-yellow/20 text-doctus-red font-black">
              <CalendarPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white">
                Apply For Leave
              </h2>
              <p className="text-xs text-neutral-500">DOCTUS Employee Leave Portal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Employee Meta Summary */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-doctus-yellow/10 dark:bg-neutral-800 border border-doctus-yellow/30 font-semibold">
            <div>
              <span className="text-neutral-500 block text-[10px]">Applicant</span>
              <strong>{currentUser.name} ({currentUser.employeeId})</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Department & Team</span>
              <strong>{currentUser.departmentName}</strong>
            </div>
          </div>

          {/* Leave Type Select */}
          <div>
            <label className="block font-extrabold text-neutral-800 dark:text-neutral-200 mb-1">
              Select Leave Type *
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-doctus-yellow"
            >
              {leaveOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Dates Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-extrabold text-neutral-800 dark:text-neutral-200 mb-1">
                From Date *
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-extrabold text-neutral-800 dark:text-neutral-200 mb-1">
                To Date *
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Days Calculation Banner */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between font-extrabold">
            <span className="text-emerald-900 dark:text-emerald-300">Total Leave Duration:</span>
            <span className="text-base text-doctus-red">{daysCount} Day(s)</span>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-extrabold text-neutral-800 dark:text-neutral-200 mb-1">
              Reason For Leave *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide specific details regarding your leave request..."
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-doctus-yellow"
            ></textarea>
          </div>

          {/* Emergency Contacts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Contact During Leave
              </label>
              <input
                type="text"
                value={contactDuringLeave}
                onChange={(e) => setContactDuringLeave(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Emergency Phone No.
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 font-extrabold text-neutral-950 shadow-md hover:shadow-glow-yellow transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
