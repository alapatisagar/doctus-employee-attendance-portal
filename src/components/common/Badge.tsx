import React from 'react';
import { AttendanceStatus, AccountStatus, LeaveStatus } from '../../types';

interface BadgeProps {
  status: AttendanceStatus | AccountStatus | LeaveStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md',
    md: 'px-3 py-1 text-xs font-bold rounded-full',
    lg: 'px-4 py-1.5 text-sm font-bold rounded-full',
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'PRESENT':
      case 'ACTIVE':
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      case 'HALF_DAY':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-400 dark:border-amber-700 font-black';
      case 'NOT_MARKED':
        return 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-300 border-dashed';
      case 'ABSENT':
      case 'TERMINATED':
      case 'REJECTED':
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800';
      case 'LATE':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      case 'PENDING_TL':
      case 'PENDING_MANAGER':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300 dark:border-orange-800';
      case 'LEAVE':
        return 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-400 dark:border-yellow-700';
      case 'HOLIDAY':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800';
      case 'WEEK_OFF':
        return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700';
      case 'WFH':
      case 'INVITED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800';
      case 'ON_DUTY':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-300';
    }
  };

  const formatText = (st: string) => {
    return st.replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex items-center justify-center tracking-wide uppercase ${sizeStyles[size]} ${getStatusColor(status)} ${className}`}>
      {formatText(status)}
    </span>
  );
};
