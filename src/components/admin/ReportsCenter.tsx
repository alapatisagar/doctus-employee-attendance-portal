import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileSpreadsheet, Printer, FileText, Calendar } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { dbService } from '../../services/db';
import { AttendanceRecord, LeaveRequest, Employee } from '../../types';
import * as XLSX from 'xlsx';

export const ReportsCenter: React.FC = () => {
  const [reportType, setReportType] = useState<'MONTHLY' | 'LEAVE' | 'LATE'>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadReportData();
  }, [selectedMonth]);

  const loadReportData = async () => {
    const att = await dbService.getAttendanceRecords(undefined, selectedMonth);
    setAttendance(att);
    const lvs = await dbService.getLeaveRequests();
    setLeaves(lvs);
    const emps = await dbService.getEmployees();
    setEmployees(emps);
  };

  const exportExcelReport = () => {
    let data: any[] = [];
    if (reportType === 'MONTHLY') {
      data = attendance.map(a => ({
        EmployeeID: a.employeeId,
        EmployeeName: a.employeeName,
        Date: a.date,
        Status: a.status,
        CheckIn: a.checkIn || 'N/A',
        CheckOut: a.checkOut || 'N/A',
        WorkingMinutes: a.workingMinutes,
        LateMinutes: a.lateMinutes,
        WorkMode: a.workMode,
      }));
    } else if (reportType === 'LEAVE') {
      data = leaves.map(l => ({
        EmployeeID: l.employeeCode,
        EmployeeName: l.employeeName,
        LeaveType: l.leaveType,
        FromDate: l.fromDate,
        ToDate: l.toDate,
        Days: l.days,
        Status: l.status,
        Reason: l.reason,
      }));
    } else {
      data = attendance.filter(a => a.status === 'LATE').map(a => ({
        EmployeeID: a.employeeId,
        EmployeeName: a.employeeName,
        Date: a.date,
        CheckIn: a.checkIn,
        Expected: '09:00 AM',
        LateMinutes: a.lateMinutes,
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType}_Report`);
    XLSX.writeFile(workbook, `DOCTUS_${reportType}_REPORT_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-doctus-red" />
              Executive Reports & Export Center
            </h2>
            <p className="text-xs text-neutral-500">
              Generate organization-wide attendance, leave utilization, and late arrival reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportExcelReport}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md flex items-center gap-2 hover:bg-emerald-700"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel (.xlsx)
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-doctus-yellow font-extrabold text-xs text-neutral-950 shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print PDF
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold mb-1">Select Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border font-bold"
            >
              <option value="MONTHLY">Monthly Attendance Master</option>
              <option value="LEAVE">Leave Utilization Summary</option>
              <option value="LATE">Late Arrival & Exception Log</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border font-bold"
            />
          </div>
        </div>

        {/* Preview Data */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100 dark:bg-neutral-800 font-extrabold uppercase">
              {reportType === 'MONTHLY' ? (
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Worked</th>
                </tr>
              ) : reportType === 'LEAVE' ? (
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              ) : (
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Actual Check In</th>
                  <th className="py-3 px-4">Expected</th>
                  <th className="py-3 px-4">Late Mins</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y font-medium">
              {reportType === 'MONTHLY' ? (
                attendance.slice(0, 15).map(a => (
                  <tr key={a.id} className="hover:bg-doctus-yellow/10">
                    <td className="py-3 px-4 font-bold">{a.employeeName} ({a.employeeId})</td>
                    <td className="py-3 px-4 font-mono">{a.date}</td>
                    <td className="py-3 px-4 font-bold">{a.status}</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">{a.checkIn || '—'}</td>
                    <td className="py-3 px-4 font-mono">{a.checkOut || '—'}</td>
                    <td className="py-3 px-4">{Math.floor(a.workingMinutes/60)}h {a.workingMinutes%60}m</td>
                  </tr>
                ))
              ) : reportType === 'LEAVE' ? (
                leaves.map(l => (
                  <tr key={l.id} className="hover:bg-doctus-yellow/10">
                    <td className="py-3 px-4 font-bold">{l.employeeName}</td>
                    <td className="py-3 px-4">{l.leaveType}</td>
                    <td className="py-3 px-4 font-mono">{l.fromDate}</td>
                    <td className="py-3 px-4 font-mono">{l.toDate}</td>
                    <td className="py-3 px-4 font-bold text-doctus-red">{l.days}</td>
                    <td className="py-3 px-4 font-bold">{l.status}</td>
                  </tr>
                ))
              ) : (
                attendance.filter(a => a.status === 'LATE').map(a => (
                  <tr key={a.id} className="hover:bg-doctus-yellow/10">
                    <td className="py-3 px-4 font-bold">{a.employeeName} ({a.employeeId})</td>
                    <td className="py-3 px-4 font-mono">{a.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-600">{a.checkIn}</td>
                    <td className="py-3 px-4 font-mono">09:00 AM</td>
                    <td className="py-3 px-4 font-bold text-red-600">{a.lateMinutes} mins</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
