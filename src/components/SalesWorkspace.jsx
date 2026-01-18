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
      
      // Fetch users
      const usersResponse = await api.get('/users');
      const allUsers = usersResponse.data.data || usersResponse.data;
      
      // Filter out user ID 7 (Tony) from display for other users
      const users = allUsers.filter(u => u.id !== 7);
      
      // Fetch additional data for each user
      const salesData = await Promise.all(
        users.map(async (userData) => {
          try {
            // Fetch user stats
            const statsResponse = await api.get(`/users/${userData.id}/stats`);
            const stats = statsResponse.data;
            
            // Fetch user customers for pipelines
            const customersResponse = await api.get('/customers', {
              params: { user_id: userData.id }
            });
            const customers = customersResponse.data.data || customersResponse.data;
            
            // Transform data to match existing structure
            return {
              id: userData.id,
              name: userData.name,
              avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.name.replace(' ', '').toLowerCase()}`,
              summary: `${stats.new_prospects || 0} New | ${stats.hot_prospects || 0} Hot | ${stats.closed_deals || 0} Closed`,
              monthsActive: stats.months_active || 1,
              totalPipelines: stats.total_pipelines || 0,
              totalCustomers: stats.total_customers || 0,
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
              pipelines: customers.slice(0, 4).map(customer => ({
                pic: customer.pic,
                title: customer.position,
                company: customer.institution,
                stage: customer.kpi_id || 1,
                date: new Date(customer.created_at).toLocaleDateString('en-GB')
              }))
            };
          } catch (error) {
            console.error(`Error fetching data for user ${userData.id}:`, error);
            // Return basic user data if stats fetch fails
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
      
      setSalesTeamData(salesData);
    } catch (error) {
      console.error('Error fetching sales team data:', error);
      // Set empty array on error
      setSalesTeamData([]);
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
    <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading sales data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* TOP SECTION: KPI MATRIX & STATS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-md font-bold text-slate-800">Monitoring Sales KPI</h2>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Berdasarkan 10 KPI</p>
                  </div>
                  <HugeiconsIcon icon={InformationCircleIcon} size={18} className="text-slate-300" />
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
                className="group h-64 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all hover:shadow-md"
              >
                <div className="p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform">
                  <HugeiconsIcon icon={PlusSignIcon} size={24} className="text-slate-400 group-hover:text-indigo-600" />
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">Add New Sales Member</span>
              </button>
            )}
          </>
        )}
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