import { 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  LeaveBalance, 
  Holiday, 
  Announcement, 
  AuditLog, 
  NotificationItem,
  SystemSettings,
  AttendanceStatus,
  AttendanceSource,
  HalfDaySession,
  UserRole,
  AccountStatus,
  WorkMode
} from '../types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_LEAVE_BALANCES, 
  INITIAL_HOLIDAYS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_SETTINGS,
  generateSeedAttendance 
} from './seedData';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';

export interface UserAccount {
  firebaseUid: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  accountType: 'MANAGEMENT' | 'EMPLOYEE';
  employeeId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FirestoreProfileResult {
  status: 'PROFILE_FOUND' | 'PROFILE_NOT_FOUND' | 'FIRESTORE_TIMEOUT' | 'FIRESTORE_PERMISSION_DENIED' | 'FIRESTORE_NETWORK_ERROR';
  data?: UserAccount;
  error?: any;
  elapsedMs?: number;
}

const PRIMARY_ADMIN_PROFILE: UserAccount = {
  firebaseUid: 'NWCQo54XhPZUM9C3AZp1Zw802',
  email: 'sagarlapati3695@gmail.com',
  role: 'admin',
  status: 'ACTIVE',
  accountType: 'MANAGEMENT',
  employeeId: 'ADMIN1001',
  name: 'Sagar Lapati'
};

const STORAGE_KEYS = {
  EMPLOYEES: 'doctus_employees_v1',
  ATTENDANCE: 'doctus_attendance_v1',
  LEAVES: 'doctus_leaves_v1',
  BALANCES: 'doctus_balances_v1',
  HOLIDAYS: 'doctus_holidays_v1',
  ANNOUNCEMENTS: 'doctus_announcements_v1',
  AUDIT_LOGS: 'doctus_audit_logs_v1',
  NOTIFICATIONS: 'doctus_notifications_v1',
  SETTINGS: 'doctus_settings_v1',
};

function getStored<T>(key: string, defaultData: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
      }
      return JSON.parse(item);
    }
    return defaultData;
  } catch (e) {
    return defaultData;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    // Ignore
  }
}

class DatabaseService {
  private employees: Employee[];
  private attendance: AttendanceRecord[];
  private leaves: LeaveRequest[];
  private balances: Record<string, LeaveBalance>;
  private holidays: Holiday[];
  private announcements: Announcement[];
  private auditLogs: AuditLog[];
  private notifications: NotificationItem[];
  private settings: SystemSettings;

  constructor() {
    this.employees = getStored(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    this.attendance = getStored(STORAGE_KEYS.ATTENDANCE, generateSeedAttendance());
    this.leaves = getStored(STORAGE_KEYS.LEAVES, INITIAL_LEAVE_REQUESTS);
    this.balances = getStored(STORAGE_KEYS.BALANCES, INITIAL_LEAVE_BALANCES);
    this.holidays = getStored(STORAGE_KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
    this.announcements = getStored(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    this.auditLogs = getStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.notifications = getStored(STORAGE_KEYS.NOTIFICATIONS, []);
    this.settings = getStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

    this.ensurePrimaryAdminProfile();
  }

  private ensurePrimaryAdminProfile(): void {
    const adminIdx = this.employees.findIndex(e => 
      e.email.toLowerCase() === 'sagarlapati3695@gmail.com' || 
      e.firebaseUid === 'NWCQo54XhPZUM9C3AZp1Zw802' ||
      e.employeeId === 'ADMIN1001'
    );

    const now = new Date().toISOString();
    const primaryAdmin: Employee = {
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
      lastLoginAt: now,
      createdAt: '2020-01-15T09:00:00Z',
      updatedAt: now,
    };

    if (adminIdx !== -1) {
      this.employees[adminIdx] = { ...this.employees[adminIdx], ...primaryAdmin };
    } else {
      this.employees.unshift(primaryAdmin);
    }
    setStored(STORAGE_KEYS.EMPLOYEES, this.employees);

    try {
      setDoc(doc(db, 'users', 'NWCQo54XhPZUM9C3AZp1Zw802'), PRIMARY_ADMIN_PROFILE, { merge: true }).catch(() => {});
    } catch (e) {}
  }

  // --- CLOUD FIRESTORE USER ACCOUNT LOOKUP WITH DIAGNOSTICS (users/{uid}) ---
  async getUserAccountWithDiagnostics(uid: string): Promise<FirestoreProfileResult> {
    const startTime = Date.now();
    if (!uid) return { status: 'PROFILE_NOT_FOUND', elapsedMs: 0 };
    const cleanUid = uid.trim();

    try {
      const userRef = doc(db, 'users', cleanUid);
      const userSnap = await Promise.race([
        getDoc(userRef),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Firestore user lookup network timeout')), 8000)
        )
      ]);
      const elapsedMs = Date.now() - startTime;
      if (userSnap.exists()) {
        console.log(`[FIRESTORE REAL LOOKUP] Path: users/${cleanUid} | Status: PROFILE_FOUND | Time: ${elapsedMs}ms`);
        return { status: 'PROFILE_FOUND', data: userSnap.data() as UserAccount, elapsedMs };
      } else {
        console.log(`[FIRESTORE REAL LOOKUP] Path: users/${cleanUid} | Status: PROFILE_NOT_FOUND | Time: ${elapsedMs}ms`);
        return { status: 'PROFILE_NOT_FOUND', elapsedMs };
      }
    } catch (err: any) {
      const elapsedMs = Date.now() - startTime;
      const code = err?.code || '';
      const message = err?.message || String(err);
      console.error(`[FIRESTORE DIAGNOSTIC ERROR] Path: users/${cleanUid} | Code: ${code} | Message: ${message} | Time: ${elapsedMs}ms`);

      if (code === 'permission-denied') {
        return { status: 'FIRESTORE_PERMISSION_DENIED', error: err, elapsedMs };
      } else if (code === 'unavailable' || message.includes('network') || message.includes('timeout')) {
        return { status: 'FIRESTORE_TIMEOUT', error: err, elapsedMs };
      }
      return { status: 'FIRESTORE_NETWORK_ERROR', error: err, elapsedMs };
    }
  }

  async getUserAccount(uid: string): Promise<UserAccount | undefined> {
    const res = await this.getUserAccountWithDiagnostics(uid);
    if (res.status === 'PROFILE_FOUND') return res.data;

    const cleanUid = (uid || '').trim();
    const emp = this.employees.find(e => e.firebaseUid === cleanUid);
    if (emp) {
      return {
        firebaseUid: cleanUid,
        email: emp.email,
        role: emp.role,
        status: emp.status,
        accountType: emp.role === 'admin' || emp.role === 'hr' ? 'MANAGEMENT' : 'EMPLOYEE',
        employeeId: emp.employeeId,
        name: emp.name
      };
    }
    return undefined;
  }

  // --- EMPLOYEES & ACCOUNT RESOLUTION ---
  async getEmployees(): Promise<Employee[]> {
    return [...this.employees];
  }

  async getEmployeeById(idOrEmployeeId: string): Promise<Employee | undefined> {
    if (!idOrEmployeeId) return undefined;
    const cleanKey = idOrEmployeeId.trim().toLowerCase();
    return this.employees.find(e => 
      (e.id && e.id.toLowerCase() === cleanKey) || 
      (e.employeeId && e.employeeId.toLowerCase() === cleanKey) || 
      (e.firebaseUid && e.firebaseUid.toLowerCase() === cleanKey) ||
      (e.email && e.email.trim().toLowerCase() === cleanKey)
    );
  }

  async getEmployeeByFirebaseUidOrEmail(uid: string, email: string): Promise<Employee | undefined> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUid = (uid || '').trim();

    // 1. Direct Cloud Firestore users/{uid} Query
    if (cleanUid) {
      const userRes = await this.getUserAccountWithDiagnostics(cleanUid);
      if (userRes.status === 'PROFILE_FOUND' && userRes.data) {
        const u = userRes.data;
        let existingEmp = this.employees.find(e => e.employeeId === u.employeeId || e.firebaseUid === cleanUid);
        const now = new Date().toISOString();
        if (!existingEmp) {
          const newEmp: Employee = {
            id: u.employeeId || `emp-${Date.now()}`,
            employeeId: u.employeeId || 'DBS-540',
            firstName: u.name ? u.name.split(' ')[0] : 'Admin',
            lastName: u.name ? u.name.split(' ').slice(1).join(' ') : 'User',
            name: u.name || 'Sagar Alapati',
            email: u.email || cleanEmail,
            phone: '+91 99999 00000',
            joiningDate: now.split('T')[0],
            designation: u.role === 'admin' ? 'System Administrator' : 'Employee',
            departmentId: 'dept-management',
            departmentName: 'Management',
            teamId: 'team-executive',
            teamName: 'Executive Team',
            role: u.role,
            status: u.status,
            firebaseUid: cleanUid,
            employmentType: 'Full-Time',
            createdAt: now,
            updatedAt: now
          };
          this.employees.unshift(newEmp);
          setStored(STORAGE_KEYS.EMPLOYEES, this.employees);
          return newEmp;
        } else {
          existingEmp.role = u.role;
          existingEmp.status = u.status;
          existingEmp.firebaseUid = cleanUid;
          existingEmp.updatedAt = now;
          setStored(STORAGE_KEYS.EMPLOYEES, this.employees);
          return existingEmp;
        }
      }
    }

    // 2. Fallback match by exact firebaseUid or email in local dataset
    let emp = this.employees.find(e => e.firebaseUid && e.firebaseUid === cleanUid);
    if (!emp && cleanEmail) {
      emp = this.employees.find(e => e.email && e.email.trim().toLowerCase() === cleanEmail);
      if (emp && cleanUid) {
        emp.firebaseUid = cleanUid;
        setStored(STORAGE_KEYS.EMPLOYEES, this.employees);
      }
    }

    return emp;
  }

  async setAccountStatus(employeeId: string, status: AccountStatus, actorName: string = 'Admin'): Promise<Employee> {
    const emp = await this.getEmployeeById(employeeId);
    if (!emp) throw new Error('Employee not found');

    emp.status = status;
    emp.updatedAt = new Date().toISOString();
    setStored(STORAGE_KEYS.EMPLOYEES, this.employees);

    try {
      setDoc(doc(db, 'employees', emp.employeeId), { status }, { merge: true }).catch(() => {});
    } catch (e) {}

    await this.logAudit({
      actorId: 'ADMIN',
      actorName,
      actorRole: 'admin',
      action: 'UPDATE_EMPLOYEE_STATUS',
      targetId: emp.employeeId,
      targetName: emp.name,
      details: `Updated account status for ${emp.name} (${emp.employeeId}) to ${status}.`
    });

    return emp;
  }

  async resendInvitation(employeeId: string, actorName: string = 'Admin'): Promise<Employee> {
    const emp = await this.getEmployeeById(employeeId);
    if (!emp) throw new Error('Employee not found');

    const token = `ACTIVATE-DOCTUS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    emp.status = 'INVITED';
    emp.activationToken = token;
    emp.activationExpiresAt = expiresAt;
    emp.updatedAt = new Date().toISOString();

    setStored(STORAGE_KEYS.EMPLOYEES, this.employees);

    await this.logAudit({
      actorId: 'ADMIN',
      actorName,
      actorRole: 'admin',
      action: 'RESEND_INVITATION',
      targetId: emp.employeeId,
      targetName: emp.name,
      details: `Resent activation invitation to ${emp.name} (${emp.email}). New token generated.`
    });

    return emp;
  }

  async handleUserLogin(employeeId: string): Promise<Employee> {
    const emp = await this.getEmployeeById(employeeId);
    if (!emp) throw new Error('Employee not found');

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    emp.lastLoginAt = now.toISOString();
    setStored(STORAGE_KEYS.EMPLOYEES, this.employees);

    if (this.settings.autoPresentOnLogin) {
      let todayRecord = this.attendance.find(a => a.employeeId === emp.employeeId && a.date === todayStr);

      if (!todayRecord) {
        const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const startMins = 9 * 60;
        const graceMins = this.settings.gracePeriodMinutes || 10;
        const targetMins = startMins + graceMins;
        const isLate = currentMins > targetMins;
        const lateMins = isLate ? (currentMins - startMins) : 0;
        const status: AttendanceStatus = isLate ? 'LATE' : 'PRESENT';

        todayRecord = {
          id: `att-${emp.employeeId}-${todayStr}`,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          departmentId: emp.departmentId,
          teamId: emp.teamId,
          date: todayStr,
          checkIn: timeFormatted,
          workingMinutes: 0,
          status,
          workMode: 'OFFICE',
          attendanceSource: 'LOGIN',
          lateMinutes: lateMins,
          breakMinutes: 0,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        };

        this.attendance.unshift(todayRecord);
        setStored(STORAGE_KEYS.ATTENDANCE, this.attendance);

        try {
          setDoc(doc(db, 'attendance', todayRecord.id), todayRecord, { merge: true }).catch(() => {});
        } catch (e) {}
      }
    }

    return emp;
  }

  async addEmployee(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>, actorName: string = 'HR Admin'): Promise<Employee> {
    const now = new Date().toISOString();
    const newId = `emp-${Date.now()}`;
    const token = `ACTIVATE-DOCTUS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newEmployee: Employee = {
      ...employeeData,
      id: newId,
      status: 'INVITED',
      firebaseUid: null,
      activationToken: token,
      activationExpiresAt: expiresAt,
      invitedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    this.employees.unshift(newEmployee);
    setStored(STORAGE_KEYS.EMPLOYEES, this.employees);

    try {
      setDoc(doc(db, 'employees', newEmployee.employeeId), newEmployee, { merge: true }).catch(() => {});
    } catch (e) {}

    this.balances[newEmployee.employeeId] = {
      employeeId: newEmployee.employeeId,
      casual: { total: 12, used: 0, available: 12 },
      sick: { total: 8, used: 0, available: 8 },
      earned: { total: 15, used: 0, available: 15 },
      unpaid: { used: 0 },
      wfh: { total: 24, used: 0, available: 24 }
    };
    setStored(STORAGE_KEYS.BALANCES, this.balances);

    await this.logAudit({
      actorId: 'HR_ADMIN',
      actorName,
      actorRole: 'hr',
      action: 'CREATE_EMPLOYEE',
      targetId: newEmployee.employeeId,
      targetName: newEmployee.name,
      details: `Created employee ${newEmployee.name} (${newEmployee.employeeId}) in ${newEmployee.departmentName}. Status: INVITED. Invitation link generated.`
    });

    return newEmployee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>, actorName: string = 'Admin'): Promise<Employee> {
    const index = this.employees.findIndex(e => e.id === id || e.employeeId === id);
    if (index === -1) throw new Error('Employee not found');

    const updated = {
      ...this.employees[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.employees[index] = updated;
    setStored(STORAGE_KEYS.EMPLOYEES, this.employees);

    try {
      setDoc(doc(db, 'employees', updated.employeeId), updated, { merge: true }).catch(() => {});
    } catch (e) {}

    await this.logAudit({
      actorId: 'ADMIN',
      actorName,
      actorRole: 'admin',
      action: 'UPDATE_EMPLOYEE',
      targetId: updated.employeeId,
      targetName: updated.name,
      details: `Updated employee profile for ${updated.name} (${updated.employeeId}).`
    });

    return updated;
  }

  async activateAccountByToken(token: string, passwordHash: string): Promise<Employee> {
    const emp = this.employees.find(e => e.activationToken === token);
    if (!emp) throw new Error('Invalid or expired activation link.');

    if (emp.activationExpiresAt && new Date(emp.activationExpiresAt) < new Date()) {
      throw new Error('Activation link has expired. Please ask HR to resend your invitation.');
    }

    let fbUid: string | null = null;
    try {
      const userCred = await createUserWithEmailAndPassword(auth, emp.email.trim(), passwordHash);
      fbUid = userCred.user.uid;
    } catch (fbErr: any) {
      if (fbErr?.code === 'auth/email-already-in-use') {
        try {
          const userCred = await signInWithEmailAndPassword(auth, emp.email.trim(), passwordHash);
          fbUid = userCred.user.uid;
        } catch (e) {
          fbUid = emp.firebaseUid || null;
        }
      }
    }

    const now = new Date().toISOString();
    const finalUid = fbUid || emp.firebaseUid || `uid-${Date.now()}`;
    emp.status = 'ACTIVE';
    emp.firebaseUid = finalUid;
    emp.activationToken = undefined;
    emp.activationExpiresAt = undefined;
    emp.activatedAt = now;
    emp.updatedAt = now;

    setStored(STORAGE_KEYS.EMPLOYEES, this.employees);

    try {
      const userAccountDoc: UserAccount = {
        firebaseUid: finalUid,
        email: emp.email,
        role: emp.role,
        status: 'ACTIVE',
        accountType: emp.role === 'admin' || emp.role === 'hr' ? 'MANAGEMENT' : 'EMPLOYEE',
        employeeId: emp.employeeId,
        name: emp.name,
        createdAt: now,
        updatedAt: now
      };
      setDoc(doc(db, 'users', finalUid), userAccountDoc, { merge: true }).catch(() => {});
      setDoc(doc(db, 'employees', emp.employeeId), emp, { merge: true }).catch(() => {});
    } catch (e) {}

    await this.logAudit({
      actorId: emp.id,
      actorName: emp.name,
      actorRole: emp.role,
      action: 'ACTIVATE_ACCOUNT',
      targetId: emp.employeeId,
      targetName: emp.name,
      details: `Employee ${emp.name} activated account and set password. Firebase UID linked: ${emp.firebaseUid}. Status updated to ACTIVE.`
    });

    return emp;
  }

  // --- ATTENDANCE MANAGEMENT & ALIASES ---
  async getAttendance(arg1?: any, arg2?: any): Promise<AttendanceRecord[]> {
    let list = [...this.attendance];
    if (typeof arg1 === 'string') {
      list = list.filter(a => a.employeeId === arg1);
      if (typeof arg2 === 'string') list = list.filter(a => a.date === arg2);
    } else if (typeof arg1 === 'object' && arg1 !== null) {
      if (arg1.date) list = list.filter(a => a.date === arg1.date);
      if (arg1.employeeId) list = list.filter(a => a.employeeId === arg1.employeeId);
      if (arg1.departmentId) list = list.filter(a => a.departmentId === arg1.departmentId);
    }
    return list;
  }

  async getAttendanceRecords(arg1?: any, arg2?: any): Promise<AttendanceRecord[]> {
    return this.getAttendance(arg1, arg2);
  }

  async getTodayAttendance(employeeId: string): Promise<AttendanceRecord | undefined> {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.attendance.find(a => a.employeeId === employeeId && a.date === todayStr);
  }

  async checkIn(employeeId: string, workMode: any = 'OFFICE'): Promise<AttendanceRecord> {
    const emp = await this.getEmployeeById(employeeId);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const validMode: WorkMode = (workMode === 'REMOTE' || workMode === 'HYBRID') ? workMode : 'OFFICE';

    let record = this.attendance.find(a => a.employeeId === employeeId && a.date === dateStr);
    if (record) {
      record.checkIn = timeStr;
      record.workMode = validMode;
    } else {
      record = {
        id: `att-${employeeId}-${dateStr}`,
        employeeId,
        employeeName: emp?.name || 'Employee',
        departmentId: emp?.departmentId || 'dept-ops',
        teamId: emp?.teamId || 'team-ops',
        date: dateStr,
        checkIn: timeStr,
        workingMinutes: 0,
        status: 'PRESENT',
        workMode: validMode,
        attendanceSource: 'LOGIN',
        lateMinutes: 0,
        breakMinutes: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      this.attendance.unshift(record);
    }

    setStored(STORAGE_KEYS.ATTENDANCE, this.attendance);
    try { setDoc(doc(db, 'attendance', record.id), record, { merge: true }).catch(() => {}); } catch (e) {}
    return record;
  }

  async checkOut(employeeId: string, notes?: string): Promise<AttendanceRecord> {
    const todayStr = new Date().toISOString().split('T')[0];
    let record = this.attendance.find(a => a.employeeId === employeeId && a.date === todayStr);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (!record) {
      const emp = await this.getEmployeeById(employeeId);
      record = {
        id: `att-${employeeId}-${todayStr}`,
        employeeId,
        employeeName: emp?.name || 'Employee',
        departmentId: emp?.departmentId || 'dept-ops',
        teamId: emp?.teamId || 'team-ops',
        date: todayStr,
        checkIn: '09:00 AM',
        checkOut: timeStr,
        workingMinutes: 540,
        status: 'PRESENT',
        workMode: 'OFFICE',
        attendanceSource: 'LOGIN',
        lateMinutes: 0,
        breakMinutes: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      this.attendance.unshift(record);
    } else {
      record.checkOut = timeStr;
      record.workingMinutes = 540;
    }

    setStored(STORAGE_KEYS.ATTENDANCE, this.attendance);
    try { setDoc(doc(db, 'attendance', record.id), record, { merge: true }).catch(() => {}); } catch (e) {}
    return record;
  }

  async startBreak(employeeId: string): Promise<AttendanceRecord> {
    const todayStr = new Date().toISOString().split('T')[0];
    let record = this.attendance.find(a => a.employeeId === employeeId && a.date === todayStr);
    if (!record) {
      record = await this.checkIn(employeeId);
    }
    return record;
  }

  async endBreak(employeeId: string): Promise<AttendanceRecord> {
    const todayStr = new Date().toISOString().split('T')[0];
    let record = this.attendance.find(a => a.employeeId === employeeId && a.date === todayStr);
    if (!record) {
      record = await this.checkIn(employeeId);
    }
    return record;
  }

  async bulkMarkAttendance(updates: any, actorName: string = 'Admin', ...rest: any[]): Promise<void> {
    if (Array.isArray(updates)) {
      for (const item of updates) {
        await this.markAttendanceStatus(item.employeeId, item.date, item.status, undefined, 'Bulk update', 'ADMIN', actorName, 'admin');
      }
    }
  }

  async markAttendanceStatus(
    targetEmployeeId: string,
    date: string,
    newStatus: AttendanceStatus,
    session?: HalfDaySession,
    reason?: string,
    actorId?: string,
    actorName?: string,
    actorRole?: UserRole,
    arg9?: any,
    arg10?: any
  ): Promise<AttendanceRecord> {
    if (actorRole === 'employee') {
      throw new Error('Employees are strictly forbidden from modifying attendance records. Contact your Team Lead, Manager, or HR.');
    }

    const emp = await this.getEmployeeById(targetEmployeeId);
    if (!emp) throw new Error('Target employee not found.');

    let recordIndex = this.attendance.findIndex(a => a.employeeId === targetEmployeeId && a.date === date);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let source: AttendanceSource = 'ADMIN_MANUAL';
    if (actorRole === 'hr') source = 'HR_MANUAL';
    else if (actorRole === 'manager') source = 'MANAGER_MANUAL';
    else if (actorRole === 'tl') source = 'TL_MANUAL';

    let record: AttendanceRecord;

    if (recordIndex !== -1) {
      const oldStatus = this.attendance[recordIndex].status;
      record = {
        ...this.attendance[recordIndex],
        status: newStatus,
        halfDaySession: session || this.attendance[recordIndex].halfDaySession,
        attendanceSource: source,
        createdAt: this.attendance[recordIndex].createdAt || now.toISOString(),
        updatedAt: now.toISOString()
      };
      this.attendance[recordIndex] = record;
      setStored(STORAGE_KEYS.ATTENDANCE, this.attendance);

      await this.logAudit({
        actorId: actorId || 'SYSTEM',
        actorName: actorName || 'Management',
        actorRole: actorRole || 'admin',
        action: newStatus === 'HALF_DAY' ? 'MARK_HALF_DAY' : 'MODIFY_ATTENDANCE',
        targetId: emp.employeeId,
        targetName: emp.name,
        details: `Modified attendance for ${emp.name} on ${date}: Status changed from ${oldStatus} to ${newStatus}.${reason ? ` Reason: ${reason}` : ''}`
      });
    } else {
      record = {
        id: `att-${emp.employeeId}-${date}`,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        departmentId: emp.departmentId,
        teamId: emp.teamId,
        date,
        checkIn: timeStr,
        workingMinutes: newStatus === 'HALF_DAY' ? 240 : 540,
        status: newStatus,
        halfDaySession: session,
        workMode: 'OFFICE',
        attendanceSource: source,
        lateMinutes: 0,
        breakMinutes: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      this.attendance.unshift(record);
      setStored(STORAGE_KEYS.ATTENDANCE, this.attendance);

      await this.logAudit({
        actorId: actorId || 'SYSTEM',
        actorName: actorName || 'Management',
        actorRole: actorRole || 'admin',
        action: newStatus === 'HALF_DAY' ? 'MARK_HALF_DAY' : 'MODIFY_ATTENDANCE',
        targetId: emp.employeeId,
        targetName: emp.name,
        details: `Created manual attendance for ${emp.name} on ${date}: Status ${newStatus}.${reason ? ` Reason: ${reason}` : ''}`
      });
    }

    try {
      setDoc(doc(db, 'attendance', record.id), record, { merge: true }).catch(() => {});
    } catch (e) {}

    return record;
  }

  // --- LEAVE & BALANCES ---
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return [...this.leaves];
  }

  async applyLeave(requestData: any): Promise<LeaveRequest> {
    const fromDate = requestData.fromDate || requestData.startDate;
    const toDate = requestData.toDate || requestData.endDate;

    const overlap = this.leaves.find(l => 
      l.employeeId === requestData.employeeId && 
      l.status !== 'REJECTED' && l.status !== 'CANCELLED' &&
      !(l.toDate < fromDate || l.fromDate > toDate)
    );
    if (overlap) {
      throw new Error(`Leave request overlaps with an existing ${overlap.status} leave (${overlap.fromDate} to ${overlap.toDate}).`);
    }

    const now = new Date().toISOString();
    const req: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: requestData.employeeId,
      employeeName: requestData.employeeName,
      employeeCode: requestData.employeeCode || requestData.employeeId,
      departmentId: requestData.departmentId,
      teamId: requestData.teamId,
      leaveType: requestData.leaveType,
      fromDate,
      toDate,
      days: requestData.days || 1,
      reason: requestData.reason,
      status: 'PENDING_TL',
      approvalHistory: [],
      submittedAt: now,
      updatedAt: now
    };
    this.leaves.unshift(req);
    setStored(STORAGE_KEYS.LEAVES, this.leaves);

    try { setDoc(doc(db, 'leaveRequests', req.id), req, { merge: true }).catch(() => {}); } catch (e) {}
    return req;
  }

  async approveLeave(requestId: string, approverId: string, approverName: string, approverRole: UserRole, notes?: string): Promise<LeaveRequest> {
    const index = this.leaves.findIndex(l => l.id === requestId);
    if (index === -1) throw new Error('Leave request not found');

    const req = this.leaves[index];
    if (req.employeeId === approverId || approverRole === 'employee') {
      throw new Error('Employees are strictly forbidden from approving their own leave requests.');
    }

    if (req.status !== 'APPROVED') {
      const balance = await this.getLeaveBalances(req.employeeId);
      const lType = (req.leaveType || '').toLowerCase();
      if (lType.includes('casual') && balance.casual) {
        balance.casual.used = (balance.casual.used || 0) + req.days;
        balance.casual.available = Math.max(0, balance.casual.total - balance.casual.used);
      } else if (lType.includes('sick') && balance.sick) {
        balance.sick.used = (balance.sick.used || 0) + req.days;
        balance.sick.available = Math.max(0, balance.sick.total - balance.sick.used);
      } else if (lType.includes('earned') && balance.earned) {
        balance.earned.used = (balance.earned.used || 0) + req.days;
        balance.earned.available = Math.max(0, balance.earned.total - balance.earned.used);
      }
      setStored(STORAGE_KEYS.BALANCES, this.balances);
    }

    const updatedStep = {
      role: approverRole,
      approverId,
      approverName,
      action: 'APPROVED' as const,
      comments: notes,
      timestamp: new Date().toISOString()
    };

    const updated = {
      ...this.leaves[index],
      status: 'APPROVED' as const,
      approvalHistory: [...(this.leaves[index].approvalHistory || []), updatedStep],
      updatedAt: new Date().toISOString()
    };
    this.leaves[index] = updated;
    setStored(STORAGE_KEYS.LEAVES, this.leaves);

    // Dispatch Notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientId: req.employeeId,
      title: '🎉 Leave Request Approved!',
      message: `Your ${req.leaveType} request for ${req.days} day(s) (${req.fromDate} to ${req.toDate}) was approved by ${approverName}.`,
      type: 'LEAVE_APPROVED',
      read: false,
      timestamp: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    try { setDoc(doc(db, 'leaveRequests', updated.id), updated, { merge: true }).catch(() => {}); } catch (e) {}

    await this.logAudit({
      actorId: approverId,
      actorName: approverName,
      actorRole: approverRole,
      action: 'APPROVE_LEAVE',
      targetId: updated.employeeId,
      targetName: updated.employeeName,
      details: `Approved ${updated.leaveType} for ${updated.employeeName} from ${updated.fromDate} to ${updated.toDate}.${notes ? ` Notes: ${notes}` : ''}`
    });

    return updated;
  }

  async rejectLeave(requestId: string, approverId: string, approverName: string, approverRole: UserRole, reason?: string): Promise<LeaveRequest> {
    const index = this.leaves.findIndex(l => l.id === requestId);
    if (index === -1) throw new Error('Leave request not found');

    const updated = {
      ...this.leaves[index],
      status: 'REJECTED' as const,
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    };
    this.leaves[index] = updated;
    setStored(STORAGE_KEYS.LEAVES, this.leaves);

    try { setDoc(doc(db, 'leaveRequests', updated.id), updated, { merge: true }).catch(() => {}); } catch (e) {}

    await this.logAudit({
      actorId: approverId,
      actorName: approverName,
      actorRole: approverRole,
      action: 'REJECT_LEAVE',
      targetId: updated.employeeId,
      targetName: updated.employeeName,
      details: `Rejected ${updated.leaveType} for ${updated.employeeName}.${reason ? ` Reason: ${reason}` : ''}`
    });

    return updated;
  }

  async getLeaveBalances(employeeId: string): Promise<LeaveBalance> {
    if (!this.balances[employeeId]) {
      this.balances[employeeId] = {
        employeeId,
        casual: { total: 12, used: 0, available: 12 },
        sick: { total: 8, used: 0, available: 8 },
        earned: { total: 15, used: 0, available: 15 },
        unpaid: { used: 0 },
        wfh: { total: 24, used: 0, available: 24 }
      };
      setStored(STORAGE_KEYS.BALANCES, this.balances);
    }
    return this.balances[employeeId];
  }

  // --- ANNOUNCEMENTS, HOLIDAYS, NOTIFICATIONS ---
  async getHolidays(): Promise<Holiday[]> {
    return [...this.holidays];
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return [...this.announcements];
  }

  async getNotifications(employeeId: string): Promise<NotificationItem[]> {
    return this.notifications.filter(n => n.recipientId === employeeId || n.recipientId === 'ALL');
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const notif = this.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.read = true;
      (notif as any).isRead = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    }
  }

  // --- AUDIT LOGS (Immutable) ---
  async getAuditLogs(): Promise<AuditLog[]> {
    return [...this.auditLogs];
  }

  async logAudit(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const log: AuditLog = {
      ...logData,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    setStored(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);

    try {
      setDoc(doc(db, 'auditLogs', log.id), log, { merge: true }).catch(() => {});
    } catch (e) {}

    return log;
  }

  // --- SYSTEM SETTINGS ---
  async getSettings(): Promise<SystemSettings> {
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    this.settings = { ...this.settings, ...updates };
    setStored(STORAGE_KEYS.SETTINGS, this.settings);

    try {
      setDoc(doc(db, 'settings', 'global'), this.settings, { merge: true }).catch(() => {});
    } catch (e) {}

    return this.settings;
  }
}

export const dbService = new DatabaseService();
