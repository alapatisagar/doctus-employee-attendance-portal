import React, { useState } from 'react';
import { Menu, Sun, Moon, Sparkles, UserCheck, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ISTClock } from '../common/ISTClock';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { UserRole } from '../../types';
import { IS_DEMO_MODE_ENABLED } from '../../config/security';

interface HeaderProps {
  activeTab: string;
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setMobileOpen }) => {
  const { currentUser, activeRole, switchDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    'dashboard': { title: `Good Morning, ${currentUser?.firstName || 'Employee'}!`, subtitle: 'Welcome to your Doctus Self-Service Portal' },
    'attendance': { title: 'My Attendance Logs', subtitle: 'View check-in/check-out history and daily working hours' },
    'attendance-control': { title: 'Role-Authorized Attendance Control', subtitle: 'Mark Present, Half Day, Absent, or edit attendance with mandatory reason logging' },
    'calendar': { title: 'Attendance Monthly Calendar', subtitle: 'Interactive monthly status overview and holiday schedule' },
    'apply-leave': { title: 'Apply For Leave', subtitle: 'Submit new leave requests with instant conflict checking' },
    'my-leaves': { title: 'My Leaves & Balance', subtitle: 'Track available casual, sick, earned, and WFH balances' },
    'announcements': { title: 'Company Announcements', subtitle: 'Important updates and holiday notifications from HR' },
    'profile': { title: 'My Profile', subtitle: 'View and update your personal employee information' },
    'team-attendance': { title: 'Team Attendance Overview', subtitle: 'Monitor today\'s team status, late arrivals, and absences' },
    'leave-approvals': { title: 'Pending Leave Approvals', subtitle: 'Review, approve, reject, or clarify team leave requests' },
    'team-calendar': { title: 'Team Leave Calendar', subtitle: 'Shared schedule of upcoming team leaves and holidays' },
    'department-overview': { title: 'Department Dashboard', subtitle: 'Executive overview of attendance across department teams' },
    'team-comparison': { title: 'Team Comparison Analytics', subtitle: 'Compare attendance metrics and late arrival trends' },
    'employee-mgmt': { title: 'Employee Directory & Account Provisioning', subtitle: 'Add employees, send invitation links, edit roles and statuses' },
    'all-attendance': { title: 'Organization Attendance Master', subtitle: 'View and filter attendance records across all departments' },
    'leave-mgmt': { title: 'Leave & Balances Configuration', subtitle: 'Manage leave types, entitlement rules, and allocations' },
    'holidays': { title: 'Holiday Calendar Management', subtitle: 'Add and manage official company public holidays' },
    'manage-announcements': { title: 'Publish Announcements', subtitle: 'Create and broadcast company-wide updates' },
    'reports': { title: 'Reports & Export Center', subtitle: 'Generate and export attendance summaries to Excel, CSV & PDF' },
    'audit-logs': { title: 'Security Audit Logs', subtitle: 'Immutable history of administrative actions and status updates' },
    'settings': { title: 'System Settings', subtitle: 'Configure work hours, grace periods, and notification rules' },
  };

  const currentInfo = tabTitles[activeTab] || { title: 'Doctus Portal', subtitle: 'Employee Self-Service' };

  const demoUsers: { id: string; name: string; role: UserRole; label: string }[] = [
    { id: 'EMP1001', name: 'Rahul Verma', role: 'employee', label: 'Employee' },
    { id: 'TL1001', name: 'Ananya Deshmukh', role: 'tl', label: 'Team Lead' },
    { id: 'MGR1001', name: 'Vikram Sengupta', role: 'manager', label: 'Manager' },
    { id: 'HR1001', name: 'Priya Nair', role: 'hr', label: 'HR Manager' },
    { id: 'ADMIN1001', name: 'Rajesh Sharma', role: 'admin', label: 'System Admin' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 lg:hidden hover:bg-doctus-yellow/20"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-neutral-950 dark:text-white leading-tight">
            {currentInfo.title}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Live IST Clock */}
        <ISTClock />

        {/* Notifications Bell */}
        <NotificationDropdown />

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/80 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-doctus-yellow-50 dark:hover:bg-neutral-700 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-doctus-yellow" /> : <Moon className="w-5 h-5 text-neutral-700" />}
        </button>

        {/* Quick Demo Role Switcher (Enabled ONLY when NOT in Production) */}
        {IS_DEMO_MODE_ENABLED && (
          <div className="relative">
            <button
              onClick={() => setShowDemoSwitcher(!showDemoSwitcher)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-doctus-yellow/20 to-doctus-red/10 border border-doctus-yellow/50 text-xs font-bold text-neutral-900 dark:text-white hover:border-doctus-red transition-all shadow-xs"
              title="Switch Demo Role"
            >
              <Sparkles className="w-4 h-4 text-doctus-red" />
              <span className="hidden md:inline">Demo Role:</span>
              <span className="uppercase text-doctus-red font-black">{activeRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            {showDemoSwitcher && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDemoSwitcher(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-doctus-yellow/40 dark:border-neutral-800 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[10px] font-black tracking-widest text-doctus-red uppercase mb-2 px-2 flex items-center justify-between">
                    <span>Quick Role Switcher (QA)</span>
                    <span className="bg-doctus-yellow px-1.5 py-0.5 rounded text-neutral-950">DEMO</span>
                  </div>
                  <div className="space-y-1">
                    {demoUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchDemoUser(u.id);
                          setShowDemoSwitcher(false);
                        }}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left
                          ${currentUser?.employeeId === u.id 
                            ? 'bg-doctus-yellow text-neutral-950 shadow-xs' 
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
                          }
                        `}
                      >
                        <div>
                          <p>{u.name}</p>
                          <p className="text-[10px] opacity-75 font-mono">{u.id}</p>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/10">
                          {u.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
