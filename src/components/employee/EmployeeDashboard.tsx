import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  LogOut, 
  Coffee, 
  Calendar, 
  CalendarPlus, 
  AlertCircle, 
  TrendingUp, 
  Award, 
  FileText,
  Building2,
  UserCheck,
  Megaphone,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { AttendanceRecord, LeaveBalance, Announcement, Holiday } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import confetti from 'canvas-confetti';

interface EmployeeDashboardProps {
  setActiveTab: (tab: string) => void;
  openApplyLeave: () => void;
  openCorrection: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ 
  setActiveTab, 
  openApplyLeave,
  openCorrection
}) => {
  const { currentUser } = useAuth();
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>(undefined);
  const [balances, setBalances] = useState<LeaveBalance | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [workMode, setWorkMode] = useState<'OFFICE' | 'WFH' | 'ON_DUTY'>('OFFICE');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [stats, setStats] = useState({ present: 16, halfDays: 2, late: 2, wfh: 1, absent: 0, percentage: 95.2 });

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;
    const today = await dbService.getTodayAttendance(currentUser.employeeId);
    setTodayRecord(today);
    const bal = await dbService.getLeaveBalances(currentUser.employeeId);
    setBalances(bal);
    const anns = await dbService.getAnnouncements();
    setAnnouncements(anns.slice(0, 2));
    const hols = await dbService.getHolidays();
    setHolidays(hols.filter(h => new Date(h.date) >= new Date()).slice(0, 3));
  };

  const handleCheckIn = async () => {
    if (!currentUser) return;
    setIsLoadingAction(true);
    try {
      const rec = await dbService.checkIn(currentUser.employeeId, workMode);
      setTodayRecord(rec);
      // Trigger celebrate confetti
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to check out for today?')) return;
    setIsLoadingAction(true);
    try {
      const rec = await dbService.checkOut(currentUser.employeeId);
      setTodayRecord(rec);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleStartBreak = async () => {
    if (!currentUser) return;
    try {
      const rec = await dbService.startBreak(currentUser.employeeId);
      setTodayRecord(rec);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleEndBreak = async () => {
    if (!currentUser) return;
    try {
      const rec = await dbService.endBreak(currentUser.employeeId);
      setTodayRecord(rec);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <GlassCard variant="yellow" className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-doctus-red text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Doctus Self-Service
              </span>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-300 font-bold">
                ID: {currentUser?.employeeId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Good Morning, <span className="text-doctus-red">{currentUser?.name}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Department: <strong>{currentUser?.departmentName}</strong></span>
              <span>Team: <strong>{currentUser?.teamName}</strong></span>
              <span>TL: <strong>{currentUser?.tlName || 'Unassigned'}</strong></span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openApplyLeave}
              className="px-4 py-2.5 rounded-xl bg-doctus-red text-white font-extrabold text-xs shadow-md hover:bg-doctus-red-600 transition-all flex items-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" />
              Apply Leave
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Check-in Widget & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check In / Check Out Interactive Card */}
        <GlassCard className="lg:col-span-1 border-2 border-doctus-yellow/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-doctus-red" />
                Today's Attendance
              </h3>
              {todayRecord?.status && (
                <Badge status={todayRecord.status} size="md" />
              )}
            </div>

            {/* Work Mode Selection (before check in) */}
            {!todayRecord?.checkIn && (
              <div className="mb-4 bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Select Work Mode:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['OFFICE', 'WFH', 'ON_DUTY'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setWorkMode(mode)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                        workMode === mode 
                          ? 'bg-doctus-yellow text-neutral-950 border-doctus-yellow-600 shadow-xs' 
                          : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Check-In / Check-Out Action Button Area */}
            <div className="my-4 text-center">
              {!todayRecord?.checkIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={isLoadingAction}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-doctus-yellow via-doctus-yellow-600 to-doctus-yellow text-neutral-950 font-black text-lg shadow-lg hover:shadow-glow-yellow hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-1 border-2 border-doctus-yellow-300"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-doctus-red" />
                    <span>CHECK IN NOW</span>
                  </div>
                  <span className="text-xs font-normal opacity-90">Official shift start: 09:00 AM</span>
                </button>
              ) : !todayRecord?.checkOut ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm mb-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>CHECKED IN ✓</span>
                    </div>
                    <p className="text-2xl font-black font-mono text-neutral-900 dark:text-white">
                      {todayRecord.checkIn}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Work Mode: <strong className="uppercase">{todayRecord.workMode}</strong>
                    </p>
                  </div>

                  {/* Break Management Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span>Break Duration: {todayRecord.breakMinutes || 0} mins</span>
                    </div>
                    {todayRecord.isOnBreak ? (
                      <button
                        onClick={handleEndBreak}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                      >
                        End Break
                      </button>
                    ) : (
                      <button
                        onClick={handleStartBreak}
                        className="px-3 py-1 rounded-lg bg-amber-500 text-white font-bold text-xs hover:bg-amber-600"
                      >
                        Start Break
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleCheckOut}
                    disabled={isLoadingAction}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-doctus-red to-doctus-red-800 text-white font-extrabold text-sm shadow-md hover:shadow-glow-red transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>CHECK OUT</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    CHECKED OUT ✓
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg">
                      <span className="text-neutral-500 block text-[10px]">Check In</span>
                      <strong className="font-mono">{todayRecord.checkIn}</strong>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg">
                      <span className="text-neutral-500 block text-[10px]">Check Out</span>
                      <strong className="font-mono">{todayRecord.checkOut}</strong>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-bold pt-1">
                    Total Hours Worked: {Math.floor((todayRecord.workingMinutes || 0)/60)}h {(todayRecord.workingMinutes || 0)%60}m
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>Shift: 09:00 AM - 06:00 PM</span>
            <span>Grace: 10 mins</span>
          </div>
        </GlassCard>

        {/* Leave Balances Cards */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-doctus-red" />
              Available Leave Balances
            </h3>
            <button 
              onClick={() => setActiveTab('my-leaves')}
              className="text-xs font-bold text-doctus-red hover:underline flex items-center gap-1"
            >
              View Full Details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-100/50 dark:from-yellow-950/30 dark:to-neutral-900 border border-yellow-200 dark:border-yellow-800 text-center">
              <span className="text-[11px] font-bold text-yellow-900 dark:text-yellow-300 uppercase block">Casual Leave</span>
              <span className="text-2xl font-black text-neutral-950 dark:text-white my-1 block">
                {balances?.casual.available ?? 8}
              </span>
              <span className="text-[10px] text-neutral-500">Used: {balances?.casual.used ?? 4} / Total: {balances?.casual.total ?? 12}</span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100/50 dark:from-emerald-950/30 dark:to-neutral-900 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase block">Sick Leave</span>
              <span className="text-2xl font-black text-neutral-950 dark:text-white my-1 block">
                {balances?.sick.available ?? 6}
              </span>
              <span className="text-[10px] text-neutral-500">Used: {balances?.sick.used ?? 2} / Total: {balances?.sick.total ?? 8}</span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-100/50 dark:from-purple-950/30 dark:to-neutral-900 border border-purple-200 dark:border-purple-800 text-center">
              <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase block">Earned Leave</span>
              <span className="text-2xl font-black text-neutral-950 dark:text-white my-1 block">
                {balances?.earned.available ?? 12}
              </span>
              <span className="text-[10px] text-neutral-500">Used: {balances?.earned.used ?? 3} / Total: {balances?.earned.total ?? 15}</span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-100/50 dark:from-blue-950/30 dark:to-neutral-900 border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase block">WFH Balance</span>
              <span className="text-2xl font-black text-neutral-950 dark:text-white my-1 block">
                {balances?.wfh?.available ?? 16}
              </span>
              <span className="text-[10px] text-neutral-500">Used: {balances?.wfh?.used ?? 8} / Total: {balances?.wfh?.total ?? 24}</span>
            </div>
          </div>

          {/* Monthly Attendance Statistics Bar */}
          <div className="mt-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> August 2026 Attendance Summary
              </span>
              <span className="text-xs font-black text-doctus-red">
                Attendance Equivalent: <strong>{(stats.present + (stats.halfDays || 2) * 0.5).toFixed(1)} Days</strong> ({stats.percentage}%)
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-xs pt-1">
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-emerald-600 font-black text-base block">{stats.present}</span>
                <span className="text-[10px] text-neutral-500">Present</span>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-amber-600 font-black text-base block">{stats.halfDays || 2}</span>
                <span className="text-[10px] text-neutral-500">Half Days (0.5)</span>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-amber-600 font-black text-base block">{stats.late}</span>
                <span className="text-[10px] text-neutral-500">Late Days</span>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-indigo-600 font-black text-base block">{stats.wfh}</span>
                <span className="text-[10px] text-neutral-500">WFH Days</span>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-red-600 font-black text-base block">{stats.absent}</span>
                <span className="text-[10px] text-neutral-500">Absent</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Grid: Announcements & Upcoming Holidays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Announcements */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-doctus-red" />
              Company Announcements
            </h3>
            <button 
              onClick={() => setActiveTab('announcements')}
              className="text-xs font-bold text-doctus-red hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className="p-3.5 rounded-xl bg-doctus-yellow/10 dark:bg-neutral-800 border border-doctus-yellow/30">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-black text-neutral-900 dark:text-white">{ann.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-doctus-yellow text-neutral-950">
                    {ann.category}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                  {ann.message}
                </p>
                <span className="text-[10px] text-neutral-400 block mt-2">By {ann.publishedBy}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Upcoming Holidays */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Upcoming Company Holidays
            </h3>
            <button 
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-bold text-doctus-red hover:underline"
            >
              Calendar
            </button>
          </div>

          <div className="space-y-2.5">
            {holidays.map(h => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <div>
                  <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">{h.name}</h4>
                  <span className="text-[10px] text-neutral-500">{h.type} Holiday • {h.description}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black font-mono text-purple-900 dark:text-purple-300 block">{h.date}</span>
                  <span className="text-[10px] text-neutral-400">{h.dayOfWeek}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
