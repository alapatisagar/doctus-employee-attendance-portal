import React, { useState, useEffect } from 'react';
import { Building2, Users, CheckSquare, TrendingUp, BarChart2 } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { dbService } from '../../services/db';
import { Employee, LeaveRequest, AttendanceRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const ManagerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    const allEmps = await dbService.getEmployees();
    setEmployees(allEmps);
    const allLeaves = await dbService.getLeaveRequests();
    setLeaves(allLeaves);
  };

  const chartData = [
    { team: 'AR Alpha', present: 8, late: 1, wfh: 2, absent: 0 },
    { team: 'AR Beta', present: 10, late: 2, wfh: 1, absent: 0 },
    { team: 'Medical Coding', present: 12, late: 0, wfh: 3, absent: 1 },
    { team: 'IT Operations', present: 6, late: 1, wfh: 1, absent: 0 },
  ];

  return (
    <div className="space-y-6">
      <GlassCard variant="yellow">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-doctus-red text-white font-extrabold text-xl">
              MGR
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white">
                Operations Manager Dashboard — {currentUser?.name}
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Department: <strong>AR Calling & Revenue Cycle Management</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-xl font-extrabold text-xs">
              96.4% Department Attendance
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Analytics Chart & Department Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-base text-neutral-950 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-doctus-red" />
            Team Attendance Comparison (Today)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="team" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="present" fill="#10B981" name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="#F59E0B" name="Late" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wfh" fill="#6366F1" name="WFH" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Escalated Approvals Queue */}
        <GlassCard className="space-y-4">
          <h3 className="font-extrabold text-base text-neutral-950 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-doctus-red" />
            Escalated Approvals ({leaves.filter(l => l.status === 'PENDING_MANAGER').length})
          </h3>

          <div className="space-y-3">
            {leaves.filter(l => l.status === 'PENDING_MANAGER').length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-8">
                No escalated leave requests pending manager sign-off.
              </p>
            ) : (
              leaves.filter(l => l.status === 'PENDING_MANAGER').map(l => (
                <div key={l.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
                  <p className="font-bold">{l.employeeName} ({l.leaveType})</p>
                  <p className="text-[10px] text-neutral-500">{l.fromDate} to {l.toDate} ({l.days} days)</p>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
