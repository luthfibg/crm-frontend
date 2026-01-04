import React, { useState, useEffect } from 'react';
import { 
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  AiChat02Icon,
  Upload01Icon,
  SentIcon,
  InformationCircleIcon,
  Cancel02Icon,
  ArrowRight01Icon,
  AlertCircleIcon,
  Loading03Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import api from '../api/axios';

const TaskChecklistModal = ({ isOpen, onClose, prospect, onSuccess }) => {
  const [submitting, setSubmitting] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [submissionResults, setSubmissionResults] = useState({});
  const [fileNames, setFileNames] = useState({});
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    if (isOpen && prospect) {
      setInputValues({});
      setSubmissionResults({});
      setFileNames({});
    }
  }, [isOpen, prospect]);

  if (!isOpen || !prospect) return null;

  const { customer, kpi, daily_goals, stats } = prospect;

  // Handle Input Change - TANPA VALIDASI, hanya simpan input
  const handleInputChange = (taskId, value, file = null) => {
    setInputValues(prev => ({ ...prev, [taskId]: value }));
    
    if (file) {
      setFileNames(prev => ({ ...prev, [taskId]: file.name }));
    }
  };

  // Submit Task - LANGSUNG KIRIM tanpa validasi frontend
  const handleSubmitTask = async (task) => {
    const value = inputValues[task.id];
    const fileInput = document.getElementById(`file-${task.id}`);
    const file = fileInput?.files[0];

    // Minimal check: harus ada input
    if (!value && !file) {
      alert('Mohon isi terlebih dahulu sebelum submit');
      return;
    }

    setSubmitting(task.id);

    try {
      const formData = new FormData();
      formData.append('daily_goal_id', task.id);
      formData.append('customer_id', customer.id);
      
      if (['file', 'image', 'video'].includes(task.input_type) && file) {
        formData.append('evidence', file);
      } else {
        formData.append('evidence', value || '');
      }

      // Backend yang akan melakukan validasi dan memberikan approved/rejected
      const response = await api.post('/progress/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Simpan hasil penilaian sistem
      setSubmissionResults(prev => ({
        ...prev,
        [task.id]: {
          submitted: true,
          approved: response.data.is_valid, // true = centang hijau, false = X merah
          message: response.data.message,
          progress_percent: response.data.progress_percent
        }
      }));

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

      // Refresh data
      setTimeout(() => onSuccess?.(), 500);

    } catch (error) {
    console.error('Submit error:', error);
    
    // Tampilkan pesan error dari backend jika ada
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Gagal menyimpan. Silakan coba lagi.';
    
    alert(errorMessage);
    
    // Jika error 409 (duplikasi), update UI
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

  // Handle Skip ke KPI Berikutnya
  const handleSkipToNext = async () => {
    if (!window.confirm(
      '⚠️ Konfirmasi Skip\n\n' +
      'Dengan melakukan skip:\n' +
      '• Misi yang ditolak (X merah) tidak akan menambah poin\n' +
      '• Customer akan dipindahkan ke KPI berikutnya\n' +
      '• Anda tidak bisa kembali ke KPI ini\n\n' +
      'Lanjutkan?'
    )) {
      return;
    }

    setSkipping(true);
    try {
      const response = await api.post(`/customers/${customer.id}/skip-kpi`);
      alert(`✓ ${response.data.message}\n\nStatus baru: ${response.data.new_status}`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Skip error:', error);
      alert(error.response?.data?.message || 'Gagal skip ke status berikutnya');
    } finally {
      setSkipping(false);
    }
  };

  // Check kondisi untuk tombol skip
    const allTasksAttempted = daily_goals?.every(task => {
    // Sudah completed (approved sebelumnya dari database)
    if (task.is_completed) return true;
    
    // Sudah rejected sebelumnya dari database
    if (task.is_rejected) return true;
    
    // Baru saja submit (dari submissionResults)
    if (submissionResults[task.id]?.submitted) return true;
    
    // Belum diattempt sama sekali
    return false;
    }) || false;

    const hasRejectedTasks = daily_goals?.some(task => {
    // Rejected dari database
    if (task.is_rejected) return true;
    
    // Baru saja submit dan rejected
    if (submissionResults[task.id]?.submitted && !submissionResults[task.id]?.approved) {
        return true;
    }
    
    return false;
    }) || false;

    const approvedCount = daily_goals?.filter(task => 
    task.is_completed || (submissionResults[task.id]?.submitted && submissionResults[task.id]?.approved)
    ).length || 0;

    const rejectedCount = daily_goals?.filter(task => 
    task.is_rejected || (submissionResults[task.id]?.submitted && !submissionResults[task.id]?.approved)
    ).length || 0;

    const showSkipButton = allTasksAttempted && hasRejectedTasks && !prospect?.kpi?.is_completed;

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
            placeholder="Contoh: 08123456789"
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
                task.input_type === 'image' ? 'image/*' :
                task.input_type === 'video' ? 'video/*' : '*/*'
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

  // Render Task Status & Input
  const renderTaskContent = (task) => {
    const result = submissionResults[task.id];
    const isAlreadyCompleted = task.is_completed;
    
    // 1. Jika sudah completed dari database (approved sebelumnya)
    if (isAlreadyCompleted && !result) {
      return (
        <div className="mt-2 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-500" />
          <div className="flex-1">
            <p className="text-xs font-bold text-emerald-700">✓ Terverifikasi Sistem</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Misi ini sudah diselesaikan sebelumnya</p>
          </div>
        </div>
      );
    }

    // 2. Jika baru saja submit dan sedang menunggu hasil
    if (submitting === task.id) {
      return (
        <div className="mt-2 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <HugeiconsIcon icon={Loading03Icon} size={16} className="text-blue-500 animate-spin" />
          <p className="text-xs font-bold text-blue-700">Sistem sedang memverifikasi...</p>
        </div>
      );
    }

    // 3. Jika sudah submit dan DITOLAK (X merah)
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
              💡 Misi ini tidak menambah poin. Anda bisa skip ke status berikutnya setelah semua misi diisi.
            </p>
          </div>
        </div>
      );
    }

    // 4. Jika sudah submit dan DITERIMA (centang hijau)
    if (result?.submitted && result?.approved) {
      return (
        <div className="mt-2 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-emerald-700 mb-1">✓ Terverifikasi Sistem</p>
            <p className="text-[10px] text-emerald-600">{result.message}</p>
          </div>
        </div>
      );
    }

    // 5. Form input (belum submit)
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
              <span className="text-indigo-600">{Math.round(stats?.percent || 0)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${stats?.percent || 0}%` }} />
            </div>
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
                <span className="text-slate-400" title="Total attempted">
                    ({approvedCount + rejectedCount}/{daily_goals?.length || 0})
                </span>
                </div>
            )}
            </div>

          {daily_goals?.map((task, index) => {
            const result = submissionResults[task.id];
            const isCompleted = task.is_completed || (result?.submitted && result?.approved);
            const isRejected = result?.submitted && !result?.approved;
            
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
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-3">
          {/* Skip Button */}
          {showSkipButton && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-3">
                <HugeiconsIcon icon={AlertCircleIcon} size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-900 mb-1">
                    Terdapat {rejectedCount} misi yang tidak memenuhi syarat
                  </p>
                  <p className="text-[10px] text-amber-700">
                    Anda dapat melanjutkan ke KPI berikutnya. Misi yang ditolak tidak akan menambah poin KPI.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkipToNext}
                disabled={skipping}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white py-2.5 rounded-lg hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-bold text-sm transition-all shadow-sm"
              >
                {skipping ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Skip ke Status Berikutnya
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </>
                )}
              </button>
            </div>
          )}

          <p className="text-[10px] text-center text-slate-400 font-medium">
            Sistem Verifikasi Otomatis • Input Apa Adanya
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskChecklistModal;