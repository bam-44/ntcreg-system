export type CourseStatus = 'active' | 'inactive' | 'closed';
export type AttendanceType = 'online' | 'onsite' | 'hybrid';
export type RegistrationStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Instructor {
  name: string;
  title?: string;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string; // اسم الدورة
  type: AttendanceType; // نوع الدورة (أونلاين / حضورياً / مدمج)
  status: CourseStatus; // 'active' | 'inactive' | 'closed'
  month?: string; // Format: "YYYY-MM" e.g., "2026-08"
  monthNameAr?: string; // e.g., "أغسطس 2026"
  isCurrentMonth?: boolean;
  description?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  days?: string;
  time?: string;
  duration?: string;
  location?: string;
  price?: number;
  currency?: string;
  instructor?: Instructor;
  maxCapacity?: number;
  featured?: boolean;
  certificate?: boolean;
  prerequisites?: string;
  targetAudience?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TraineeRegistration {
  id: string; // e.g. "REG-94812"
  fullName: string; // الاسم الرباعي
  phoneNumber: string; // رقم الهاتف / الواتساب
  email?: string;
  courseId: string;
  courseTitle: string;
  courseMonth: string;
  registeredAt: string;
  status: RegistrationStatus;
  notes?: string;
  city?: string;
  jobTitle?: string;
  paymentStatus: 'paid' | 'unpaid' | 'free';
}

export interface SystemSettings {
  centerName: string;
  centerSubtitle: string;
  contactPhone: string;
  contactWhatsApp: string;
  contactEmail: string;
  currentMonth: string; // "2026-08"
  currentMonthName: string; // "أغسطس 2026"
  adminPin: string;
  adminEmail: string; // bayan.kim@alnahda-group.com
  welcomeNotice: string;
  registrationSuccessMsg: string;
  logoUrl?: string; // Custom uploaded logo image (base64 or URL)
}
