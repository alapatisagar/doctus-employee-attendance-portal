import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Printer, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { dbService } from '../../services/db';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const AttendanceHistoryTable: React.FC = () => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      loadRecords();
    }
  }, [currentUser]);

  const loadRecords = async () => {
    if (!currentUser) return;
    const list = await dbService.getAttendanceRecords(currentUser.employeeId);
    setRecords(list);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.date.includes(searchQuery) || (r.remarks && r.remarks.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesDate = !dateFilter || r.date.startsWith(dateFilter);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportExcel = () => {
    const data = filteredRecords.map(r => ({
      Date: r.date,
      Status: r.status,
      WorkMode: r.workMode,
      CheckIn: r.checkIn || 'N/A',
      CheckOut: r.checkOut || 'N/A',
      WorkingHours: `${Math.floor(r.workingMinutes / 60)}h ${r.workingMinutes % 60}m`,
      LateMinutes: r.lateMinutes || 0,
      BreakMinutes: r.breakMinutes || 0,
      Remarks: r.remarks || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'My Attendance');
    XLSX.writeFile(workbook, `Doctus_Attendance_${currentUser?.employeeId}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportCSV = () => {
    const headers = ['Date,Status,WorkMode,CheckIn,CheckOut,WorkingMinutes,Remarks\n'];
    const rows = filteredRecords.map(r => 
      `"${r.date}","${r.status}","${r.workMode}","${r.checkIn || ''}","${r.checkOut || ''}","${r.workingMinutes}","${r.remarks || ''}"`
    );
    const blob = new Blob([headers.join('') + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Doctus_Attendance_${currentUser?.employeeId}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <GlassCard className="space-y-4">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h3 className="font-extrabold text-lg text-neutral-950 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-doctus-red" />
            My Attendance Logs & History
          </h3>
          <p className="text-xs text-neutral-500">Showing {filteredRecords.length} records</p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportExcel}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-xl bg-doctus-yellow text-neutral-950 font-bold text-xs hover:bg-doctus-yellow-600 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs hover:bg-neutral-300 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search date or remarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
          />
        </div>

        {/* Month Filter */}
        <input
          type="month"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold"
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold"
        >
          <option value="ALL">All Statuses</option>
          <option value="PRESENT">PRESENT</option>
          <option value="LATE">LATE</option>
          <option value="WFH">WFH</option>
          <option value="LEAVE">LEAVE</option>
          <option value="HOLIDAY">HOLIDAY</option>
          <option value="WEEK_OFF">WEEK OFF</option>
        </select>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-extrabold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Mode</th>
              <th className="py-3 px-4">Check In</th>
              <th className="py-3 px-4">Check Out</th>
              <th className="py-3 px-4">Working Duration</th>
              <th className="py-3 px-4">Late Mins</th>
              <th className="py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-500">
                  No attendance records found matching filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-doctus-yellow/10 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold">{r.date}</td>
                  <td className="py-3 px-4"><Badge status={r.status} size="sm" /></td>
                  <td className="py-3 px-4 uppercase font-bold text-neutral-500">{r.workMode}</td>
                  <td className="py-3 px-4 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{r.checkIn || '—'}</td>
                  <td className="py-3 px-4 font-mono text-neutral-700 dark:text-neutral-300 font-bold">{r.checkOut || '—'}</td>
                  <td className="py-3 px-4 font-bold">{Math.floor(r.workingMinutes/60)}h {r.workingMinutes%60}m</td>
                  <td className="py-3 px-4 text-amber-600 font-bold">{r.lateMinutes > 0 ? `${r.lateMinutes}m` : '0m'}</td>
                  <td className="py-3 px-4 text-neutral-500 text-[11px] truncate max-w-xs">{r.remarks || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};
