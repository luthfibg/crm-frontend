import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { HugeiconsIcon } from '@hugeicons/react';
import { CancelCircleIcon, FloppyDiskIcon } from '@hugeicons/core-free-icons';

const AddCustomerModal = ({ isOpen, onClose, onSuccess, userId }) => {
  const [loading, setLoading] = useState(false);
  const [selectedSubCategoryLabel, setSelectedSubCategoryLabel] = useState('');
  const [formData, setFormData] = useState({
    user_id: userId,
    pic: '',
    institution: '',
    position: '',
    email: '',
    phone_number: '',
    category: '',
    notes: '',
    kpi_id: 1,
    current_kpi_id: 1,
    created_at: '' // Custom creation datetime
  });

  // Sinkronkan userId jika berubah (misal saat login/reload)
  useEffect(() => {
    if (userId) {
      setFormData(prev => ({ ...prev, user_id: userId }));
    }
  }, [userId]);

  // Update selectedSubCategoryLabel ketika formData.sub_category berubah
  useEffect(() => {
    if (formData.sub_category) {
      const mapping = SUB_CAT_MAPPING.find(item => item.value === formData.sub_category);
      if (mapping) {
        setSelectedSubCategoryLabel(mapping.label);
      }
    } else {
      setSelectedSubCategoryLabel('');
    }
  }, [formData.sub_category]);

  // Reset subcategory ketika category berubah dan bukan pemerintahan
  useEffect(() => {
    if (formData.category !== "Pemerintahan") {
      setFormData(prev => ({ ...prev, sub_category: '' }));
      setSelectedSubCategoryLabel('');
    }
  }, [formData.category]);

  if (!isOpen) return null;

  // category options
  const categories = [
    "Pendidikan",
    "Pemerintahan",
    "Web Inquiry Corporate",
    "Web Inquiry CNI"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare payload - format created_at if provided
      const payload = { ...formData };
      
      // Convert datetime-local format (YYYY-MM-DDTHH:MM) to Laravel format (YYYY-MM-DD HH:MM:SS)
      if (payload.created_at) {
        // Replace 'T' with space and add seconds
        payload.created_at = payload.created_at.replace('T', ' ') + ':00';
      } else {
        // Remove empty created_at to let backend use default timestamp
        delete payload.created_at;
      }
      
      const response = await api.post('/customers', payload);
      onSuccess();
      onClose();
      // Reset form
      resetForm();
      alert("Customer berhasil ditambahkan.");
    } catch (error) {
      // Tampilkan error validasi spesifik dari Laravel agar mudah didebug
      const validationErrors = error.response?.data?.errors;
      console.error("Gagal menambah customer:", validationErrors || error.message);
      
      if (validationErrors) {
        alert("Validasi Gagal: " + Object.values(validationErrors).flat().join(", "));
      } else {
        alert("Terjadi kesalahan pada server.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Reset form when closed or success
  const resetForm = () => {
    setFormData({ 
      ...formData, 
      pic: '', institution: '', position: '', 
      email: '', phone_number: '', notes: '', category: '', sub_category: '',
      created_at: ''
    });
    setSelectedSubCategoryLabel('');
  };

  // Konfigurasi Mapping
  const SUB_CAT_MAPPING = [
    { label: "Kantor Kedinasan", value: "Kedinasan" },
    { label: "Kantor Balai", value: "Kedinasan" },
    { label: "UKPBJ", value: "Kedinasan" },
    { label: "Rumah Sakit", value: "Kedinasan" },
    { label: "Puskesmas", value: "Puskesmas" },
    { label: "Kecamatan", value: "Kecamatan" },
    { label: "Kelurahan", value: "Kecamatan" },
  ];

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-black text-slate-800">Add New Customer</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <HugeiconsIcon icon={CancelCircleIcon} size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PIC - Required */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Person In Charge *</label>
              <input 
                required
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.pic}
                onChange={(e) => setFormData({...formData, pic: e.target.value})}
                placeholder="Full Name"
              />
            </div>

            {/* Category */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Category *</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="" className='text-slate-400'>-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Sub Category</label>
              <select 
                disabled={formData.category !== "Pemerintahan"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                value={selectedSubCategoryLabel}
                onChange={(e) => {
                  const selectedLabel = e.target.value;
                  setSelectedSubCategoryLabel(selectedLabel);
                  const mapping = SUB_CAT_MAPPING.find(item => item.label === selectedLabel);
                  if (mapping) {
                    setFormData({...formData, sub_category: mapping.value});
                  } else {
                    setFormData({...formData, sub_category: ''});
                  }
                }}
              >
                <option value="">-- Pilih Jenis Instansi --</option>
                {formData.category === "Pemerintahan" && SUB_CAT_MAPPING.map((item, index) => (
                  <option key={index} value={item.label}>{item.label}</option>
                ))}
              </select>
            </div>

            {/* Institution */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Institution *</label>
              <input 
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
                placeholder="Company Name"
              />
            </div>

            {/* Position */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Position</label>
              <input 
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="e.g. CEO / Manager"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
              <input 
                type="email"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Number *</label>
              <input 
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                placeholder="+62..."
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
            <textarea 
              rows="3"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any additional info..."
            />
          </div>

          {/* Created At - Custom Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Custom Creation Date/Time
            </label>
            <input 
              type="datetime-local"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.created_at}
              onChange={(e) => setFormData({...formData, created_at: e.target.value})}
            />
            <p className="text-xs text-slate-400 mt-1">
              Leave empty to use current date/time. Set a past date for late data entry.
            </p>
          </div>

          <div className="shrink-0 border-t border-slate-100 p-6">
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <HugeiconsIcon icon={FloppyDiskIcon} size={18} />
                    Save Customer
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

export default AddCustomerModal;