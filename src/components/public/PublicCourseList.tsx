import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Award, Users, BookOpen, CheckCircle, ShieldCheck, Laptop, Building2 } from 'lucide-react';
import { Course, SystemSettings, TraineeRegistration } from '../../types';
import { CourseCard } from './CourseCard';

interface PublicCourseListProps {
  courses: Course[];
  registrations: TraineeRegistration[];
  settings: SystemSettings;
  onRegisterCourse: (course: Course) => void;
}

export const PublicCourseList: React.FC<PublicCourseListProps> = ({
  courses,
  registrations,
  settings,
  onRegisterCourse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'online' | 'onsite'>('all');

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Must be active
      if (c.status !== 'active') return false;

      // Type filter (online vs onsite)
      if (typeFilter !== 'all' && c.type !== typeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        if (!matchesTitle) {
          return false;
        }
      }

      return true;
    });
  }, [courses, typeFilter, searchQuery]);

  // Registrations counter helper
  const getRegisteredCountForCourse = (courseId: string) => {
    return registrations.filter((r) => r.courseId === courseId && r.status !== 'cancelled').length;
  };

  const activeCoursesCount = courses.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero / Announcement Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#185d89] via-[#144f75] to-[#0f3b57] text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-[#185d89]/40">
        {/* Glow decoration in brand orange & gold */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#f06423]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#fab437]/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-white backdrop-blur-md border border-white/20 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#fab437]" />
            <span>بوابة التسجيل الرسمية للمتدربين</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            التسجيل في الدورات والبرامج التدريبية المعتمدة
          </h1>

          <p className="text-sm sm:text-base text-sky-100 leading-relaxed max-w-2xl">
            {settings.welcomeNotice || 'أهلاً بكم في بوابة تسجيل المتدربين بمركز النهضة للتدريب والتطوير الذاتي. اختر الدورة المناسبة وسجل بياناتك بسهولة.'}
          </p>

          {/* Quick value badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-white">
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs border border-white/10">
              <Award className="w-4 h-4 text-[#fab437]" />
              <span>شهادات تدريبية معتمدة</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs border border-white/10">
              <Users className="w-4 h-4 text-[#fab437]" />
              <span>تدريب أونلاين وحضوري</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl backdrop-blur-xs border border-white/10">
              <CheckCircle className="w-4 h-4 text-[#fab437]" />
              <span>تأكيد فوري للتسجيل</span>
            </span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar Section */}
      {activeCoursesCount > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <input
              id="input-search-courses"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#185d89] focus:ring-2 focus:ring-[#185d89]/20 text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                typeFilter === 'all'
                  ? 'bg-[#185d89] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              جميع الدورات ({activeCoursesCount})
            </button>

            <button
              onClick={() => setTypeFilter('online')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                typeFilter === 'online'
                  ? 'bg-[#185d89] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>أونلاين</span>
            </button>

            <button
              onClick={() => setTypeFilter('onsite')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                typeFilter === 'onsite'
                  ? 'bg-[#f06423] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>حضورياً</span>
            </button>
          </div>

        </section>
      )}

      {/* Courses Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              الدورات التدريبية المتاحة
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              اختر الدورة وسجل بياناتك مباشرة
            </p>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                registeredCount={getRegisteredCountForCourse(course.id)}
                onRegister={onRegisterCourse}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#185d89]/10 text-[#185d89] flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {activeCoursesCount === 0 
                ? 'لا توجد دورات تدريبية معروضة للتسجيل حالياً' 
                : 'لا توجد دورات تدريبية مطابقة لبحثك'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {activeCoursesCount === 0
                ? 'تابعونا قريباً للإعلان عن مواعيد الدورات والبرامج التدريبية القادمة.'
                : 'جرب إزالة معايير التصفية أو البحث عن دورة أخرى.'}
            </p>
            {(searchQuery || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                }}
                className="mt-3 px-4 py-2 text-xs font-bold text-[#185d89] bg-[#185d89]/10 rounded-xl hover:bg-[#185d89]/20 transition-colors"
              >
                إعادة تعيين البحث
              </button>
            )}
          </div>
        )}
      </section>

      {/* Trainees Information */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#f06423]" />
          <span>خطوات التسجيل وضمان الحضور</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">1. اختيار الدورة</h4>
            <p className="leading-relaxed">
              حدد الدورة ونوع الحضور المناسب لك (أونلاين عن بُعد أو حضورياً بمقر المركز).
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">2. تعبئة البيانات</h4>
            <p className="leading-relaxed">
              أدخل الاسم الرباعي المعتمد للشهادة ورقم الهاتف/الواتساب للتواصل واستلام التفاصيل.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">3. تأكيد الحضور والشهادة</h4>
            <p className="leading-relaxed">
              يتم تأكيد التسجيل فوراً وتزويدك بالرابط أو موقع القاعة ومنحك شهادة حضور معتمدة.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
