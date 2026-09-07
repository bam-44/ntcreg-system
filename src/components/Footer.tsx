import React from 'react';
import { Phone, Mail, MessageSquare, Award, CheckCircle2, Laptop } from 'lucide-react';
import { SystemSettings } from '../types';
import { Logo } from './Logo';

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
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f06423]" />
              <span>بيانات التواصل والاستفسار</span>
            </h4>
            <ul className="space-y-2.5 text-sky-100/90">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#f06423]" />
                <span dir="ltr">{settings.contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#f06423]" />
                <a
                  href={`https://wa.me/${settings.contactWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#fab437] transition-colors"
                  dir="ltr"
                >
                  +{settings.contactWhatsApp} (واتساب المركز)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#f06423]" />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:text-[#fab437] transition-colors font-mono"
                  dir="ltr"
                >
                  {settings.contactEmail}
                </a>
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
