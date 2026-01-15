import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import EnterpriseCoreMetrics from './EnterpriseCoreMetrics';
import { useAuth } from '../context/AuthContext';
import AddUserModal from './AddUserModal';
import SalesPersonCard from './SalesPersonCard';

// --- APEXCHART CONFIG ---
const heatmapOptions = {
  chart: { toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  dataLabels: { enabled: false },
  colors: ["#6366f1"],
  xaxis: {
    categories: ['Visit 1', 'Visit 2', 'Visit 3', 'Closing', 'Repeat', 'Target', 'Social', 'Activity', 'Customer', 'Ratio'],
    labels: { style: { fontSize: '10px', fontWeight: 600 } }
  },
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      radius: 4,
      useFillColorAsStroke: false,
      colorScale: {
        ranges: [
          { from: 0, to: 30, name: 'Rendah', color: '#f1f5f9' },
          { from: 31, to: 65, name: 'Sedang', color: '#818cf8' },
          { from: 66, to: 100, name: 'Tinggi', color: '#4f46e5' }
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

// Heatmap series untuk chart
const heatmapSeries = salesTeamData.map(sales => ({
  name: sales.name,
  data: calculateKPIScores(sales)
}));

// --- MAIN COMPONENT ---
export default function SalesWorkspace() {
  const { isAdmin } = useAuth();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const handleAddUserSuccess = () => {
    // Refresh data atau tampilkan notifikasi
    console.log('User added successfully');
    // Anda bisa menambahkan logic untuk refresh data user di sini
  };

  const handleEditUser = (user) => {
    console.log('Edit user:', user);
    // Implement edit functionality here
    // Contoh: setIsEditModalOpen(true); setSelectedUser(user);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      console.log('Delete user:', user);
      // Implement delete functionality here
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP SECTION: KPI MATRIX & STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-md font-bold text-slate-800">Matriks Kekuatan Sales</h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Berdasarkan 10 KPI</p>
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
                isAdmin={isAdmin}
                onEdit={() => handleEditUser(sales)}
                onDelete={() => handleDeleteUser(sales)}
              />
            );
          })}

          {/* KARTU ADD NEW (Hanya untuk Admin) */}
          {isAdmin && (
            <button 
              onClick={() => setIsAddUserModalOpen(true)}
              className="group h-full min-h-62.5 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all hover:shadow-md"
            >
              <div className="p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform">
                <HugeiconsIcon icon={PlusSignIcon} size={24} className="text-slate-400 group-hover:text-indigo-600" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">Add New Sales Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal Add User */}
      <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={handleAddUserSuccess}
      />
    </main>
  );
}