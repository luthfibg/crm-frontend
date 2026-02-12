import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar01Icon,
  UserIcon,
  Tag01Icon
} from '@hugeicons/core-free-icons';

const HistoryWorkspace = () => {
  const [sales, setSales] = useState({
    data: [],
    meta: { current_page: 1, last_page: 1, total: 0 }
  });
  const [loading, setLoading] = useState(true);

  const fetchSalesHistory = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/customers/sales-history?page=${page}`);
      setSales({
        data: response.data.data,
        meta: response.data.meta
      });
    } catch (error) {
      console.error("Error loading sales history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-slate-500 dark:text-slate-400 font-medium">Loading Sales History...</span>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full flex flex-col p-4 lg:p-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">

        {/* Table Filter/Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-700/20">
            <div className="relative w-72">
                <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                    type="text"
                    placeholder="Search sales history..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
            </div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Total: {sales.meta.total} Completed Sales
            </div>
        </div>

        {/* The Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-slate-800 z-10 shadow-sm">
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Customer</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Institution</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Category</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Sales Person</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Completed At</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Final KPI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {sales.data.map((sale) => (
                <tr key={sale.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                            {sale.pic ? sale.pic.charAt(0) : '?'}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{sale.pic}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{sale.institution}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      <HugeiconsIcon icon={Tag01Icon} size={12} className="mr-1" />
                      {sale.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={UserIcon} size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{sale.sales_person}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{formatDate(sale.completed_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">{sale.final_kpi}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
                Showing page <b className="text-slate-800">{sales.meta.current_page}</b> of <b className="text-slate-800">{sales.meta.last_page}</b>
            </span>
            <div className="flex gap-2">
                <button
                    onClick={() => fetchSalesHistory(sales.meta.current_page - 1)}
                    disabled={sales.meta.current_page === 1}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                </button>
                <button
                    onClick={() => fetchSalesHistory(sales.meta.current_page + 1)}
                    disabled={sales.meta.current_page === sales.meta.last_page}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryWorkspace;