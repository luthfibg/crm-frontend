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
        const response = await api.get('/customers');
        
        // Perbaikan Disini:
        // Tergantung API Anda, jika menggunakan API Resources Laravel biasanya di response.data.data
        // Jika return biasa di response.data
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
      // Logic: Update customer yang sudah ada agar masuk ke KPI 1
      await api.put(`/customers/${selectedCustomerId}`, {
        current_kpi_id: 1,
        status: 'New'
      });
      
      onSuccess();
      onClose();
      setSelectedCustomerId('');
    } catch (err) {
      alert("Gagal menambahkan prospek: " + err.message);
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
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Customer
            </label>
            <div className="relative">
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="..."
                >
                <option value="">-- Choose Customer --</option>
                {/* Tambahkan pengecekan Array.isArray sebelum map untuk keamanan ekstra */}
                {Array.isArray(customers) && customers.map(c => (
                    <option key={c.id} value={c.id}>
                    {c.pic} {c.institution ? `- ${c.institution}` : ''}
                    </option>
                ))}
                </select>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
            <HugeiconsIcon icon={UserGroupIcon} className="text-amber-600 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed">
              Adding this customer will initiate <strong>KPI Phase 1 (Initial Visit)</strong> and place them in the "New" column of your pipeline.
            </p>
          </div>

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
              disabled={submitting || !selectedCustomerId}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200"
            >
              {submitting ? 'Processing...' : 'Add to Pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProspectModal;