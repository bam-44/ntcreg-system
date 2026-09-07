import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, ArrowRight, Sparkles, FolderPlus, AlertCircle } from 'lucide-react';
import { Course, SystemSettings } from '../../types';
import { getArabicMonthLabel, MONTH_NAMES_AR } from '../../data/initialData';

interface MonthManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  onUpdateCourses: (courses: Course[]) => void;
}

export const MonthManagerModal: React.FC<MonthManagerModalProps> = ({
  isOpen,
  onClose,
  courses,
  settings,
  onSaveSettings,
  onUpdateCourses,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(settings.currentMonth);
  const [autoClosePrevious, setAutoClosePrevious] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate next 6 months options
  const monthOptions = [];
  const currentDate = new Date();
  for (let i = -2; i <= 6; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${yyyy}-${mm}`;
    const label = `${MONTH_NAMES_AR[mm] || mm} ${yyyy}`;
    monthOptions.push({ key, label });
  }

  const handleApplyMonthChange = () => {
    const monthLabel = getArabicMonthLabel(selectedMonth);

    // Update settings
    const updatedSettings = {
      ...settings,
      currentMonth: selectedMonth,
      currentMonthName: monthLabel,
    };
    onSaveSettings(updatedSettings);

    // Update courses: mark courses with this month as isCurrentMonth: true
    const updatedCourses = courses.map((c) => {
      const isTarget = c.month === selectedMonth;
      let newStatus = c.status;
      if (autoClosePrevious && !isTarget && c.status === 'active') {
        newStatus = 'closed';
      }
      return {
        ...c,
        isCurrentMonth: isTarget,
        status: newStatus,
      };
    });

    onUpdateCourses(updatedCourses);
    setMessage(`تم تعيين (${monthLabel}) كشهر تدريبي نشط بنجاح!`);
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">إدارة وتحديد الشهر التدريبي النشط</h3>
              <p className="text-xs text-slate-400">تحديد دورات الشهر الحالي وفتح فترات تسجيل جديدة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold block">الشهر التدريبي الحالي المفعل:</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-emerald-700">{settings.currentMonthName}</span>
              <span className="font-mono text-slate-400">({settings.currentMonth})</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5 text-sm">
              اختر الشهر التدريبي الجديد لتفعيله في الواجهة العامة:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              {monthOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} ({opt.key})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              سيتم إبراز دورات هذا الشهر في الصفحة الرئيسية تلقائياً للمتدربين.
            </p>
          </div>

          {/* Option to automatically close previous month courses */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={autoClosePrevious}
                onChange={(e) => setAutoClosePrevious(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 leading-relaxed font-semibold">
                إغلاق التسجيل تلقائياً في دورات الأشهر السابقة وحصر التسجيل في دورات الشهر الجديد فقط.
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              إلغاء
            </button>

            <button
              id="btn-apply-month-change"
              onClick={handleApplyMonthChange}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold flex items-center gap-2 shadow-md shadow-emerald-700/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تطبيق وتحديث الشهر الحالي</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
