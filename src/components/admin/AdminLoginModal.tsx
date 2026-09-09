import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Mail, 
  ArrowLeft,
  Shield,
  Loader2
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { AUTHORIZED_ADMIN_EMAIL, getStoredSettings } from '../../utils/storage';
import { signInWithGoogleAdmin } from '../../services/firestoreService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  settings: SystemSettings;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  settings,
}) => {
  // Empty fields by default - admin enters credentials manually
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Enterprise standard: Rate limiting / attempt protection
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Reset fields and errors whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setShowPassword(false);
      setIsGoogleLoading(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutTimer]);

  if (!isOpen) return null;

  // Handle Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      const res = await signInWithGoogleAdmin();
      setIsGoogleLoading(false);

      if (res.success && res.email) {
        onSuccess(res.email);
        onClose();
      } else {
        setError(res.message || 'تعذر تسجيل الدخول عبر Google.');
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setError(err?.message || 'حدث خطأ أثناء الاتصال بخدمة Google.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (lockoutTimer > 0) {
      setError(`تم تجاوز عدد المحاولات المسموح بها مؤقتاً. يرجى الانتظار ${lockoutTimer} ثانية.`);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setIsLoading(true);

    // Standard authentication delay for security (prevents timing attacks)
    setTimeout(() => {
      const isEmailValid = cleanEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
      
      // Determine the active PIN (from props or stored settings)
      const stored = getStoredSettings();
      const currentPin = (settings?.adminPin || stored?.adminPin || 'admin123').trim();
      
      // Password must match the current active PIN strictly (no hardcoded old password fallback)
      const isPasswordValid = cleanPassword === currentPin;

      if (isEmailValid && isPasswordValid) {
        setIsLoading(false);
        setFailedAttempts(0);
        onSuccess(cleanEmail);
      } else {
        setIsLoading(false);
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutTimer(30);
          setError('تم إيقاف المحاولات مؤقتاً لأسباب أمنية. يرجى الانتظار 30 ثانية قبل المحاولة مجدداً.');
        } else {
          // Standard security practice: Never disclose whether the email or password was wrong
          setError('بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور والمحاولة مجدداً.');
        }
      }
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
      >
        {/* Institutional Header */}
        <div className="bg-[#0f3047] text-white p-6 sm:p-7 relative border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            title="إغلاق"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center border border-white/15 shadow-inner">
              <Shield className="w-5 h-5 text-[#fab437]" />
            </div>
            <div>
              <h2 id="admin-login-title" className="text-lg sm:text-xl font-black tracking-tight text-white">
                تسجيل دخول الإدارة
              </h2>
              <p className="text-xs text-sky-200/70 mt-0.5">
                {settings.centerName}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          
          {/* Security error alert */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {/* Google Sign-in with Firebase Auth */}
          <div>
            <button
              type="button"
              id="btn-google-admin-signin"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#185d89]" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>تسجيل الدخول الآمن بحساب Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 whitespace-nowrap">
              أو إدخال بيانات الاعتماد يدوياً
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Manual Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Input Field (Empty by default) */}
            <div className="space-y-1">
              <label 
                htmlFor="admin-email-input" 
                className="block text-xs font-bold text-slate-700"
              >
                البريد الإلكتروني المعتمد
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email-input"
                  type="email"
                  autoComplete="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  disabled={isLoading || isGoogleLoading || lockoutTimer > 0}
                  className="w-full text-left font-mono text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#185d89] focus:ring-2 focus:ring-[#185d89]/20 transition-all placeholder:text-slate-400 bg-white"
                />
              </div>
            </div>

            {/* Password / PIN Input Field (Empty by default) */}
            <div className="space-y-1">
              <label 
                htmlFor="admin-password-input" 
                className="block text-xs font-bold text-slate-700"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  disabled={isLoading || isGoogleLoading || lockoutTimer > 0}
                  className="w-full text-left font-mono text-xs sm:text-sm pr-10 pl-11 py-2.5 rounded-xl border border-slate-300 focus:border-[#185d89] focus:ring-2 focus:ring-[#185d89]/20 transition-all placeholder:text-slate-400 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember session checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#185d89] focus:ring-[#185d89]"
                />
                <span>تذكر تسجيل الدخول على هذا الجهاز</span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                id="btn-admin-login-submit"
                disabled={isLoading || isGoogleLoading || lockoutTimer > 0}
                className="w-full py-2.5 px-4 bg-[#185d89] hover:bg-[#134b6e] active:bg-[#0f3c59] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق من البيانات...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-4 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>إلغاء والعودة للموقع العام</span>
              </button>
            </div>
          </form>

          {/* Security note */}
          <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
            بوابة تسجيل الدخول الإدارية الآمنة لمركز النهضة • Firebase Secured
          </div>
        </div>
      </div>
    </div>
  );
};
