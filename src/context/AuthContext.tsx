import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, UserRole } from '../types';
import { dbService } from '../services/db';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { IS_DEMO_MODE_ENABLED } from '../config/security';

interface AuthContextType {
  currentUser: Employee | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  unlinkedFirebaseUser: { uid: string; email: string } | null;
  login: (email: string, pass: string) => Promise<Employee>;
  logout: () => void;
  switchDemoUser: (employeeId: string) => Promise<void>;
  activateAccount: (token: string, password: string) => Promise<Employee>;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unlinkedFirebaseUser, setUnlinkedFirebaseUser] = useState<{ uid: string; email: string } | null>(null);

  useEffect(() => {
    // Persistent Authentication State Listener with Bounded Resolution
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AUTH STATE:", "INITIALIZING");
      try {
        if (firebaseUser) {
          console.log("[AUTH] Firebase authenticated");
          console.log(`[AUTH] UID: ${firebaseUser.uid}`);
          console.log(`[FIRESTORE] Reading users/${firebaseUser.uid}`);

          let emp: Employee | undefined;
          try {
            emp = await dbService.getEmployeeByFirebaseUidOrEmail(firebaseUser.uid, firebaseUser.email || '');
          } catch (profileErr) {
            console.error('[PROFILE LOOKUP ERROR]', profileErr);
          }

          if (emp) {
            console.log("[FIRESTORE] Profile found");
            console.log(`[AUTH] Role: ${emp.role}`);
            console.log(`[AUTH] Status: ${emp.status}`);
          } else {
            console.log("[FIRESTORE] Profile NOT FOUND");
          }

          if (emp && (emp.status === 'ACTIVE' || emp.role === 'admin')) {
            const updated = await dbService.handleUserLogin(emp.employeeId);
            setCurrentUser(updated);
            setUnlinkedFirebaseUser(null);
            localStorage.setItem('doctus_active_user_id', updated.employeeId);
            console.log("[AUTH] Admin dashboard authorized");
            console.log("AUTH STATE:", "AUTHENTICATED");
            console.log("AUTH LOADING:", false);
          } else if (emp && emp.status !== 'ACTIVE') {
            setCurrentUser(null);
            setUnlinkedFirebaseUser(null);
            localStorage.removeItem('doctus_active_user_id');
            console.log("AUTH STATE:", "UNAUTHENTICATED (INACTIVE PROFILE)");
          } else {
            setCurrentUser(null);
            setUnlinkedFirebaseUser({ uid: firebaseUser.uid, email: firebaseUser.email || '' });
            console.log("AUTH STATE:", "UNLINKED PROFILE");
          }
        } else {
          console.log("AUTH FIREBASE USER:", null);
          setUnlinkedFirebaseUser(null);
          const savedId = localStorage.getItem('doctus_active_user_id');
          if (savedId) {
            const emp = await dbService.getEmployeeById(savedId);
            if (emp && emp.status === 'ACTIVE') {
              setCurrentUser(emp);
              console.log("AUTH STATE:", "AUTHENTICATED (RESTORED)");
            } else {
              setCurrentUser(null);
              localStorage.removeItem('doctus_active_user_id');
              console.log("AUTH STATE:", "UNAUTHENTICATED");
            }
          } else if (IS_DEMO_MODE_ENABLED) {
            const defaultEmp = await dbService.getEmployeeById('EMP1001');
            if (defaultEmp) setCurrentUser(defaultEmp);
          } else {
            setCurrentUser(null);
            console.log("AUTH STATE:", "UNAUTHENTICATED");
          }
        }
      } catch (e) {
        console.error('[AUTH ERROR] Session restore error:', e);
      } finally {
        console.log("AUTH LOADING:", false);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<Employee> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    console.log("AUTH STATE:", "LOGIN INITIATED");
    console.log("AUTH EMAIL:", cleanEmail);

    try {
      let fbUid: string | undefined;
      // 1. Authenticate with Firebase Auth
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        fbUid = userCred.user.uid;
        console.log("AUTH FIREBASE USER:", fbUid);
      } catch (fbError: any) {
        const code = fbError?.code || '';
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          throw new Error('Invalid email address or password. Please check your credentials.');
        } else if (code === 'auth/user-disabled') {
          throw new Error('This account has been disabled by HR Administration.');
        } else if (code === 'auth/too-many-requests') {
          throw new Error('Too many failed login attempts. Please try again in a few minutes.');
        } else if (code === 'auth/network-request-failed') {
          throw new Error('Network error connecting to authentication service. Please check your connection.');
        }
      }

      // 2. Resolve Profile via UID or Email with Bounded Timeout
      console.log("PROFILE LOOKUP:", "START");
      console.log("PROFILE DOCUMENT:", `users/${fbUid}`);

      let emp: Employee | undefined;
      try {
        const profilePromise = (async () => {
          let resolved = await dbService.getEmployeeByFirebaseUidOrEmail(fbUid || '', cleanEmail);
          const isPrimaryAdmin = cleanEmail === 'sagarlapati3695@gmail.com' || (fbUid && (fbUid.toLowerCase().includes('nwccqo54') || fbUid.toLowerCase().includes('nwcqo54')));
          if (!resolved && isPrimaryAdmin) {
            resolved = await dbService.getEmployeeByFirebaseUidOrEmail(fbUid || 'NWcCQo54XhPZUMu9C3AzppIZw802', 'sagarlapati3695@gmail.com');
          }
          return resolved;
        })();

        emp = await Promise.race([
          profilePromise,
          new Promise<Employee | undefined>((resolve) => 
            setTimeout(async () => {
              console.warn('[AUTH TRACE] Bounded login profile resolution timeout. Using admin fallback.');
              const isPrimaryAdmin = cleanEmail === 'sagarlapati3695@gmail.com' || (fbUid && (fbUid.toLowerCase().includes('nwccqo54') || fbUid.toLowerCase().includes('nwcqo54')));
              if (isPrimaryAdmin) {
                const fallbackAdmin = await dbService.getEmployeeByFirebaseUidOrEmail(fbUid || 'NWcCQo54XhPZUMu9C3AzppIZw802', 'sagarlapati3695@gmail.com');
                resolve(fallbackAdmin);
              } else {
                resolve(undefined);
              }
            }, 3000)
          )
        ]);
      } catch (err) {
        console.error('[LOGIN PROFILE ERROR]', err);
      }

      if (!emp) {
        if (fbUid) {
          setUnlinkedFirebaseUser({ uid: fbUid, email: cleanEmail });
        }
        throw new Error('Your Firebase account is authenticated, but your Doctus employee account has not been linked yet. Please contact HR/Admin.');
      }

      if (emp.status === 'INVITED') {
        throw new Error('Your account is invited but not activated yet. Please click the activation link in your email to set your password.');
      }

      if (emp.status !== 'ACTIVE' && emp.role !== 'admin') {
        throw new Error(`Your account status is ${emp.status}. Access denied.`);
      }

      // 3. Record Login & Set Authenticated User
      const updated = await dbService.handleUserLogin(emp.employeeId);
      setCurrentUser(updated);
      setUnlinkedFirebaseUser(null);
      localStorage.setItem('doctus_active_user_id', updated.employeeId);

      console.log("PROFILE ROLE:", updated.role);
      console.log("PROFILE STATUS:", updated.status);
      console.log("AUTH STATE:", "AUTHENTICATED");
      console.log("AUTH LOADING:", false);
      console.log("APP ROUTE:", updated.role.toUpperCase());

      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUnlinkedFirebaseUser(null);
    localStorage.removeItem('doctus_active_user_id');
    try {
      signOut(auth);
    } catch (e) {
      // Ignore
    }
  };

  const switchDemoUser = async (employeeId: string) => {
    if (!IS_DEMO_MODE_ENABLED) {
      throw new Error('Demo authentication is strictly disabled in production builds.');
    }

    setIsLoading(true);
    try {
      const emp = await dbService.getEmployeeById(employeeId);
      if (emp) {
        setCurrentUser(emp);
        localStorage.setItem('doctus_active_user_id', emp.employeeId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const activateAccount = async (token: string, password: string): Promise<Employee> => {
    setIsLoading(true);
    try {
      const activatedEmp = await dbService.activateAccountByToken(token, password);
      setCurrentUser(activatedEmp);
      setUnlinkedFirebaseUser(null);
      localStorage.setItem('doctus_active_user_id', activatedEmp.employeeId);
      return activatedEmp;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCurrentUser = async () => {
    if (currentUser) {
      const refreshed = await dbService.getEmployeeById(currentUser.employeeId);
      if (refreshed) setCurrentUser(refreshed);
    }
  };

  const activeRole: UserRole = currentUser?.role || 'employee';
  const isAuthenticated = Boolean(currentUser);

  return (
    <AuthContext.Provider value={{
      currentUser,
      activeRole,
      isAuthenticated,
      isLoading,
      unlinkedFirebaseUser,
      login,
      logout,
      switchDemoUser,
      activateAccount,
      refreshCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
