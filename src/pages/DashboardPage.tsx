import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { EmployeeDashboard } from '../components/employee/EmployeeDashboard';
import { AttendanceCalendar } from '../components/employee/AttendanceCalendar';
import { AttendanceHistoryTable } from '../components/employee/AttendanceHistoryTable';
import { ApplyLeaveModal } from '../components/employee/ApplyLeaveModal';
import { TLDashboard } from '../components/tl/TLDashboard';
import { ManagerDashboard } from '../components/manager/ManagerDashboard';
import { EmployeeManagement } from '../components/admin/EmployeeManagement';
import { AttendanceManagement } from '../components/admin/AttendanceManagement';
import { AuditLogViewer } from '../components/admin/AuditLogViewer';
import { ReportsCenter } from '../components/admin/ReportsCenter';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <EmployeeDashboard 
            setActiveTab={setActiveTab} 
            openApplyLeave={() => setIsApplyLeaveOpen(true)}
            openCorrection={() => setActiveTab('attendance')}
          />
        );
      case 'attendance-control':
        return <AttendanceManagement />;
      case 'attendance':
      case 'my-leaves':
        return <AttendanceHistoryTable />;
      case 'calendar':
      case 'team-calendar':
        return <AttendanceCalendar />;
      case 'apply-leave':
        return (
          <EmployeeDashboard 
            setActiveTab={setActiveTab} 
            openApplyLeave={() => setIsApplyLeaveOpen(true)}
            openCorrection={() => setActiveTab('attendance')}
          />
        );
      case 'team-attendance':
      case 'leave-approvals':
        return <TLDashboard />;
      case 'department-overview':
      case 'team-comparison':
        return <ManagerDashboard />;
      case 'employee-mgmt':
      case 'all-attendance':
      case 'leave-mgmt':
        return <EmployeeManagement />;
      case 'audit-logs':
        return <AuditLogViewer />;
      case 'reports':
        return <ReportsCenter />;
      default:
        return (
          <EmployeeDashboard 
            setActiveTab={setActiveTab} 
            openApplyLeave={() => setIsApplyLeaveOpen(true)}
            openCorrection={() => setActiveTab('attendance')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-doctus-cream dark:bg-doctus-dark flex">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Header activeTab={activeTab} setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {renderContent()}
        </main>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen || activeTab === 'apply-leave'}
        onClose={() => {
          setIsApplyLeaveOpen(false);
          if (activeTab === 'apply-leave') setActiveTab('dashboard');
        }}
        onSuccess={() => setActiveTab('my-leaves')}
      />
    </div>
  );
};
