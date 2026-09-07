import { Course, TraineeRegistration, SystemSettings } from '../types';
import { INITIAL_COURSES, INITIAL_REGISTRATIONS, INITIAL_SETTINGS, getArabicMonthLabel } from '../data/initialData';

const STORAGE_KEYS = {
  COURSES: 'alnahda_training_courses_v2',
  REGISTRATIONS: 'alnahda_training_registrations_v2',
  SETTINGS: 'alnahda_training_settings_v2',
  ADMIN_AUTH: 'alnahda_training_admin_auth_v2',
  ADMIN_EMAIL: 'alnahda_training_admin_email_v2',
};

export const AUTHORIZED_ADMIN_EMAIL = 'bayan.kim@alnahda-group.com';

// --- Storage Handlers ---

export function getStoredCourses(): Course[] {
  try {
    // Clear old sample data if present in previous versions
    if (localStorage.getItem('alnahda_training_courses_v1')) {
      localStorage.removeItem('alnahda_training_courses_v1');
    }
    if (localStorage.getItem('alnahda_training_registrations_v1')) {
      localStorage.removeItem('alnahda_training_registrations_v1');
    }

    const data = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
      return [];
    }
    const parsed: Course[] = JSON.parse(data);
    // Filter out any leftover mock courses if any
    const filtered = parsed.filter(c => !c.id.startsWith('crs-2026-'));
    if (filtered.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(filtered));
      return filtered;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading courses:', err);
    return [];
  }
}

export function saveCourses(courses: Course[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  } catch (err) {
    console.error('Error saving courses:', err);
  }
}

export function getStoredRegistrations(): TraineeRegistration[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([]));
      return [];
    }
    const parsed: TraineeRegistration[] = JSON.parse(data);
    const filtered = parsed.filter(r => !r.id.startsWith('REG-2026-80'));
    if (filtered.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(filtered));
      return filtered;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading registrations:', err);
    return [];
  }
}

export function saveRegistrations(registrations: TraineeRegistration[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
  } catch (err) {
    console.error('Error saving registrations:', err);
  }
}

export function getStoredSettings(): SystemSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(data);
    // If stored name is previous or missing, apply official brand
    if (!parsed.centerName || parsed.centerName.includes('المهني') || parsed.centerName === 'المركز التدريبي') {
      parsed.centerName = INITIAL_SETTINGS.centerName;
      parsed.centerSubtitle = INITIAL_SETTINGS.centerSubtitle;
    }
    if (!parsed.contactEmail || parsed.contactEmail.includes('example') || parsed.contactEmail.includes('info@') || parsed.contactEmail.includes('alnahdatrainingc@gmail.com')) {
      parsed.contactEmail = INITIAL_SETTINGS.contactEmail;
    }
    if (!parsed.contactWhatsApp || parsed.contactWhatsApp.includes('966501234567')) {
      parsed.contactWhatsApp = INITIAL_SETTINGS.contactWhatsApp;
      parsed.contactPhone = INITIAL_SETTINGS.contactPhone;
    }
    // Strictly enforce authorized admin email
    parsed.adminEmail = AUTHORIZED_ADMIN_EMAIL;
    return { ...INITIAL_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Error loading settings:', err);
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: SystemSettings): void {
  try {
    // Preserve authorized admin email
    const safeSettings = {
      ...settings,
      adminEmail: AUTHORIZED_ADMIN_EMAIL,
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(safeSettings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

// --- Admin Authentication (Restricted exclusively to bayan.kim@alnahda-group.com) ---

export function getAuthenticatedAdminEmail(): string | null {
  try {
    const email = sessionStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL);
    if (email && email.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return email;
    }
    return null;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  try {
    const isAuth = sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    const email = sessionStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL);
    return isAuth && !!email && email.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(authenticated: boolean, email?: string): void {
  try {
    if (authenticated && email && email.toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, email.toLowerCase().trim());
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_EMAIL);
    }
  } catch (err) {
    console.error('Auth error:', err);
  }
}

// --- Trainee Registration Logic ---

export function registerTrainee(
  data: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    courseId: string;
    city?: string;
    jobTitle?: string;
    notes?: string;
  },
  courses: Course[],
  registrations: TraineeRegistration[]
): { success: boolean; registration?: TraineeRegistration; message?: string } {
  const course = courses.find((c) => c.id === data.courseId);
  if (!course) {
    return { success: false, message: 'الدورة المختارة غير موجودة أو تم حذفها.' };
  }

  if (course.status !== 'active') {
    return { success: false, message: 'التسجيل في هذه الدورة مغلق حالياً.' };
  }

  // Count existing registrations
  const currentCount = registrations.filter((r) => r.courseId === course.id && r.status !== 'cancelled').length;
  if (course.maxCapacity && currentCount >= course.maxCapacity) {
    return { success: false, message: 'عذراً، اكتملت المقاعد المتاحة لهذه الدورة.' };
  }

  // Format clean Arabic phone
  const cleanPhone = data.phoneNumber.trim().replace(/\s+/g, '');

  // Generate Reference ID
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const monthTag = course.month.replace('-', '');
  const id = `REG-${monthTag}-${randomSuffix}`;

  const newReg: TraineeRegistration = {
    id,
    fullName: data.fullName.trim(),
    phoneNumber: cleanPhone,
    email: data.email?.trim(),
    courseId: course.id,
    courseTitle: course.title,
    courseMonth: course.month,
    registeredAt: new Date().toISOString(),
    status: 'pending',
    notes: data.notes?.trim() || '',
    city: data.city?.trim() || '',
    jobTitle: data.jobTitle?.trim() || '',
    paymentStatus: course.price === 0 ? 'free' : 'unpaid',
  };

  const updatedRegistrations = [newReg, ...registrations];
  saveRegistrations(updatedRegistrations);

  return {
    success: true,
    registration: newReg,
    message: 'تم تسجيلك بنجاح!',
  };
}

// --- CSV / Excel Export with UTF-8 BOM ---

export function exportRegistrationsToCSV(
  registrations: TraineeRegistration[],
  courseFilterTitle?: string
): void {
  if (registrations.length === 0) {
    alert('لا توجد بيانات متدربين لتصديرها.');
    return;
  }

  // Header row in Arabic
  const headers = [
    'الرقم المرجعي',
    'الاسم الرباعي',
    'رقم الهاتف / الواتساب',
    'البريد الإلكتروني',
    'اسم الدورة التدريبية',
    'شهر الدورة',
    'تاريخ وتوقيت التسجيل',
    'حالة التسجيل',
    'حالة الدفع',
    'المدينة',
    'المسمى الوظيفي',
    'الملاحظات',
  ];

  const escapeCSV = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const statusLabel = (st: string) => {
    switch (st) {
      case 'confirmed': return 'مؤكد';
      case 'pending': return 'قيد الانتظار';
      case 'cancelled': return 'ملغي';
      default: return st;
    }
  };

  const paymentLabel = (st: string) => {
    switch (st) {
      case 'paid': return 'تم السداد';
      case 'unpaid': return 'غير مسدد';
      case 'free': return 'مجاني';
      default: return st;
    }
  };

  const rows = registrations.map((r) => [
    escapeCSV(r.id),
    escapeCSV(r.fullName),
    escapeCSV(r.phoneNumber),
    escapeCSV(r.email || '-'),
    escapeCSV(r.courseTitle),
    escapeCSV(getArabicMonthLabel(r.courseMonth)),
    escapeCSV(new Date(r.registeredAt).toLocaleString('ar-SA')),
    escapeCSV(statusLabel(r.status)),
    escapeCSV(paymentLabel(r.paymentStatus)),
    escapeCSV(r.city || '-'),
    escapeCSV(r.jobTitle || '-'),
    escapeCSV(r.notes || '-'),
  ]);

  // Combine with UTF-8 BOM (\uFEFF) to ensure Arabic letters display correctly in Excel
  const csvContent = '\uFEFF' + [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileNamePrefix = courseFilterTitle ? `مسجلين_${courseFilterTitle.slice(0, 20)}` : 'كشف_جميع_المتدربين';
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileNamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Reset data to defaults if user wants to restore
export function resetDataToDefaults(): void {
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
  localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
}
