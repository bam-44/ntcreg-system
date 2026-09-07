import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, ShieldCheck, User, Phone, Mail, MapPin, Briefcase, FileText, Send, Calendar, Clock, DollarSign } from 'lucide-react';
import { Course, SystemSettings } from '../../types';

interface RegistrationModalProps {
  course: Course;
  settings: SystemSettings;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    fullName: string;
    phoneNumber: string;
    email?: string;
    city?: string;
    jobTitle?: string;
    notes?: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  course,
  settings,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Validation function
  const validateForm = () => {
    const errs: Record<string, string> = {};

    // Validate 4-part name
    const trimmedName = fullName.trim();
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    if (!trimmedName) {
      errs.fullName = 'يرجى إدخال الاسم الرباعي كاملاً.';
    } else if (nameParts.length < 3) {
      errs.fullName = 'يرجى كتابة الاسم الثلاثي أو الرباعي على الأقل (كما سيظهر في الشهادة المعتمدة).';
    }

    // Validate Phone / WhatsApp
    const cleanPhone = phoneNumber.trim().replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errs.phoneNumber = 'رقم الهاتف / الواتساب مطلوب للتواصل وإرسال تفاصيل الدورة.';
    } else if (cleanPhone.length < 9) {
      errs.phoneNumber = 'يرجى إدخال رقم هاتف صحيح مع رمز الدولة أو مفتاح المنطقة (مثال: 05xxxxxxxx أو 966xxxxxxxxx).';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'صيغة البريد الإلكتروني غير صحيحة.';
    }

    if (!agreeTerms) {
      errs.agreeTerms = 'يرجى الموافقة على الالتزام بحضور الدورة التدريبية.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (!res.success) {
        setGeneralError(res.message || 'حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'تعذر إتمام التسجيل في الوقت الحالي.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-[#185d89] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute left-5 top-5 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-[#fab437] text-xs font-black mb-1.5">
            <span>استمارة التسجيل في الدورة التدريبية</span>
            <span>•</span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold">
              {course.type === 'online' ? '💻 أونلاين (عن بُعد)' : '🏛️ حضورياً (بالمقر)'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {course.title}
          </h2>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {generalError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Notice */}
          <div className="p-3.5 bg-[#185d89]/5 rounded-xl border border-[#185d89]/20 text-[#185d89] text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#f06423] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              يرجى التأكد من دقة البيانات المدخلة؛ سيتم إصدار الشهادة بالاسم المسجل والتواصل عبر رقم الهاتف/الواتساب لتزويدك برابط وقاعة الدورة.
            </p>
          </div>

          {/* Full Name Input (Required) */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#185d89]" />
                <span>الاسم الرباعي كاملاً <span className="text-rose-600">*</span></span>
              </span>
              <span className="text-[11px] font-normal text-slate-500">حسب الهوية للشهادة</span>
            </label>
            <input
              id="input-trainee-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder=""
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                errors.fullName
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-300 focus:border-[#185d89] focus:ring-[#185d89]/20'
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.fullName}</p>
            )}
          </div>

          {/* Phone / WhatsApp (Required) */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#185d89]" />
                <span>رقم الهاتف / الواتساب <span className="text-rose-600">*</span></span>
              </span>
              <span className="text-[11px] font-normal text-slate-500">لإرسال رابط المحاضرات والتأكيد</span>
            </label>
            <div className="relative">
              <input
                id="input-trainee-phone"
                type="tel"
                dir="ltr"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder=""
                className={`w-full text-right px-4 py-3 rounded-xl border text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                  errors.phoneNumber
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                    : 'border-slate-300 focus:border-[#185d89] focus:ring-[#185d89]/20'
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Optional: Email & City in 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>البريد الإلكتروني (اختياري)</span>
              </label>
              <input
                id="input-trainee-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#185d89] focus:ring-2 focus:ring-[#185d89]/20 text-sm"
              />
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>المدينة / المنطقة (اختياري)</span>
              </label>
              <input
                id="input-trainee-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#185d89] focus:ring-2 focus:ring-[#185d89]/20 text-sm"
              />
            </div>
          </div>

          {/* Optional: Job Title / Field of study */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span>المسمى الوظيفي / جهة العمل أو التخصص (اختياري)</span>
            </label>
            <input
              id="input-trainee-job"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder=""
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#185d89] focus:ring-2 focus:ring-[#185d89]/20 text-sm"
            />
          </div>

          {/* Optional: Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>ملاحظات أو استفسارات للمدرب (اختياري)</span>
            </label>
            <textarea
              id="input-trainee-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder=""
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#185d89] focus:ring-2 focus:ring-[#185d89]/20 text-sm resize-none"
            />
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-[#185d89] focus:ring-[#185d89]"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                أقر بصحة البيانات المدخلة وألتزم بحضور الساعات التدريبية المقررة للحصول على شهادة مركز النهضة المعتمدة.
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.agreeTerms}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-submit-registration"
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-black text-sm bg-[#185d89] hover:bg-[#13496c] active:bg-[#0e3752] text-white shadow-md shadow-[#185d89]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري تسجيل البيانات...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#f06423]" />
                  <span>تأكيد وإرسال طلب التسجيل</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto py-3 px-5 rounded-xl font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
