import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { HugeiconsIcon } from '@hugeicons/react';
import { CancelCircleIcon, FloppyDiskIcon, PackageIcon } from '@hugeicons/core-free-icons';

const EditCustomerModal = ({ isOpen, onClose, onSuccess, customer }) => {
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedSubCategoryLabel, setSelectedSubCategoryLabel] = useState('');
  const [formData, setFormData] = useState({
    pic: '',
    institution: '',
    position: '',
    email: '',
    phone_number: '',
    category: '',
    source: '',
    notes: '',
    sub_category: '',
    display_name: '',
    created_at: '',
  });

  useEffect(() => {
    if (customer) {
      // Determine the display label based on sub_category
      const subCat = customer.sub_category || '';
      const displayName = customer.display_name || '';
      let label = '';
      
      if (displayName) {
        label = displayName;
      } else if (subCat) {
        const mapping = SUB_CAT_MAPPING.find(item => item.value === subCat);
        label = mapping?.label || subCat;
      }
      
      setSelectedSubCategoryLabel(label);
      setFormData({
        pic: customer.name || '',
        institution: customer.institution || '',
        position: customer.position || '',
        email: customer.email || '',
        phone_number: customer.phone_number || '',
        category: customer.category || '',
        source: customer.source || '',
        notes: customer.notes || '',
        sub_category: customer.sub_category || '',
        display_name: customer.display_name || '',
        created_at: customer.created_at ? customer.created_at.replace(' ', 'T').slice(0, 16) : '',
      });
    }
  }, [customer]);

  useEffect(() => {
    if (formData.category !== 'Pemerintahan') {
      setFormData(prev => ({ ...prev, sub_category: '', display_name: '' }));
      setSelectedSubCategoryLabel('');
    }
    if (formData.category !== 'Corporate' && formData.category !== 'C&I') {
      setFormData(prev => ({ ...prev, source: '' }));
    }
  }, [formData.category]);

useEffect(() => {
    if (isOpen) {
      fetchProducts();
      if (customer) {
        // Set selected products based on customer's current products
        // Handle both array of objects and flat array
        let productIds = [];
        if (customer.product_ids) {
          if (Array.isArray(customer.product_ids)) {
            // Check if it's array of objects or array of IDs
            if (customer.product_ids.length > 0 && typeof customer.product_ids[0] === 'object') {
              productIds = customer.product_ids.map(p => p.id);
            } else {
              productIds = customer.product_ids;
            }
          }
        }
        setSelectedProductIds(productIds);
      }
    }
  }, [isOpen, customer]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await api.get('/products/list');
      setProducts(response.data || []);
    } catch (err) {
      console.error("Gagal mengambil produk", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    'Pendidikan',
    'Pemerintahan',
    'Corporate',
    'C&I',
  ];

  const sourceOptions = [
    'Web Inquiry',
    'Canvasing',
  ];

  const SUB_CAT_MAPPING = [
    { label: 'Kantor Kedinasan', value: 'Kedinasan' },
    { label: 'Kantor Balai', value: 'Kedinasan' },
    { label: 'UKPBJ', value: 'Kedinasan' },
    { label: 'Rumah Sakit', value: 'Kedinasan' },
    { label: 'Puskesmas', value: 'Puskesmas' },
    { label: 'Kecamatan', value: 'Kecamatan' },
    { label: 'Kelurahan', value: 'Kecamatan' },
  ];

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
    setLoading(true);
    try {
      const payload = { ...formData, product_ids: selectedProductIds };
      if (payload.created_at) {
        payload.created_at = payload.created_at.replace('T', ' ') + ':00';
      } else {
        delete payload.created_at;
      }
      await api.put(`/customers/${customer.id}`, payload);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        alert('Validasi Gagal: ' + Object.values(validationErrors).flat().join(', '));
      } else {
        alert('Terjadi kesalahan pada server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 w-[95%] md:w-[80%] lg:w-[55%] max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0 dark:bg-slate-800/50">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Edit Customer</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 dark:text-slate-500">
            <HugeiconsIcon icon={CancelCircleIcon} size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 dark:bg-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Person In Charge *</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                placeholder="Full Name"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer Category *</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" className="text-slate-400 dark:text-slate-600">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {(formData.category === 'Corporate' || formData.category === 'C&I') && (
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sumber Customer *</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none appearance-none"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  <option value="">-- Pilih Sumber --</option>
                  {sourceOptions.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
            )}
            {formData.category === 'Pemerintahan' && (
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer Sub Category</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none appearance-none"
                  value={selectedSubCategoryLabel}
                  onChange={(e) => {
                    const selectedLabel = e.target.value;
                    setSelectedSubCategoryLabel(selectedLabel);
                    const mapping = SUB_CAT_MAPPING.find(item => item.label === selectedLabel);
                    if (mapping) {
                      setFormData({ ...formData, sub_category: mapping.value, display_name: selectedLabel });
                    } else {
                      setFormData({ ...formData, sub_category: '', display_name: '' });
                    }
                  }}
                >
                  <option value="">-- Pilih Jenis Instansi --</option>
                  {SUB_CAT_MAPPING.map((item, index) => (
                    <option key={index} value={item.label}>{item.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Institution *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Position</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g. CEO / Manager"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone Number *</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+62..."
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Notes</label>
            <textarea
              rows="3"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none resize-none placeholder-slate-400 dark:placeholder-slate-500"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional info..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Products <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
            </label>
            {loadingProducts ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">Memuat produk...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="p-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-center">
                <HugeiconsIcon icon={PackageIcon} className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Tidak ada produk aktif</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Tambahkan produk di halaman Produk</p>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-xl p-2 space-y-1 dark:bg-slate-700">
                {products.map(product => (
                  <label
                    key={product.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedProductIds.includes(product.id) ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' : 'hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="w-4 h-4 text-indigo-600 dark:accent-indigo-600 border-slate-300 dark:border-slate-500 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block truncate">{product.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Rp {Number(product.default_price || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <HugeiconsIcon icon={PackageIcon} className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                  </label>
                ))}
              </div>
            )}
            {selectedProductIds.length > 0 && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400">{selectedProductIds.length} produk dipilih</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Custom Creation Date/Time
            </label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
              value={formData.created_at}
              onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Leave empty to use current date/time. Set a past date for late data entry.
            </p>
          </div>
          <div className="shrink-0 border-t border-slate-100 dark:border-slate-700 p-6 dark:bg-slate-800">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-indigo-600 dark:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:dark:opacity-40 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <HugeiconsIcon icon={FloppyDiskIcon} size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;
