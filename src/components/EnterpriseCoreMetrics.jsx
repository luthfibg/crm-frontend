import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  FireIcon, 
  ChartLineData01Icon, 
  Target02Icon, 
  GlobalIcon 
} from '@hugeicons/core-free-icons';

const EnterpriseCoreMetrics = ({ data }) => {
  // 1. Aggregations (Logic tetap sama)
  const totalRevenue = data.reduce((acc, s) => acc + s.salesAchieved, 0);
  const totalTarget = data.reduce((acc, s) => acc + s.yearlyTarget, 0);
  const revenueProgress = (totalRevenue / totalTarget) * 100;

  let warm = 0, hot = 0, closed = 0, totalPipes = 0;
  let totalKpiSum = 0;

  data.forEach(sales => {
    totalPipes += sales.pipelines.length;
    sales.pipelines.forEach(p => {
      if (p.stage <= 2) warm++;
      else if (p.stage === 3) hot++; 
      else if (p.stage >= 4) closed++;
    });
    
    const monthsActive = sales.monthsActive || 1;
    const tP = sales.totalPipelines || 1;
    const tC = sales.totalCustomers || 1;
    const yT = sales.yearlyTarget || 1;
    
    const scores = [
      (sales.v1 / tP) * 100, (sales.v2 / tP) * 100, (sales.v3 / tP) * 100,
      (sales.close / tP) * 100, (sales.repeat / tP) * 100, (sales.salesAchieved / yT) * 100,
      (sales.socPosts / (8 * monthsActive)) * 100, (sales.actCount / (4 * monthsActive)) * 100,
      ((sales.hotProspects / tC) / 0.5) * 100, ((sales.closingCount / tC) / 0.1) * 100,
    ];
    totalKpiSum += scores.reduce((a, b) => a + Math.min(100, Math.max(0, b)), 0);
  });

  const avgKpiScore = Math.round(totalKpiSum / (data.length * 10));

  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0 
  }).format(val);

  return (
    <div className="bg-white rounded-2xl p-5 text-slate-900 shadow-sm border border-slate-200 flex flex-col h-full justify-between">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[12px] font-black text-indigo-600 uppercase tracking-[0.2em]">Performa Cabang</h3>
        </div>
        <div className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full text-[10px] font-extrabold border border-indigo-100 shadow-sm">
          AVG KPI: {avgKpiScore}
        </div>
      </div>

      {/* Prospect Grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[8px] uppercase text-slate-500 font-bold tracking-wider">Warm</p>
          <p className="text-lg font-black text-blue-600">{warm}</p>
        </div>
        <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-100">
          <p className="text-[8px] uppercase text-orange-600 font-bold tracking-wider">Hot</p>
          <div className="flex items-center gap-1">
            <p className="text-lg font-black text-orange-600">{hot}</p>
            <HugeiconsIcon icon={FireIcon} size={12} className="text-orange-500 animate-pulse" variant="solid" />
          </div>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
          <p className="text-[8px] uppercase text-emerald-700 font-bold tracking-wider">Closed</p>
          <p className="text-lg font-black text-emerald-600">{closed}</p>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] mb-1 text-slate-500 font-bold uppercase tracking-tight">Pendapatan Tahunan</p>
            <p className="text-base font-black text-slate-900 leading-tight">{formatIDR(totalRevenue)}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-600 text-white rounded-md shadow-sm">
              {revenueProgress.toFixed(1)}%
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden p-px">
          <div 
            className="h-full bg-linear-to-r from-indigo-600 via-indigo-500 to-blue-400 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, revenueProgress)}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={ChartLineData01Icon} size={14} className="text-slate-400" />
            <span className="text-[10px] text-slate-500 font-semibold">Pipelines: <b className="text-slate-900">{totalPipes}</b></span>
          </div>
          <div className="flex items-center gap-1">
             <HugeiconsIcon icon={Target02Icon} size={12} className="text-slate-400" />
             <span className="text-[10px] text-slate-400 font-medium">Goal: {formatIDR(totalTarget)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseCoreMetrics;