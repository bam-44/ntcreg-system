import React from 'react';
import { Laptop, Building2, Globe2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  registeredCount: number;
  onRegister: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  registeredCount,
  onRegister,
}) => {
  const isFull = (course.maxCapacity && course.maxCapacity > 0) ? registeredCount >= course.maxCapacity : false;
  const isClosed = course.status !== 'active' || isFull;

  const getAttendanceBadge = (type: Course['type']) => {
    switch (type) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#185d89]/10 text-[#185d89] border border-[#185d89]/20">
            <Laptop className="w-3.5 h-3.5 text-[#185d89]" />
            <span>تدريب أونلاين (عن بُعد)</span>
          </span>
        );
      case 'onsite':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#f06423]/10 text-[#f06423] border border-[#f06423]/25">
            <Building2 className="w-3.5 h-3.5 text-[#f06423]" />
            <span>تدريب حضورياً (بمقر المركز)</span>
          </span>
        );
      case 'hybrid':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Globe2 className="w-3.5 h-3.5 text-amber-600" />
            <span>تدريب مدمج (حضوري وعن بُعد)</span>
          </span>
        );
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200 hover:border-[#185d89] transition-all duration-200 hover:shadow-lg overflow-hidden p-6 sm:p-7">
      
      {/* Top Section: Type Badge & Status */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          {getAttendanceBadge(course.type)}
        </div>
        
        {course.status === 'active' && !isFull && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>التسجيل متاح</span>
          </span>
        )}
      </div>

      {/* Course Title */}
      <div className="mb-6 flex-1">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-relaxed group-hover:text-[#185d89] transition-colors">
          {course.title}
        </h3>
      </div>

      {/* Action / Registration CTA */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
        <button
          id={`btn-register-course-${course.id}`}
          disabled={isClosed}
          onClick={() => onRegister(course)}
          className={`w-full py-3 px-5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
            isClosed
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-[#185d89] hover:bg-[#13496c] active:bg-[#0e3752] text-white shadow-md shadow-[#185d89]/20 hover:shadow-lg'
          }`}
        >
          {isFull ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>اكتملت المقاعد</span>
            </>
          ) : course.status !== 'active' ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>التسجيل مغلق</span>
            </>
          ) : (
            <>
              <span>التسجيل في الدورة</span>
              <ArrowLeft className="w-4 h-4 text-[#fab437] group-hover:-translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
