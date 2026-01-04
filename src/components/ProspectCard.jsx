import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon, AiChat02Icon, Clock01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

const ProspectCard = ({ data, onDetailsClick }) => {
  const customer = data?.customer || {};
  const kpi = data?.kpi || {};
  const stats = data?.stats || { percent: 0 };
  const kpiHistory = data?.kpi_progress_history || [];

  console.log("🃏 ProspectCard data:", data);

  // Warna progress bar berdasarkan status
  const getProgressColor = (isCompleted, isCurrent) => {
    if (isCompleted) return 'bg-emerald-500';
    if (isCurrent) return 'bg-indigo-500';
    return 'bg-slate-300';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
      {/* ⭐ KPI Progress History - Multiple Bars */}
      <div className="mb-6">
        
        {/* Current KPI - Highlighted */}
        {kpiHistory.find(k => k.is_current) && (
            <div className="mb-3">
            {(() => {
                const current = kpiHistory.find(k => k.is_current);
                return (
                <>
                    <div className="flex justify-between items-center mb-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                        📍 Current Stage
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600">
                        {current.kpi_description}
                        </span>
                    </div>
                    <span className="text-[12px] font-bold text-indigo-600">
                        {Math.round(current.percent)}%
                    </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                        style={{ width: `${current.percent}%` }} 
                    />
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400 text-right">
                    {current.completed_count}/{current.assigned_count} tasks completed
                    </div>
                </>
                );
            })()}
            </div>
        )}
        
        {/* Previous KPIs - Mini Indicators */}
        {kpiHistory.filter(k => !k.is_current && k.percent > 0).length > 0 && (
            <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Previous Stages
            </span>
            {kpiHistory.filter(k => !k.is_current).map((kpiItem) => (
                <div key={kpiItem.kpi_id} className="flex items-center gap-2">
                <HugeiconsIcon 
                    icon={CheckmarkCircle02Icon} 
                    size={12} 
                    className={kpiItem.is_completed ? 'text-emerald-500' : 'text-slate-300'} 
                />
                <span className="text-[10px] text-slate-500 flex-1">
                    {kpiItem.kpi_description}
                </span>
                <span className={`text-[10px] font-bold ${
                    kpiItem.is_completed ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                    {Math.round(kpiItem.percent)}%
                </span>
                </div>
            ))}
            </div>
        )}
        </div>

      {/* PIC & Info */}
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-800 truncate">
            {customer?.pic || 'Unnamed PIC'}
          </h4>
          <p className="text-[13px] text-slate-500 font-medium truncate">
            {customer?.institution || 'No institution'}
          </p>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-indigo-600 transition-colors">
            <HugeiconsIcon icon={CallIcon} size={16} />
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-2 border-y border-slate-50 py-3 mb-4">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="text-[12px] font-medium italic">
            KPI Code: {kpi?.code || 'N/A'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md">
          <HugeiconsIcon icon={Clock01Icon} size={12} className="text-slate-400" />
          <span className="text-[11px] font-bold text-slate-500 uppercase">Active</span>
        </div>
        <button 
          className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1" 
          onClick={() => onDetailsClick?.(data)}
        >
          Checklist <HugeiconsIcon icon={AiChat02Icon} size={12} />
        </button>
      </div>
    </div>
  );
};

export default ProspectCard;