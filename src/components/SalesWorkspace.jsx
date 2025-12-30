import React from 'react';
import Chart from 'react-apexcharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { User02Icon, StarIcon, InformationCircleIcon, FireIcon } from '@hugeicons/core-free-icons';
import EnterpriseCoreMetrics from './EnterpriseCoreMetrics';

// --- APEXCHART CONFIG ---
const heatmapOptions = {
  chart: { toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  dataLabels: { enabled: false },
  colors: ["#6366f1"],
  xaxis: {
    categories: ['V1', 'V2', 'V3', 'Close', 'Repeat', 'Tgt', 'Soc', 'Act', 'Cust', 'Ratio'],
    labels: { style: { fontSize: '10px', fontWeight: 600 } }
  },
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      radius: 4,
      useFillColorAsStroke: false,
      colorScale: {
        ranges: [
          { from: 0, to: 30, name: 'Low', color: '#f1f5f9' },
          { from: 31, to: 65, name: 'Med', color: '#818cf8' },
          { from: 66, to: 100, name: 'High', color: '#4f46e5' }
        ]
      }
    }
  },
};

// --- DATA LENGKAP (Gabungan KPI + Display) ---
const salesTeamData = [
  {
    name: "Alex Chandra",
    avatar: "https://i.pravatar.cc/150?u=alex",
    summary: "12 New | 5 Hot | 2 Closed",
    monthsActive: 5,
    totalPipelines: 50,
    totalCustomers: 120,
    v1: 50, v2: 40, v3: 25, close: 10, repeat: 5,
    socPosts: 20,
    actCount: 20,
    salesAchieved: 60000000,
    yearlyTarget: 300000000,
    hotProspects: 30,
    closingCount: 6,
    pipelines: [
      { pic: "Budi Santoso", title: "Procurement", company: "PT. Global", stage: 3, date: "24 Oct 2023" },
      { pic: "Siska Putri", title: "Manager", company: "Tech Hub", stage: 5, date: "22 Oct 2023" },
      { pic: "Anton J.", title: "CEO", company: "StartUp ID", stage: 4, date: "20 Oct 2023" },
      { pic: "Rina W.", title: "HRD", company: "Retail Co", stage: 1, date: "19 Oct 2023" },
    ]
  },
  {
    name: "Sarah Jenkins",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    summary: "8 New | 2 Hot | 5 Closed",
    monthsActive: 3,
    totalPipelines: 100,
    totalCustomers: 200,
    v1: 100, v2: 80, v3: 70, close: 15, repeat: 2,
    socPosts: 24,
    actCount: 10,
    salesAchieved: 150000000,
    yearlyTarget: 200000000,
    hotProspects: 110,
    closingCount: 25,
    pipelines: [
      { pic: "M. Rizky", title: "VP Ops", company: "Logistics X", stage: 4, date: "25 Oct 2023" },
      { pic: "Dewi A.", title: "Founder", company: "Creative Lab", stage: 2, date: "23 Oct 2023" },
      { pic: "Kevin L.", title: "Director", company: "Bank ABC", stage: 3, date: "21 Oct 2023" },
    ]
  },
  {
    name: "Himawan Rizal",
    avatar: "https://i.pravatar.cc/33?u=himawan",
    summary: "2 New | 3 Hot | 9 Closed",
    monthsActive: 6,
    totalPipelines: 130,
    totalCustomers: 340,
    v1: 60, v2: 90, v3: 90, close: 25, repeat: 4,
    socPosts: 39,
    actCount: 14,
    salesAchieved: 90000000,
    yearlyTarget: 170000000,
    hotProspects: 46,
    closingCount: 21,
    pipelines: [
      { pic: "M. Taulany", title: "Humas", company: "Emba Fashion", stage: 2, date: "02 Oct 2025" },
      { pic: "Rhenny A.", title: "Co Founder", company: "Bandung Creative Hub", stage: 3, date: "4 Nov 2025" },
      { pic: "Christine C.", title: "Pengadaan", company: "BKKBN", stage: 1, date: "1 Sep 2025" },
      { pic: "H. Winata", title: "President", company: "Graha Mulia", stage: 4, date: "22 Dec 2025" },
    ]
  }
];

// --- FUNGSI PERHITUNGAN KPI ---
const calculateKPIScores = (sales) => {
  const monthsActive = sales.monthsActive || 1;
  const totalPipes = sales.totalPipelines || 1;
  const totalCust = sales.totalCustomers || 1;
  const yearlyTarget = sales.yearlyTarget || 1;

  const cap = (val) => Math.min(100, Math.max(0, Math.round(val || 0)));

  return [
    cap((sales.v1 / totalPipes) * 100),
    cap((sales.v2 / totalPipes) * 100),
    cap((sales.v3 / totalPipes) * 100),
    cap((sales.close / totalPipes) * 100),
    cap((sales.repeat / totalPipes) * 100),
    cap((sales.salesAchieved / yearlyTarget) * 100),
    cap((sales.socPosts / (8 * monthsActive)) * 100),
    cap((sales.actCount / (4 * monthsActive)) * 100),
    cap(((sales.hotProspects / totalCust) / 0.5) * 100),
    cap(((sales.closingCount / totalCust) / 0.1) * 100),
  ];
};

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

// Heatmap series untuk chart
const heatmapSeries = salesTeamData.map(sales => ({
  name: sales.name,
  data: calculateKPIScores(sales)
}));

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
    <div className="group flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors px-2">
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-bold text-slate-800 truncate leading-tight">{pic}</span>
        <span className="text-[9px] text-slate-500 truncate leading-tight">{title} • {company}</span>
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
          <div className="bg-slate-900 text-white text-[9px] py-1 px-2 rounded shadow-xl whitespace-nowrap">
            Last Checkpoint: {date}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SALES PERSON CARD ---
const SalesPersonCard = ({ name, avatar, summary, pipelines, totalScore = 0 }) => {
  const safeScore = isNaN(totalScore) ? 0 : totalScore;
  const level = getKPILevel(safeScore);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <div className="p-3 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden shadow-sm">
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-extrabold text-slate-800 truncate">{name}</h3>
            <p className="text-[10px] text-indigo-600 font-medium truncate">{summary}</p>
          </div>
        </div>

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

      <div className="max-h-55 overflow-y-auto scrollbar-hide bg-white">
        {pipelines.map((p, idx) => (
          <PipelineRow key={idx} {...p} />
        ))}
      </div>

      <div className="px-3 py-2 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase">Performance Index</span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1 w-3 rounded-full ${i < (totalScore/200) ? level.dot : 'bg-slate-200'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SalesWorkspace() {
  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP SECTION: KPI MATRIX & STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Strength Map Performance</h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">KPI Matrix Across Stages</p>
              </div>
              <HugeiconsIcon icon={InformationCircleIcon} size={18} className="text-slate-300" />
            </div>
            <Chart options={heatmapOptions} series={heatmapSeries} type="heatmap" height={180} />
          </div>

          <div className="lg:col-span-4">
            <EnterpriseCoreMetrics data={salesTeamData} />
          </div>
        </div>

        {/* BOTTOM SECTION: SALES CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salesTeamData.map((sales, i) => {
            const scoresArray = calculateKPIScores(sales);
            const totalScore = scoresArray.reduce((acc, curr) => acc + curr, 0);

            return (
              <SalesPersonCard 
                key={i} 
                name={sales.name}
                avatar={sales.avatar}
                summary={sales.summary}
                pipelines={sales.pipelines}
                totalScore={totalScore}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}