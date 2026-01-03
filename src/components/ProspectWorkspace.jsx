import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Mail01Icon, 
  CallIcon, 
  AiChat02Icon, 
  Clock01Icon, 
  PackageIcon, 
  Money01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  FilterIcon
} from '@hugeicons/core-free-icons';

// --- MOCK EXTENSION (Adding missing fields for Prospect View) ---
const getExtendedProspects = (pipelines) => pipelines.map(p => ({
  ...p,
  email: `${p.pic.toLowerCase().replace(' ', '.')}@company.com`,
  phone: "+62 812-3456-7890",
  product: "Enterprise ERP Solution",
  value: Math.floor(Math.random() * 100000000) + 10000000,
  dailyKpi: Math.floor(Math.random() * 100), // % of daily goals done
  daysInStage: Math.floor(Math.random() * 15) + 1,
}));

const COLUMNS = [
  { id: 1, label: 'New', color: 'bg-blue-500', text: 'text-blue-600' },
  { id: 2, label: 'Warm', color: 'bg-orange-400', text: 'text-orange-600' },
  { id: 3, label: 'Hot', color: 'bg-red-500', text: 'text-red-600' },
  { id: 5, label: 'After Sales', color: 'bg-emerald-500', text: 'text-emerald-600' },
];

const ProspectCard = ({ data }) => {
  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group mb-3">
      {/* KPI Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Daily KPI Progress</span>
          <span className="text-[12px] font-bold text-indigo-600">{data.dailyKpi}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full bg-indigo-500 rounded-full transition-all duration-500`} style={{ width: `${data.dailyKpi}%` }} />
        </div>
      </div>

      {/* PIC & Info */}
      <div className="flex items-start justify-between mb-">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-800 truncate">{data.pic}</h4>
          <p className="text-[13px] text-slate-500 font-medium">{data.title} @ {data.company}</p>
        </div>
        <div className="flex gap-1">
            <button className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-indigo-600 transition-colors">
                <HugeiconsIcon icon={CallIcon} size={16} />
            </button>
            <button className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-indigo-600 transition-colors">                <HugeiconsIcon icon={Mail01Icon} size={16} />
            </button>        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-2 border-y border-slate-50 py-3 mb-6">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={PackageIcon} size={16} className="text-slate-400" />
          <span className="text-[13px] text-slate-600 truncate">{data.product}</span>
        </div>
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Money01Icon} size={16} className="text-slate-400" />
          <span className="text-[13px] font-bold text-slate-700">{formatIDR(data.value)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md">
          <HugeiconsIcon icon={Clock01Icon} size={12} className="text-slate-400" />
          <span className="text-[12px] font-bold text-slate-500">{data.daysInStage} Days</span>
        </div>
        <button className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          Details <HugeiconsIcon icon={AiChat02Icon} size={12} />
        </button>
      </div>
    </div>
  );
};

const ProspectWorkspace = () => {
  // Simulating authenticated user: Alex Chandra
  const currentUser = "Alex Chandra";
  const rawData = [
    {
      name: "Alex Chandra",
      pipelines: [
        { pic: "Budi Santoso", title: "Procurement", company: "PT. Global", stage: 3, date: "24 Oct 2023" },
        { pic: "Siska Putri", title: "Manager", company: "Tech Hub", stage: 5, date: "22 Oct 2023" },
        { pic: "Anton J.", title: "CEO", company: "StartUp ID", stage: 4, date: "20 Oct 2023" }, // History (Won)
        { pic: "Rina W.", title: "HRD", company: "Retail Co", stage: 1, date: "19 Oct 2023" },
        { pic: "Denny H.", title: "Owner", company: "Cafe 88", stage: 2, date: "18 Oct 2023" },
        { pic: "Maya K.", title: "Purchasing", company: "Hotel Grand", stage: 6, date: "15 Oct 2023" }, // History (Lost)
      ]    }
  ];

  const myProspects = getExtendedProspects(rawData[0].pipelines);
  const [showHistory, setShowHistory] = useState(false);

  // Filter out won (4) and lost (6) for main view, keep for history
  const activeProspects = myProspects.filter(p => p.stage !== 4 && p.stage !== 6);
  const historyProspects = myProspects.filter(p => p.stage === 4 || p.stage === 6);

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50/50">
      {/* Header Section */}
      <div className="p-4 lg:p-6 flex items-center justify-between border-b border-slate-200 bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Prospect Pipeline</h2>
          <p className="text-xs text-slate-500 font-medium">Managing {activeProspects.length} active opportunities</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
              showHistory ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <HugeiconsIcon icon={Clock01Icon} size={16} />
            {showHistory ? 'Hide History' : 'Show History'}          </button>
          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600">
            <HugeiconsIcon icon={FilterIcon} size={18} />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4 lg:p-6 flex gap-6 items-start">
        {COLUMNS.map(col => (
          <div key={col.id} className="min-w-75 w-75 flex flex-col max-h-full">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{col.label}</h3>
              </div>
              <span className="bg-slate-200 text-slate-600 text-[12px] font-bold px-2 py-0.5 rounded-full">
                {activeProspects.filter(p => p.stage === col.id).length}              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
              {activeProspects
                .filter(p => p.stage === col.id)
                .map((prospect, i) => (
                  <ProspectCard key={i} data={prospect} />
                ))}
            </div>
          </div>
        ))}

        {/* Folded History Column */}
        {showHistory && (          <div className="min-w-75 w-75 flex flex-col max-h-full bg-slate-100/50 rounded-2xl p-4 border border-dashed border-slate-300">
            <div className="flex items-center gap-2 mb-4">
               <HugeiconsIcon icon={Clock01Icon} size={16} className="text-slate-500" />
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">History (Won/Lost)</h3>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {historyProspects.map((hp, i) => (
                <div key={i} className="bg-white/60 border border-slate-200 rounded-xl p-3 mb-2 opacity-70 grayscale">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-700">{hp.pic}</h4>
                      <p className="text-[11px] text-slate-400">{hp.company}</p>
                    </div>
                    {hp.stage === 4 ? (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-500" variant="solid" />
                    ) : (
                      <HugeiconsIcon icon={CancelCircleIcon} size={16} className="text-red-400" variant="solid" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProspectWorkspace;