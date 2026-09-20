import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Shield, LogOut, Phone, ChevronDown } from 'lucide-react';
import { SystemSettings } from '../types';
import { Logo } from './Logo';
import { WhatsAppIcon } from './WhatsAppIcon';
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
  const [showContactMenu, setShowContactMenu] = useState(false);
  const contactMenuRef = useRef<HTMLDivElement>(null);

  const phone1 = settings.contactPhone || '+249 12 315 6073';
  const phone2 = settings.contactPhone2 || '+249 12 306 1996';
  const whatsapp1 = settings.contactWhatsApp || '249123156073';
  const whatsapp2 = settings.contactWhatsApp2 || '249123061996';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contactMenuRef.current && !contactMenuRef.current.contains(e.target as Node)) {
        setShowContactMenu(false);
      }
    };
    if (showContactMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContactMenu]);

  const handleLogoClick = () => {
    setActiveView('public');
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
            {/* Reach out via Phone Call / WhatsApp Menu (2 Numbers) */}
            <div className="relative" ref={contactMenuRef}>
              <button
                id="btn-contact-menu"
                onClick={() => setShowContactMenu(!showContactMenu)}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold text-[#185d89] bg-[#185d89]/5 hover:bg-[#185d89]/10 rounded-xl transition-colors border border-[#185d89]/20"
                title="أرقام التواصل والواتساب"
              >
                <div className="flex items-center gap-1 text-[#ec6226]">
                  <Phone className="w-3.5 h-3.5" />
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                </div>
                <span className="hidden sm:inline">تواصل معنا</span>
                <span className="sm:hidden">اتصال/واتساب</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showContactMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Contact Dropdown */}
              {showContactMenu && (
                <div className="absolute left-0 sm:right-auto sm:left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-right">
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      بيانات التواصل
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">متاحان الآن</span>
                  </div>

                  {/* Section 1: WhatsApp (Official Icon, Number Alone) */}
                  <div className="mb-3">
                    <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>واتساب:</span>
                    </div>
                    <a
                      href={`https://wa.me/${whatsapp1}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن برامج ودورات مركز النهضة.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all group shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0">
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="font-mono text-xs font-black" dir="ltr">{phone1}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md font-bold group-hover:bg-[#25D366] group-hover:text-white transition-colors">محادثة</span>
                    </a>
                  </div>

                  {/* Section 2: Direct Phone Calls (Numbers Alone) */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#ec6226]" />
                      <span>اتصال:</span>
                    </div>
                    <div className="space-y-1.5">
                      <a
                        href={`tel:${phone1.replace(/\s+/g, '')}`}
                        className="flex items-center justify-between p-2 bg-slate-50 hover:bg-sky-50 text-slate-800 hover:text-[#185d89] border border-slate-200/80 hover:border-sky-200 rounded-xl text-xs font-bold transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#ec6226]/10 text-[#ec6226] flex items-center justify-center shrink-0 group-hover:bg-[#ec6226] group-hover:text-white transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-mono text-xs font-bold" dir="ltr">{phone1}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-[#185d89]">اتصال</span>
                      </a>

                      <a
                        href={`tel:${phone2.replace(/\s+/g, '')}`}
                        className="flex items-center justify-between p-2 bg-slate-50 hover:bg-sky-50 text-slate-800 hover:text-[#185d89] border border-slate-200/80 hover:border-sky-200 rounded-xl text-xs font-bold transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#ec6226]/10 text-[#ec6226] flex items-center justify-center shrink-0 group-hover:bg-[#ec6226] group-hover:text-white transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-mono text-xs font-bold" dir="ltr">{phone2}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-[#185d89]">اتصال</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
