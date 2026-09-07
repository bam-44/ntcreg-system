import React, { useRef } from 'react';
import { MessageSquare, Calendar, Shield, LogOut } from 'lucide-react';
import { SystemSettings } from '../types';
import { Logo } from './Logo';
import { AUTHORIZED_ADMIN_EMAIL } from '../utils/storage';

interface HeaderProps {
  settings: SystemSettings;
  isAdmin: boolean;
  adminEmail?: string | null;
  onOpenAdminLogin: () => void;
  onOpenCheckStatus: () => void;
  activeView: 'public' | 'admin';
  setActiveView: (view: 'public' | 'admin') => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isAdmin,
  adminEmail,
  onOpenAdminLogin,
  onOpenCheckStatus,
  activeView,
  setActiveView,
  onLogout,
}) => {
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<any>(null);

  const handleLogoClick = () => {
    setActiveView('public');

    // Discreet triple-click trigger for admin on touch/mobile devices
    clickCountRef.current += 1;
    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (!isAdmin) {
        onOpenAdminLogin();
      }
      return;
    }

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1200);
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22">
          
          {/* Official Center Logo & Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={handleLogoClick}
            title="الصفحة الرئيسية - مركز النهضة للتدريب والتطوير الذاتي"
          >
            <Logo 
              size="md" 
              variant="full-horizontal" 
              logoUrl={settings.logoUrl}
              centerName={settings.centerName}
              centerSubtitle={settings.centerSubtitle}
            />
            
            <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#185d89]/10 text-[#185d89] border border-[#185d89]/20 mr-2">
              <Calendar className="w-3.5 h-3.5 ml-1 text-[#f06423]" />
              <span>{settings.currentMonthName}</span>
            </span>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Contact */}
            <a
              href={`https://wa.me/${settings.contactWhatsApp}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن الدورات التدريبية المتاحة في مركز النهضة.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#185d89] bg-[#185d89]/5 hover:bg-[#185d89]/10 rounded-xl transition-colors border border-[#185d89]/20"
            >
              <MessageSquare className="w-4 h-4 text-[#f06423]" />
              <span>تواصل واتساب</span>
            </a>

            {/* Check registration status */}
            <button
              id="btn-check-registration"
              onClick={onOpenCheckStatus}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-[#185d89] hover:text-white bg-[#185d89]/10 hover:bg-[#185d89] rounded-xl transition-all border border-[#185d89]/20"
            >
              <span>الاستعلام عن تسجيلي</span>
            </button>

            {/* Admin Dashboard Button - EXCLUSIVELY shown when logged in as bayan.kim@alnahda-group.com */}
            {isAdmin && adminEmail === AUTHORIZED_ADMIN_EMAIL && (
              <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2 mr-1">
                <button
                  id="btn-switch-admin-view"
                  onClick={() => setActiveView(activeView === 'admin' ? 'public' : 'admin')}
                  className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs ${
                    activeView === 'admin'
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-[#185d89] text-white hover:bg-[#12496d]'
                  }`}
                  title={`المشرف المعتمد: ${AUTHORIZED_ADMIN_EMAIL}`}
                >
                  <Shield className="w-4 h-4 text-[#f06423]" />
                  <span>{activeView === 'admin' ? 'عرض واجهة المتدربين' : 'لوحة تحكم المشرف'}</span>
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="تسجيل خروج المشرف"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
