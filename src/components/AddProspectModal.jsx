import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Agreement01Icon, UserGroupIcon, PackageIcon } from '@hugeicons/core-free-icons';
import api from '../api/axios';

const AddProspectModal = ({ isOpen, onClose, onSuccess }) => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCustomers();
      fetchProducts();
    }
  }, [isOpen]);


  const fetchAvailableCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers/available-for-prospect');
      const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setCustomers(data);
    } catch (err) {
      console.error("Gagal mengambil customer", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/list');
      setProducts(response.data || []);
    } catch (err) {
      console.error("Gagal mengambil produk", err);
      setProducts([]);
    }
  };

  const handleProductToggle = (productId) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/customers/${selectedCustomerId}/convert-to-prospect`);
      
      if (response.data.status) {
        if (selectedProductIds.length > 0) {
          for (const productId of selectedProductIds) {
            await api.post(`/customers/${selectedCustomerId}/products`, {
              product_id: productId
            });
          }
        }
        
        alert(response.data.message || "Customer berhasil ditambahkan ke pipeline!");
        onSuccess();
        onClose();
        setSelectedCustomerId('');
        setSelectedProductIds([]);
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
      <div className="bg-white rounded-2xl w-[95%] md:w-[80%] lg:w-[55%] max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
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

              {/* Product Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Products <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                  {products.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-2">No products available</p>
                  ) : (
                    products.map(product => (
                      <label 
                        key={product.id} 
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedProductIds.includes(product.id) 
                            ? 'bg-indigo-50 border border-indigo-200' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => handleProductToggle(product.id)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-slate-700 block">
                            {product.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            Rp {Number(product.default_price || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <HugeiconsIcon icon={PackageIcon} className="w-4 h-4 text-slate-300" />
                      </label>
                    ))
                  )}
                </div>
                {selectedProductIds.length > 0 && (
                  <p className="text-xs text-indigo-600 mt-1">
                    {selectedProductIds.length} produk dipilih
                  </p>
                )}
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

