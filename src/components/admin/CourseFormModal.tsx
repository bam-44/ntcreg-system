import React, { useState, useEffect } from 'react';
import { X, Save, Plus, BookOpen, Laptop, Building2, Globe2 } from 'lucide-react';
import { Course, CourseStatus, AttendanceType, SystemSettings } from '../../types';
import { getArabicMonthLabel } from '../../data/initialData';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (courseData: Partial<Course>) => void;
  initialCourse?: Course | null;
  settings: SystemSettings;
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCourse,
  settings,
}) => {
  const isEditing = !!initialCourse;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<AttendanceType>('online');
  const [month, setMonth] = useState(settings.currentMonth || '2026-08');
  const [status, setStatus] = useState<CourseStatus>('active');
  const [isCurrentMonth, setIsCurrentMonth] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialCourse) {
      setTitle(initialCourse.title || '');
      setType(initialCourse.type || 'online');
      setMonth(initialCourse.month || settings.currentMonth || '2026-08');
      setStatus(initialCourse.status || 'active');
      setIsCurrentMonth(initialCourse.isCurrentMonth ?? true);
    } else {
      setTitle('');
      setType('online');
      setMonth(settings.currentMonth || '2026-08');
      setStatus('active');
      setIsCurrentMonth(true);
    }
    setErrors({});
  }, [initialCourse, isOpen, settings.currentMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'يرجى كتابة اسم الدورة التدريبية.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const courseData: Partial<Course> = {
      title: title.trim(),
      type,
      status,
      month: month.trim(),
      monthNameAr: getArabicMonthLabel(month.trim()),
      isCurrentMonth,
      updatedAt: new Date().toISOString(),
    };

    onSave(courseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 bg-[#185d89] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-[#fab437]">
              {isEditing ? <BookOpen className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-black">
                {isEditing ? 'تعديل الدورة التدريبية' : 'إضافة دورة تدريبية جديدة'}
              </h3>
              <p className="text-xs text-white/80">
                أدخل اسم الدورة وحدد نوع الحضور (أونلاين / حضورياً)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Course Title */}
          <div>
            <label className="block font-bold text-slate-800 text-sm mb-2">
              اسم الدورة التدريبية <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder=""
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#185d89] focus:ring-2 focus:ring-[#185d89]/20 text-sm font-medium transition-all"
            />
            {errors.title && <p className="text-rose-500 text-xs font-semibold mt-1.5">{errors.title}</p>}
          </div>

          {/* Attendance Type Selector (Online vs Onsite) */}
          <div>
            <label className="block font-bold text-slate-800 text-sm mb-2">
              نوع الدورة التدريبية <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('online')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  type === 'online'
                    ? 'border-[#185d89] bg-[#185d89]/5 text-[#185d89] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Laptop className={`w-6 h-6 ${type === 'online' ? 'text-[#185d89]' : 'text-slate-400'}`} />
                <span className="text-sm">أونلاين (عن بُعد)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('onsite')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                  type === 'onsite'
                    ? 'border-[#f06423] bg-[#f06423]/5 text-[#f06423] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Building2 className={`w-6 h-6 ${type === 'onsite' ? 'text-[#f06423]' : 'text-slate-400'}`} />
                <span className="text-sm">حضورياً (بالمقر)</span>
              </button>
            </div>
          </div>

          {/* Status & Current Month Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5">
                حالة التسجيل في الدورة
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CourseStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#185d89] text-xs font-bold bg-white"
              >
                <option value="active">🟢 مفعلة (متاحة للتسجيل)</option>
                <option value="closed">🔴 إغلاق التسجيل</option>
                <option value="inactive">⚪ غير مفعلة (مخفية)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5">
                الشهر التدريبي
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#185d89] text-xs font-semibold"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              id="btn-save-course"
              className="py-2.5 px-6 rounded-xl text-xs font-black bg-[#185d89] hover:bg-[#13496c] text-white shadow-md flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4 text-[#fab437]" />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة الدورة'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
