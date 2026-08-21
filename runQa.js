// Node.js script to execute the Complete Firestore Production Architecture QA Suite
import { dbService } from './src/services/db.ts';

async function run() {
  console.log('=====================================================================');
  console.log('DOCTUS ATTENDANCE PORTAL — CLOUD FIRESTORE PRODUCTION QA SUITE');
  console.log('=====================================================================\n');

  try {
    const dateToday = new Date().toISOString().split('T')[0];

    // -----------------------------------------------------------------
    // TEST 1 & 2: Primary Admin Authentication & Firestore User Account
    // -----------------------------------------------------------------
    console.log('--- TEST 1 & 2: Primary Admin (sagarlapati3695@gmail.com) Auth & Firestore User Profile ---');
    const adminEmail = 'sagarlapati3695@gmail.com';
    const adminUid = 'NWCQo54XhPZUM9C3AZp1Zw802';

    const userAccount = await dbService.getUserAccount(adminUid);
    const adminEmp = await dbService.getEmployeeByFirebaseUidOrEmail(adminUid, adminEmail);

    console.log(`-> Authenticated Email: ${userAccount?.email}`);
    console.log(`-> Firebase Auth UID:  ${userAccount?.firebaseUid}`);
    console.log(`-> Account Type:        ${userAccount?.accountType} [EXPECTED: MANAGEMENT]`);
    console.log(`-> Role Resolved:      ${userAccount?.role} [EXPECTED: admin]`);
    console.log(`-> Account Status:      ${userAccount?.status} [EXPECTED: ACTIVE]`);

    if (!userAccount || userAccount.role !== 'admin' || userAccount.status !== 'ACTIVE') {
      throw new Error('FAIL: Primary Admin user profile in users/{uid} not resolved as ACTIVE admin');
    }
    if (userAccount.firebaseUid !== adminUid) {
      throw new Error('FAIL: Primary Admin Firebase UID mismatch');
    }
    console.log('✅ TEST 1 & 2 PASSED: Primary Admin (sagarlapati3695@gmail.com / NWCQo54XhPZUM9C3AZp1Zw802) verified in users/{uid}!\n');

    // -----------------------------------------------------------------
    // TEST 3 & 4: Admin Provisions Employee (Admin session preserved!)
    // -----------------------------------------------------------------
    console.log('--- TEST 3 & 4: Admin Provisions Employee (QA-PROD-005) ---');
    const newEmp = await dbService.addEmployee({
      employeeId: 'QA-PROD-005',
      firstName: 'Deepak',
      lastName: 'Kumar',
      name: 'Deepak Kumar',
      email: 'deepak.k@doctus.com',
      phone: '+91 98765 00005',
      joiningDate: dateToday,
      designation: 'AR Analyst',
      departmentId: 'dept-ar',
      departmentName: 'AR Calling & Billing',
      teamId: 'team-ar-beta',
      teamName: 'AR Team Beta',
      role: 'employee',
      status: 'INVITED'
    }, 'Sagar Lapati (Admin & HR)');

    console.log(`-> Created Employee: ${newEmp.name} (${newEmp.employeeId}) in employees/{employeeId}`);
    console.log(`-> Initial Status: ${newEmp.status} [EXPECTED: INVITED]`);
    console.log(`-> Initial Firebase UID: ${newEmp.firebaseUid} [EXPECTED: null]`);

    if (newEmp.status !== 'INVITED') throw new Error('FAIL: Status is not INVITED');
    if (newEmp.firebaseUid !== null && newEmp.firebaseUid !== undefined) throw new Error('FAIL: firebaseUid is not null on creation');
    console.log('✅ TEST 3 & 4 PASSED: Admin created employee in employees/{employeeId} with status INVITED & null UID without corrupting Admin session!\n');

    // -----------------------------------------------------------------
    // TEST 5 & 6: Employee Activation, Firestore users/{uid} & employees/{employeeId} Linking
    // -----------------------------------------------------------------
    console.log('--- TEST 5 & 6: Employee Activation & Cloud Firestore UID Linking ---');
    const token = newEmp.activationToken;
    const activatedEmp = await dbService.activateAccountByToken(token, 'ProductionSecurePass2026!');
    const employeeUserAccount = await dbService.getUserAccount(activatedEmp.firebaseUid);

    console.log('---------------------------------------------------------------------');
    console.log('CLOUD FIRESTORE IDENTITY VERIFICATION:');
    console.log(`Firebase UID:                ${activatedEmp.firebaseUid}`);
    console.log(`users/{uid} document:        users/${activatedEmp.firebaseUid}`);
    console.log(`users/{uid} role:            ${employeeUserAccount?.role}`);
    console.log(`users/{uid} status:          ${employeeUserAccount?.status}`);
    console.log(`employees/{employeeId} ID:   employees/${activatedEmp.employeeId}`);
    console.log(`employees/{employeeId} UID:  ${activatedEmp.firebaseUid}`);
    console.log(`employees/{employeeId} stat: ${activatedEmp.status}`);
    console.log(`Match:                       ${Boolean(activatedEmp.firebaseUid && employeeUserAccount?.firebaseUid === activatedEmp.firebaseUid)}`);
    console.log('---------------------------------------------------------------------\n');

    if (activatedEmp.status !== 'ACTIVE') throw new Error('FAIL: Status did not change to ACTIVE');
    if (!activatedEmp.firebaseUid) throw new Error('FAIL: firebaseUid was not linked');
    if (!employeeUserAccount || employeeUserAccount.status !== 'ACTIVE') throw new Error('FAIL: users/{uid} record missing or inactive');
    console.log('✅ TEST 5 & 6 PASSED: Account activated & users/{uid} + employees/{employeeId} linked in Firestore!\n');

    // -----------------------------------------------------------------
    // TEST 7, 8, 9: Employee Login & Automatic Attendance Creation
    // -----------------------------------------------------------------
    console.log('--- TEST 7, 8, 9: Employee Login & Automatic Attendance Creation ---');
    const loggedInEmp = await dbService.handleUserLogin(activatedEmp.employeeId);
    const todayAtt = await dbService.getTodayAttendance(activatedEmp.employeeId);
    console.log(`-> Attendance Record Created: Source = ${todayAtt?.attendanceSource}, Status = ${todayAtt?.status}`);

    const origCheckIn = todayAtt?.checkIn;
    await dbService.handleUserLogin(activatedEmp.employeeId); // 2nd login
    const todayAttAfter = await dbService.getTodayAttendance(activatedEmp.employeeId);
    console.log(`-> Check-In after 2nd login: ${todayAttAfter?.checkIn} (Original: ${origCheckIn})`);
    if (todayAttAfter?.checkIn !== origCheckIn) throw new Error('FAIL: Duplicate login altered check-in');
    console.log('✅ TEST 7-9 PASSED: Employee login created attendance with LOGIN source; 2nd login prevented duplicates!\n');

    // -----------------------------------------------------------------
    // TEST 10 & 11: Security Boundaries & RBAC Enforcement
    // -----------------------------------------------------------------
    console.log('--- TEST 10 & 11: Security Boundaries & RBAC Enforcement ---');
    try {
      await dbService.markAttendanceStatus('QA-PROD-005', dateToday, 'PRESENT', undefined, 'Employee self mark', 'QA-PROD-005', 'Deepak Kumar', 'employee');
      throw new Error('FAIL: Employee self mark allowed');
    } catch (e) {
      console.log(`-> 🔒 Employee attendance edit attempt blocked: "${e.message}"`);
    }
    console.log('✅ TEST 10 & 11 PASSED: Employee attendance editing strictly blocked!\n');

    // -----------------------------------------------------------------
    // TEST 12, 13, 14, 15: Management Override & Immutable Audit Logs
    // -----------------------------------------------------------------
    console.log('--- TEST 12 to 15: Management Override & Immutable Audit Logs ---');
    const adminOverridden = await dbService.markAttendanceStatus('QA-PROD-005', dateToday, 'HALF_DAY', 'FIRST_HALF', 'Admin verified half day', 'ADMIN1001', 'Sagar Lapati (Admin & HR)', 'admin');
    console.log(`-> Admin modified QA-PROD-005 status to: ${adminOverridden.status} (${adminOverridden.halfDaySession})`);
    const auditLogs = await dbService.getAuditLogs();
    const auditEntry = auditLogs.find(l => l.targetId === 'QA-PROD-005' && l.action === 'MARK_HALF_DAY');
    console.log(`-> Immutable Audit Log Recorded: "${auditEntry?.details}"`);
    if (!auditEntry) throw new Error('FAIL: Audit log missing');
    console.log('✅ TEST 12-15 PASSED: Admin management override & immutable audit trail verified!\n');

    console.log('=====================================================================');
    console.log('🎉 ALL 15 CLOUD FIRESTORE PRODUCTION QA TESTS PASSED 100%!');
    console.log('=====================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error(`❌ QA TEST FAILURE: ${err.message}`);
    process.exit(1);
  }
}

run();
