import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, XCircle, Phone, User, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { TraineeRegistration } from '../../types';
import { getArabicMonthLabel } from '../../data/initialData';

interface CheckStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: TraineeRegistration[];
}

export const CheckStatusModal: React.FC<CheckStatusModalProps> = ({
  isOpen,
  onClose,
  registrations,
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<TraineeRegistration[]>([]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toLowerCase().replace(/[\s-]/g, '');
    if (!clean) return;

    const found = registrations.filter((r) => {
      const phoneClean = r.phoneNumber.replace(/[\s-]/g, '');
      const idClean = r.id.toLowerCase().replace(/[\s-]/g, '');
      const nameClean = r.fullName.toLowerCase();
      return (
        phoneClean.includes(clean) ||
        idClean.includes(clean) ||
        nameClean.includes(query.trim().toLowerCase())
      );
    });

    setResults(found);
    setHasSearched(true);
  };

  const getStatusBadge = (st: TraineeRegistration['status']) => {
    switch (st) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مؤكد ومقبول</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>قيد المراجعة والتأكيد</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>ملغي</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 bg-[#185d89] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center">
              <Search className="w-5 h-5 text-[#fab437]" />
            </div>
            <div>
              <h3 className="text-lg font-black">الاستعلام عن حالة التسجيل</h3>
              <p className="text-xs text-sky-100">مركز النهضة للتدريب والتطوير الذاتي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <div className="p-6 border-b border-slate-100">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              id="input-query-status"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder=""
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-[#185d89] focus:ring-2 focus:ring-[#185d89]/20 text-sm"
            />
            <button
              type="submit"
              id="btn-search-status"
              className="px-6 py-3 bg-[#185d89] hover:bg-[#13496c] text-white font-black text-sm rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#f06423]" />
              <span>بحث</span>
            </button>
          </form>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {hasSearched ? (
            results.length > 0 ? (
              results.map((reg) => (
                <div key={reg.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {reg.id}
                    </span>
                    {getStatusBadge(reg.status)}
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">{reg.courseTitle}</h4>
                    <p className="text-xs text-slate-500">شهر الدورة: {getArabicMonthLabel(reg.courseMonth)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-200/70 pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{reg.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span dir="ltr">{reg.phoneNumber}</span>
                    </div>
                  </div>

                  {reg.notes && (
                    <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                      <strong>ملاحظة الإدارة:</strong> {reg.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">لم يتم العثور على أي تسجيل مطابق</p>
                <p className="text-xs text-slate-400 mt-1">تأكد من كتابة رقم الهاتف أو الرقم المرجعي بشكل صحيح</p>
              </div>
            )
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              أدخل رقم الهاتف الذي قمت بالتسجيل به للاطلاع على حالة طلبك وتفاصيل الدورة.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
