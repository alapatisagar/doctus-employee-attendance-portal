import { 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  LeaveBalance, 
  Holiday, 
  Announcement, 
  AuditLog, 
  NotificationItem,
  SystemSettings 
} from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  companyName: 'Doctus Business Solutions',
  officialStartTime: '09:00',
  officialEndTime: '18:00',
  gracePeriodMinutes: 10,
  maxBreakMinutes: 60,
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri
  alternateSaturdaysWorking: false,
  emailNotificationsEnabled: true,
  attendanceRemindersEnabled: true,
  // Production Attendance Control Settings
  autoPresentOnLogin: true,
  employeeCheckInEnabled: true,
  employeeCheckOutEnabled: true,
  employeeEditingEnabled: false, // Employees CANNOT edit attendance
  halfDayEnabled: true,
  tlManualAttendanceEnabled: true,
  managerManualAttendanceEnabled: true,
  hrManualAttendanceEnabled: true,
  adminManualAttendanceEnabled: true,
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-admin-1',
    employeeId: 'ADMIN1001',
    firstName: 'Sagar',
    lastName: 'Lapati',
    name: 'Sagar Lapati',
    email: 'sagarlapati3695@gmail.com',
    firebaseUid: 'NWCQo54XhPZUM9C3AZp1Zw802',
    phone: '+91 98765 43210',
    joiningDate: '2020-01-15',
    designation: 'VP of Human Resources & Admin',
    departmentId: 'dept-admin',
    departmentName: 'Administration & HR',
    teamId: 'team-exec',
    teamName: 'Executive Leadership',
    role: 'admin',
    status: 'ACTIVE',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    workLocation: 'Hyderabad HQ',
    employmentType: 'Full-Time',
    activatedAt: '2020-01-15T09:00:00Z',
    lastLoginAt: '2026-08-21T08:30:00Z',
    createdAt: '2020-01-15T09:00:00Z',
    updatedAt: '2026-08-21T08:30:00Z',
  },
  {
    id: 'emp-hr-1',
    employeeId: 'HR1001',
    firstName: 'Priya',
    lastName: 'Nair',
    name: 'Priya Nair',
    email: 'hr@doctus.com',
    phone: '+91 98765 43211',
    joiningDate: '2021-03-01',
    designation: 'Senior HR Manager',
    departmentId: 'dept-hr',
    departmentName: 'Human Resources',
    teamId: 'team-hr-ops',
    teamName: 'HR Operations',
    managerId: 'emp-admin-1',
    managerName: 'Rajesh Sharma',
    role: 'hr',
    status: 'ACTIVE',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    workLocation: 'Hyderabad HQ',
    employmentType: 'Full-Time',
    activatedAt: '2021-03-01T09:00:00Z',
    lastLoginAt: '2026-08-21T08:45:00Z',
    createdAt: '2021-03-01T09:00:00Z',
    updatedAt: '2026-08-21T08:45:00Z',
  },
  {
    id: 'emp-mgr-1',
    employeeId: 'MGR1001',
    firstName: 'Vikram',
    lastName: 'Sengupta',
    name: 'Vikram Sengupta',
    email: 'manager@doctus.com',
    phone: '+91 98765 43212',
    joiningDate: '2021-06-15',
    designation: 'Operations Delivery Manager',
    departmentId: 'dept-ar',
    departmentName: 'AR Calling & Billing',
    teamId: 'team-ar-dept',
    teamName: 'AR Billing Management',
    managerId: 'emp-admin-1',
    managerName: 'Rajesh Sharma',
    role: 'manager',
    status: 'ACTIVE',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    workLocation: 'Hyderabad HQ',
    employmentType: 'Full-Time',
    activatedAt: '2021-06-15T09:00:00Z',
    lastLoginAt: '2026-08-21T08:50:00Z',
    createdAt: '2021-06-15T09:00:00Z',
    updatedAt: '2026-08-21T08:50:00Z',
  },
  {
    id: 'emp-tl-1',
    employeeId: 'TL1001',
    firstName: 'Ananya',
    lastName: 'Deshmukh',
    name: 'Ananya Deshmukh',
    email: 'tl@doctus.com',
    phone: '+91 98765 43213',
    joiningDate: '2022-02-10',
    designation: 'Team Lead - AR Accounts',
    departmentId: 'dept-ar',
    departmentName: 'AR Calling & Billing',
    teamId: 'team-ar-alpha',
    teamName: 'AR Calling Team Alpha',
    managerId: 'emp-mgr-1',
    managerName: 'Vikram Sengupta',
    role: 'tl',
    status: 'ACTIVE',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    workLocation: 'Hyderabad HQ',
    employmentType: 'Full-Time',
    activatedAt: '2022-02-10T09:00:00Z',
    lastLoginAt: '2026-08-21T08:55:00Z',
    createdAt: '2022-02-10T09:00:00Z',
    updatedAt: '2026-08-21T08:55:00Z',
  },
  {
    id: 'emp-1001',
    employeeId: 'EMP1001',
    firstName: 'Rahul',
    lastName: 'Verma',
    name: 'Rahul Verma',
    email: 'employee@doctus.com',
    phone: '+91 98765 43214',
    joiningDate: '2023-05-15',
    designation: 'Senior AR Calling Specialist',
    departmentId: 'dept-ar',
    departmentName: 'AR Calling & Billing',
    teamId: 'team-ar-alpha',
    teamName: 'AR Calling Team Alpha',
    tlId: 'emp-tl-1',
    tlName: 'Ananya Deshmukh',
    managerId: 'emp-mgr-1',
    managerName: 'Vikram Sengupta',
    role: 'employee',
    status: 'ACTIVE',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    workLocation: 'Hyderabad HQ',
    employmentType: 'Full-Time',
    activatedAt: '2023-05-15T09:00:00Z',
    lastLoginAt: '2026-08-21T09:02:00Z',
    createdAt: '2023-05-15T09:00:00Z',
    updatedAt: '2026-08-21T09:02:00Z',
  },
  {
    id: 'emp-1002',
    employeeId: 'EMP1002',
    firstName: 'Sneha',
    lastName: 'Reddy',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@doctus.com',
    phone: '+91 98765 43215',
    joiningDate: '2023-08-20',
    designation: 'Medical Coding Specialist',
    departmentId: 'dept-coding',
    departmentName: 'Medical Coding',
    teamId: 'team-coding-beta',
    teamName: 'Medical Coding Team Beta',
    tlId: 'emp-tl-1',
    tlName: 'Ananya Deshmukh',
    managerId: 'emp-mgr-1',
    managerName: 'Vikram Sengupta',
    role: 'employee',
    status: 'ACTIVE',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    workLocation: 'Hyderabad HQ',
    employmentType: 'Full-Time',
    activatedAt: '2023-08-20T09:00:00Z',
    lastLoginAt: '2026-08-20T17:30:00Z',
    createdAt: '2023-08-20T09:00:00Z',
    updatedAt: '2026-08-20T17:30:00Z',
  },
  {
    id: 'emp-1003',
    employeeId: 'EMP1003',
    firstName: 'Karthik',
    lastName: 'Iyer',
    name: 'Karthik Iyer',
    email: 'karthik.iyer@doctus.com',
    phone: '+91 98765 43216',
    joiningDate: '2024-01-10',
    designation: 'AR Specialist',
    departmentId: 'dept-ar',
    departmentName: 'AR Calling & Billing',
    teamId: 'team-ar-alpha',
    teamName: 'AR Calling Team Alpha',
    tlId: 'emp-tl-1',
    tlName: 'Ananya Deshmukh',
    managerId: 'emp-mgr-1',
    managerName: 'Vikram Sengupta',
    role: 'employee',
    status: 'ACTIVE',
    photoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    workLocation: 'Hyderabad HQ',
    employmentType: 'Full-Time',
    activatedAt: '2024-01-10T09:00:00Z',
    lastLoginAt: '2026-08-21T09:12:00Z',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2026-08-21T09:12:00Z',
  },
  {
    id: 'emp-1004',
    employeeId: 'EMP1004',
    firstName: 'Meera',
    lastName: 'Joshi',
    name: 'Meera Joshi',
    email: 'meera.joshi@doctus.com',
    phone: '+91 98765 43217',
    joiningDate: '2026-08-20',
    designation: 'Junior Revenue Analyst',
    departmentId: 'dept-ar',
    departmentName: 'AR Calling & Billing',
    teamId: 'team-ar-alpha',
    teamName: 'AR Calling Team Alpha',
    tlId: 'emp-tl-1',
    tlName: 'Ananya Deshmukh',
    managerId: 'emp-mgr-1',
    managerName: 'Vikram Sengupta',
    role: 'employee',
    status: 'INVITED',
    activationToken: 'ACTIVATE-DOCTUS-2026-MEERA-99',
    activationExpiresAt: '2026-08-28T23:59:59Z',
    invitedAt: '2026-08-20T14:30:00Z',
    createdAt: '2026-08-20T14:30:00Z',
    updatedAt: '2026-08-20T14:30:00Z',
  }
];

export const INITIAL_LEAVE_BALANCES: Record<string, LeaveBalance> = {
  'EMP1001': {
    employeeId: 'EMP1001',
    casual: { total: 12, used: 4, available: 8 },
    sick: { total: 8, used: 2, available: 6 },
    earned: { total: 15, used: 3, available: 12 },
    unpaid: { used: 0 },
    wfh: { total: 24, used: 8, available: 16 }
  },
  'EMP1002': {
    employeeId: 'EMP1002',
    casual: { total: 12, used: 2, available: 10 },
    sick: { total: 8, used: 1, available: 7 },
    earned: { total: 15, used: 5, available: 10 },
    unpaid: { used: 0 },
    wfh: { total: 24, used: 5, available: 19 }
  },
  'EMP1003': {
    employeeId: 'EMP1003',
    casual: { total: 12, used: 5, available: 7 },
    sick: { total: 8, used: 3, available: 5 },
    earned: { total: 15, used: 0, available: 15 },
    unpaid: { used: 0 },
    wfh: { total: 24, used: 12, available: 12 }
  },
  'TL1001': {
    employeeId: 'TL1001',
    casual: { total: 12, used: 3, available: 9 },
    sick: { total: 8, used: 2, available: 6 },
    earned: { total: 15, used: 4, available: 11 },
    unpaid: { used: 0 },
    wfh: { total: 24, used: 6, available: 18 }
  }
};

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 'hol-1',
    name: 'New Year Day',
    date: '2026-01-01',
    dayOfWeek: 'Thursday',
    type: 'PUBLIC',
    description: 'National Public Holiday'
  },
  {
    id: 'hol-2',
    name: 'Republic Day',
    date: '2026-01-26',
    dayOfWeek: 'Monday',
    type: 'PUBLIC',
    description: 'Indian Republic Day'
  },
  {
    id: 'hol-3',
    name: 'Holi',
    date: '2026-03-04',
    dayOfWeek: 'Wednesday',
    type: 'PUBLIC',
    description: 'Festival of Colors'
  },
  {
    id: 'hol-4',
    name: 'Independence Day',
    date: '2026-08-15',
    dayOfWeek: 'Saturday',
    type: 'PUBLIC',
    description: 'Indian Independence Day'
  },
  {
    id: 'hol-5',
    name: 'Gandhi Jayanti',
    date: '2026-10-02',
    dayOfWeek: 'Friday',
    type: 'PUBLIC',
    description: 'Mahatma Gandhi Birthday'
  },
  {
    id: 'hol-6',
    name: 'Diwali (Deepavali)',
    date: '2026-11-08',
    dayOfWeek: 'Sunday',
    type: 'PUBLIC',
    description: 'Festival of Lights'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Independence Day Holiday & Flag Hoisting Ceremony',
    message: 'Doctus Business Solutions will remain closed on August 15, 2026 for Independence Day. Join us virtually or at HQ for flag hoisting at 08:30 AM.',
    category: 'HOLIDAY',
    priority: 'HIGH',
    publishedBy: 'Priya Nair (HR)',
    publishedAt: '2026-08-12T10:00:00Z',
    startDate: '2026-08-12',
    endDate: '2026-08-16'
  },
  {
    id: 'ann-2',
    title: 'Updated Work From Home (WFH) & Check-In Grace Period Rules',
    message: 'Official office start time is 09:00 AM. A 10-minute grace period (up to 09:10 AM) is applicable. Check-ins after 09:10 AM will automatically record as LATE.',
    category: 'POLICY',
    priority: 'MEDIUM',
    publishedBy: 'Rajesh Sharma (Admin)',
    publishedAt: '2026-08-01T09:00:00Z',
    startDate: '2026-08-01',
    endDate: '2026-08-31'
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-101',
    employeeId: 'EMP1001',
    employeeName: 'Rahul Verma',
    employeeCode: 'EMP1001',
    departmentId: 'dept-ar',
    teamId: 'team-ar-alpha',
    leaveType: 'Casual Leave',
    fromDate: '2026-08-25',
    toDate: '2026-08-26',
    days: 2,
    reason: 'Family event and personal work in hometown.',
    contactDuringLeave: '+91 98765 43214',
    emergencyContact: '+91 98765 00000',
    status: 'PENDING_TL',
    tlId: 'emp-tl-1',
    approvalHistory: [],
    submittedAt: '2026-08-20T11:15:00Z',
    updatedAt: '2026-08-20T11:15:00Z'
  },
  {
    id: 'leave-102',
    employeeId: 'EMP1003',
    employeeName: 'Karthik Iyer',
    employeeCode: 'EMP1003',
    departmentId: 'dept-ar',
    teamId: 'team-ar-alpha',
    leaveType: 'Sick Leave',
    fromDate: '2026-08-18',
    toDate: '2026-08-18',
    days: 1,
    reason: 'High fever and doctor consultation.',
    contactDuringLeave: '+91 98765 43216',
    status: 'APPROVED',
    tlId: 'emp-tl-1',
    tlApproval: {
      role: 'tl',
      approverId: 'emp-tl-1',
      approverName: 'Ananya Deshmukh',
      action: 'APPROVED',
      comments: 'Take care & rest well.',
      timestamp: '2026-08-18T09:30:00Z'
    },
    approvalHistory: [
      {
        role: 'tl',
        approverId: 'emp-tl-1',
        approverName: 'Ananya Deshmukh',
        action: 'APPROVED',
        comments: 'Take care & rest well.',
        timestamp: '2026-08-18T09:30:00Z'
      }
    ],
    submittedAt: '2026-08-18T08:00:00Z',
    updatedAt: '2026-08-18T09:30:00Z'
  },
  {
    id: 'leave-103',
    employeeId: 'EMP1002',
    employeeName: 'Sneha Reddy',
    employeeCode: 'EMP1002',
    departmentId: 'dept-coding',
    teamId: 'team-coding-beta',
    leaveType: 'Earned Leave',
    fromDate: '2026-08-28',
    toDate: '2026-08-31',
    days: 4,
    reason: 'Outstation vacation planned in advance.',
    status: 'PENDING_TL',
    tlId: 'emp-tl-1',
    approvalHistory: [],
    submittedAt: '2026-08-19T14:20:00Z',
    updatedAt: '2026-08-19T14:20:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2026-08-20T14:30:00Z',
    actorId: 'HR1001',
    actorName: 'Priya Nair',
    actorRole: 'hr',
    action: 'CREATE_EMPLOYEE',
    targetId: 'EMP1004',
    targetName: 'Meera Joshi',
    details: 'Created employee account for Meera Joshi (EMP1004) in AR Calling & Billing department. Secure invitation link dispatched.'
  },
  {
    id: 'audit-2',
    timestamp: '2026-08-18T09:30:00Z',
    actorId: 'TL1001',
    actorName: 'Ananya Deshmukh',
    actorRole: 'tl',
    action: 'APPROVE_LEAVE',
    targetId: 'leave-102',
    targetName: 'Karthik Iyer',
    details: 'Approved 1 day Sick Leave request for Karthik Iyer for date 2026-08-18.'
  }
];

// Helper function to generate realistic attendance data for August 2026 up to today (Aug 21)
export function generateSeedAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const employees = [
    { id: 'EMP1001', name: 'Rahul Verma', dept: 'dept-ar', team: 'team-ar-alpha' },
    { id: 'EMP1002', name: 'Sneha Reddy', dept: 'dept-coding', team: 'team-coding-beta' },
    { id: 'EMP1003', name: 'Karthik Iyer', dept: 'dept-ar', team: 'team-ar-alpha' },
    { id: 'TL1001', name: 'Ananya Deshmukh', dept: 'dept-ar', team: 'team-ar-alpha' },
  ];

  // Loop through days 1 to 21 of August 2026
  for (let day = 1; day <= 21; day++) {
    const dateStr = `2026-08-${day < 10 ? '0' + day : day}`;
    const dateObj = new Date(2026, 7, day); // Month 7 is August
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat

    employees.forEach(emp => {
      // Check if it's today (Aug 21)
      const isToday = day === 21;

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Week Off
        records.push({
          id: `att-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          departmentId: emp.dept,
          teamId: emp.team,
          date: dateStr,
          status: 'WEEK_OFF',
          workMode: 'OFFICE',
          workingMinutes: 0,
          lateMinutes: 0,
          breakMinutes: 0,
          remarks: 'Weekend Off',
          createdAt: `${dateStr}T00:00:00Z`,
          updatedAt: `${dateStr}T00:00:00Z`
        });
      } else if (day === 15) {
        // Independence Day Holiday
        records.push({
          id: `att-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          departmentId: emp.dept,
          teamId: emp.team,
          date: dateStr,
          status: 'HOLIDAY',
          workMode: 'OFFICE',
          workingMinutes: 0,
          lateMinutes: 0,
          breakMinutes: 0,
          remarks: 'Independence Day',
          createdAt: `${dateStr}T00:00:00Z`,
          updatedAt: `${dateStr}T00:00:00Z`
        });
      } else if (emp.id === 'EMP1003' && day === 18) {
        // Sick leave approved earlier
        records.push({
          id: `att-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          departmentId: emp.dept,
          teamId: emp.team,
          date: dateStr,
          status: 'LEAVE',
          workMode: 'OFFICE',
          workingMinutes: 0,
          lateMinutes: 0,
          breakMinutes: 0,
          remarks: 'Sick Leave (Approved)',
          createdAt: `${dateStr}T00:00:00Z`,
          updatedAt: `${dateStr}T00:00:00Z`
        });
      } else if (isToday && emp.id === 'EMP1001') {
        // EMP1001 checked in today at 09:02 AM, currently checked in
        records.push({
          id: `att-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          departmentId: emp.dept,
          teamId: emp.team,
          date: dateStr,
          checkIn: '09:02 AM',
          status: 'PRESENT',
          workMode: 'OFFICE',
          workingMinutes: 120, // 2 hours so far
          lateMinutes: 0,
          breakMinutes: 0,
          remarks: 'On Duty',
          createdAt: `${dateStr}T09:02:00Z`,
          updatedAt: `${dateStr}T09:02:00Z`
        });
      } else {
        // Regular working day
        // Slight variations (some late, some WFH)
        const isLate = (day % 7 === 2 && emp.id === 'EMP1003'); // Day 5, 12, 19
        const isWFH = (day % 5 === 0 && emp.id === 'EMP1002');

        const checkInTime = isLate ? '09:18 AM' : '08:58 AM';
        const checkOutTime = '06:05 PM';
        const lateMins = isLate ? 18 : 0;
        const status = isLate ? 'LATE' : (isWFH ? 'WFH' : 'PRESENT');

        records.push({
          id: `att-${emp.id}-${dateStr}`,
          employeeId: emp.id,
          employeeName: emp.name,
          departmentId: emp.dept,
          teamId: emp.team,
          date: dateStr,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          workingMinutes: 545, // 9 hours 5 minutes
          status: status,
          workMode: isWFH ? 'WFH' : 'OFFICE',
          attendanceSource: isLate ? 'LOGIN' : (isWFH ? 'WFH' : 'EMPLOYEE_CHECK_IN'),
          lateMinutes: lateMins,
          breakMinutes: 45,
          remarks: isLate ? 'Checked in after 09:10 AM grace period' : 'Regular Shift',
          createdAt: `${dateStr}T${checkInTime}`,
          updatedAt: `${dateStr}T${checkOutTime}`
        });
      }
    });
  }

  return records;
}
