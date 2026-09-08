import React, { useState } from 'react';
import { CheckCircle, Copy, Check, MessageSquare, Printer, ArrowRight, User, Phone, BookOpen } from 'lucide-react';
import { TraineeRegistration, Course, SystemSettings } from '../../types';

interface RegistrationSuccessModalProps {
  registration: TraineeRegistration;
  course: Course;
  settings: SystemSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  registration,
  course,
  settings,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(registration.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `السلام عليكم، قمت بالتسجيل في دورة "${course.title}".\n` +
    `الاسم: ${registration.fullName}\n` +
    `رقم الجوال: ${registration.phoneNumber}\n` +
    `الرقم المرجعي للتسجيل: ${registration.id}\n` +
    `أرجو تأكيد التسجيل وتزويدي بتفاصيل الحضور. شكراً لكم.`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Success Banner */}
        <div className="bg-gradient-to-br from-[#185d89] via-[#144f75] to-[#0f3b57] text-white p-8 text-center relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 ring-8 ring-white/10 shadow-lg">
            <CheckCircle className="w-10 h-10 text-[#fab437]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">
            تم تسجيلك بنجاح في مركز النهضة!
          </h2>
          <p className="text-sky-100 text-sm max-w-md mx-auto leading-relaxed font-medium">
            {settings.registrationSuccessMsg}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          
          {/* Reference ID Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold block mb-0.5">الرقم المرجعي لطلب التسجيل:</span>
              <span className="text-xl font-black text-[#185d89] tracking-wider font-mono">
                {registration.id}
              </span>
            </div>
            <button
              id="btn-copy-ref-id"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-[#185d89] bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-2xs transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#f06423]" />
                  <span className="text-[#f06423]">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#185d89]" />
                  <span>نسخ الرقم</span>
                </>
              )}
            </button>
          </div>

          {/* Registration Details Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 text-xs text-slate-700 shadow-2xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-bold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#185d89]" />
                <span>الدورة التدريبية:</span>
              </span>
              <span className="font-bold text-slate-900 text-left max-w-[65%] leading-snug">
                {course.title}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-bold flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#185d89]" />
                <span>اسم المتدرب:</span>
              </span>
              <span className="font-bold text-slate-900">{registration.fullName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#185d89]" />
                <span>رقم الهاتف / الواتساب:</span>
              </span>
              <span className="font-bold text-slate-900 font-mono" dir="ltr">{registration.phoneNumber}</span>
            </div>
          </div>

          {/* Quick WhatsApp Confirmation Button */}
          <a
            href={`https://wa.me/${settings.contactWhatsApp}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            id="btn-whatsapp-confirm"
            className="w-full py-3.5 px-5 bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1da851] text-white font-black text-sm rounded-2xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2.5"
          >
            <MessageSquare className="w-5 h-5 fill-white/20" />
            <span>تأكيد الحضور فوراً عبر واتساب المركز</span>
          </a>

          {/* Secondary Actions: Print & Close */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              id="btn-print-receipt"
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4 text-[#185d89]" />
              <span>طباعة إشعار التسجيل</span>
            </button>

            <button
              onClick={onClose}
              id="btn-close-success-modal"
              className="flex-1 py-3 px-4 rounded-xl bg-[#185d89] hover:bg-[#13496c] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>إغلاق وتصفح المزيد</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
