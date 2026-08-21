import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckSquare, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Calendar, 
  MessageSquare, 
  AlertCircle,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { dbService } from '../../services/db';
import { LeaveRequest, AttendanceRecord, Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export const TLDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<Employee[]>([]);
  const [teamAttendance, setTeamAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'CLARIFY' | null>(null);
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadTLData();
    }
  }, [currentUser]);

  const loadTLData = async () => {
    if (!currentUser) return;
    const allLeaves = await dbService.getLeaveRequests();
    // Filter leaves for team lead (pending requests for team members)
    const teamLeaves = allLeaves.filter(l => l.status === 'PENDING_TL' || l.tlId === currentUser.employeeId);
    setPendingRequests(teamLeaves);

    const allEmps = await dbService.getEmployees();
    const myTeam = allEmps.filter(e => e.teamId === currentUser.teamId || e.tlId === currentUser.employeeId);
    setTeamMembers(myTeam);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAtt = await dbService.getAttendanceRecords(undefined, todayStr.substring(0, 7));
    setTeamAttendance(todayAtt.filter(a => a.date === todayStr));
  };

  const handleActionClick = (req: LeaveRequest, type: 'APPROVE' | 'REJECT' | 'CLARIFY') => {
    if (req.employeeId === currentUser?.employeeId) {
      alert('Self-approval is strictly forbidden. A Manager or HR Administrator must review your leave request.');
      return;
    }
    setSelectedRequest(req);
    setActionType(type);
    setComments('');
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType || !currentUser) return;

    setIsProcessing(true);
    try {
      if (actionType === 'APPROVE') {
        await dbService.approveLeave(
          selectedRequest.id,
          currentUser.employeeId,
          currentUser.name,
          'tl',
          comments
        );
        confetti({ particleCount: 60, spread: 50 });
      } else if (actionType === 'REJECT') {
        await dbService.rejectLeave(
          selectedRequest.id,
          currentUser.employeeId,
          currentUser.name,
          'tl',
          comments
        );
      }

      setSelectedRequest(null);
      setActionType(null);
      loadTLData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const presentCount = teamAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const lateCount = teamAttendance.filter(a => a.status === 'LATE').length;
  const wfhCount = teamAttendance.filter(a => a.status === 'WFH').length;

  return (
    <div className="space-y-6">
      {/* TL Summary Banner */}
      <GlassCard variant="yellow">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-doctus-yellow font-extrabold text-neutral-950 text-xl">
              TL
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white">
                Team Lead Dashboard — {currentUser?.teamName}
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Lead: <strong>{currentUser?.name}</strong> • Department: {currentUser?.departmentName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-300">
              {presentCount} Present
            </span>
            <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300">
              {lateCount} Late
            </span>
            <span className="bg-indigo-100 text-indigo-900 px-3 py-1.5 rounded-xl border border-indigo-300">
              {wfhCount} WFH
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Pending Approvals Queue & Team Member Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-extrabold text-base text-neutral-950 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-doctus-red" />
                Pending Team Leave Approvals ({pendingRequests.filter(r => r.status === 'PENDING_TL').length})
              </h3>
            </div>

            <div className="space-y-3">
              {pendingRequests.filter(r => r.status === 'PENDING_TL').length === 0 ? (
                <div className="p-8 text-center text-sm text-neutral-500 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                  🎉 No pending leave requests to review!
                </div>
              ) : (
                pendingRequests.filter(r => r.status === 'PENDING_TL').map(req => (
                  <div 
                    key={req.id} 
                    className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-doctus-yellow/40 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-doctus-yellow text-neutral-950 font-black flex items-center justify-center text-xs">
                          {req.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-neutral-950 dark:text-white">
                            {req.employeeName}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {req.employeeCode} • {req.leaveType}
                          </span>
                        </div>
                      </div>
                      <Badge status={req.status} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-xl font-semibold">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Dates</span>
                        <span>{req.fromDate} to {req.toDate}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Duration</span>
                        <strong className="text-doctus-red">{req.days} Day(s)</strong>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 italic bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50">
                      "{req.reason}"
                    </p>

                    {/* Decision Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleActionClick(req, 'REJECT')}
                        className="px-3.5 py-1.5 rounded-xl bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 font-extrabold text-xs hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleActionClick(req, 'APPROVE')}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 font-black text-xs text-neutral-950 shadow-xs hover:shadow-glow-yellow transition-all"
                      >
                        Approve Request
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Team Member Status List (1 Col) */}
        <div className="space-y-4">
          <GlassCard>
            <h3 className="font-extrabold text-base text-neutral-950 dark:text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-doctus-red" />
              Team Members ({teamMembers.length})
            </h3>

            <div className="space-y-2.5">
              {teamMembers.map(m => {
                const att = teamAttendance.find(a => a.employeeId === m.employeeId);
                return (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs">
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white">{m.name}</h4>
                      <span className="text-[10px] text-neutral-500 font-mono">{m.designation}</span>
                    </div>
                    <Badge status={att?.status || 'ABSENT'} size="sm" />
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Action Approval Confirmation Modal */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-neutral-950 dark:text-white">
                {actionType === 'APPROVE' ? 'Approve Leave Request?' : 'Reject Leave Request?'}
              </h3>
              <Badge status={actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED'} size="sm" />
            </div>

            <div className="p-3 rounded-xl bg-doctus-yellow/10 dark:bg-neutral-800 text-xs space-y-1">
              <p>Applicant: <strong>{selectedRequest.employeeName} ({selectedRequest.employeeCode})</strong></p>
              <p>Leave Type: <strong>{selectedRequest.leaveType}</strong></p>
              <p>Dates: <strong>{selectedRequest.fromDate} to {selectedRequest.toDate} ({selectedRequest.days} days)</strong></p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-800 dark:text-neutral-200 mb-1">
                Approver Comments / Remarks
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add comments or instructions for the employee..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`px-5 py-2 rounded-xl font-extrabold text-xs text-white shadow-md ${
                  actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-doctus-red hover:bg-doctus-red-600'
                }`}
              >
                {isProcessing ? 'Processing...' : (actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
