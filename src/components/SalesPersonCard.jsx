import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, PencilEdit01Icon, Delete02Icon } from '@hugeicons/core-free-icons';

// --- PIPELINE ROW COMPONENT ---
const PipelineRow = ({ pic, title, company, stage, date }) => {
  const stages = [1, 2, 3, 4, 5];
  
  const getStageColor = (s) => {
    if (s > stage) return 'bg-slate-100';
    if (s <= 2) return 'bg-blue-400';
    if (s === 3) return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse';
    if (s === 4) return 'bg-emerald-500';
    return 'bg-teal-600';
  };

  return (
    <div className="group flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors px-2">
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{pic}</span>
        <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-tight">{title} • {company}</span>
      </div>

      <div className="flex items-center gap-1 relative group/tooltip">
        {stages.map((s) => (
          <div key={s} className="relative">
            <div className={`h-2 w-6 rounded-sm transition-all duration-500 ${getStageColor(s)}`}>
              {s === 5 && stage >= 5 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <HugeiconsIcon icon={StarIcon} size={6} color="#fff" variant="solid" />
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:block z-50">
          <div className="bg-slate-900 dark:bg-slate-700 text-white text-[9px] py-1 px-2 rounded shadow-xl whitespace-nowrap">
            Last Checkpoint: {date}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function untuk menentukan level KPI
const getKPILevel = (totalScore) => {
  if (totalScore <= 500) {
    return { 
      label: 'Less Good', 
      container: 'bg-amber-50 border-amber-200', 
      text: 'text-amber-700', 
      dot: 'bg-amber-500' 
    };
  }
  if (totalScore <= 700) {
    return { 
      label: 'Good', 
      container: 'bg-emerald-50 border-emerald-200', 
      text: 'text-emerald-700', 
      dot: 'bg-emerald-500' 
    };
  }
  if (totalScore <= 850) {
    return { 
      label: 'Very Good', 
      container: 'bg-blue-50 border-blue-200', 
      text: 'text-blue-700', 
      dot: 'bg-blue-500' 
    };
  }
  return { 
    label: 'Excellent', 
    container: 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent shadow-md', 
    text: 'text-white', 
    dot: 'bg-white animate-pulse' 
  };
};

// --- MAIN SALES PERSON CARD COMPONENT ---
const SalesPersonCard = ({ 
  name, 
  avatar, 
  summary, 
  pipelines, 
  totalScore = 0, 
  isAdmin,
  onEdit,
  onDelete
}) => {
  const safeScore = isNaN(totalScore) ? 0 : totalScore;
  const level = getKPILevel(safeScore);

  return (
    <div className="bg-white dark:bg-slate-800 group rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">

      <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden shadow-sm">
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">{name}</h3>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate">{summary}</p>
          </div>
        </div>

        {/* Tombol CRUD (Hanya Admin) */}
        {isAdmin && (
          <div className="flex gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onEdit}
              className="p-1.5 bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all hover:scale-105"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
            </button>
            <button 
              onClick={onDelete}
              className="p-1.5 bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all hover:scale-105"
            >
              <HugeiconsIcon icon={Delete02Icon} size={14} />
            </button>
          </div>
        )}

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all duration-500 ${level.container}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${level.dot}`} />
          <div className="flex flex-col leading-none">
            <span className={`text-[9px] font-black uppercase tracking-wider ${level.text}`}>
              {level.label}
            </span>
            <span className={`text-[8px] font-bold opacity-80 ${level.text}`}>
              {safeScore} pts
            </span>
          </div>
        </div>
      </div>

      <div className="max-h-55 overflow-y-auto scrollbar-hide bg-white dark:bg-slate-800">
        {pipelines && pipelines.length > 0 ? (
          pipelines.map((pipeline, idx) => (
            <PipelineRow key={idx} {...pipeline} />
          ))
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">No pipelines available</p>
          </div>
        )}
      </div>

      <div className="px-3 py-2 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase">Performance Index</span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1 w-3 rounded-full transition-all duration-300 ${
                i < (safeScore / 200) ? level.dot : 'bg-slate-200'
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Prop types untuk validasi (opsional)
SalesPersonCard.defaultProps = {
  name: '',
  avatar: 'https://i.pravatar.cc/150?u=user',
  summary: '',
  pipelines: [],
  totalScore: 0,
  isAdmin: false,
  onEdit: () => {},
  onDelete: () => {}
};

export default SalesPersonCard;