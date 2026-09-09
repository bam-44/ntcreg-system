import React, { useState } from 'react';
import { 
  LayoutDashboard, BookOpen, Users, Calendar, Settings, Plus, 
  CheckCircle, Clock, XCircle, AlertCircle, Trash2, Edit3, 
  ExternalLink, LogOut, ArrowRight, ShieldCheck, Download, RefreshCw, KeyRound, Sparkles,
  Upload, Image as ImageIcon
} from 'lucide-react';
import { Course, TraineeRegistration, SystemSettings, CourseStatus } from '../../types';
import { TraineeTable } from './TraineeTable';
import { CourseFormModal } from './CourseFormModal';
import { MonthManagerModal } from './MonthManagerModal';
import { saveCourses, saveSettings, resetDataToDefaults } from '../../utils/storage';
import { getArabicMonthLabel } from '../../data/initialData';

interface AdminDashboardProps {
  courses: Course[];
  registrations: TraineeRegistration[];
  settings: SystemSettings;
  onUpdateCourses: (courses: Course[]) => void;
  onUpdateRegistrations: (registrations: TraineeRegistration[]) => void;
  onUpdateSettings: (settings: SystemSettings) => void;
  onLogout: () => void;
  onBackToPublic: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  courses,
  registrations,
  settings,
  onUpdateCourses,
  onUpdateRegistrations,
  onUpdateSettings,
  onLogout,
  onBackToPublic,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'trainees' | 'settings'>('overview');

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);

  // Settings local state
  const [centerName, setCenterName] = useState(settings.centerName);
  const [contactWhatsApp, setContactWhatsApp] = useState(settings.contactWhatsApp);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [welcomeNotice, setWelcomeNotice] = useState(settings.welcomeNotice);
  const [adminPin, setAdminPin] = useState(settings.adminPin);
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl || '');
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  // KPIs
  const totalCoursesCount = courses.length;
  const activeCoursesCount = courses.filter((c) => c.status === 'active').length;
  const currentMonthCoursesCount = courses.filter((c) => c.month === settings.currentMonth || c.isCurrentMonth).length;
  const totalRegistrationsCount = registrations.length;
  const currentMonthRegistrationsCount = registrations.filter((r) => r.courseMonth === settings.currentMonth).length;
  const confirmedRegistrationsCount = registrations.filter((r) => r.status === 'confirmed').length;

  // Course handlers
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (courseData: Partial<Course>) => {
    let updatedCourses: Course[];
    if (editingCourse) {
      // Edit
      updatedCourses = courses.map((c) =>
        c.id === editingCourse.id ? ({ ...c, ...courseData } as Course) : c
      );
    } else {
      // Create new
      const newId = `crs-${Date.now()}`;
      const newCourse: Course = {
        id: newId,
        title: courseData.title || 'دورة تدريبية جديدة',
        description: courseData.description || '',
        category: courseData.category || 'التقنية والذكاء الاصطناعي',
        month: courseData.month || settings.currentMonth,
        monthNameAr: courseData.monthNameAr || getArabicMonthLabel(courseData.month || settings.currentMonth),
        startDate: courseData.startDate || '',
        endDate: courseData.endDate || '',
        days: courseData.days || '',
        time: courseData.time || '',
        duration: courseData.duration || '',
        type: courseData.type || 'online',
        location: courseData.location || '',
        price: courseData.price ?? 0,
        currency: courseData.currency || 'ج.س',
        instructor: courseData.instructor || { name: 'مدرب معتمد', title: 'خبير تدريب' },
        maxCapacity: courseData.maxCapacity || 30,
        status: courseData.status || 'active',
        isCurrentMonth: courseData.isCurrentMonth ?? true,
        featured: courseData.featured ?? false,
        certificate: courseData.certificate ?? true,
        prerequisites: courseData.prerequisites || '',
        targetAudience: courseData.targetAudience || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedCourses = [newCourse, ...courses];
    }
    onUpdateCourses(updatedCourses);
    saveCourses(updatedCourses);
  };

  const handleDeleteCourse = (courseId: string, title: string) => {
    const regCount = registrations.filter((r) => r.courseId === courseId).length;
    let confirmMsg = `هل أنت متأكد من حذف دورة "${title}"؟`;
    if (regCount > 0) {
      confirmMsg += `\nتنبيه: يوجد (${regCount}) متدرب مسجلين في هذه الدورة!`;
    }
    if (window.confirm(confirmMsg)) {
      const updated = courses.filter((c) => c.id !== courseId);
      onUpdateCourses(updated);
      saveCourses(updated);
    }
  };

  const handleToggleCourseStatus = (courseId: string, newStatus: CourseStatus) => {
    const updated = courses.map((c) =>
      c.id === courseId ? { ...c, status: newStatus } : c
    );
    onUpdateCourses(updated);
    saveCourses(updated);
  };

  const handleToggleCurrentMonthCourse = (courseId: string) => {
    const updated = courses.map((c) =>
      c.id === courseId ? { ...c, isCurrentMonth: !c.isCurrentMonth } : c
    );
    onUpdateCourses(updated);
    saveCourses(updated);
  };

  // Settings Save
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SystemSettings = {
      ...settings,
      centerName,
      contactWhatsApp,
      contactPhone,
      contactEmail,
      welcomeNotice,
      adminPin: adminPin.trim() || 'admin123',
      logoUrl: logoUrl.trim() || undefined,
    };
    onUpdateSettings(updated);
    saveSettings(updated);
    setSettingsSuccessMsg('تم حفظ الإعدادات والشعار بنجاح!');
    setTimeout(() => setSettingsSuccessMsg(null), 3000);
  };

  // Backup & Restore
  const handleExportBackupJSON = () => {
    const backup = {
      courses,
      registrations,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_training_system_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleResetData = () => {
    if (window.confirm('هل أنت متأكد من استعادة البيانات الافتراضية التجريبية؟ سيتم استرجاع الدورات والمتدربين الافتراضيين.')) {
      resetDataToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Admin Navigation Header */}
      <div className="bg-gradient-to-r from-[#185d89] via-[#144f75] to-[#0f3b57] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#185d89]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[#fab437] text-xs font-black mb-1">
            <ShieldCheck className="w-4 h-4 text-[#f06423]" />
            <span>لوحة تحكم الإدارة - {settings.centerName}</span>
            <span>•</span>
            <span>الشهر الحالي: {settings.currentMonthName}</span>
            <span>•</span>
            <span className="text-white/90 bg-white/10 px-2 py-0.5 rounded-md font-mono text-[11px]">
              المشرف: bayan.kim@alnahda-group.com
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            نظام إدارة الدورات وتسجيل المتدربين
          </h1>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-admin-add-course"
            onClick={handleOpenAddCourse}
            className="px-4 py-2.5 bg-[#f06423] hover:bg-[#d65319] active:bg-[#ba4410] text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة دورة جديدة</span>
          </button>

          <button
            id="btn-admin-month-manager"
            onClick={() => setIsMonthModalOpen(true)}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-2 transition-all"
          >
            <Calendar className="w-4 h-4 text-[#fab437]" />
            <span>تحديد الشهر التدريبي</span>
          </button>

          <button
            id="btn-admin-back-public"
            onClick={onBackToPublic}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>معاينة واجهة المتدربين</span>
          </button>

          <button
            id="btn-admin-logout"
            onClick={onLogout}
            className="p-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-xl text-xs font-bold transition-colors"
            title="تسجيل الخروج من لوحة التحكم"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="tab-admin-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>نظرة عامة وإحصائيات</span>
        </button>

        <button
          id="tab-admin-courses"
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'courses'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>إدارة الدورات التدريبية ({courses.length})</span>
        </button>

        <button
          id="tab-admin-trainees"
          onClick={() => setActiveTab('trainees')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'trainees'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>سجل المتدربين المسجلين ({registrations.length})</span>
        </button>

        <button
          id="tab-admin-settings"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>إعدادات النظام والنسخ الاحتياطي</span>
        </button>
      </div>

      {/* Tab 1: Overview KPIs */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold block mb-1">إجمالي المتدربين المسجلين</span>
                <span className="text-3xl font-black text-slate-900">{totalRegistrationsCount}</span>
                <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">
                  ✓ {confirmedRegistrationsCount} تسجيل مؤكد
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold block mb-1">مسجلي الشهر الحالي</span>
                <span className="text-3xl font-black text-emerald-700">{currentMonthRegistrationsCount}</span>
                <span className="text-[11px] text-slate-400 block mt-1 font-medium">
                  لشهر {settings.currentMonthName}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold block mb-1">الدورات التدريبية المفعلة</span>
                <span className="text-3xl font-black text-slate-900">{activeCoursesCount}</span>
                <span className="text-[11px] text-slate-400 block mt-1 font-medium">
                  من أصل {totalCoursesCount} دورة مسجلة
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold block mb-1">دورات الشهر الحالي</span>
                <span className="text-3xl font-black text-slate-900">{currentMonthCoursesCount}</span>
                <span className="text-[11px] text-slate-400 block mt-1 font-medium">
                  تظهر في الواجهة الرئيسية
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Actions Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>إجراءات سريعة</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <button
                  onClick={handleOpenAddCourse}
                  className="w-full p-3 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded-xl font-bold flex items-center justify-between transition-colors border border-slate-200 hover:border-emerald-200"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>إضافة دورة تدريبية جديدة</span>
                  </span>
                  <span>←</span>
                </button>

                <button
                  onClick={() => setIsMonthModalOpen(true)}
                  className="w-full p-3 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded-xl font-bold flex items-center justify-between transition-colors border border-slate-200 hover:border-emerald-200"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>تغيير أو فتح شهر تدريبي جديد</span>
                  </span>
                  <span>←</span>
                </button>

                <button
                  onClick={() => setActiveTab('trainees')}
                  className="w-full p-3 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded-xl font-bold flex items-center justify-between transition-colors border border-slate-200 hover:border-emerald-200"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>تصدير كشف المتدربين إلى Excel</span>
                  </span>
                  <span>←</span>
                </button>
              </div>
            </div>

            {/* Latest Registrations Preview */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>أحدث طلبات التسجيل</span>
                </h3>
                <button
                  onClick={() => setActiveTab('trainees')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  عرض جميع المتدربين ({registrations.length})
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {registrations.slice(0, 5).map((reg) => (
                  <div key={reg.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{reg.fullName}</p>
                      <p className="text-[11px] text-slate-500">
                        {reg.courseTitle} • {getArabicMonthLabel(reg.courseMonth)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        reg.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reg.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {reg.status === 'confirmed' ? 'مؤكد' : reg.status === 'pending' ? 'انتظار' : 'ملغي'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                        {reg.phoneNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Course Management */}
      {activeTab === 'courses' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900">إدارة الدورات التدريبية</h2>
              <p className="text-xs text-slate-500">
                أضف وعدل الدورات، وتحكم في حالتها (مفعلة / إغلاق التسجيل / غير مفعلة) وحدد دورات الشهر الحالي
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddCourse}
                id="btn-add-course-table"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة دورة جديدة</span>
              </button>
            </div>
          </div>

          {/* Courses List Table / Cards */}
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#185d89]/10 text-[#185d89] flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">لا توجد دورات تدريبية مضافة حالياً</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                اضغط على زر "إضافة دورة جديدة" لإدخال اسم الدورة ونوع الحضور (أونلاين أو حضورياً).
              </p>
              <button
                onClick={handleOpenAddCourse}
                className="px-5 py-2.5 bg-[#185d89] hover:bg-[#13496c] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#fab437]" />
                <span>إضافة أول دورة تدريبية</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => {
                const regCount = registrations.filter((r) => r.courseId === course.id && r.status !== 'cancelled').length;
                return (
                  <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#185d89]/40 transition-all">
                    
                    <div>
                      {/* Top status & type badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          course.type === 'online'
                            ? 'bg-[#185d89]/10 text-[#185d89] border-[#185d89]/20'
                            : 'bg-[#f06423]/10 text-[#f06423] border-[#f06423]/25'
                        }`}>
                          {course.type === 'online' ? '💻 أونلاين' : '🏛️ حضورياً'}
                        </span>

                        {/* Status Selector */}
                        <select
                          value={course.status}
                          onChange={(e) => handleToggleCourseStatus(course.id, e.target.value as CourseStatus)}
                          className={`text-xs font-bold py-1 px-2 rounded-lg border ${
                            course.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : course.status === 'closed'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="active">🟢 متاح للتسجيل</option>
                          <option value="closed">🔴 إغلاق التسجيل</option>
                          <option value="inactive">⚪ غير مفعل (مخفي)</option>
                        </select>
                      </div>

                      <h3 className="font-black text-slate-900 text-base leading-snug mb-3">
                        {course.title}
                      </h3>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                        <span className="text-slate-500 font-medium">عدد المسجلين:</span>
                        <span className="font-black text-[#185d89] text-sm">
                          {regCount} متدرب
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditCourse(course)}
                          className="px-3 py-1.5 text-xs font-bold text-[#185d89] bg-[#185d89]/10 hover:bg-[#185d89]/20 rounded-xl transition-colors flex items-center gap-1.5"
                          title="تعديل بيانات الدورة"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.title)}
                          className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5"
                          title="حذف الدورة"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Tab 3: Trainees Registrations Table */}
      {activeTab === 'trainees' && (
        <div className="animate-fadeIn">
          <TraineeTable
            registrations={registrations}
            courses={courses}
            onUpdateRegistrations={onUpdateRegistrations}
          />
        </div>
      )}

      {/* Tab 4: Settings & Data Management */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn text-xs">
          
          {/* Main Settings Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">إعدادات المركز والتواصل</h2>
              <p className="text-xs text-slate-500 mt-0.5">تعديل بيانات المركز وأرقام التواصل المباشر مع المتدربين</p>
            </div>

            {settingsSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{settingsSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettingsSubmit} className="space-y-5">
              
              {/* Logo Upload Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block font-bold text-slate-800 text-sm flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#f06423]" />
                    <span>شعار المركز (صورة اللوغو)</span>
                  </span>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline"
                    >
                      حذف صورة الشعار
                    </button>
                  )}
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Logo Preview */}
                  <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-2xs p-2 flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <span className="text-[10px] text-slate-400 font-bold block leading-tight">بدون صورة</span>
                        <span className="text-[9px] text-[#185d89] font-bold block mt-0.5">(عرض النص فقط)</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-4 py-2 bg-[#185d89] hover:bg-[#13496c] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة الشعار الأصلية من جهازك</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setLogoUrl(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      عند عدم رفع صورة، سيظهر اسم المركز وعنوانه بتنسيق نصي أنيق وواضح دون أي رسومات.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المركز التدريبي</label>
                <input
                  type="text"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الواتساب لاستقبال التأكيدات والتواصل</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={contactWhatsApp}
                    onChange={(e) => setContactWhatsApp(e.target.value)}
                    placeholder=""
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-left focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400">بدون + أو مسافات</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف العام</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-left focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني الرسمي</label>
                <input
                  type="email"
                  dir="ltr"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-left focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الإعلان الترحيبي أعلى صفحة المتدربين</label>
                <textarea
                  rows={2}
                  value={welcomeNotice}
                  onChange={(e) => setWelcomeNotice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm resize-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  البريد الإلكتروني المعتمد للمشرف (صاحب صلاحية الإدارة)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    readOnly
                    value="bayan.kim@alnahda-group.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-sm font-mono cursor-not-allowed"
                  />
                  <span className="text-xs font-bold text-[#185d89] whitespace-nowrap bg-[#185d89]/10 border border-[#185d89]/20 px-3 py-2 rounded-xl">
                    معتمد ومحمي
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">لوحة التحكم مقفلة ومخصصة حصرياً لصاحب هذا الحساب.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  كلمة المرور / الرمز السري لدخول المشرف (Admin PIN)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder=""
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-center tracking-wider font-bold focus:border-[#185d89]"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  id="btn-save-settings"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>حفظ إعدادات النظام</span>
                </button>
              </div>
            </form>
          </div>

          {/* Backup & System Maintenance */}
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>النسخ الاحتياطي وتصدير البيانات</span>
              </h3>
              <p className="text-slate-500 leading-relaxed">
                قم بتحميل نسخة احتياطية كاملة لجميع الدورات والمسجلين والإعدادات كملف JSON لحفظها على جهازك.
              </p>
              <button
                onClick={handleExportBackupJSON}
                id="btn-export-backup-json"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>تحميل نسخة احتياطية (JSON)</span>
              </button>
            </div>

            <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-200 shadow-xs space-y-3">
              <h3 className="font-black text-rose-900 text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-rose-600" />
                <span>استعادة البيانات الافتراضية</span>
              </h3>
              <p className="text-rose-700 leading-relaxed">
                إعادة ضبط قاعدة البيانات إلى البيانات النموذجية الأصلية وإلغاء التعديلات.
              </p>
              <button
                onClick={handleResetData}
                id="btn-reset-defaults"
                className="w-full py-2.5 px-4 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>استعادة البيانات التجريبية</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Modals */}
      <CourseFormModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSave={handleSaveCourse}
        initialCourse={editingCourse}
        settings={settings}
      />

      <MonthManagerModal
        isOpen={isMonthModalOpen}
        onClose={() => setIsMonthModalOpen(false)}
        courses={courses}
        settings={settings}
        onSaveSettings={(s) => {
          onUpdateSettings(s);
          saveSettings(s);
        }}
        onUpdateCourses={(c) => {
          onUpdateCourses(c);
          saveCourses(c);
        }}
      />

    </div>
  );
};
