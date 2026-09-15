import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  UserCheck, 
  Calendar, 
  Users, 
  ShieldAlert,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { dbService } from '../../services/db';
import { Employee, AttendanceRecord, AttendanceStatus, HalfDaySession } from '../../types';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export const AttendanceManagement: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for Manual Modification
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [targetStatus, setTargetStatus] = useState<AttendanceStatus>('PRESENT');
  const [halfDaySession, setHalfDaySession] = useState<HalfDaySession>('FIRST_HALF');
  const [customCheckIn, setCustomCheckIn] = useState('09:00 AM');
  const [customCheckOut, setCustomCheckOut] = useState('06:00 PM');
  const [mandatoryReason, setMandatoryReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Bulk Selection
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate, currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    const allEmps = await dbService.getEmployees();

    // Role-Aware Filtering Scope
    let scopedEmps = allEmps;
    if (activeRole === 'tl') {
      scopedEmps = allEmps.filter(e => e.teamId === currentUser.teamId || e.tlId === currentUser.employeeId);
    } else if (activeRole === 'manager') {
      scopedEmps = allEmps.filter(e => e.departmentId === currentUser.departmentId || e.managerId === currentUser.employeeId);
    }
    setEmployees(scopedEmps);

    const records = await dbService.getAttendanceRecords(undefined, selectedDate.substring(0, 7));
    setAttendance(records.filter(r => r.date === selectedDate));
  };

  const handleOpenModifyModal = (emp: Employee, defaultStatus: AttendanceStatus = 'PRESENT') => {
    const existing = attendance.find(a => a.employeeId === emp.employeeId);
    setSelectedEmp(emp);
    setTargetStatus(defaultStatus);
    setHalfDaySession(existing?.halfDaySession || 'FIRST_HALF');
    setCustomCheckIn(existing?.checkIn || '09:00 AM');
    setCustomCheckOut(existing?.checkOut || (defaultStatus === 'HALF_DAY' ? '01:30 PM' : '06:00 PM'));
    setMandatoryReason('');
    setErrorMsg('');
  };

  const handleSaveAttendanceChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !currentUser) return;

    const isReasonRequired = targetStatus !== 'PRESENT' && targetStatus !== 'ABSENT';
    if (isReasonRequired && (!mandatoryReason || !mandatoryReason.trim())) {
      setErrorMsg('A mandatory reason is required for manual attendance modification.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await dbService.markAttendanceStatus(
        selectedEmp.employeeId,
        selectedDate,
        targetStatus,
        targetStatus === 'HALF_DAY' ? halfDaySession : undefined,
        mandatoryReason ? mandatoryReason.trim() : undefined,
        currentUser.employeeId,
        currentUser.name,
        activeRole,
        targetStatus === 'PRESENT' || targetStatus === 'HALF_DAY' || targetStatus === 'LATE' ? customCheckIn : undefined,
        targetStatus === 'PRESENT' || targetStatus === 'HALF_DAY' ? customCheckOut : undefined
      );

      confetti({ particleCount: 50, spread: 40 });
      setSelectedEmp(null);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (selectedEmpIds.length === 0 || !currentUser) return;

    const isReasonRequired = targetStatus !== 'PRESENT' && targetStatus !== 'ABSENT';
    if (isReasonRequired && (!mandatoryReason || !mandatoryReason.trim())) {
      setErrorMsg('A mandatory reason is required for bulk attendance updates.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dbService.bulkMarkAttendance(
        selectedEmpIds,
        selectedDate,
        targetStatus,
        mandatoryReason ? mandatoryReason.trim() : undefined,
        currentUser.employeeId,
        currentUser.name,
        activeRole
      );

      confetti({ particleCount: 60, spread: 50 });
      setIsBulkModalOpen(false);
      setSelectedEmpIds([]);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing bulk attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered employees table
  const filteredRows = employees.filter(e => {
    const rec = attendance.find(a => a.employeeId === e.employeeId);
    const currentSt = rec?.status || 'NOT_MARKED';
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || currentSt === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Summary Cards
  const totalEmps = employees.length;
  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const halfDayCount = attendance.filter(a => a.status === 'HALF_DAY').length;
  const absentCount = attendance.filter(a => a.status === 'ABSENT').length;
  const lateCount = attendance.filter(a => a.status === 'LATE').length;
  const leaveCount = attendance.filter(a => a.status === 'LEAVE').length;
  const wfhCount = attendance.filter(a => a.status === 'WFH').length;
  const notMarkedCount = Math.max(0, totalEmps - (presentCount + halfDayCount + absentCount + lateCount + leaveCount + wfhCount));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <GlassCard variant="yellow">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-doctus-red" />
              Role-Authorized Attendance Control
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Scope: <strong>{activeRole.toUpperCase()}</strong> • Date: <strong>{selectedDate}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 shadow-xs"
            />
            {selectedEmpIds.length > 0 && (
              <button
                onClick={() => { setIsBulkModalOpen(true); setMandatoryReason(''); setErrorMsg(''); }}
                className="px-4 py-2 rounded-xl bg-doctus-red text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                Bulk Update ({selectedEmpIds.length})
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border text-center">
          <span className="text-[10px] font-bold text-neutral-500 uppercase block">Total</span>
          <span className="text-lg font-black text-neutral-950 dark:text-white">{totalEmps}</span>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-center">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">Present</span>
          <span className="text-lg font-black text-emerald-700">{presentCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-center">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase block">Half Day (0.5)</span>
          <span className="text-lg font-black text-amber-700">{halfDayCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-300 text-center">
          <span className="text-[10px] font-bold text-orange-800 dark:text-orange-300 uppercase block">Late</span>
          <span className="text-lg font-black text-orange-700">{lateCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 text-center">
          <span className="text-[10px] font-bold text-red-800 dark:text-red-300 uppercase block">Absent</span>
          <span className="text-lg font-black text-red-700">{absentCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 text-center">
          <span className="text-[10px] font-bold text-yellow-900 dark:text-yellow-300 uppercase block">Leave</span>
          <span className="text-lg font-black text-yellow-800">{leaveCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 text-center">
          <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase block">WFH</span>
          <span className="text-lg font-black text-indigo-700">{wfhCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border text-center">
          <span className="text-[10px] font-bold text-neutral-500 uppercase block">Not Marked</span>
          <span className="text-lg font-black text-neutral-600 dark:text-neutral-300">{notMarkedCount}</span>
        </div>
      </div>

      {/* Filter Toolbar & Table */}
      <GlassCard className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Employee Name or ID..."
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
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="HALF_DAY">HALF DAY</option>
            <option value="LATE">LATE</option>
            <option value="ABSENT">ABSENT</option>
            <option value="LEAVE">LEAVE</option>
            <option value="WFH">WFH</option>
            <option value="NOT_MARKED">NOT MARKED</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-extrabold uppercase">
              <tr>
                <th className="py-3 px-3">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedEmpIds(filteredRows.map(r => r.employeeId));
                      else setSelectedEmpIds([]);
                    }}
                    checked={selectedEmpIds.length === filteredRows.length && filteredRows.length > 0}
                  />
                </th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department & Team</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium">
              {filteredRows.map(emp => {
                const rec = attendance.find(a => a.employeeId === emp.employeeId);
                const st = rec?.status || 'NOT_MARKED';
                const isSelected = selectedEmpIds.includes(emp.employeeId);

                return (
                  <tr key={emp.id} className="hover:bg-doctus-yellow/10 transition-colors">
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) setSelectedEmpIds(prev => prev.filter(id => id !== emp.employeeId));
                          else setSelectedEmpIds(prev => [...prev, emp.employeeId]);
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-doctus-red">{emp.employeeId}</td>
                    <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">{emp.name}</td>
                    <td className="py-3 px-4 text-neutral-500">
                      <div>{emp.departmentName}</div>
                      <div className="text-[10px]">{emp.teamName}</div>
                    </td>
                    <td className="py-3 px-4"><Badge status={st} size="sm" /></td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-neutral-400">{rec?.attendanceSource || '—'}</td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{rec?.checkIn || '—'}</td>
                    <td className="py-3 px-4 font-mono">{rec?.checkOut || '—'}</td>
                    <td className="py-3 px-4 font-bold">
                      {rec?.workingMinutes ? `${Math.floor(rec.workingMinutes/60)}h ${rec.workingMinutes%60}m` : '—'}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-neutral-400">
                      {rec?.lastModifiedBy ? `${rec.lastModifiedBy}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModifyModal(emp, 'PRESENT')}
                          className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold hover:bg-emerald-200"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleOpenModifyModal(emp, 'HALF_DAY')}
                          className="px-2 py-1 rounded bg-amber-100 text-amber-900 text-[10px] font-bold hover:bg-amber-200"
                        >
                          Half Day
                        </button>
                        <button
                          onClick={() => handleOpenModifyModal(emp, 'ABSENT')}
                          className="px-2 py-1 rounded bg-red-100 text-red-900 text-[10px] font-bold hover:bg-red-200"
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Manual Attendance Modification Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-lg w-full border-2 border-doctus-yellow/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-neutral-950 dark:text-white">
                  Manual Attendance Override
                </h3>
                <p className="text-xs text-neutral-500">
                  Target Employee: <strong>{selectedEmp.name} ({selectedEmp.employeeId})</strong>
                </p>
              </div>
              <Badge status={targetStatus} />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAttendanceChange} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Select Attendance Status *</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border font-bold"
                >
                  <option value="PRESENT">MARK PRESENT (Full Day)</option>
                  <option value="HALF_DAY">MARK HALF DAY (0.5 Attendance Equivalent)</option>
                  <option value="ABSENT">MARK ABSENT</option>
                  <option value="LEAVE">MARK LEAVE</option>
                  <option value="WFH">MARK WORK FROM HOME (WFH)</option>
                  <option value="ON_DUTY">MARK ON DUTY</option>
                  <option value="COMP_OFF">MARK COMP OFF</option>
                </select>
              </div>

              {/* Half Day Session Options */}
              {targetStatus === 'HALF_DAY' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300">
                  <label className="block font-extrabold text-amber-900 dark:text-amber-200 mb-1">
                    Half-Day Session *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHalfDaySession('FIRST_HALF')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border ${halfDaySession === 'FIRST_HALF' ? 'bg-amber-500 text-white' : 'bg-white text-neutral-800'}`}
                    >
                      FIRST HALF (09:00 AM - 01:30 PM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHalfDaySession('SECOND_HALF')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border ${halfDaySession === 'SECOND_HALF' ? 'bg-amber-500 text-white' : 'bg-white text-neutral-800'}`}
                    >
                      SECOND HALF (01:30 PM - 06:00 PM)
                    </button>
                  </div>
                </div>
              )}

              {/* Check-In / Check-Out Timestamps */}
              {(targetStatus === 'PRESENT' || targetStatus === 'HALF_DAY' || targetStatus === 'LATE') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Check-In Time</label>
                    <input
                      type="text"
                      value={customCheckIn}
                      onChange={(e) => setCustomCheckIn(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Check-Out Time</label>
                    <input
                      type="text"
                      value={customCheckOut}
                      onChange={(e) => setCustomCheckOut(e.target.value)}
                      placeholder="06:00 PM"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Reason / Justification */}
              <div>
                <label className={`block font-extrabold mb-1 ${targetStatus === 'PRESENT' || targetStatus === 'ABSENT' ? 'text-neutral-700 dark:text-neutral-300' : 'text-doctus-red'}`}>
                  {targetStatus === 'PRESENT' || targetStatus === 'ABSENT' ? 'Reason / Justification (Optional)' : 'Reason / Justification * (Required)'}
                </label>
                <textarea
                  rows={3}
                  value={mandatoryReason}
                  onChange={(e) => setMandatoryReason(e.target.value)}
                  placeholder={targetStatus === 'PRESENT' || targetStatus === 'ABSENT' ? "Optional justification/notes for this update..." : "Provide specific justification for this manual attendance change..."}
                  className={`w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border ${targetStatus === 'PRESENT' || targetStatus === 'ABSENT' ? 'border-neutral-300 dark:border-neutral-700' : 'border-doctus-red/40'} text-xs font-medium`}
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedEmp(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 text-neutral-950 font-black text-xs shadow-md"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm & Save Audit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full border border-neutral-200 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base">Bulk Update Attendance ({selectedEmpIds.length} Employees)</h3>
            <div>
              <label className="block text-xs font-bold mb-1">Select Status</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border text-xs font-bold"
              >
                <option value="PRESENT">MARK PRESENT</option>
                <option value="HALF_DAY">MARK HALF DAY</option>
                <option value="ABSENT">MARK ABSENT</option>
                <option value="LEAVE">MARK LEAVE</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${targetStatus === 'PRESENT' || targetStatus === 'ABSENT' ? 'text-neutral-700 dark:text-neutral-300' : 'text-doctus-red'}`}>
                {targetStatus === 'PRESENT' || targetStatus === 'ABSENT' ? 'Reason (Optional)' : 'Reason * (Required)'}
              </label>
              <textarea
                rows={3}
                value={mandatoryReason}
                onChange={(e) => setMandatoryReason(e.target.value)}
                placeholder={targetStatus === 'PRESENT' || targetStatus === 'ABSENT' ? "Optional reason for bulk mark..." : "Mandatory reason for bulk mark..."}
                className="w-full px-3 py-2 rounded-xl border text-xs"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs">Cancel</button>
              <button onClick={handleBulkSubmit} className="px-4 py-2 rounded-xl bg-doctus-yellow font-extrabold text-xs">Confirm Bulk Mark</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
