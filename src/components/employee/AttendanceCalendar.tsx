import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { dbService } from '../../services/db';
import { AttendanceRecord, Holiday } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AttendanceCalendar: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Default August 2026
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDayRecord, setSelectedDayRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadCalendarData();
    }
  }, [currentDate, currentUser]);

  const loadCalendarData = async () => {
    if (!currentUser) return;
    const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const recs = await dbService.getAttendanceRecords(currentUser.employeeId, monthStr);
    setRecords(recs);
    const hols = await dbService.getHolidays();
    setHolidays(hols);
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const changeYear = (year: number) => {
    setCurrentDate(prev => new Date(year, prev.getMonth(), 1));
  };

  const yearOptions = [2025, 2026, 2027];

  // Calendar rendering helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="space-y-6">
      <GlassCard>
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-doctus-red" />
            <div>
              <h2 className="text-xl font-extrabold text-neutral-950 dark:text-white">
                {monthNames[month]} {year}
              </h2>
              <p className="text-xs text-neutral-500">Monthly Attendance & Shift Breakdown</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Year selector */}
            <select
              value={year}
              onChange={(e) => changeYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-1.5 rounded-lg hover:bg-doctus-yellow/30 text-neutral-700 dark:text-neutral-200 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(2026, 7, 1))}
                className="px-2.5 py-1 text-xs font-bold text-doctus-red hover:underline"
              >
                Today
              </button>
              <button 
                onClick={() => changeMonth(1)}
                className="p-1.5 rounded-lg hover:bg-doctus-yellow/30 text-neutral-700 dark:text-neutral-200 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 text-[11px] font-bold">
          <span className="text-neutral-500 mr-1">Status Legend:</span>
          <Badge status="PRESENT" size="sm" />
          <Badge status="LATE" size="sm" />
          <Badge status="WFH" size="sm" />
          <Badge status="LEAVE" size="sm" />
          <Badge status="HOLIDAY" size="sm" />
          <Badge status="WEEK_OFF" size="sm" />
          <Badge status="ABSENT" size="sm" />
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Day Name Headers */}
          {dayNames.map((d, idx) => (
            <div 
              key={d} 
              className={`py-2 text-center text-xs font-black tracking-wider ${idx === 0 || idx === 6 ? 'text-doctus-red' : 'text-neutral-600 dark:text-neutral-400'}`}
            >
              {d}
            </div>
          ))}

          {/* Empty cells before 1st day */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 sm:h-28 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800/40 opacity-40"></div>
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dateObj = new Date(year, month, dayNum);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

            const rec = records.find(r => r.date === dateStr);
            const holiday = holidays.find(h => h.date === dateStr);

            const displayStatus = holiday ? 'HOLIDAY' : (rec?.status || (isWeekend ? 'WEEK_OFF' : 'PRESENT'));

            return (
              <div
                key={dayNum}
                onClick={() => rec && setSelectedDayRecord(rec)}
                className={`
                  h-24 sm:h-28 rounded-xl p-2 border transition-all flex flex-col justify-between cursor-pointer relative group
                  ${isWeekend 
                    ? 'bg-neutral-100/70 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800' 
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-doctus-yellow hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${isWeekend ? 'text-doctus-red' : 'text-neutral-900 dark:text-white'}`}>
                    {dayNum}
                  </span>
                  <Badge status={displayStatus} size="sm" />
                </div>

                <div className="my-auto space-y-0.5 text-[10px]">
                  {rec?.checkIn && (
                    <div className="text-emerald-700 dark:text-emerald-400 font-mono font-bold truncate">
                      In: {rec.checkIn}
                    </div>
                  )}
                  {rec?.checkOut && (
                    <div className="text-neutral-600 dark:text-neutral-400 font-mono font-bold truncate">
                      Out: {rec.checkOut}
                    </div>
                  )}
                  {holiday && (
                    <div className="text-purple-700 dark:text-purple-300 font-bold truncate">
                      🎉 {holiday.name}
                    </div>
                  )}
                </div>

                {rec?.workingMinutes ? (
                  <div className="text-[10px] text-neutral-400 font-bold border-t border-neutral-100 dark:border-neutral-800 pt-0.5">
                    {Math.floor(rec.workingMinutes/60)}h {rec.workingMinutes%60}m
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Day Detail Modal */}
      {selectedDayRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                Attendance Detail — {selectedDayRecord.date}
              </h3>
              <Badge status={selectedDayRecord.status} />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <span className="text-neutral-500">Check In Time:</span>
                <strong className="font-mono">{selectedDayRecord.checkIn || 'N/A'}</strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <span className="text-neutral-500">Check Out Time:</span>
                <strong className="font-mono">{selectedDayRecord.checkOut || 'N/A'}</strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <span className="text-neutral-500">Work Mode:</span>
                <strong className="uppercase">{selectedDayRecord.workMode}</strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <span className="text-neutral-500">Late Minutes:</span>
                <strong className="text-amber-600">{selectedDayRecord.lateMinutes || 0} mins</strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <span className="text-neutral-500">Break Duration:</span>
                <strong>{selectedDayRecord.breakMinutes || 0} mins</strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <span className="text-neutral-500">Remarks:</span>
                <span>{selectedDayRecord.remarks || 'Standard Shift'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedDayRecord(null)}
              className="w-full py-2.5 rounded-xl bg-doctus-yellow font-extrabold text-xs text-neutral-950 hover:bg-doctus-yellow-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
