import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { HugeiconsIcon } from '@hugeicons/react';
import Masonry from 'react-masonry-css';
import {
  PlusSignIcon,
  PencilEdit01Icon,
  Delete02Icon,
  Settings02Icon,
  ChartBarLineIcon,
  Medal01Icon,
  UserGroupIcon,
  MessageNotification01Icon,
  WorkflowSquare10Icon
} from '@hugeicons/core-free-icons';

const getIconByKpiType = (type) => {
  switch (type) {
    case 'achievement':
      return Medal01Icon;
    case 'periodic':
      return ChartBarLineIcon;
    case 'cycle':
    default:
      return WorkflowSquare10Icon;
  }
};

const KPIWorkspace = () => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Breakpoint columns for masonry
  const breakpointColumns = {
    default: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1
  };

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const response = await api.get('/kpis');
        // Petakan field DB Anda ke struktur UI
        const mappedData = response.data.map(item => ({
          id: item.id,
          name: item.code, // Menggunakan 'code' sebagai Nama
          weight: `${item.weight_point}%`,
          type: item.type,
          description: item.description,
          icon: getIconByKpiType(item.type),
          // Tentukan ukuran card berdasarkan weight - untuk variasi height
          size: item.weight_point > 25 ? 'large' : item.weight_point > 15 ? 'medium' : 'small' 
        }));
        setKpis(mappedData);
      } catch (error) {
        console.error("Gagal mengambil data KPI", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-slate-600">Loading KPI Data...</div></div>;

  return (
    <main className="flex-1 overflow-hidden p-8 bg-slate-50">
      <div className="h-full overflow-y-auto">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-100 bg-linear-to-br from-indigo-50/50 to-purple-50/30 rounded-t-xl -mx-6 -mt-8 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <HugeiconsIcon icon={Settings02Icon} className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">KPI Configurations</h1>
              <p className="text-sm text-slate-500 mt-0.5">Kelola 10 metrik utama dan distribusi bobotnya.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200">
            <HugeiconsIcon icon={PlusSignIcon} size={18} />
            Add New KPI
          </button>
        </div>
      </div>

      {/* Masonry Grid */}
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-6 w-auto"
        columnClassName="pl-6 bg-clip-padding"
      >
        {kpis.map((kpi) => (
          <div 
            key={kpi.id}
            className={`
              group relative bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between overflow-hidden transition-all hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 mb-6
              ${kpi.size === 'large' ? 'min-h-70' : ''}
              ${kpi.size === 'medium' ? 'min-h-55' : ''}
              ${kpi.size === 'small' ? 'min-h-45' : ''}
            `}
          >
            {/* Background Decoration Icon */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <HugeiconsIcon icon={kpi.icon || Settings02Icon} size={120} />
            </div>

            <div className="flex justify-between items-start relative z-10 mb-4">
              <div className={`p-3 rounded-xl transition-all ${
                kpi.size === 'large' 
                  ? 'bg-linear-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200' 
                  : kpi.size === 'medium'
                  ? 'bg-linear-to-br from-indigo-100 to-indigo-50 text-indigo-600'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                <HugeiconsIcon 
                  icon={kpi.icon || Settings02Icon} 
                  size={kpi.size === 'large' ? 28 : kpi.size === 'medium' ? 24 : 20} 
                />
              </div>
              
              {/* CRUD Actions (Visible on Hover) */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                  <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
                  <HugeiconsIcon icon={Delete02Icon} size={16} />
                </button>
              </div>
            </div>

            <div className="relative z-10 space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  {kpi.type}
                </span>
                <h3 className={`font-black text-slate-900 leading-tight ${
                  kpi.size === 'large' ? 'text-2xl' : kpi.size === 'medium' ? 'text-lg' : 'text-base'
                }`}>
                  {kpi.name}
                </h3>
              </div>
              
              {kpi.description && kpi.size !== 'small' && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {kpi.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 pt-2">
                <span className={`font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 ${
                  kpi.size === 'large' ? 'text-sm' : 'text-xs'
                }`}>
                  Weight: {kpi.weight}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Placeholder for Add New Action in Grid */}
        <div className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer group text-slate-400 hover:text-indigo-600 mb-6 min-h-45 p-6">
           <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all border border-slate-200 group-hover:border-indigo-200">
              <HugeiconsIcon icon={PlusSignIcon} size={24} />
           </div>
           <span className="text-sm font-bold">New Metric</span>
        </div>
      </Masonry>
      </div>
    </main>
  );
};

export default KPIWorkspace;
