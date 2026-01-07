import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon, AiChat02Icon, Clock01Icon, Delete02Icon, CheckmarkCircle02Icon, StarIcon } from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ProspectCard = ({ data, onDetailsClick }) => {
  const customer = data?.customer || {};
  const kpi = data?.kpi || {};
  const stats = data?.stats || { percent: 0 };
  const kpiHistory = data?.kpi_progress_history || [];
  const user = useAuth().user;

  console.log("🃏 Is Dev Mode:", user.is_developer_mode);

  // Warna progress bar berdasarkan status
  const getProgressColor = (isCompleted, isCurrent) => {
    if (isCompleted) return 'bg-emerald-500';
    if (isCurrent) return 'bg-indigo-500';
    return 'bg-slate-300';
  };

  // Format points dengan 1 desimal
  const formatPoints = (points) => {
    return points ? parseFloat(points).toFixed(1) : '0.0';
  };

  // Hitung total earned points dari semua KPI history
  const totalEarnedPoints = kpiHistory.reduce((sum, kpi) => {
    const earnedPoints = (kpi.percent / 100) * (kpi.kpi_weight || 0);
    return sum + earnedPoints;
  }, 0);

  // Hitung max possible points dari KPI yang sudah dilalui
  const maxPossiblePoints = kpiHistory.reduce((sum, kpi) => {
    return sum + (kpi.kpi_weight || 0);
  }, 0);

  const handleResetProspect = async (customerId) => {
      if (!confirm("Semua progress, file, dan skor customer ini akan DIHAPUS PERMANEN. Lanjutkan?")) return;
      
      try {
          await api.delete(`/progress/reset-prospect/${customerId}`);
          alert("Data prospek berhasil di-reset.");
          // Refresh data list customer Anda di sini
      } catch (err) {
          alert(err.response?.data?.message || "Gagal melakukan reset.");
      }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
      {/* ⭐ Score Badge - Top Right */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-800 truncate">
            {customer?.pic || 'Unnamed PIC'}
          </h4>
          <p className="text-[11px] text-slate-500 font-medium truncate">
            {customer?.institution || 'No institution'}
          </p>
        </div>
        
        {/* Score Badge */}
        <div className="ml-2 flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 px-2 py-1 bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
            <HugeiconsIcon icon={StarIcon} size={12} className="text-amber-500" />
            <span className="text-xs font-black text-amber-700">
              {formatPoints(totalEarnedPoints)}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-medium">
            of {formatPoints(maxPossiblePoints)} pts
          </span>
        </div>
      </div>

      {/* ⭐ KPI Progress History - Multiple Bars */}
      <div className="mb-4">
        {/* Current KPI - Highlighted */}
        {kpiHistory.find(k => k.is_current) && (
          <div className="mb-3">
            {(() => {
              const current = kpiHistory.find(k => k.is_current);
              const currentPoints = (current.percent / 100) * (current.kpi_weight || 0);
              
              return (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex flex-col flex-1">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                        Current Stage
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600">
                        {current.kpi_description}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[12px] font-bold text-indigo-600 block">
                        {Math.round(current.percent)}%
                      </span>
                      <span className="text-[9px] text-indigo-500 font-bold">
                        {formatPoints(currentPoints)}/{current.kpi_weight} pts
                      </span>
                    </div>
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
        
        {/* Previous KPIs - Mini Indicators with Points */}
        {kpiHistory.filter(k => !k.is_current && k.percent > 0).length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Previous Stages
            </span>
            {kpiHistory.filter(k => !k.is_current).map((kpiItem) => {
              const earnedPoints = (kpiItem.percent / 100) * (kpiItem.kpi_weight || 0);
              
              return (
                <div key={kpiItem.kpi_id} className="flex items-center gap-2">
                  <HugeiconsIcon 
                    icon={CheckmarkCircle02Icon} 
                    size={12} 
                    className={kpiItem.is_completed ? 'text-emerald-500' : 'text-slate-300'} 
                  />
                  <span className="text-[10px] text-slate-500 flex-1 truncate">
                    {kpiItem.kpi_description}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold ${
                      kpiItem.is_completed ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {Math.round(kpiItem.percent)}%
                    </span>
                    <span className="text-[9px] text-slate-400">
                      ({formatPoints(earnedPoints)})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mb-3">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="text-[11px] font-medium">
            KPI: <span className="font-bold text-slate-700">{kpi?.code || 'N/A'}</span>
          </span>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-indigo-600 transition-colors">
            <HugeiconsIcon icon={CallIcon} size={14} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md">
          <HugeiconsIcon icon={Clock01Icon} size={12} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">Active</span>
        </div>
        {user.is_developer_mode && (
          <button 
              onClick={() => handleResetProspect(data?.customer.id)}
              className="top-2 right-2 p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-all border border-red-100"
              title="Developer: Reset Prospect Data"
          >
              <HugeiconsIcon icon={Delete02Icon} size={14} className="text-red-400" />
          </button>
        )}
        <button 
          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors" 
          onClick={() => onDetailsClick?.(data)}
        >
          Checklist <HugeiconsIcon icon={AiChat02Icon} size={12} />
        </button>
      </div>
    </div>
  );
};

export default ProspectCard;