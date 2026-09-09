import React, { useState, useEffect } from 'react';
import { Course, TraineeRegistration, SystemSettings } from './types';
import { 
  getStoredCourses, 
  saveCourses, 
  getStoredRegistrations, 
  saveRegistrations, 
  getStoredSettings, 
  saveSettings, 
  isAdminAuthenticated, 
  setAdminAuthenticated, 
  getAuthenticatedAdminEmail,
  AUTHORIZED_ADMIN_EMAIL,
  registerTrainee 
} from './utils/storage';
import {
  subscribeToCourses,
  subscribeToRegistrations,
  subscribeToSettings,
  saveRegistrationToFirestore,
  deleteRegistrationFromFirestore,
  syncCoursesWithFirestore,
  syncRegistrationsWithFirestore,
  saveSettingsToFirestore,
  seedInitialFirestoreData,
  onAdminAuthStateChange,
  signOutFirebaseUser,
} from './services/firestoreService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PublicCourseList } from './components/public/PublicCourseList';
import { RegistrationModal } from './components/public/RegistrationModal';
import { RegistrationSuccessModal } from './components/public/RegistrationSuccessModal';
import { CheckStatusModal } from './components/public/CheckStatusModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<TraineeRegistration[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(getStoredSettings());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'public' | 'admin'>('public');

  // Modals
  const [selectedCourseForRegistration, setSelectedCourseForRegistration] = useState<Course | null>(null);
  const [latestSuccessfulRegistration, setLatestSuccessfulRegistration] = useState<{
    registration: TraineeRegistration;
    course: Course;
  } | null>(null);
  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Initialize data and listeners for admin access
  useEffect(() => {
    const loadedCourses = getStoredCourses();
    const loadedRegistrations = getStoredRegistrations();
    const loadedSettings = getStoredSettings();
    const adminAuth = isAdminAuthenticated();
    const currentAdminEmail = getAuthenticatedAdminEmail();

    setCourses(loadedCourses);
    setRegistrations(loadedRegistrations);
    setSettings(loadedSettings);
    setIsAdmin(adminAuth);
    setAdminEmail(currentAdminEmail);

    // Any unauthenticated user is strictly locked to public trainee view
    if (!adminAuth) {
      setActiveView('public');
    }

    // Real-time Firestore Subscriptions
    const unsubCourses = subscribeToCourses((firestoreCourses) => {
      if (firestoreCourses && firestoreCourses.length > 0) {
        setCourses(firestoreCourses);
        saveCourses(firestoreCourses);
      } else if (loadedCourses.length > 0) {
        seedInitialFirestoreData(loadedCourses, loadedSettings);
      }
    });

    const unsubRegs = subscribeToRegistrations((firestoreRegs) => {
      if (firestoreRegs) {
        // Merge Firestore records with local cached records to prevent accidental data loss
        const local = getStoredRegistrations();
        const map = new Map<string, TraineeRegistration>();

        // 1. Populate from local storage
        local.forEach((r) => map.set(r.id, r));

        // 2. Overwrite with authoritative Firestore records
        firestoreRegs.forEach((r) => map.set(r.id, r));

        // 3. For any local record not yet in Firestore, back it up to Firestore
        for (const [id, reg] of map.entries()) {
          const existsInFirestore = firestoreRegs.some((fr) => fr.id === id);
          if (!existsInFirestore) {
            saveRegistrationToFirestore(reg).catch((err) => {
              console.warn('Auto-sync local registration to Firestore:', err);
            });
          }
        }

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
        );

        setRegistrations(merged);
        saveRegistrations(merged);
      }
    });

    const unsubSettings = subscribeToSettings((firestoreSettings) => {
      if (firestoreSettings && firestoreSettings.centerName) {
        setSettings(firestoreSettings);
        saveSettings(firestoreSettings);
      }
    });

    // Listen to Firebase Auth state for Google Sign-In
    const unsubAuth = onAdminAuthStateChange((user, isAuthorized) => {
      if (isAuthorized && user?.email) {
        setIsAdmin(true);
        setAdminEmail(user.email);
        setAdminAuthenticated(true, user.email);
      }
    });

    // Keyboard shortcut to open admin login (Alt+A or Ctrl+Shift+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'ش')) || 
          (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A' || e.key === 'ش'))) {
        e.preventDefault();
        if (isAdminAuthenticated()) {
          setActiveView((prev) => (prev === 'admin' ? 'public' : 'admin'));
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };

    // Check URL hash for direct admin routing (#admin)
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        if (isAdminAuthenticated()) {
          setActiveView('admin');
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };

    checkHash();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', checkHash);

    return () => {
      unsubCourses();
      unsubRegs();
      unsubSettings();
      unsubAuth();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  // Handler for trainee submitting registration form
  const handleTraineeSubmitRegistration = async (formData: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    city?: string;
    jobTitle?: string;
    notes?: string;
  }) => {
    if (!selectedCourseForRegistration) {
      return { success: false, message: 'لم يتم تحديد الدورة التدريبية.' };
    }

    const res = registerTrainee(
      {
        ...formData,
        courseId: selectedCourseForRegistration.id,
      },
      courses,
      registrations
    );

    if (res.success && res.registration) {
      // 1. Immediately persist to Firebase Firestore to guarantee cloud storage
      try {
        await saveRegistrationToFirestore(res.registration);
      } catch (err) {
        console.error('Direct Firestore registration save warning:', err);
      }

      // 2. Update local state and cache
      const updatedList = [res.registration, ...registrations];
      setRegistrations(updatedList);
      saveRegistrations(updatedList);

      const targetCourse = selectedCourseForRegistration;
      setSelectedCourseForRegistration(null);

      // Open Success Modal
      setLatestSuccessfulRegistration({
        registration: res.registration,
        course: targetCourse,
      });

      return { success: true };
    }

    return { success: false, message: res.message || 'تعذر إتمام التسجيل.' };
  };

  // Handler for Admin Login (Exclusive to bayan.kim@alnahda-group.com)
  const handleAdminLoginSuccess = (email: string) => {
    if (email.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setIsAdmin(true);
      setAdminEmail(AUTHORIZED_ADMIN_EMAIL);
      setAdminAuthenticated(true, AUTHORIZED_ADMIN_EMAIL);
      setActiveView('admin');
      setIsAdminLoginOpen(false);
      window.location.hash = '#admin';
    }
  };

  // Handler for Admin Logout
  const handleAdminLogout = async () => {
    await signOutFirebaseUser();
    setIsAdmin(false);
    setAdminEmail(null);
    setAdminAuthenticated(false);
    setActiveView('public');
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Handler for explicitly deleting a registration
  const handleDeleteRegistration = async (id: string) => {
    const updated = registrations.filter((r) => r.id !== id);
    setRegistrations(updated);
    saveRegistrations(updated);
    try {
      await deleteRegistrationFromFirestore(id);
    } catch (err) {
      console.error('Failed to delete registration from Firestore:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-tajawal">
      
      {/* Header */}
      <Header
        settings={settings}
        isAdmin={isAdmin}
        adminEmail={adminEmail}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenCheckStatus={() => setIsCheckStatusOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeView === 'admin' && isAdmin && adminEmail === AUTHORIZED_ADMIN_EMAIL ? (
          <AdminDashboard
            courses={courses}
            registrations={registrations}
            settings={settings}
            onUpdateCourses={(updated) => {
              const prev = courses;
              setCourses(updated);
              saveCourses(updated);
              syncCoursesWithFirestore(updated, prev);
            }}
            onUpdateRegistrations={(updated) => {
              setRegistrations(updated);
              saveRegistrations(updated);
              syncRegistrationsWithFirestore(updated);
            }}
            onDeleteRegistration={handleDeleteRegistration}
            onUpdateSettings={(updated) => {
              setSettings(updated);
              saveSettings(updated);
              saveSettingsToFirestore(updated);
            }}
            onLogout={handleAdminLogout}
            onBackToPublic={() => setActiveView('public')}
          />
        ) : (
          <PublicCourseList
            courses={courses}
            registrations={registrations}
            settings={settings}
            onRegisterCourse={(course) => setSelectedCourseForRegistration(course)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
      />

      {/* Trainee Registration Form Modal */}
      {selectedCourseForRegistration && (
        <RegistrationModal
          course={selectedCourseForRegistration}
          settings={settings}
          isOpen={!!selectedCourseForRegistration}
          onClose={() => setSelectedCourseForRegistration(null)}
          onSubmit={handleTraineeSubmitRegistration}
        />
      )}

      {/* Registration Success Confirmation Modal */}
      {latestSuccessfulRegistration && (
        <RegistrationSuccessModal
          registration={latestSuccessfulRegistration.registration}
          course={latestSuccessfulRegistration.course}
          settings={settings}
          isOpen={!!latestSuccessfulRegistration}
          onClose={() => setLatestSuccessfulRegistration(null)}
        />
      )}

      {/* Check Trainee Registration Status Modal */}
      <CheckStatusModal
        isOpen={isCheckStatusOpen}
        onClose={() => setIsCheckStatusOpen(false)}
        registrations={registrations}
      />

      {/* Admin Login Modal (Exclusive to authorized admin) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => {
          setIsAdminLoginOpen(false);
          if (window.location.hash === '#admin') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
        onSuccess={handleAdminLoginSuccess}
        settings={settings}
      />

    </div>
  );
}
