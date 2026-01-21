import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Agreement01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import api from '../api/axios';

const AddProspectModal = ({ isOpen, onClose, onSuccess }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCustomers();
    }
  }, [isOpen]);


  const fetchAvailableCustomers = async () => {
    try {
      setLoading(true);
      // Use the new endpoint that filters only non-prospected customers
      const response = await api.get('/customers/available-for-prospect');
      
      // Handle API Resources Laravel response format
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setCustomers(data);
      
    } catch (err) {
      console.error("Gagal mengambil customer", err);
      setCustomers([]); // Reset ke array kosong jika error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    setSubmitting(true);
    try {
      // Use the dedicated convert-to-prospect endpoint
      const response = await api.post(`/customers/${selectedCustomerId}/convert-to-prospect`);
      
      if (response.data.status) {
        alert(response.data.message || "Customer berhasil ditambahkan ke pipeline!");
        onSuccess();
        onClose();
        setSelectedCustomerId('');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      alert("Gagal menambahkan prospek: " + errorMsg);
      console.error("Error converting to prospect:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <HugeiconsIcon icon={Agreement01Icon} size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Add to Pipeline</h3>
              <p className="text-xs text-slate-500">Select existing customer to track</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-sm text-slate-500">Loading customers...</span>
            </div>
          )}
          
          {!loading && customers.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
              <HugeiconsIcon icon={UserGroupIcon} className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-sm font-medium text-slate-600 mb-1">No customers available</p>
              <p className="text-xs text-slate-400">All your customers are already in the pipeline, or you haven't added any customers yet.</p>
            </div>
          )}
          
          {!loading && customers.length > 0 && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Customer
                </label>
                <div className="relative">
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none transition-all"
                disabled={loading}
              >
                <option value="">
                  {loading ? '⏳ Loading customers...' : '-- Choose Customer --'}
                </option>
                {Array.isArray(customers) && customers.length === 0 && !loading && (
                  <option value="" disabled>No customers available</option>
                )}
                {Array.isArray(customers) && customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.pic} {c.institution ? `- ${c.institution}` : ''}
                  </option>
                ))}
              </select>
              {!loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <HugeiconsIcon icon={UserGroupIcon} className="text-amber-600 shrink-0" size={20} />
              <p className="text-xs text-amber-800 leading-relaxed">
                Adding this customer will initiate <strong>KPI Phase 1 (Initial Visit)</strong> and place them in the "New" column of your pipeline.
              </p>
            </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedCustomerId || loading || customers.length === 0}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Add to Pipeline'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProspectModal;