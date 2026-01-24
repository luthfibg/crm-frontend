import React, { useState, useEffect } from 'react';
import { 
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Upload01Icon,
  SentIcon,
  InformationCircleIcon,
  Cancel02Icon,
  Loading03Icon,
  CheckmarkSquare02Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import api from '../api/axios';

const TaskChecklistModal = ({ isOpen, onClose, prospect, onSuccess }) => {
  const [submitting, setSubmitting] = useState(null);
  const [submittingSummary, setSubmittingSummary] = useState(false);
  const [inputValues, setInputValues] = useState({});
  const [submissionResults, setSubmissionResults] = useState({});
  const [fileNames, setFileNames] = useState({});
  const [summaryRequired, setSummaryRequired] = useState(false);
  const [summaryValue, setSummaryValue] = useState('');

  useEffect(() => {
    if (isOpen && prospect) {
      setInputValues({});
      setSubmissionResults({});
      setFileNames({});
      setSummaryRequired(false);
      setSummaryValue('');
      
      // Debug logging
      console.log('📋 TaskChecklistModal - Prospect Data:', {
        customer: prospect.customer,
        kpi: prospect.kpi,
        daily_goals: prospect.daily_goals,
        daily_goals_count: prospect.daily_goals?.length || 0,
        stats: prospect.stats
      });
    }
  }, [isOpen, prospect]);

  if (!isOpen || !prospect) return null;

  const { customer, kpi, daily_goals, stats } = prospect;

  // Handle Input Change
  const handleInputChange = (taskId, value, file = null) => {
    setInputValues(prev => ({ ...prev, [taskId]: value }));
    
    if (file) {
      setFileNames(prev => ({ ...prev, [taskId]: file.name }));
    }
  };

  // ⭐ Submit Summary and Advance Customer
  const handleSubmitSummary = async () => {
    if (!summaryValue || summaryValue.trim().length < 5) {
      alert('Mohon isi Kesimpulan minimal 5 karakter sebelum submit');
      return;
    }

    setSubmittingSummary(true);

    try {
      const response = await api.post('/summaries/submit-and-advance', {
        customer_id: customer.id,
        summary: summaryValue
      });

      if (response.data.status) {
        setTimeout(() => {
          alert(response.data.message);
          onSuccess?.();
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error('Summary submit error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Gagal menyimpan kesimpulan. Silakan coba lagi.';
      alert(errorMessage);
    } finally {
      setSubmittingSummary(false);
    }
  };

  // ⭐ Submit Task - DETEKSI apakah submit baru atau re-submit
  const handleSubmitTask = async (task) => {
    const value = inputValues[task.id];
    const fileInput = document.getElementById(`file-${task.id}`);
    const file = fileInput?.files[0];

    if (!value && !file) {
      alert('Mohon isi terlebih dahulu sebelum submit');
      return;
    }

    setSubmitting(task.id);

    try {
      const formData = new FormData();
      
      // Jika task.progress_id ada DAN is_rejected = true, gunakan UPDATE
      const isResubmit = task.is_rejected && task.progress_id;
      
      if (!isResubmit) {
        formData.append('daily_goal_id', task.id);
        formData.append('customer_id', customer.id);
      }
      
      if (['file', 'image', 'video'].includes(task.input_type) && file) {
        formData.append('evidence', file);
      } else {
        formData.append('evidence', value || '');
      }

      // ⭐ PILIH ENDPOINT: POST /submit atau PUT /update
      const response = isResubmit
        ? await api.put(`/progress/update/${task.progress_id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : await api.post('/progress/submit', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

      setSubmissionResults(prev => ({
        ...prev,
        [task.id]: {
          submitted: true,
          approved: response.data.is_valid,
          message: response.data.message,
          progress_percent: response.data.progress_percent,
          kpi_completed: response.data.kpi_completed,
          input: response.data.user_input || value,
        }
      }));

      // ⭐ JIKA KPI 100% DAN MEMERLUKAN SUMMARY
      if (response.data.summary_required) {
        setSummaryRequired(true);
      }
      // ⭐ AUTO CLOSE MODAL jika KPI sudah 100% (hanya jika tidak perlu summary)
      else if (response.data.kpi_completed) {
        setTimeout(() => {
          const isFinalKPI = kpi.code === 'after_sales';
          const message = isFinalKPI
            ? `✅ Selamat! After Sales telah berhasil diselesaikan.\n\nPenjualan berhasil dan akan disimpan ke dalam history.`
            : `✅ Selamat! KPI ${kpi.code} telah diselesaikan 100%.\n\nProspek otomatis naik ke status berikutnya.`;
          alert(message);
          onSuccess?.();
          onClose();
        }, 800);
      } else {
        // Clear input setelah submit
        setInputValues(prev => {
          const newState = { ...prev };
          delete newState[task.id];
          return newState;
        });
        setFileNames(prev => {
          const newState = { ...prev };
          delete newState[task.id];
          return newState;
        });

        setTimeout(() => onSuccess?.(), 500);
      }

    } catch (error) {
      console.error('Submit error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Gagal menyimpan. Silakan coba lagi.';
      
      alert(errorMessage);
      
      if (error.response?.status === 409) {
        setSubmissionResults(prev => ({
          ...prev,
          [task.id]: {
            submitted: true,
            approved: false,
            message: error.response.data.message || 'Sudah diselesaikan sebelumnya'
          }
        }));
      }
    } finally {
      setSubmitting(null);
    }
  };

  // Counter stats
  const approvedCount = daily_goals?.filter(task => 
    task.is_completed || (submissionResults[task.id]?.submitted && submissionResults[task.id]?.approved)
  ).length || 0;

  const rejectedCount = daily_goals?.filter(task => 
    task.is_rejected || (submissionResults[task.id]?.submitted && !submissionResults[task.id]?.approved)
  ).length || 0;

  const totalTasks = daily_goals?.length || 0;

  // Render Input Form
  const renderInputForm = (task) => {
    switch (task.input_type) {

      case 'text':
        return (
          <textarea
            placeholder="Tulis jawaban Anda di sini... (input apa adanya, sistem akan menilai setelah submit)"
            value={inputValues[task.id] || ''}
            onChange={(e) => handleInputChange(task.id, e.target.value)}
            rows={3}
            className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            placeholder="Contoh: 08123456789 (boleh ditambah keterangan)"
            value={inputValues[task.id] || ''}
            onChange={(e) => handleInputChange(task.id, e.target.value)}
            className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        );

      // ✅ DATE (text fleksibel)
      case 'date':
        return (
          <input
            type="text"
            placeholder="Contoh: 24-01-2026 / 24/01/2026 (boleh ditambah catatan)"
            value={inputValues[task.id] || ''}
            onChange={(e) => handleInputChange(task.id, e.target.value)}
            className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        );

      // ✅ NUMBER (text fleksibel)
      case 'number':
        return (
          <input
            type="text"
            placeholder="Contoh: 150 / 150,5 / 150.5 (boleh ditambah keterangan)"
            value={inputValues[task.id] || ''}
            onChange={(e) => handleInputChange(task.id, e.target.value)}
            className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        );

      // ✅ CURRENCY (text fleksibel)
      case 'currency':
        return (
          <input
            type="text"
            placeholder="Contoh: Rp 10.000 / 10000 / Rp 5jt cash"
            value={inputValues[task.id] || ''}
            onChange={(e) => handleInputChange(task.id, e.target.value)}
            className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        );

      case 'file':
      case 'image':
      case 'video':
        return (
          <>
            <input
              type="file"
              className="hidden"
              id={`file-${task.id}`}
              accept={
                task.input_type === 'image'
                  ? 'image/*'
                  : task.input_type === 'video'
                  ? 'video/*'
                  : '*/*'
              }
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleInputChange(task.id, file.name, file);
              }}
            />
            <label
              htmlFor={`file-${task.id}`}
              className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all"
            >
              <HugeiconsIcon icon={Upload01Icon} size={16} />
              <span className="flex-1 truncate">
                {fileNames[task.id] || `Pilih ${task.input_type}...`}
              </span>
            </label>
          </>
        );

      default:
        return null;
    }
  };


  // Render Task Content
  const renderTaskContent = (task) => {
    const result = submissionResults[task.id];
    const isAlreadyCompleted = task.is_completed;
    const isAlreadyRejected = task.is_rejected;
    
    // 1. Sudah approved sebelumnya (dari database)
    if (isAlreadyCompleted && !result) {
      return (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-500" />
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-700">✓ Terverifikasi Sistem</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">Misi ini sudah diselesaikan sebelumnya</p>
            </div>
          </div>
          {task.user_input && (
            <div className="p-2 bg-emerald-25 border border-emerald-100 rounded-lg">
              <p className="text-[10px] font-medium text-emerald-800 mb-1">Input Anda:</p>
              <p className="text-xs text-emerald-700 wrap-break-words">{task.user_input}</p>
            </div>
          )}
        </div>
      );
    }

    // 2. Sudah rejected sebelumnya (dari database)
    if (isAlreadyRejected && !result) {
      return (
        <div className="mt-2 space-y-2">
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <HugeiconsIcon icon={Cancel02Icon} size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-red-700 mb-1">✗ Ditolak Sistem</p>
              <p className="text-[10px] text-red-600">Misi ini perlu diperbaiki untuk melanjutkan ke KPI berikutnya</p>
            </div>
          </div>

          {task.user_input && (
            <div className="p-2 bg-red-25 border border-red-100 rounded-lg">
              <p className="text-[10px] font-medium text-red-800 mb-1">Input Sebelumnya:</p>
              <p className="text-xs text-red-700 wrap-break-words">{task.user_input}</p>
            </div>
          )}

          {/* Form untuk re-submit */}
          <div className="space-y-2">
            {renderInputForm(task)}
            <button
              disabled={submitting === task.id || (!inputValues[task.id] && !fileNames[task.id])}
              onClick={() => handleSubmitTask(task)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              {submitting === task.id ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                  Mengirim Ulang...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SentIcon} size={14} />
                  Perbaiki & Submit Ulang
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    // 3. Sedang submit
    if (submitting === task.id) {
      return (
        <div className="mt-2 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <HugeiconsIcon icon={Loading03Icon} size={16} className="text-blue-500 animate-spin" />
          <p className="text-xs font-bold text-blue-700">Sistem sedang memverifikasi...</p>
        </div>
      );
    }

    // 4. Baru submit dan DITOLAK
    if (result?.submitted && !result?.approved) {
      return (
        <div className="mt-2 space-y-2">
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <HugeiconsIcon icon={Cancel02Icon} size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-red-700 mb-1">✗ Tidak Memenuhi Syarat</p>
              <p className="text-[10px] text-red-600">{result.message}</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <p className="text-[10px] text-amber-700 font-medium">
              ⚠️ Misi ini harus diperbaiki. Prospek tidak dapat naik status sampai semua misi approved 100%.
            </p>
          </div>

          {/* Form untuk re-submit */}
          <div className="space-y-2">
            {renderInputForm(task)}
            <button
              disabled={submitting === task.id || (!inputValues[task.id] && !fileNames[task.id])}
              onClick={() => handleSubmitTask(task)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              {submitting === task.id ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                  Mengirim Ulang...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SentIcon} size={14} />
                  Perbaiki & Submit Ulang
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    // 5. Baru submit dan DITERIMA
    if (result?.submitted && result?.approved) {
      return (
        <div className="mt-2 space-y-2">
          <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-700 mb-1">✓ Terverifikasi Sistem</p>
              <p className="text-[10px] text-emerald-600">{result.message}</p>
            </div>
          </div>
          {result?.input !== undefined && result?.input !== null && (
            <div className="p-2 bg-emerald-25 border border-emerald-100 rounded-lg">
              <p className="text-[10px] font-medium text-emerald-800 mb-1">Input Anda:</p>
              <p className="text-xs text-emerald-700 wrap-break-words">{result.input}</p>
            </div>
          )}
        </div>
      );
    }

    // 6. Form input (belum submit)
    return (
      <div className="mt-2 space-y-2">
        {renderInputForm(task)}
        <button
          disabled={submitting === task.id || (!inputValues[task.id] && !fileNames[task.id])}
          onClick={() => handleSubmitTask(task)}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          {submitting === task.id ? (
            <>
              <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <HugeiconsIcon icon={SentIcon} size={14} />
              Submit Misi
            </>
          )}
        </button>
        <p className="text-[10px] text-slate-400 italic text-center">
          *Submit apa adanya, sistem akan menilai otomatis
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded mb-1 inline-block uppercase tracking-tighter">
                {kpi?.code}
              </span>
              <h3 className="text-lg font-black text-slate-800">{customer?.pic}</h3>
              <p className="text-xs text-slate-500 font-medium">{customer?.institution}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <HugeiconsIcon icon={CancelCircleIcon} size={20} />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-400">KPI Progress</span>
              <span className={`${Math.round(stats?.percent || 0) === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                {Math.round(stats?.percent || 0)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  Math.round(stats?.percent || 0) === 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                }`} 
                style={{ width: `${stats?.percent || 0}%` }} 
              />
            </div>
            {Math.round(stats?.percent || 0) === 100 && !summaryRequired && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1">
                ✓ KPI selesai! Silakan isi Kesimpulan untuk melanjutkan.
              </p>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-indigo-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Daily Missions</span>
            </div>
            {(approvedCount > 0 || rejectedCount > 0) && (
              <div className="flex gap-2 text-[10px] font-bold">
                {approvedCount > 0 && (
                  <span className="text-emerald-600" title="Approved tasks">✓ {approvedCount}</span>
                )}
                {rejectedCount > 0 && (
                  <span className="text-red-600" title="Rejected tasks">✗ {rejectedCount}</span>
                )}
                <span className="text-slate-400" title="Total tasks">
                  / {totalTasks}
                </span>
              </div>
            )}
          </div>

          {(!daily_goals || daily_goals.length === 0) && (
            <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50 text-center">
              <p className="text-sm font-bold text-amber-700 mb-1">Tidak ada misi tersedia</p>
              <p className="text-xs text-amber-600">
                Daily goals belum dikonfigurasi untuk KPI ini atau kategori customer tidak cocok dengan filter.
              </p>
            </div>
          )}
          
          {daily_goals?.map((task, index) => {
            const result = submissionResults[task.id];
            const isCompleted = task.is_completed || (result?.submitted && result?.approved);
            const isRejected = task.is_rejected || (result?.submitted && !result?.approved);
            
            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isCompleted
                    ? 'border-emerald-100 bg-emerald-50/30 shadow-none'
                    : isRejected
                    ? 'border-red-100 bg-red-50/30 shadow-sm'
                    : 'border-white bg-white shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className={`mt-1 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isRejected
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                    ) : isRejected ? (
                      <HugeiconsIcon icon={Cancel02Icon} size={14} />
                    ) : (
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-tight mb-1 ${
                      isCompleted ? 'text-emerald-700' : isRejected ? 'text-red-700' : 'text-slate-700'
                    }`}>
                      {task.description}
                    </p>
                    <span className="inline-block text-[10px] font-bold text-slate-400 uppercase px-2 py-0.5 bg-slate-100 rounded">
                      {task.input_type}
                    </span>

                    {renderTaskContent(task)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ⭐ SUMMARY SECTION - Appears when progress is 100% */}
          {summaryRequired && (
            <div className="mt-6 p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50">
              <div className="flex items-center gap-2 mb-3">
                <HugeiconsIcon icon={CheckmarkSquare02Icon} size={18} className="text-indigo-600" />
                <span className="text-sm font-bold text-indigo-700 uppercase tracking-tight">
                  Kesimpulan
                </span>
              </div>
              
              <p className="text-xs text-indigo-600 mb-3">
                Semua misi telah selesai! Silakan tuliskan kesimpulan dari aktivitas Anda pada tahap ini.
              </p>
              
              <textarea
                placeholder="Tulis kesimpulan Anda di sini... (contoh: Telah berhasil melakukan demo produk dan mendapatkan komitmen untuk follow-up meeting)"
                value={summaryValue}
                onChange={(e) => setSummaryValue(e.target.value)}
                rows={4}
                className="w-full p-3 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
              
              <p className="text-[10px] text-indigo-400 mt-1 mb-3">
                * Kesimpulan akan disimpan dan menggantikan kesimpulan sebelumnya
              </p>
              
              <button
                disabled={submittingSummary || !summaryValue || summaryValue.trim().length < 5}
                onClick={handleSubmitSummary}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                {submittingSummary ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                    Submit Kesimpulan & Lanjut
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100">
          {rejectedCount > 0 && !summaryRequired && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-3">
              <p className="text-xs font-bold text-amber-900 mb-1">
                ⚠️ Terdapat {rejectedCount} misi yang ditolak
              </p>
              <p className="text-[10px] text-amber-700">
                Perbaiki semua misi yang ditolak untuk melanjutkan ke KPI berikutnya. Sistem hanya akan menaikkan status prospek jika semua misi approved 100%.
              </p>
            </div>
          )}
          
          <p className="text-[10px] text-center text-slate-400 font-medium">
            {summaryRequired 
              ? '⚡ Wajib mengisi Kesimpulan untuk melanjutkan'
              : 'Sistem Verifikasi Otomatis • Wajib 100% Approved untuk Naik Status'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskChecklistModal;

