import { Course, TraineeRegistration, SystemSettings } from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  centerName: 'مركز النهضة للتدريب والتطوير الذاتي',
  centerSubtitle: 'بوابة تسجيل المتدربين الرسمية في الدورات والبرامج التطويرية المعتمدة',
  contactPhone: '+249 12 315 6073',
  contactWhatsApp: '249123156073',
  contactEmail: 'trainingcenter@alnahda-group.com',
  currentMonth: '2026-08',
  currentMonthName: 'أغسطس 2026',
  adminPin: 'admin123',
  adminEmail: 'bayan.kim@alnahda-group.com',
  welcomeNotice: 'أهلاً بكم في مركز النهضة للتدريب والتطوير الذاتي. التسجيل متاح حالياً لدورات الشهر التدريبي الحالي مع منح شهادات معتمدة وتدريب احترافي.',
  registrationSuccessMsg: 'تم استلام طلب تسجيلك بنجاح في مركز النهضة! سيقوم فريق شؤون المتدربين بالتواصل معك عبر الواتساب لتأكيد تفاصيل الحضور.',
};

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_REGISTRATIONS: TraineeRegistration[] = [];

export const MONTH_NAMES_AR: Record<string, string> = {
  '01': 'يناير',
  '02': 'فبراير',
  '03': 'مارس',
  '04': 'أبريل',
  '05': 'مايو',
  '06': 'يونيو',
  '07': 'يوليو',
  '08': 'أغسطس',
  '09': 'سبتمبر',
  '10': 'أكتوبر',
  '11': 'نوفمبر',
  '12': 'ديسمبر',
};

export function getArabicMonthLabel(yearMonth: string): string {
  if (!yearMonth || !yearMonth.includes('-')) return yearMonth;
  const [year, month] = yearMonth.split('-');
  const monthName = MONTH_NAMES_AR[month] || month;
  return `${monthName} ${year}`;
}
