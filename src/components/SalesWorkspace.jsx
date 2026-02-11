import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import EnterpriseCoreMetrics from './EnterpriseCoreMetrics';
import { useAuth } from '../context/AuthContext';
import AddUserModal from './AddUserModal';
import SalesPersonCard from './SalesPersonCard';
import api from '../api/axios';

// --- APEXCHART CONFIG ---
const heatmapOptions = {
  chart: { toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  dataLabels: { enabled: false },
  colors: ["#6366f1"],
  xaxis: {
    categories: ['Visit 1', 'Visit 2', 'Visit 3', 'Closing', 'Repeat', 'Achieve', 'Sosmed', 'Activity', ['DB', 'Progress'], 'Email'],
    labels: {
      style: { fontSize: '10px', fontWeight: 600 },
      rotate: 0,
      rotateAlways: false
    }
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

// --- FUNGSI PERHITUNGAN KPI ---

// --- MAIN COMPONENT ---
export default function SalesWorkspace() {
  const { isAdmin, user } = useAuth();
  const [salesTeamData, setSalesTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Fetch sales team data from API
  const fetchSalesTeamData = async () => {
    try {
      setLoading(true);
      console.log('🔄 SalesWorkspace: Starting to fetch sales data...');

      // Debug: Check API base URL
      console.log('🔗 API Base URL:', api.defaults.baseURL);

      // Debug: Check if we have auth token
      const token = localStorage.getItem('token');
      console.log('🔑 Auth token present:', !!token);
      console.log('🔑 Token value:', token ? token.substring(0, 20) + '...' : 'none');

      // Semua user (admin/sales) fetch seluruh sales untuk dashboard
      console.log('📡 Fetching users...');
      const usersResponse = await api.get('/users', {
        params: { dashboard: 1 }
      });
      console.log('✅ Users response:', usersResponse);

      const allUsers = usersResponse.data.data || usersResponse.data;
      console.log('👥 All users:', allUsers);

      const users = allUsers.filter(u => u.id !== 7);
      console.log('👨‍💼 Filtered users:', users);
      const salesData = await Promise.all(
        users.map(async (userData) => {
          try {
            const statsResponse = await api.get(`/users/${userData.id}/stats`, {
              params: { dashboard: 1 }
            });
            const stats = statsResponse.data;
            const customersResponse = await api.get('/customers', {
              params: { 
                user_id: userData.id,
                per_page: 100,
                dashboard: 1
              }
            });
            let customers = [];
            if (customersResponse.data.data && Array.isArray(customersResponse.data.data)) {
              customers = customersResponse.data.data;
            } else if (Array.isArray(customersResponse.data)) {
              customers = customersResponse.data;
            }
            const statusOrder = {
              'Deal Won': 4,
              'After Sales': 5,
              'Hot Prospect': 3,
              'Warm Prospect': 2,
              'New': 1
            };
            const sortedCustomers = [...customers].sort((a, b) => {
              const aOrder = statusOrder[a.status] || 0;
              const bOrder = statusOrder[b.status] || 0;
              if (aOrder === bOrder) {
                return new Date(b.created_at) - new Date(a.created_at);
              }
              return bOrder - aOrder;
            });
            sortedCustomers.slice(0, 4).forEach((customer, idx) => {
              console.log(`  Pipeline #${idx + 1} for ${userData.name}: customer_id=${customer.id}, user_id=${customer.user_id}, status=${customer.status}`);
            });
            return {
              id: userData.id,
              name: userData.name,
              avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.name.replace(' ', '').toLowerCase()}`,
              summary: `${stats.new_prospects || 0} New | ${stats.hot_prospects || 0} Hot | ${stats.closed_deals || 0} Closed`,
              monthsActive: stats.months_active || 1,
              totalPipelines: stats.activeCustomers || 0,
              totalCustomers: stats.totalCustomers || 0,
              v1: stats.visit_1_count || 0,
              v2: stats.visit_2_count || 0,
              v3: stats.visit_3_count || 0,
              close: stats.closed_count || 0,
              repeat: stats.repeat_count || 0,
              socPosts: stats.social_posts || 0,
              actCount: stats.activity_count || 0,
              salesAchieved: stats.sales_achieved || 0,
              yearlyTarget: stats.yearly_target || 100000000,
              hotProspects: stats.hot_prospects || 0,
              closingCount: stats.closing_count || 0,
              pipelines: sortedCustomers.slice(0, 4).map(customer => ({
                id: customer.id,
                user_id: customer.user_id,
                pic: customer.pic,
                title: customer.position,
                company: customer.institution,
                stage: customer.current_kpi_id || customer.kpi_id || 1,
                date: new Date(customer.created_at).toLocaleDateString('en-GB'),
                status: customer.status
              }))
            };
          } catch (error) {
            console.error(`Error fetching data for user ${userData.id}:`, error);
            console.error('Error details:', error.response?.data);
            return {
              id: userData.id,
              name: userData.name,
              avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.name.replace(' ', '').toLowerCase()}`,
              summary: "0 New | 0 Hot | 0 Closed",
              monthsActive: 1,
              totalPipelines: 0,
              totalCustomers: 0,
              v1: 0, v2: 0, v3: 0, close: 0, repeat: 0,
              socPosts: 0,
              actCount: 0,
              salesAchieved: 0,
              yearlyTarget: 100000000,
              hotProspects: 0,
              closingCount: 0,
              pipelines: []
            };
          }
        })
      );
      console.log('✅ Sales data fetched successfully:', salesData);
      setSalesTeamData(salesData);
    } catch (error) {
      console.error('❌ SalesWorkspace: Error fetching sales data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });

      // Show user-friendly error
      alert(`Error loading sales data: ${error.message}\n\nCheck console for details.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesTeamData();
  }, []);

  // Fungsi perhitungan KPI
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

  const handleAddUserSuccess = () => {
    // Refresh data setelah user ditambahkan
    fetchSalesTeamData();
  };

  const handleEditUser = (user) => {
    console.log('Edit user:', user);
    // Implement edit functionality here
    // Contoh: setIsEditModalOpen(true); setSelectedUser(user);
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await api.delete(`/users/${user.id}`);
        // Refresh data setelah user dihapus
        fetchSalesTeamData();
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  return (
    <main className="flex-1 overflow-hidden p-4 lg:p-6 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
        
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading sales data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* TOP SECTION: KPI MATRIX & STATS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-md font-bold text-slate-800 dark:text-slate-100">Monitoring Sales KPI</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-tighter">Berdasarkan 10 KPI</p>
                  </div>
                  <HugeiconsIcon icon={InformationCircleIcon} size={18} className="text-slate-300 dark:text-slate-600" />
                </div>
                <Chart options={heatmapOptions} series={heatmapSeries} type="heatmap" height={280} />
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
                    key={sales.id || i} 
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
            </div>

            {/* KARTU ADD NEW (Hanya untuk Admin) */}
            {isAdmin && (
              <button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="group h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:shadow-md"
              >
                <div className="p-3 rounded-full bg-white dark:bg-slate-700 shadow-sm group-hover:scale-110 transition-transform">
                  <HugeiconsIcon icon={PlusSignIcon} size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Add New Sales Member</span>
              </button>
            )}
          </>
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