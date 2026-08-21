export type UserRole = 'employee' | 'tl' | 'manager' | 'hr' | 'admin';

export type AccountStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'TERMINATED';

export type AttendanceStatus = 
  | 'PRESENT' 
  | 'HALF_DAY'
  | 'ABSENT' 
  | 'LEAVE' 
  | 'HOLIDAY' 
  | 'WEEK_OFF' 
  | 'LATE' 
  | 'WFH' 
  | 'ON_DUTY' 
  | 'COMP_OFF'
  | 'NOT_MARKED';

export type WorkMode = 'OFFICE' | 'WFH' | 'ON_DUTY';

export type HalfDaySession = 'FIRST_HALF' | 'SECOND_HALF';

export type AttendanceSource = 
  | 'LOGIN' 
  | 'EMPLOYEE_CHECK_IN' 
  | 'TL_MANUAL' 
  | 'MANAGER_MANUAL' 
  | 'HR_MANUAL' 
  | 'ADMIN_MANUAL' 
  | 'SYSTEM' 
  | 'LEAVE' 
  | 'HOLIDAY' 
  | 'WFH';

export type LeaveType = 
  | 'Casual Leave' 
  | 'Sick Leave' 
  | 'Earned Leave' 
  | 'Annual Leave' 
  | 'Emergency Leave' 
  | 'Unpaid Leave' 
  | 'Optional Holiday' 
  | 'Comp Off' 
  | 'Work From Home';

export type LeaveStatus = 
  | 'PENDING_TL' 
  | 'PENDING_MANAGER' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CLARIFICATION_REQUESTED' 
  | 'CANCELLED';

export interface Employee {
  id: string; // Database ID
  employeeId: string; // e.g. DBS-1001
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  joiningDate: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  teamId: string;
  teamName: string;
  tlId?: string;
  tlName?: string;
  managerId?: string;
  managerName?: string;
  role: UserRole;
  status: AccountStatus;
  firebaseUid?: string | null;
  photoURL?: string;
  workLocation?: string;
  employmentType?: string;
  activationToken?: string;
  activationExpiresAt?: string;
  link?: string;
  invitedAt?: string;
  activatedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  teamId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm AM/PM or ISO
  checkOut?: string;
  workingMinutes: number;
  status: AttendanceStatus;
  workMode: WorkMode;
  attendanceSource?: AttendanceSource;
  halfDaySession?: HalfDaySession;
  lateMinutes: number;
  breakMinutes: number;
  isOnBreak?: boolean;
  breakStartTime?: string;
  remarks?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveApprovalStep {
  role: UserRole;
  approverId: string;
  approverName: string;
  action: 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';
  comments?: string;
  timestamp: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentId: string;
  teamId: string;
  leaveType: LeaveType;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  days: number;
  reason: string;
  supportingDocument?: string;
  contactDuringLeave?: string;
  emergencyContact?: string;
  status: LeaveStatus;
  tlId?: string;
  tlApproval?: LeaveApprovalStep;
  managerId?: string;
  managerApproval?: LeaveApprovalStep;
  clarificationRequest?: string;
  approvalHistory: LeaveApprovalStep[];
  submittedAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  casual: { total: number; used: number; available: number };
  sick: { total: number; used: number; available: number };
  earned: { total: number; used: number; available: number };
  unpaid: { used: number };
  wfh: { total: number; used: number; available: number };
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  type: 'PUBLIC' | 'OPTIONAL' | 'COMPANY';
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: 'GENERAL' | 'HOLIDAY' | 'POLICY' | 'URGENT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  publishedBy: string;
  publishedAt: string;
  startDate: string;
  endDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string; // e.g. "MARK_PRESENT", "MARK_HALF_DAY", "CREATE_EMPLOYEE"
  targetId?: string;
  targetName?: string;
  previousStatus?: string;
  newStatus?: string;
  previousCheckIn?: string;
  newCheckIn?: string;
  previousCheckOut?: string;
  newCheckOut?: string;
  reason?: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'LEAVE_SUBMITTED' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'ATTENDANCE_REMINDER' | 'ANNOUNCEMENT' | 'ATTENDANCE_CHANGED';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface SystemSettings {
  companyName: string;
  officialStartTime: string; // e.g. "09:00"
  officialEndTime: string; // e.g. "18:00"
  gracePeriodMinutes: number; // e.g. 10
  maxBreakMinutes: number; // e.g. 60
  workingDays: number[]; // e.g. [1,2,3,4,5] (Mon-Fri)
  alternateSaturdaysWorking: boolean;
  emailNotificationsEnabled: boolean;
  attendanceRemindersEnabled: boolean;
  // Attendance Control Toggles
  autoPresentOnLogin: boolean;
  employeeCheckInEnabled: boolean;
  employeeCheckOutEnabled: boolean;
  employeeEditingEnabled: boolean; // MUST BE FALSE for security
  halfDayEnabled: boolean;
  tlManualAttendanceEnabled: boolean;
  managerManualAttendanceEnabled: boolean;
  hrManualAttendanceEnabled: boolean;
  adminManualAttendanceEnabled: boolean;
}
