import React from 'react';
import ProspectCard from './ProspectCard';

const COLUMNS = [
  { id: 'New', label: 'New', color: 'bg-blue-500' },
  { id: 'Warm Prospect', label: 'Warm', color: 'bg-orange-400' },
  { id: 'Hot Prospect', label: 'Hot', color: 'bg-red-500' },
  { id: 'Deal Won', label: 'Deal Won', color: 'bg-green-500' },
  { id: 'After Sales', label: 'After Sales', color: 'bg-emerald-500' },
];

const KanbanBoard = ({ prospects = [], onOpenModal }) => {
  // ← TAMBAHAN: Debugging
  console.log("🎯 KanbanBoard received prospects:", prospects);

  // ← TAMBAHAN: Fungsi helper untuk mendapatkan status
  const getStatus = (prospect) => {
    // Coba berbagai kemungkinan struktur data
    return prospect?.customer?.status || 
           prospect?.status || 
           'New'; // default fallback
  };

  // ← TAMBAHAN: Fungsi untuk filter prospects
  const getProspectsForColumn = (columnId) => {
    if (!Array.isArray(prospects) || prospects.length === 0) {
      return [];
    }
    
    const filtered = prospects.filter(p => {
      const status = getStatus(p);
      console.log(`Checking prospect:`, p, `Status: ${status}, Column: ${columnId}`);
      return status === columnId;
    });
    
    return filtered;
  };

  // ← TAMBAHAN: Jika tidak ada data
  if (!prospects || prospects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-400 font-medium mb-2">No prospects found</p>
          <p className="text-slate-400 text-sm">Add a new customer to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex gap-6 items-start overflow-x-auto h-full p-4 lg:p-6">
      {COLUMNS.map(col => {
        const columnProspects = getProspectsForColumn(col.id);
        
        return (
          <div key={col.id} className="min-w-80 w-80 flex flex-col max-h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  {col.label}
                </h3>
              </div>
              <span className="bg-slate-200 text-slate-600 text-[12px] font-bold px-2 py-0.5 rounded-full">
                {columnProspects.length}
              </span>
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-3">
              {columnProspects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">No {col.label.toLowerCase()} prospects</p>
                </div>
              ) : (
                columnProspects.map((item) => (
                  <ProspectCard 
                    key={item?.customer?.id || item?.id || Math.random()} 
                    data={item} 
                    onDetailsClick={onOpenModal} 
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;