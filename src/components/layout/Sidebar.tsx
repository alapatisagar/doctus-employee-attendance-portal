import React from 'react';
import { 
  Home, 
  Clock, 
  Calendar, 
  CalendarPlus, 
  FileText, 
  Users, 
  CheckSquare, 
  BarChart3, 
  Building2, 
  ShieldCheck, 
  Bell, 
  Megaphone, 
  User, 
  Settings, 
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon?: any;
  isHeader?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  mobileOpen,
  setMobileOpen
}) => {
  const { currentUser, activeRole, logout } = useAuth();

  const getNavItems = (role: UserRole): NavItem[] => {
    // Shared items for all roles
    const employeeItems: NavItem[] = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'attendance', label: 'My Attendance', icon: Clock },
      { id: 'calendar', label: 'Attendance Calendar', icon: Calendar },
      { id: 'apply-leave', label: 'Apply Leave', icon: CalendarPlus },
      { id: 'my-leaves', label: 'My Leaves & Balance', icon: FileText },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
      { id: 'profile', label: 'My Profile', icon: User },
    ];

    if (role === 'tl') {
      return [
        ...employeeItems,
        { id: 'header-tl', label: 'TEAM LEAD PANEL', isHeader: true },
        { id: 'attendance-control', label: 'Manage Team Attendance', icon: Clock },
        { id: 'team-attendance', label: 'My Team Summary', icon: Users },
        { id: 'leave-approvals', label: 'Leave Approvals', icon: CheckSquare },
        { id: 'team-calendar', label: 'Team Leave Calendar', icon: Calendar },
        { id: 'reports', label: 'Team Reports', icon: BarChart3 },
      ];
    }

    if (role === 'manager') {
      return [
        ...employeeItems,
        { id: 'header-mgr', label: 'MANAGER PANEL', isHeader: true },
        { id: 'attendance-control', label: 'Manage Dept Attendance', icon: Clock },
        { id: 'department-overview', label: 'Department Overview', icon: Building2 },
        { id: 'leave-approvals', label: 'Department Approvals', icon: CheckSquare },
        { id: 'team-comparison', label: 'Team Comparison', icon: Users },
        { id: 'reports', label: 'Manager Reports', icon: BarChart3 },
      ];
    }

    if (role === 'hr' || role === 'admin') {
      return [
        ...employeeItems,
        { id: 'header-admin', label: 'HR & ADMIN PANEL', isHeader: true },
        { id: 'attendance-control', label: 'Attendance Management', icon: Clock },
        { id: 'employee-mgmt', label: 'Employee Directory', icon: Users },
        { id: 'all-attendance', label: 'Org Attendance Master', icon: Clock },
        { id: 'leave-mgmt', label: 'Leave & Balances Config', icon: FileText },
        { id: 'leave-approvals', label: 'All Approvals', icon: CheckSquare },
        { id: 'holidays', label: 'Holidays Management', icon: Calendar },
        { id: 'manage-announcements', label: 'Publish Announcements', icon: Megaphone },
        { id: 'reports', label: 'Executive Reports', icon: BarChart3 },
        { id: 'audit-logs', label: 'Security Audit Logs', icon: ShieldCheck },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ];
    }

    return employeeItems;
  };

  const navItems = getNavItems(activeRole);

  const roleLabels: Record<UserRole, string> = {
    employee: 'Employee',
    tl: 'Team Lead',
    manager: 'Manager',
    hr: 'HR Manager',
    admin: 'System Admin',
  };

  const roleColors: Record<UserRole, string> = {
    employee: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    tl: 'bg-orange-100 text-orange-900 border-orange-300',
    manager: 'bg-purple-100 text-purple-900 border-purple-300',
    hr: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    admin: 'bg-red-100 text-red-900 border-red-300',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-br from-doctus-yellow/20 via-white to-transparent dark:from-doctus-yellow-950/20 dark:via-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-doctus-yellow to-doctus-yellow-600 flex items-center justify-center shadow-md border border-doctus-yellow-400 font-extrabold text-doctus-red text-2xl tracking-tighter">
              D
            </div>
            <div>
              <h1 className="font-extrabold text-base leading-tight tracking-tight text-neutral-950 dark:text-white">
                DOCTUS
              </h1>
              <p className="text-[10px] font-bold tracking-wider uppercase text-doctus-red">
                ATTENDANCE PORTAL
              </p>
            </div>
          </div>

          {/* Current User Quick Info */}
          {currentUser && (
            <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <img 
                  src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border-2 border-doctus-yellow object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    {currentUser.employeeId}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${roleColors[currentUser.role]}`}>
                {roleLabels[currentUser.role]}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item, idx) => {
            if (item.isHeader) {
              return (
                <div key={idx} className="pt-4 pb-1 px-3 text-[10px] font-black tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon!;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-doctus-yellow to-doctus-yellow-600 text-neutral-950 shadow-md translate-x-1' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-doctus-yellow/15 dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-doctus-red' : 'text-neutral-500 dark:text-neutral-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-doctus-red" />}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 text-doctus-red border border-doctus-red/20 hover:bg-doctus-red hover:text-white transition-all shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
