import React from 'react';
import { Phone, Mail, Award, CheckCircle2, Laptop } from 'lucide-react';
import { SystemSettings } from '../types';
import { Logo } from './Logo';
import { WhatsAppIcon } from './WhatsAppIcon';

interface FooterProps {
  settings: SystemSettings;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
}) => {
  return (
    <footer className="no-print bg-[#0f3047] text-white border-t border-[#185d89]/30 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/10 text-xs">
          
          {/* Col 1: About with Official Logo */}
          <div className="space-y-3">
            <Logo 
              size="md" 
              variant="full-horizontal" 
              theme="dark" 
              logoUrl={settings.logoUrl}
              centerName={settings.centerName}
              centerSubtitle={settings.centerSubtitle}
            />
            <p className="text-sky-100/70 leading-relaxed max-w-sm pt-1">
              البوابة الإلكترونية الرسمية لمركز النهضة للتدريب والتطوير الذاتي لتسجيل المتدربين في البرامج التدريبية المعتمدة وتطوير المهارات القيادية والمهنية.
            </p>
          </div>

          {/* Col 2: Direct Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ec6226]" />
              <span>بيانات التواصل</span>
            </h4>
            <ul className="space-y-3 text-sky-100/90 text-xs">
              {/* WhatsApp (Official Icon, Number Alone) */}
              <li className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0 border border-[#25D366]/30">
                  <WhatsAppIcon className="w-4 h-4" />
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sky-200/80 font-medium">واتساب:</span>
                  <a
                    href={`https://wa.me/${settings.contactWhatsApp || '249123156073'}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن برامج ودورات مركز النهضة.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-white font-bold hover:text-[#25D366] transition-colors"
                    dir="ltr"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              </li>

              {/* Direct Phone Calls (Numbers Alone) */}
              <li className="flex items-start sm:items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#ec6226]/20 text-[#ec6226] flex items-center justify-center shrink-0 border border-[#ec6226]/30 mt-0.5 sm:mt-0">
                  <Phone className="w-4 h-4" />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-sky-200/80 font-medium">اتصال:</span>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-white font-bold" dir="ltr">
                    <a
                      href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`}
                      className="hover:text-[#fab437] transition-colors"
                    >
                      {settings.contactPhone}
                    </a>
                    <span className="text-white/30 font-normal">/</span>
                    <a
                      href={`tel:${(settings.contactPhone2 || '+249 12 306 1996').replace(/\s+/g, '')}`}
                      className="hover:text-[#fab437] transition-colors"
                    >
                      {settings.contactPhone2 || '+249 12 306 1996'}
                    </a>
                  </div>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-center gap-2.5 pt-0.5">
                <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                  <Mail className="w-4 h-4" />
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sky-200/80 font-medium">البريد الإلكتروني:</span>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="hover:text-[#fab437] transition-colors font-mono"
                    dir="ltr"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3: Training Features */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#fab437]" />
              <span>مميزات البرامج التدريبية</span>
            </h4>
            <ul className="space-y-2.5 text-sky-100/80">
              <li className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#fab437]" />
                <span>شهادات حضور تدريبية معتمدة</span>
              </li>
              <li className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#fab437]" />
                <span>برامج أونلاين تفاعلية وتدريب حضوري</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#fab437]" />
                <span>متابعة وتأكيد فوري عبر واتساب شؤون المتدربين</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-sky-200/60 text-[11px] gap-2">
          <p>© {new Date().getFullYear()} {settings.centerName}. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1 text-sky-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#f06423]" />
            <span>نظام تسجيل المتدربين في الدورات التدريبية</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
