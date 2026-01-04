import React, { useState, useEffect } from 'react';
import { 
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  AiChat02Icon,
  Upload01Icon,
  SentIcon,
  InformationCircleIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import api from '../api/axios';

const TaskChecklistModal = ({ isOpen, onClose, prospect, onSuccess }) => {
  const [submitting, setSubmitting] = useState(null); // ID task yang sedang disubmit
  const [inputValues, setInputValues] = useState({}); // Menyimpan input teks/file sementara

  if (!isOpen || !prospect) return null;

  const { customer, kpi, daily_goals, stats } = prospect;

  // Handle Input Change
  const handleInputChange = (id, value) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
  };

  // Fungsi Submit Misi (Daily Goal)
  const handleSubmitTask = async (task) => {
        try {
            setSubmitting(task.id);
            const formData = new FormData();
            formData.append('daily_goal_id', task.id);
            formData.append('customer_id', customer.id);
            
            const evidenceValue = inputValues[task.id];
            if (evidenceValue) {
                formData.append('evidence', evidenceValue);
            }

            const response = await api.post('/progress/submit', formData);
            
            if (response.data.status) { // Pastikan mengecek status sukses dari backend
                alert("Mission Submitted Successfully!");
                
                // OPTIONAL: Menghapus input temporary setelah sukses
                setInputValues(prev => {
                    const newState = { ...prev };
                    delete newState[task.id];
                    return newState;
                });

                onSuccess?.(); // Memicu re-fetch data di parent
            } 
        } catch (err) {
            alert(err.response?.data?.message || "Error submitting data");
        } finally {
            setSubmitting(null);
        }
    };

  const renderInput = (task) => {
    switch (task.input_type) {
      case 'text':
        return (
          <input 
            type="text" 
            placeholder="Type your report here..."
            className="w-full mt-2 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => handleInputChange(task.id, e.target.value)}
          />
        );
      case 'phone':
        return (
          <input 
            type="tel" 
            placeholder="Input phone number..."
            className="w-full mt-2 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => handleInputChange(task.id, e.target.value)}
          />
        );
      case 'file':
      case 'image':
        return (
          <div className="relative mt-2">
            <input 
              type="file" 
              className="hidden" 
              id={`file-${task.id}`}
              onChange={(e) => handleInputChange(task.id, e.target.files[0])}
            />
            <label 
              htmlFor={`file-${task.id}`}
              className="flex items-center gap-2 p-2 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-500 cursor-pointer hover:bg-slate-50"
            >
              <HugeiconsIcon icon={Upload01Icon} size={14} />
              {inputValues[task.id] ? inputValues[task.id].name : `Upload ${task.input_type}...`}
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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
          <div className="flex items-center gap-2 mb-2">
            <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-indigo-500" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Daily Missions</span>
          </div>

          {daily_goals?.map((task) => (
            <div 
                key={task.id} 
                className={`p-4 rounded-xl border-2 bg-white transition-all ${
                    task.is_completed 
                    ? 'border-emerald-100 bg-emerald-50/10 shadow-none opacity-80' // Style untuk misi selesai
                    : 'border-white shadow-sm'
                }`}
            >
                <div className="flex items-start gap-3">
                    {/* Bulatan Nomor / Checklist */}
                    <div className={`mt-1 shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        task.is_completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                        {task.is_completed ? (
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} variant="solid" />
                        ) : (
                            <span className="text-[10px] font-bold">{task.order || '•'}</span>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold leading-tight ${
                            task.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'
                        }`}>
                            {task.description}
                        </p>
                        
                        {/* Input & Button hanya muncul jika BELUM selesai */}
                        {!task.is_completed ? (
                            <div className="mt-3 space-y-3">
                                {renderInput(task)}
                                <button 
                                    disabled={submitting === task.id || (task.input_type !== 'none' && !inputValues[task.id])}
                                    onClick={() => handleSubmitTask(task)}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    {submitting === task.id ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <> <HugeiconsIcon icon={SentIcon} size={14} /> Submit Mission </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="mt-1 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Verified by System</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium italic">
            *Systems will automatically verify your submissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskChecklistModal;