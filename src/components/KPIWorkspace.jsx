import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { HugeiconsIcon } from '@hugeicons/react';
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
          // Tentukan ukuran bento berdasarkan urutan (sequence) atau type
          size: item.weight_point > 20 ? 'large' : 'small' 
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

  if (loading) return <div>Loading KPI Data...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">KPI Configurations</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your 10 core metrics and their weight distribution.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200">
          <HugeiconsIcon icon={PlusSignIcon} size={18} />
          Add New KPI
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[160px]">
        {kpis.map((kpi) => (
          <div 
            key={kpi.id}
            className={`
              group relative bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between overflow-hidden h-fit transition-all hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1
              ${kpi.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
              ${kpi.size === 'medium' ? 'md:col-span-2' : ''}
              ${kpi.size === 'small' ? 'md:col-span-1 md:row-span-1' : ''}
            `}
          >
            {/* Background Decoration Icon */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <HugeiconsIcon icon={kpi.icon || Settings02Icon} size={100} />
            </div>

            <div className="flex justify-between items-start relative z-10">
              <div className={`p-2 rounded-lg ${kpi.size === 'large' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <HugeiconsIcon icon={kpi.icon || Settings02Icon} size={kpi.size === 'large' ? 24 : 18} />
              </div>
              
              {/* CRUD Actions (Visible on Hover) */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 transition-colors">
                  <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                </button>
                <button className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600 transition-colors">
                  <HugeiconsIcon icon={Delete02Icon} size={16} />
                </button>
              </div>
            </div>

            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{kpi.type}</span>
              <h3 className={`font-black text-slate-800 leading-tight ${kpi.size === 'large' ? 'text-xl' : 'text-sm'}`}>
                {kpi.name}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                  Weight: {kpi.weight}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Placeholder for Add New Action in Grid */}
        <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer group text-slate-400 hover:text-indigo-600">
           <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
              <HugeiconsIcon icon={PlusSignIcon} size={20} />
           </div>
           <span className="text-xs font-bold">New Metric</span>
        </div>
      </div>
    </div>
  );
};

export default KPIWorkspace;