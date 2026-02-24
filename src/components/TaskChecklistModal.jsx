import React, { useState, useEffect } from 'react';
import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Upload01Icon,
  SentIcon,
  InformationCircleIcon,
  Cancel02Icon,
  Loading03Icon,
  CheckmarkSquare02Icon,
  File01Icon,
  Undo02Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TaskChecklistModal = ({ isOpen, onClose, prospect, onSuccess }) => {
  const [submitting, setSubmitting] = useState(null);
  const [submittingSummary, setSubmittingSummary] = useState(false);
  const [inputValues, setInputValues] = useState({});
  const [submissionResults, setSubmissionResults] = useState({});
  const [fileNames, setFileNames] = useState({});
  const [summaryRequired, setSummaryRequired] = useState(false);
  const [summaryValue, setSummaryValue] = useState('');

  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isOpen && prospect) {
      // Prefill input values with existing user_input for rejected tasks
      const prefilledValues = {};
      const prefilledFileNames = {};
      prospect.daily_goals?.forEach(task => {
        if (task.is_rejected && task.user_input) {
          if (['file', 'image', 'video'].includes(task.input_type)) {
            prefilledFileNames[task.id] = task.user_input;
          } else {
            prefilledValues[task.id] = task.user_input;
          }
        }
      });

      setInputValues(prefilledValues);
      setSubmissionResults({});
      setFileNames(prefilledFileNames);
      setSummaryRequired(false); // Reset
      setSummaryValue('');

      // Check if summary should be required based on current progress
      const currentProgress = Math.round(prospect.stats?.percent || 0);
      if (currentProgress >= 100) {
        // Check if summary already exists for this customer and KPI
        api.get(`/summaries/customer/${prospect.customer.id}`)
          .then(response => {
            const existingSummary = response.data?.summary;
            if (!existingSummary) {
              setSummaryRequired(true);
            }
          })
          .catch(error => {
            console.error('Error checking summary existence:', error);
            // As fallback, assume summary is required if progress is 100%
            setSummaryRequired(true);
          });
      }
    }
  }, [isOpen, prospect]);

  if (!isOpen || !prospect) return null;

  const { customer, kpi, daily_goals, stats } = prospect;

  const handleInputChange = (taskId, value, file = null) => {
    setInputValues(prev => ({ ...prev, [taskId]: value }));
    if (file) {
      setFileNames(prev => ({ ...prev, [taskId]: file.name }));
    }
  };

  const handleSubmitSummary = async () => {
    if (isAdmin) {
      alert('Administrator hanya dapat melihat progress, tidak dapat menginput kesimpulan.');
      return;
    }

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
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Gagal menyimpan kesimpulan.';
      alert(errorMessage);
    } finally {
      setSubmittingSummary(false);
    }
  };

  const handleRevertTask = async (task) => {
    if (isAdmin) {
      alert('Administrator hanya dapat melihat riwayat, tidak dapat melakukan revert.');
      return;
    }
    if (!task.progress_id) {
      alert('Tidak dapat revert: Progress ID tidak ditemukan');
      return;
    }

    const confirmRevert = window.confirm('Apakah Anda yakin ingin revert submission ini? Progress dan skor akan dikembalikan.');
    if (!confirmRevert) return;

    setSubmitting(task.id);

    try {
      const response = await api.post(`/progress/revert/${task.progress_id}`);

      if (response.data.status) {
        alert('Submission berhasil direvert. Progress dan skor telah dikembalikan.');
        onSuccess?.(); // Refresh the parent component
      }
    } catch (error) {
      console.error('Revert error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Gagal revert submission.';
      alert(errorMessage);
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmitTask = async (task) => {
    if (isAdmin) {
      alert('Administrator hanya dapat melihat progress, tidak dapat menginput checklist.');
      return;
    }
    const value = inputValues[task.id];
    const fileInput = document.getElementById(`file-${task.id}`);
    const file = fileInput?.files[0];

    if (
      (value === null || value === undefined || value === '') &&
      !file
    ) {
      alert('Mohon isi terlebih dahulu sebelum submit');
      return;
    }


    setSubmitting(task.id);

    try {
      const isResubmit = task.is_rejected && task.progress_id;
      let requestData;
      let config = {};

      if (['file', 'image', 'video'].includes(task.input_type) && file) {
        // Use FormData for file uploads
        const formData = new FormData();
        if (!isResubmit) {
          formData.append('daily_goal_id', task.id);
          formData.append('customer_id', customer.id);
        }
        formData.append('evidence', file);
        requestData = formData;
        // Let axios handle Content-Type for FormData
      } else {
        // Use JSON for text inputs
        requestData = {
          daily_goal_id: isResubmit ? undefined : task.id,
          customer_id: isResubmit ? undefined : customer.id,
          evidence: value === 0 ? '0' : value
        };
        // Let axios handle Content-Type for JSON
      }

      const response = isResubmit
        ? await api.put(`/progress/update/${task.progress_id}`, requestData, config)
        : await api.post('/progress/submit', requestData, config);

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

      if (response.data.summary_required) {
        setSummaryRequired(true);
      } else if (response.data.kpi_completed) {
        setTimeout(() => {
          const isFinalKPI = kpi.code === 'after_sales';
          const isDealWon = kpi.code === 'deal';
          const message = isFinalKPI
            ? 'After Sales telah selesai. Penjualan akan disimpan ke history.'
            : (isDealWon
              ? 'Deal Won berhasil diselesaikan! Prospek naik ke After Sales dan tercatat di Sales History.'
              : `KPI ${kpi.code} telah selesai 100%. Prospek naik ke status berikutnya.`);
          alert(message);
          onSuccess?.();
          onClose();
        }, 800);
      } else {
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
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Gagal menyimpan.';
      alert(errorMessage);
    } finally {
      setSubmitting(null);
    }
  };

  const approvedCount = daily_goals?.filter(task => 
    task.is_completed || (submissionResults[task.id]?.submitted && submissionResults[task.id]?.approved)
  ).length || 0;

  const rejectedCount = daily_goals?.filter(task => 
    task.is_rejected || (submissionResults[task.id]?.submitted && !submissionResults[task.id]?.approved)
  ).length || 0;

  const totalTasks = daily_goals?.length || 0;

  const detectPhrase = (value, type) => {
    if (!value) return null;
    const lowerValue = value.toLowerCase();
    
    const datePatterns = [
      { pattern: /belum\s*(ada)?\s*target\s*pengiriman/i, message: 'Belum ada target', status: 'warning' },
      { pattern: /sudah\s*(ada)?\s*target\s*pengiriman/i, message: 'Sudah ada target', status: 'success' },
      { pattern: /^(tidak\s*ada|-)$/i, message: 'Tidak ada', status: 'warning' },
    ];
    
    const currencyPatterns = [
      { pattern: /belum\s*(ada)?\s*target\s*(harga|nominal|price)/i, message: 'Belum ada target', status: 'warning' },
      { pattern: /belum\s*(ada)?\s*(nego|negosiasi)/i, message: 'Belum nego', status: 'warning' },
      { pattern: /belum\s*tahu/i, message: 'Belum tahu', status: 'warning' },
      { pattern: /masih\s*(dalam\s*)?(nego|negosiasi)/i, message: 'Masih negosiasi', status: 'warning' },
      { pattern: /(free|gratis|tanpa\s*biaya)/i, message: 'Free/Gratis', status: 'success' },
      { pattern: /sudah\s*(ada)?\s*target\s*(harga|nominal)/i, message: 'Sudah ada target', status: 'success' },
      { pattern: /sudah\s*(di)?\s*(nego|negosiasi)/i, message: 'Sudah nego', status: 'success' },
      { pattern: /^(tidak\s*ada|-)$/i, message: 'Tidak ada', status: 'warning' },
    ];

    if (type === 'date') {
      for (const { pattern, message, status } of datePatterns) {
        if (pattern.test(lowerValue)) return { message, status };
      }
    }
    
    if (type === 'currency') {
      for (const { pattern, message, status } of currencyPatterns) {
        if (pattern.test(lowerValue)) return { message, status };
      }
    }
    
    return null;
  };

  const renderInputForm = (task) => {
    // Mode read-only untuk administrator: tidak menampilkan input form baru
    if (isAdmin) return null;

    switch (task.input_type) {
      case 'text':
        return (
          <textarea
            placeholder="Tulis jawaban Anda di sini..."
            value={inputValues[task.id] || ''}
            onChange={(e) => handleInputChange(task.id, e.target.value)}
            rows={3}
            className="w-full p-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none resize-none placeholder-slate-400 dark:placeholder-slate-500"
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            placeholder="Contoh: 08123456789"
            value={inputValues[task.id] || ''}
            onChange={(e) => handleInputChange(task.id, e.target.value)}
            className="w-full p-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none placeholder-slate-400 dark:placeholder-slate-500"
          />
        );

      case 'date':
        const datePhrase = detectPhrase(inputValues[task.id], 'date');
        const dateColorClass = datePhrase?.status === 'success' ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/40 dark:text-slate-100' : datePhrase?.status === 'warning' ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/40 dark:text-slate-100' : 'border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100';
        const dateTextClass = datePhrase?.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : datePhrase?.status === 'warning' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400';
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Contoh: 24-01-2026 atau 'Sudah ada target pengiriman 24-01-2026'"
              value={inputValues[task.id] || ''}
              onChange={(e) => handleInputChange(task.id, e.target.value)}
              className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none placeholder-slate-400 dark:placeholder-slate-500 ${dateColorClass}`}
            />
            {datePhrase && (
              <p className={`text-[10px] ${dateTextClass} font-medium flex items-center gap-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${datePhrase.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                Detected: {datePhrase.message}
              </p>
            )}
          </div>
        );

      case 'number': {
        const desc = (task.description || '').toLowerCase();
        const isSerialTask = desc.includes('serial number') || desc.includes('sn');
        const placeholder = isSerialTask
          ? 'Contoh: SERIAL NUMBER: XBMS0009C11 (boleh ada teks lain)'
          : 'Contoh: 150 atau 150.5';

        return (
          <input
            type="text"
            placeholder={placeholder}
            value={inputValues[task.id] || ''}
            onChange={(e) => handleInputChange(task.id, e.target.value)}
            className="w-full p-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none placeholder-slate-400 dark:placeholder-slate-500"
          />
        );
      }

      case 'currency':
        const currencyPhrase = detectPhrase(inputValues[task.id], 'currency');
        const currencyColorClass = currencyPhrase?.status === 'success' ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/40 dark:text-slate-100' : currencyPhrase?.status === 'warning' ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/40 dark:text-slate-100' : 'border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100';
        const currencyTextClass = currencyPhrase?.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : currencyPhrase?.status === 'warning' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400';
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Contoh: Rp 10.000.000 atau 'Sudah ada target harga Rp 10.000.000'"
              value={inputValues[task.id] || ''}
              onChange={(e) => handleInputChange(task.id, e.target.value)}
              className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none placeholder-slate-400 dark:placeholder-slate-500 ${currencyColorClass}`}
            />
            {currencyPhrase && (
              <p className={`text-[10px] ${currencyTextClass} font-medium flex items-center gap-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currencyPhrase.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                Detected: {currencyPhrase.message}
              </p>
            )}
          </div>
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
              accept={task.input_type === 'image' ? 'image/*' : task.input_type === 'video' ? 'video/*' : '*/*'}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleInputChange(task.id, file.name, file);
              }}
            />
            <label
              htmlFor={`file-${task.id}`}
              className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
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

  const renderTaskContent = (task) => {
    const result = submissionResults[task.id];
    const isAlreadyCompleted = task.is_completed;
    const isAlreadyRejected = task.is_rejected;
    
    if (isAlreadyCompleted && !result) {
      return (
        <div className="mt-2 space-y-2">
          <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 rounded-lg">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">✓ Terverifikasi Sistem</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-300">Sudah diselesaikan sebelumnya</p>
            </div>
          </div>
          {task.user_input && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Input Anda:</p>
                {!isAdmin && (
                  <button
                    onClick={() => handleRevertTask(task)}
                    disabled={submitting === task.id}
                    className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-amber-700 dark:text-amber-400 disabled:text-slate-400 dark:disabled:text-slate-500 rounded text-[10px] font-bold"
                  >
                    <HugeiconsIcon icon={Undo02Icon} size={12} />
                    Revert
                  </button>
                )}
              </div>
              {['file', 'image', 'video'].includes(task.input_type) && task.progress_id ? (
                <div className="flex items-center gap-2 mt-1">
                  <HugeiconsIcon icon={File01Icon} size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token');
                      const downloadUrl = `${api.defaults.baseURL}/progress/attachment/${task.progress_id}${token ? `?token=${token}` : ''}`;
                      window.open(downloadUrl, '_blank');
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 underline"
                  >
                    {task.user_input}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 wrap-break-words">{task.user_input}</p>
              )}
            </div>
          )}
        </div>
      );
    }

    if (isAlreadyRejected && !result) {
      return (
        <div className="mt-2 space-y-2">
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg">
            <HugeiconsIcon icon={Cancel02Icon} size={16} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">✗ Ditolak Sistem</p>
              <p className="text-[10px] text-red-600 dark:text-red-300">Misi ini perlu diperbaiki</p>
            </div>
          </div>
          {task.user_input && (
            <div className="p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-xs font-medium text-red-700 dark:text-red-300">Input Anda:</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 wrap-break-words">{task.user_input}</p>
            </div>
          )}
          {!isAdmin && (
            <div className="space-y-2">
              {renderInputForm(task)}
              <button
                disabled={submitting === task.id}
                onClick={() => handleSubmitTask(task)}
                className="w-full py-2.5 bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 dark:hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white rounded-lg text-xs font-bold"
              >
                {submitting === task.id ? 'Mengirim...' : 'Perbaiki & Submit'}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (submitting === task.id) {
      return (
        <div className="mt-2 flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg">
          <HugeiconsIcon icon={Loading03Icon} size={16} className="text-blue-500 dark:text-blue-400 animate-spin" />
          <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Sistem sedang memverifikasi...</p>
        </div>
      );
    }

    if (result?.submitted && !result?.approved) {
      return (
        <div className="mt-2 space-y-2">
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg">
            <HugeiconsIcon icon={Cancel02Icon} size={16} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">✗ Tidak Memenuhi Syarat</p>
              <p className="text-[10px] text-red-600 dark:text-red-300">{result.message}</p>
            </div>
          </div>
          {result.input && (
            <div className="p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-xs font-medium text-red-700 dark:text-red-300">Input Anda:</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 wrap-break-words">{result.input}</p>
            </div>
          )}
          {!isAdmin && (
            <div className="space-y-2">
              {renderInputForm(task)}
              <button
                disabled={submitting === task.id}
                onClick={() => handleSubmitTask(task)}
                className="w-full py-2.5 bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 dark:hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white dark:text-white rounded-lg text-xs font-bold"
              >
                Perbaiki & Submit
              </button>
            </div>
          )}
        </div>
      );
    }

    if (result?.submitted && result?.approved) {
      return (
        <div className="mt-2 space-y-2">
          <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 rounded-lg">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">✓ Terverifikasi Sistem</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-300">{result.message}</p>
            </div>
          </div>
          {result.input && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 rounded-lg">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Input Anda:</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 wrap-break-words">{result.input}</p>
            </div>
          )}
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Checklist ini hanya dapat diisi oleh sales yang menangani prospek. Administrator hanya dapat melihat status dan input yang sudah ada.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-2 space-y-2">
        {renderInputForm(task)}
        <button
          disabled={submitting === task.id || (!inputValues[task.id] && !fileNames[task.id])}
          onClick={() => handleSubmitTask(task)}
          className="w-full py-2.5 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-500 rounded-lg text-xs font-bold"
        >
          {submitting === task.id ? 'Mengirim...' : 'Submit Misi'}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-800 w-[95%] md:w-[80%] lg:w-[55%] max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded mb-1 inline-block uppercase tracking-tighter">
                {kpi?.code}
              </span>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{customer?.pic}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{customer?.institution}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 dark:text-slate-500">
              <HugeiconsIcon icon={CancelCircleIcon} size={20} />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-400 dark:text-slate-500">KPI Progress</span>
              <span className={Math.round(stats?.percent || 0) === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}>
                {Math.round(stats?.percent || 0)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${Math.round(stats?.percent || 0) === 100 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'}`} 
                style={{ width: `${stats?.percent || 0}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-slate-900/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-indigo-500 dark:text-indigo-400" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Daily Missions</span>
            </div>
            {(approvedCount > 0 || rejectedCount > 0) && (
              <div className="flex gap-2 text-[10px] font-bold">
                {approvedCount > 0 && <span className="text-emerald-600 dark:text-emerald-400">✓ {approvedCount}</span>}
                {rejectedCount > 0 && <span className="text-red-600 dark:text-red-400">✗ {rejectedCount}</span>}
                <span className="text-slate-400 dark:text-slate-500">/ {totalTasks}</span>
              </div>
            )}
          </div>

          {(!daily_goals || daily_goals.length === 0) && (
            <div className="p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-center">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">Tidak ada misi tersedia</p>
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
                  isCompleted ? 'border-emerald-100 bg-emerald-50/30' : isRejected ? 'border-red-100 bg-red-50/30' : 'border-white bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-emerald-500 text-white' : isRejected ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} /> : isRejected ? <HugeiconsIcon icon={Cancel02Icon} size={14} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
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

          {summaryRequired && !isAdmin && (
            <div className="mt-6 p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
              <div className="flex items-center gap-2 mb-3">
                <HugeiconsIcon icon={CheckmarkSquare02Icon} size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">Kesimpulan</span>
              </div>
              <textarea
                placeholder="Tulis kesimpulan Anda di sini..."
                value={summaryValue}
                onChange={(e) => setSummaryValue(e.target.value)}
                rows={4}
                className="w-full p-3 text-sm border border-indigo-200 dark:border-indigo-800 dark:bg-slate-700 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none resize-none placeholder-slate-400 dark:placeholder-slate-500"
              />
              <button
                disabled={submittingSummary || !summaryValue || summaryValue.trim().length < 5}
                onClick={handleSubmitSummary}
                className="w-full py-3 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-500 rounded-lg text-sm font-bold mt-3"
              >
                {submittingSummary ? 'Menyimpan...' : 'Submit Kesimpulan & Lanjut'}
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          {rejectedCount > 0 && !summaryRequired && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 rounded-lg p-3 mb-3">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-400 mb-1">⚠️ Terdapat {rejectedCount} misi yang ditolak</p>
            </div>
          )}
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium">
            {summaryRequired
              ? (isAdmin ? '⚡ Kesimpulan wajib diisi oleh sales terkait' : '⚡ Wajib mengisi Kesimpulan')
              : 'Sistem Verifikasi Otomatis'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskChecklistModal;

