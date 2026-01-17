import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { useAuth } from '../context/AuthContext';
import { 
  PlusSignIcon, ContactBookIcon, WorkflowSquare01Icon, FilterIcon, Clock01Icon 
} from '@hugeicons/core-free-icons';
import api from '../api/axios'; // Pastikan path axios Anda benar

import KanbanBoard from './KanbanBoard';
import CustomerTable from './CustomerTable';
import AddCustomerModal from './AddCustomerModal';
import TaskChecklistModal from './TaskChecklistModal';
import AddProspectModal from './AddProspectModal';

const ProspectWorkspace = () => {
  const [view, setView] = useState('pipeline');
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddProspectOpen, setIsAddProspectOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const [error, setError] = useState(null)

  const { user } = useAuth();

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Pendidikan', label: 'Pendidikan' },
    { value: 'Pemerintahan', label: 'Pemerintahan' },
    { value: 'Web Inquiry Corporate', label: 'Web Inquiry Corporate' },
    { value: 'Web Inquiry C&I', label: 'Web Inquiry C&I' }
  ];

  // Get filtered prospects based on selected filter
  const getFilteredProspects = () => {
    if (filterType === 'all') {
      return prospects;
    }
    
    const filtered = prospects.filter(prospect => {
      const prospectType = prospect.customer?.category;
      return prospectType === filterType;
    });
    
    console.log(`🔍 Filter "${filterType}": ${filtered.length} of ${prospects.length} prospects`);
    return filtered;
  };

  // Reset filter when switching views
  useEffect(() => {
    setFilterType('all');
  }, [view]);

  // Fetch Data dari API Backend (DailyGoalController@index)
  useEffect(() => {
    const fetchProspects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/daily-goals');
        console.log("📊 API Response received");
        const prospectsData = response.data.data || [];
        console.log(`📋 Loaded ${prospectsData.length} prospects`);
        setProspects(prospectsData);
      } catch (error) {
        console.error("Error loading prospects:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProspects();
  }, [refreshKey]);

  const handleOpenModal = (prospect) => {
    setSelectedProspect(prospect);
    setIsModalOpen(true);
  };

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-full bg-slate-50/50">
      <AddCustomerModal 
        isOpen={isAddCustomerOpen} 
        onClose={() => setIsAddCustomerOpen(false)} 
        onSuccess={() => setRefreshKey(k => k + 1)}
        userId={user?.id}
      />

      <AddProspectModal
        isOpen={isAddProspectOpen}
        onClose={() => setIsAddProspectOpen(false)}
        onSuccess={() => {
          setRefreshKey(k => k + 1);
          setView('pipeline'); // Otomatis pindah ke pipeline setelah add
        }}
      />

      <TaskChecklistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        prospect={selectedProspect}
        onSuccess={() => setRefreshKey(k => k + 1)} 
      />

      {/* Header Section */}
      <div className="p-4 lg:p-6 flex items-center justify-between border-b border-slate-200 bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
            {view === 'pipeline' ? 'Prospect Pipeline' : 'Customer Database'}
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {view === 'pipeline' ? 
              filterType === 'all' 
                ? `Mengelola ${prospects.length} Prospek Aktif` 
                : `Mengelola ${getFilteredProspects().length} Prospek (${filterType})`
              : 'Direktori Semua Customer'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Filter Dropdown - Only show in pipeline view */}
          {view === 'pipeline' && (
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={FilterIcon} size={16} className="text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tombol Toggle View */}
          <button onClick={() => setView(view === 'pipeline' ? 'customer' : 'pipeline')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                view === 'customer' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-600 border-slate-200'
            }`}>
            <HugeiconsIcon icon={view === 'pipeline' ? ContactBookIcon : WorkflowSquare01Icon} size={18} />
            {view === 'pipeline' ? 'View Database' : 'View Pipeline'}
          </button>

          {/* Tombol Dinamik Berdasarkan View */}
          {view === 'pipeline' ? (
            <button 
              onClick={() => setIsAddProspectOpen(true)}
              className='flex bg-indigo-600 items-center gap-2 px-4 py-2 rounded-lg text-xs font-black text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100'>
              <HugeiconsIcon icon={PlusSignIcon} size={16} />
              ADD PROSPECT
            </button>
          ) : (
            <button 
              onClick={() => setIsAddCustomerOpen(true)}
              className='flex bg-emerald-600 items-center gap-2 px-4 py-2 rounded-lg text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100'>
              <HugeiconsIcon icon={PlusSignIcon} size={16} />
              NEW CUSTOMER
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading prospects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">Error loading data</p>
              <p className="text-slate-500 text-sm">{error}</p>
              <button 
                onClick={() => setRefreshKey(k => k + 1)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
        view === 'pipeline' ? (
          <KanbanBoard prospects={getFilteredProspects()} onOpenModal={handleOpenModal} />
        ) : (
          <CustomerTable key={refreshKey} />
        )
      )}
    </main>
  );
};

export default ProspectWorkspace;