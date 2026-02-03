import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { useAuth } from '../context/AuthContext';
import {
  PlusSignIcon, ContactBookIcon, WorkflowSquare01Icon, FilterIcon, WorkHistoryIcon
} from '@hugeicons/core-free-icons';
import api from '../api/axios'; // Pastikan path axios Anda benar

import KanbanBoard from './KanbanBoard';
import CustomerTable from './CustomerTable';
import HistoryWorkspace from './HistoryWorkspace';
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

  // Reset filter when switching views (only for pipeline view)
  useEffect(() => {
    if (view !== 'pipeline') {
      setFilterType('all');
    }
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

  const handleOpenModal = async (prospect) => {
    // Refresh prospect data to get latest summary_required status
    try {
      const response = await api.get('/daily-goals');
      const prospectsData = response.data.data || [];
      setProspects(prospectsData);

      // Find the updated prospect data
      const updatedProspect = prospectsData.find(p => p.customer.id === prospect.customer.id);
      setSelectedProspect(updatedProspect || prospect);
    } catch (error) {
      console.error("Error refreshing prospect data:", error);
      setSelectedProspect(prospect);
    }
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
      <div className="p-6 border-b border-slate-100 bg-linear-to-br from-indigo-50/50 to-purple-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <HugeiconsIcon icon={WorkflowSquare01Icon} className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {view === 'pipeline' ? 'Prospect Pipeline' : view === 'customer' ? 'Customer Database' : 'Sales History'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {view === 'pipeline' ?
                  filterType === 'all'
                    ? `Saat ini ada ${prospects.length} prospek aktif`
                    : `Saat ini ada ${getFilteredProspects().length} prospek aktif (${filterType})`
                  : view === 'customer' ? 'Direktori semua customer' : 'Riwayat penjualan berhasil'
                }
              </p>
            </div>
          </div>
        
        <div className="flex items-center gap-2">
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

          {/* Navigation Buttons */}
          {view === 'pipeline' && (
            <>
              {/* History Button - from pipeline */}
              <button onClick={() => setView('history')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">
                <HugeiconsIcon icon={WorkHistoryIcon} size={18} />
                History
              </button>

              {/* Database Button - from pipeline */}
              <button onClick={() => setView('customer')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">
                <HugeiconsIcon icon={ContactBookIcon} size={18} />
                View Database
              </button>
            </>
          )}

          {view === 'customer' && (
            <>
              {/* History Button - from customer */}
              <button onClick={() => setView('history')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">
                <HugeiconsIcon icon={WorkHistoryIcon} size={18} />
                History
              </button>

              {/* Pipeline Button - from customer */}
              <button onClick={() => setView('pipeline')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">
                <HugeiconsIcon icon={WorkflowSquare01Icon} size={18} />
                View Pipeline
              </button>
            </>
          )}

          {view === 'history' && (
            <>
              {/* Pipeline Button - from history */}
              <button onClick={() => setView('pipeline')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">
                <HugeiconsIcon icon={WorkflowSquare01Icon} size={18} />
                View Pipeline
              </button>

              {/* Database Button - from history */}
              <button onClick={() => setView('customer')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border bg-white text-slate-600 border-slate-200 hover:bg-slate-50">
                <HugeiconsIcon icon={ContactBookIcon} size={18} />
                View Database
              </button>
            </>
          )}

          {/* Tombol Dinamik Berdasarkan View */}
          {view === 'pipeline' ? (
            <button
              onClick={() => setIsAddProspectOpen(true)}
              className='flex bg-indigo-600 items-center gap-2 px-4 py-2 rounded-lg text-xs font-black text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100'>
              <HugeiconsIcon icon={PlusSignIcon} size={16} />
              ADD PROSPECT
            </button>
          ) : view === 'customer' ? (
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className='flex bg-emerald-600 items-center gap-2 px-4 py-2 rounded-lg text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100'>
              <HugeiconsIcon icon={PlusSignIcon} size={16} />
              NEW CUSTOMER
            </button>
          ) : null}
        </div>
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
        ) : view === 'customer' ? (
          <CustomerTable key={refreshKey} />
        ) : (
          <HistoryWorkspace />
        )
      )}
    </main>
  );
};

export default ProspectWorkspace;