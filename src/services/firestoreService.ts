import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  getDocs,
  getDoc,
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { Course, TraineeRegistration, SystemSettings } from '../types';
import { AUTHORIZED_ADMIN_EMAIL } from '../utils/storage';

const COURSES_COLLECTION = 'courses';
const REGISTRATIONS_COLLECTION = 'registrations';
const SETTINGS_DOC = 'settings';

/**
 * Sanitizes an object recursively to ensure no `undefined` values exist,
 * as Firestore strictly rejects any document containing `undefined`.
 */
export function cleanFirestoreData<T extends Record<string, any>>(data: T): T {
  if (!data || typeof data !== 'object') return data;
  const result: any = Array.isArray(data) ? [] : {};
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) {
      result[key] = '';
    } else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      result[key] = cleanFirestoreData(val);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

/**
 * Directly fetch all courses from Firestore
 */
export async function fetchCoursesFromFirestore(): Promise<Course[]> {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    const snap = await getDocs(coursesRef);
    const items: Course[] = [];
    snap.forEach((docSnap) => {
      items.push(docSnap.data() as Course);
    });
    return items;
  } catch (err) {
    console.error('Failed to fetch courses from Firestore:', err);
    return [];
  }
}

/**
 * Directly fetch all trainee registrations from Firestore
 */
export async function fetchRegistrationsFromFirestore(): Promise<TraineeRegistration[]> {
  try {
    const regRef = collection(db, REGISTRATIONS_COLLECTION);
    const snap = await getDocs(regRef);
    const items: TraineeRegistration[] = [];
    snap.forEach((docSnap) => {
      items.push(docSnap.data() as TraineeRegistration);
    });
    items.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    return items;
  } catch (err) {
    console.error('Failed to fetch registrations from Firestore:', err);
    return [];
  }
}

/**
 * Directly fetch system settings from Firestore
 */
export async function fetchSettingsFromFirestore(): Promise<SystemSettings | null> {
  try {
    const settingsRef = doc(db, SETTINGS_DOC, 'general');
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch settings from Firestore:', err);
    return null;
  }
}

/**
 * Real-time subscription to Courses in Firestore
 */
export function subscribeToCourses(
  onUpdate: (courses: Course[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    const unsubscribe = onSnapshot(
      coursesRef,
      (snapshot) => {
        const items: Course[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Course);
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore courses subscription warning:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not subscribe to Firestore courses:', err);
    return () => {};
  }
}

/**
 * Save / Create a course in Firestore
 */
export async function saveCourseToFirestore(course: Course): Promise<void> {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, course.id);
    const cleaned = cleanFirestoreData(course);
    await setDoc(courseRef, cleaned, { merge: true });
  } catch (err) {
    console.error('Failed to save course to Firestore:', err);
    throw err;
  }
}

/**
 * Delete a course from Firestore
 */
export async function deleteCourseFromFirestore(courseId: string): Promise<void> {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);
    await deleteDoc(courseRef);
  } catch (err) {
    console.error('Failed to delete course from Firestore:', err);
    throw err;
  }
}

/**
 * Real-time subscription to Trainee Registrations in Firestore
 */
export function subscribeToRegistrations(
  onUpdate: (registrations: TraineeRegistration[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const regRef = collection(db, REGISTRATIONS_COLLECTION);
    let fallbackUnsub: (() => void) | null = null;
    
    const primaryUnsubscribe = onSnapshot(
      regRef,
      (snapshot) => {
        const items: TraineeRegistration[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as TraineeRegistration);
        });
        items.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
        onUpdate(items);
      },
      (error) => {
        console.warn('Registrations subscription notice:', error);
        if (onError) onError(error);
      }
    );

    return () => {
      primaryUnsubscribe();
      if (fallbackUnsub) fallbackUnsub();
    };
  } catch (err) {
    console.warn('Could not subscribe to Firestore registrations:', err);
    return () => {};
  }
}

/**
 * Save new trainee registration to Firestore
 */
export async function saveRegistrationToFirestore(registration: TraineeRegistration): Promise<void> {
  try {
    const regRef = doc(db, REGISTRATIONS_COLLECTION, registration.id);
    const cleaned = cleanFirestoreData(registration);
    await setDoc(regRef, cleaned, { merge: true });
  } catch (err) {
    console.error('Failed to save registration to Firestore:', err);
    throw err;
  }
}

/**
 * Update registration status or details in Firestore
 */
export async function updateRegistrationInFirestore(
  registrationId: string, 
  updates: Partial<TraineeRegistration>
): Promise<void> {
  try {
    const regRef = doc(db, REGISTRATIONS_COLLECTION, registrationId);
    const cleaned = cleanFirestoreData(updates);
    await updateDoc(regRef, cleaned);
  } catch (err) {
    console.error('Failed to update registration in Firestore:', err);
    throw err;
  }
}

/**
 * Delete registration from Firestore
 */
export async function deleteRegistrationFromFirestore(registrationId: string): Promise<void> {
  try {
    const regRef = doc(db, REGISTRATIONS_COLLECTION, registrationId);
    await deleteDoc(regRef);
  } catch (err) {
    console.error('Failed to delete registration from Firestore:', err);
    throw err;
  }
}

/**
 * Real-time subscription to System Settings in Firestore
 */
export function subscribeToSettings(
  onUpdate: (settings: SystemSettings) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const settingsRef = doc(db, SETTINGS_DOC, 'general');
    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as SystemSettings);
        }
      },
      (error) => {
        console.warn('Firestore settings subscription error:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not subscribe to Firestore settings:', err);
    return () => {};
  }
}

/**
 * Save settings to Firestore
 */
export async function saveSettingsToFirestore(settings: SystemSettings): Promise<void> {
  try {
    const settingsRef = doc(db, SETTINGS_DOC, 'general');
    const cleaned = cleanFirestoreData(settings);
    await setDoc(settingsRef, cleaned, { merge: true });
  } catch (err) {
    console.error('Failed to save settings to Firestore:', err);
    throw err;
  }
}

/**
 * Sync entire course collection changes (added, updated, deleted) with Firestore
 */
export async function syncCoursesWithFirestore(
  updatedCourses: Course[], 
  previousCourses: Course[]
): Promise<void> {
  try {
    // Save all active courses
    for (const c of updatedCourses) {
      await saveCourseToFirestore(c);
    }
    // Delete any courses that were removed
    const updatedIds = new Set(updatedCourses.map(c => c.id));
    for (const old of previousCourses) {
      if (!updatedIds.has(old.id)) {
        await deleteCourseFromFirestore(old.id);
      }
    }
  } catch (err) {
    console.error('Error syncing courses with Firestore:', err);
  }
}

/**
 * Sync registrations changes (updated status or details) with Firestore
 * Note: Never automatically delete registrations here to prevent accidental data loss.
 * Explicit deletion must only occur via deleteRegistrationFromFirestore.
 */
export async function syncRegistrationsWithFirestore(
  updatedRegs: TraineeRegistration[]
): Promise<void> {
  try {
    for (const r of updatedRegs) {
      await saveRegistrationToFirestore(r);
    }
  } catch (err) {
    console.error('Error syncing registrations with Firestore:', err);
  }
}

/**
 * Seed initial data to Firestore if empty
 */
export async function seedInitialFirestoreData(
  initialCourses: Course[],
  initialSettings: SystemSettings
): Promise<void> {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    const snapshot = await getDocs(coursesRef);
    if (snapshot.empty && initialCourses.length > 0) {
      for (const course of initialCourses) {
        await setDoc(doc(db, COURSES_COLLECTION, course.id), course);
      }
    }

    const settingsRef = doc(db, SETTINGS_DOC, 'general');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, initialSettings);
    }
  } catch (err) {
    console.warn('Firestore initial data seed note:', err);
  }
}

/**
 * Google Sign-in for Admin Authentication
 */
export async function signInWithGoogleAdmin(): Promise<{
  success: boolean;
  email?: string;
  user?: User;
  message?: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userEmail = user.email ? user.email.toLowerCase().trim() : '';

    if (userEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return {
        success: true,
        email: userEmail,
        user,
      };
    } else {
      // User signed in with an unauthorized Google account
      await signOut(auth);
      return {
        success: false,
        message: `تم تسجيل الدخول بحساب (${userEmail})، ولكن هذا الحساب غير مصرح له كمسؤول. الحساب المصرح به حصرياً هو: ${AUTHORIZED_ADMIN_EMAIL}`,
      };
    }
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, message: 'تم إلغاء تسجيل الدخول بواسطة المستخدم.' };
    }
    return { 
      success: false, 
      message: err.message || 'تعذر إتمام تسجيل الدخول عبر Google. يرجى المحاولة باستخدام كلمة المرور.' 
    };
  }
}

/**
 * Sign out current Firebase user
 */
export async function signOutFirebaseUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Error signing out Firebase user:', err);
  }
}

/**
 * Listen to Firebase Auth state
 */
export function onAdminAuthStateChange(
  callback: (user: User | null, isAuthorized: boolean) => void
): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user && user.email) {
      const isAuthorized = user.email.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
      callback(user, isAuthorized);
    } else {
      callback(null, false);
    }
  });
}
