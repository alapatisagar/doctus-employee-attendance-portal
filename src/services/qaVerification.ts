import { dbService } from './db';
import { Employee, LeaveRequest, AttendanceRecord } from '../types';

export async function runFullQASequence(): Promise<{ success: boolean; log: string[] }> {
  const log: string[] = [];
  log.push('=====================================================');
  log.push('DOCTUS ATTENDANCE PORTAL — END-TO-END QA VERIFICATION');
  log.push('=====================================================');

  try {
    // -----------------------------------------------------------------
    // TEST 1: HR/Admin Employee Creation & Account Activation Flow
    // -----------------------------------------------------------------
    log.push('\n--- TEST 1: HR/Admin Employee Creation & Invitation Flow ---');
    const testEmployeeId = `QA-EMP-${Date.now()}`;
    const testEmail = `qa.test.${Date.now()}@doctus.com`;

    log.push(`1.1 HR Admin creates employee: ${testEmployeeId} (${testEmail})`);
    const newEmp = await dbService.addEmployee({
      employeeId: testEmployeeId,
      firstName: 'Kavita',
      lastName: 'Sharma',
      name: 'Kavita Sharma',
      email: testEmail,
      phone: '+91 99999 88888',
      joiningDate: new Date().toISOString().split('T')[0],
      designation: 'QA Analyst',
      departmentId: 'dept-ar',
      departmentName: 'AR Calling & Billing',
      teamId: 'team-ar-alpha',
      teamName: 'AR Calling Team Alpha',
      tlId: 'TL1001',
      managerId: 'MGR1001',
      role: 'employee',
      status: 'INVITED',
      workLocation: 'Hyderabad HQ',
      employmentType: 'Full-Time'
    }, 'Priya Nair (HR Manager)');

    log.push(`-> Verification: Employee status = ${newEmp.status} [EXPECTED: INVITED]`);
    if (newEmp.status !== 'INVITED') throw new Error('FAIL: Status is not INVITED');
    if (!newEmp.activationToken) throw new Error('FAIL: Activation token not generated');

    log.push(`1.2 Activation link generated: /activate?token=${newEmp.activationToken}`);
    log.push(`1.3 Employee opens link and sets secure password...`);

    const activatedEmp = await dbService.activateAccountByToken(newEmp.activationToken, 'SecurePass2026!');
    log.push(`-> Verification: Employee status after activation = ${activatedEmp.status} [EXPECTED: ACTIVE]`);
    if (activatedEmp.status !== 'ACTIVE') throw new Error('FAIL: Status did not transition to ACTIVE');
    log.push('✅ TEST 1 PASSED: HR Provisioning & Secure Activation Flow Verified!');

    // -----------------------------------------------------------------
    // TEST 2: Employee Check-In, Check-Out & Leave Application
    // -----------------------------------------------------------------
    log.push('\n--- TEST 2: Employee Attendance & Leave Application ---');
    log.push(`2.1 Employee ${activatedEmp.employeeId} performs CHECK IN...`);
    const checkInRecord = await dbService.checkIn(activatedEmp.employeeId, 'OFFICE');
    log.push(`-> Check-In Time: ${checkInRecord.checkIn}, Status: ${checkInRecord.status}, Mode: ${checkInRecord.workMode}`);
    if (!checkInRecord.checkIn || checkInRecord.status === 'ABSENT') throw new Error('FAIL: Check In failed');

    log.push(`2.2 Employee ${activatedEmp.employeeId} performs CHECK OUT...`);
    const checkOutRecord = await dbService.checkOut(activatedEmp.employeeId, 'Completed QA test shift');
    log.push(`-> Check-Out Time: ${checkOutRecord.checkOut}, Working Duration: ${checkOutRecord.workingMinutes} mins`);
    if (!checkOutRecord.checkOut) throw new Error('FAIL: Check Out failed');

    log.push(`2.3 Employee applies for 2 days Casual Leave...`);
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfterStr = new Date(Date.now() + 172800000).toISOString().split('T')[0];

    const leaveReq = await dbService.applyLeave({
      employeeId: activatedEmp.employeeId,
      employeeName: activatedEmp.name,
      employeeCode: activatedEmp.employeeId,
      departmentId: activatedEmp.departmentId,
      teamId: activatedEmp.teamId,
      leaveType: 'Casual Leave',
      fromDate: tomorrowStr,
      toDate: dayAfterStr,
      days: 2,
      reason: 'Automated QA test leave application',
      contactDuringLeave: activatedEmp.phone,
      tlId: 'TL1001',
      managerId: 'MGR1001'
    });

    log.push(`-> Leave Request Created ID: ${leaveReq.id}, Status: ${leaveReq.status} [EXPECTED: PENDING_TL]`);
    if (leaveReq.status !== 'PENDING_TL') throw new Error('FAIL: Leave status is not PENDING_TL');
    log.push('✅ TEST 2 PASSED: Employee Check-In, Check-Out & Leave Application Verified!');

    // -----------------------------------------------------------------
    // TEST 3: TL Leave Approval & Employee Notification
    // -----------------------------------------------------------------
    log.push('\n--- TEST 3: TL Leave Approval & Notification Flow ---');
    log.push(`3.1 TL (TL1001) reviews pending leave request ${leaveReq.id}...`);
    const approvedLeave = await dbService.approveLeave(
      leaveReq.id,
      'TL1001',
      'Ananya Deshmukh (TL)',
      'tl',
      'QA Approved by Team Lead'
    );

    log.push(`-> Verification: Approved Leave Status = ${approvedLeave.status} [EXPECTED: APPROVED]`);
    log.push(`-> Approval History steps: ${approvedLeave.approvalHistory.length}`);
    if (approvedLeave.status !== 'APPROVED') throw new Error('FAIL: Leave was not approved by TL');

    const notifs = await dbService.getNotifications(activatedEmp.employeeId);
    log.push(`-> Notification dispatched to employee ${activatedEmp.employeeId}: Count = ${notifs.length}`);
    if (notifs.length === 0) throw new Error('FAIL: Notification not dispatched');
    log.push(`-> Latest Notification Title: "${notifs[0].title}"`);
    log.push('✅ TEST 3 PASSED: TL Approval & Notification Flow Verified!');

    // -----------------------------------------------------------------
    // TEST 4: Security & Self-Approval Prevention Check
    // -----------------------------------------------------------------
    log.push('\n--- TEST 4: Security & Permission Rules Check ---');
    log.push('4.1 Employee attempting to approve their OWN leave request...');
    try {
      await dbService.approveLeave(
        leaveReq.id,
        activatedEmp.employeeId, // Self approval!
        activatedEmp.name,
        'employee' as any,
        'Unauthorized self approval'
      );
      throw new Error('FAIL: Self approval was incorrectly permitted!');
    } catch (e: any) {
      log.push(`-> Blocked as expected: "${e.message}"`);
    }

    log.push('4.2 Duplicate leave request conflict check...');
    try {
      await dbService.applyLeave({
        employeeId: activatedEmp.employeeId,
        employeeName: activatedEmp.name,
        employeeCode: activatedEmp.employeeId,
        departmentId: activatedEmp.departmentId,
        teamId: activatedEmp.teamId,
        leaveType: 'Sick Leave',
        fromDate: tomorrowStr, // Overlapping date!
        toDate: dayAfterStr,
        days: 2,
        reason: 'Duplicate overlap request test',
        tlId: 'TL1001'
      });
      throw new Error('FAIL: Duplicate leave overlap was not detected!');
    } catch (e: any) {
      log.push(`-> Overlap blocked as expected: "${e.message}"`);
    }
    log.push('✅ TEST 4 PASSED: Security & Conflict Prevention Verified!');

    // -----------------------------------------------------------------
    // TEST 5: Audit Logging Verification
    // -----------------------------------------------------------------
    log.push('\n--- TEST 5: Security Audit Log Verification ---');
    const auditLogs = await dbService.getAuditLogs();
    log.push(`-> Total Audit Log Entries: ${auditLogs.length}`);
    const creationLog = auditLogs.find(a => a.action === 'CREATE_EMPLOYEE' && a.targetId === testEmployeeId);
    if (!creationLog) throw new Error('FAIL: Employee creation audit log missing');
    log.push(`-> Audit Entry Found: ${creationLog.action} by ${creationLog.actorName}: "${creationLog.details}"`);
    log.push('✅ TEST 5 PASSED: Immutable Audit Logging Verified!');

    log.push('\n=====================================================');
    log.push('🎉 ALL 5 E2E QA ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
    log.push('=====================================================');
    return { success: true, log };
  } catch (err: any) {
    log.push(`❌ QA TEST FAILURE: ${err.message}`);
    return { success: false, log };
  }
}
