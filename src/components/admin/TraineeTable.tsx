import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Trash2, Edit3, MessageSquare, Phone, Mail, 
  Calendar, CheckCircle, Clock, XCircle, Filter, FileSpreadsheet, 
  Eye, UserCheck, AlertTriangle 
} from 'lucide-react';
import { TraineeRegistration, Course, RegistrationStatus } from '../../types';
import { exportRegistrationsToCSV, saveRegistrations } from '../../utils/storage';
import { getArabicMonthLabel } from '../../data/initialData';

interface TraineeTableProps {
  registrations: TraineeRegistration[];
  courses: Course[];
  onUpdateRegistrations: (updated: TraineeRegistration[]) => void;
}

export const TraineeTable: React.FC<TraineeTableProps> = ({
  registrations,
  courses,
  onUpdateRegistrations,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTraineeDetails, setSelectedTraineeDetails] = useState<TraineeRegistration | null>(null);

  // Month options
  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    registrations.forEach((r) => {
      if (r.courseMonth) months.add(r.courseMonth);
    });
    return Array.from(months);
  }, [registrations]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      // Course filter
      if (selectedCourseId !== 'all' && r.courseId !== selectedCourseId) {
        return false;
      }
      // Month filter
      if (selectedMonth !== 'all' && r.courseMonth !== selectedMonth) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && r.status !== selectedStatus) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = r.fullName.toLowerCase().includes(q);
        const matchesPhone = r.phoneNumber.includes(q);
        const matchesId = r.id.toLowerCase().includes(q);
        const matchesCourse = r.courseTitle.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesId && !matchesCourse) {
          return false;
        }
      }
      return true;
    });
  }, [registrations, selectedCourseId, selectedMonth, selectedStatus, searchQuery]);

  // Handle status toggle
  const handleStatusChange = (id: string, newStatus: RegistrationStatus) => {
    const updated = registrations.map((r) =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    onUpdateRegistrations(updated);
    saveRegistrations(updated);
  };

  // Handle payment status toggle
  const handlePaymentChange = (id: string, newPayment: 'paid' | 'unpaid' | 'free') => {
    const updated = registrations.map((r) =>
      r.id === id ? { ...r, paymentStatus: newPayment } : r
    );
    onUpdateRegistrations(updated);
    saveRegistrations(updated);
  };

  // Handle delete
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف تسجيل المتدرب "${name}"؟`)) {
      const updated = registrations.filter((r) => r.id !== id);
      onUpdateRegistrations(updated);
      saveRegistrations(updated);
    }
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const course = courses.find((c) => c.id === selectedCourseId);
    exportRegistrationsToCSV(filteredRegistrations, course?.title);
  };

  const getStatusBadge = (st: RegistrationStatus) => {
    switch (st) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>مؤكد</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>قيد الانتظار</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" />
            <span>ملغي</span>
          </span>
        );
    }
  };

  const selectedCourseObj = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Search box */}
          <div className="relative w-full lg:w-80">
            <input
              id="input-admin-search-trainees"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            <button
              id="btn-export-excel-csv"
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-[#185d89] hover:bg-[#13496c] active:bg-[#0e3752] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#fab437]" />
              <span>تصدير كشف المتدربين (Excel / CSV)</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Course filter */}
          <div>
            <label className="block font-bold text-slate-600 mb-1">تصفية حسب الدورة التدريبية:</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">جميع الدورات ({registrations.length} متدرب)</option>
              {courses.map((c) => {
                const count = registrations.filter((r) => r.courseId === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.title} ({count} مسجل)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Month filter */}
          <div>
            <label className="block font-bold text-slate-600 mb-1">تصفية حسب الشهر التدريبي:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">جميع الأشهر</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {getArabicMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block font-bold text-slate-600 mb-1">حالة الطلب:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="confirmed">مؤكد ومقبول فقط</option>
              <option value="pending">قيد الانتظار والمراجعة فقط</option>
              <option value="cancelled">ملغي فقط</option>
            </select>
          </div>
        </div>

      </div>

      {/* Trainees Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">سجل المتدربين المسجلين</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
              {filteredRegistrations.length} متدرب
            </span>
          </div>
          {selectedCourseObj && (
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              الدورة المحددة: {selectedCourseObj.title}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4"># الرقم المرجعي</th>
                <th className="py-3.5 px-4">الاسم الرباعي للمتدرب</th>
                <th className="py-3.5 px-4">رقم الهاتف / واتساب</th>
                <th className="py-3.5 px-4">اسم الدورة التدريبية</th>
                <th className="py-3.5 px-4">تاريخ التسجيل</th>
                <th className="py-3.5 px-4">حالة الطلب</th>
                <th className="py-3.5 px-4">حالة الرسوم</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((trainee) => {
                  const cleanWhatsAppPhone = trainee.phoneNumber.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(
                    `مرحباً ${trainee.fullName}، نود إعلامكم بتأكيد تسجيلكم في دورة "${trainee.courseTitle}" برقم مرجعي: ${trainee.id}.`
                  )}`;

                  return (
                    <tr key={trainee.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600 whitespace-nowrap">
                        {trainee.id}
                      </td>

                      {/* Full Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{trainee.fullName}</div>
                        {trainee.city && (
                          <span className="text-[10px] text-slate-500 block">
                            📍 {trainee.city} {trainee.jobTitle ? `• ${trainee.jobTitle}` : ''}
                          </span>
                        )}
                      </td>

                      {/* Phone & WhatsApp Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-800 font-medium" dir="ltr">
                            {trainee.phoneNumber}
                          </span>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="مراسلة المتدرب عبر واتساب"
                          >
                            <MessageSquare className="w-4 h-4 fill-emerald-600/20" />
                          </a>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 line-clamp-1 max-w-xs">
                          {trainee.courseTitle}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {getArabicMonthLabel(trainee.courseMonth)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {new Date(trainee.registeredAt).toLocaleDateString('ar-SA')}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(trainee.registeredAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={trainee.status}
                          onChange={(e) => handleStatusChange(trainee.id, e.target.value as RegistrationStatus)}
                          className={`text-xs font-bold py-1 px-2 rounded-lg border focus:ring-1 focus:outline-hidden ${
                            trainee.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : trainee.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <option value="confirmed">✅ مؤكد ومقبول</option>
                          <option value="pending">⏳ قيد الانتظار</option>
                          <option value="cancelled">❌ ملغي</option>
                        </select>
                      </td>

                      {/* Payment Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={trainee.paymentStatus}
                          onChange={(e) => handlePaymentChange(trainee.id, e.target.value as any)}
                          className="text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="paid">💳 تم السداد</option>
                          <option value="unpaid">⚠️ غير مسدد</option>
                          <option value="free">🎁 مجاني</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedTraineeDetails(trainee)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="عرض تفاصيل المتدرب"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(trainee.id, trainee.fullName)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف المتدرب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    لا توجد تسجيلات مطابقة لمعايير البحث الحالية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trainee Details Modal */}
      {selectedTraineeDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg">تفاصيل تسجيل المتدرب</h3>
              <button
                onClick={() => setSelectedTraineeDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 border border-slate-200">
                <p><strong>الرقم المرجعي:</strong> <span className="font-mono">{selectedTraineeDetails.id}</span></p>
                <p><strong>الاسم الرباعي:</strong> {selectedTraineeDetails.fullName}</p>
                <p><strong>الهاتف:</strong> <span dir="ltr">{selectedTraineeDetails.phoneNumber}</span></p>
                <p><strong>البريد الإلكتروني:</strong> {selectedTraineeDetails.email || 'غير محدد'}</p>
                <p><strong>المدينة:</strong> {selectedTraineeDetails.city || 'غير محدد'}</p>
                <p><strong>المسمى الوظيفي:</strong> {selectedTraineeDetails.jobTitle || 'غير محدد'}</p>
                <p><strong>الدورة:</strong> {selectedTraineeDetails.courseTitle}</p>
                <p><strong>الشهر:</strong> {getArabicMonthLabel(selectedTraineeDetails.courseMonth)}</p>
                <p><strong>تاريخ التسجيل:</strong> {new Date(selectedTraineeDetails.registeredAt).toLocaleString('ar-SA')}</p>
              </div>

              {selectedTraineeDetails.notes && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <strong className="block text-emerald-900 mb-1">الملاحظات:</strong>
                  <p className="text-emerald-800">{selectedTraineeDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTraineeDetails(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
