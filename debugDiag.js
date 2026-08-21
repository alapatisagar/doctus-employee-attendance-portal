import { dbService } from './src/services/db.ts';
import { auth } from './src/services/firebase.ts';

async function diag() {
  const uid = 'NWCQo54XhPZUM9C3AZp1Zw802';
  const email = 'sagarlapati3695@gmail.com';

  const userAcc = await dbService.getUserAccount(uid);
  const emp = await dbService.getEmployeeByFirebaseUidOrEmail(uid, email);

  console.log("DOCTUS AUTH DEBUG", {
    uid: uid,
    email: email,
    projectId: auth.app.options.projectId,
    userAccount: userAcc,
    profile: emp,
    role: emp?.role,
    status: emp?.status
  });
  process.exit(0);
}

diag();
