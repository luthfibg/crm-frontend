import React, { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  PlusSignIcon, 
  Edit01Icon
} from '@hugeicons/core-free-icons';
import api from '../api/axios';

const AddProductModal = ({ isOpen, onClose, onSuccess, editingProduct }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    default_price: editingProduct?.default_price?.toString() || '',
    specification: editingProduct?.specification || '',
    is_active: editingProduct?.is_active ?? true
  });

  const [priceDisplay, setPriceDisplay] = useState(editingProduct?.default_price?.toString() || '');
  const inputRef = useRef(null);

  // Initialize price display when modal opens or editingProduct changes
  useEffect(() => {
    if (editingProduct?.default_price) {
      const formatted = formatRupiah(editingProduct.default_price);
      setPriceDisplay(formatted);
    }
  }, [editingProduct]);

  // Format number to Rupiah format
  const formatRupiah = (value) => {
    if (!value) return '';
    const num = value.toString().replace(/\D/g, '');
    if (num === '') return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(num));
  };

  // Handle price input change
  const handlePriceChange = (e) => {
    const rawValue = e.target.value;
    // Remove all non-digit characters
    const digitsOnly = rawValue.replace(/\D/g, '');
    
    if (digitsOnly === '') {
      setFormData({ ...formData, default_price: '' });
      setPriceDisplay('');
      return;
    }
    
    const numericValue = parseInt(digitsOnly);
    const formatted = formatRupiah(numericValue);
    
    setFormData({ ...formData, default_price: digitsOnly });
    setPriceDisplay(formatted);
  };

  // Handle blur to ensure proper format
  const handlePriceBlur = () => {
    if (formData.default_price && parseInt(formData.default_price) > 0) {
      setPriceDisplay(formatRupiah(formData.default_price));
    }
  };

  // Handle focus to allow editing
  const handlePriceFocus = (e) => {
    // Select all text for easy replacement
    e.target.setSelectionRange(0, e.target.value.length);
  };

  // Handle key down to allow specific key presses
  const handlePriceKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'];
    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    const ctrlKeys = ['a', 'c', 'v', 'x'];
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    
    if (allowedKeys.includes(e.key) || (isCtrlPressed && ctrlKeys.includes(e.key.toLowerCase()))) {
      return;
    }
    
    // Allow arrow keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      return;
    }
    
    // Block any non-numeric keys
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        default_price: parseInt(formData.default_price) || 0,
        specification: formData.specification,
        is_active: formData.is_active
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      const msg = err.response?.data?.message || err.response?.data?.errors 
        ? JSON.stringify(err.response.data.errors) 
        : 'Gagal menyimpan produk';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-[95%] md:w-[80%] lg:w-[55%] max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <HugeiconsIcon icon={editingProduct ? Edit01Icon : PlusSignIcon} size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingProduct ? 'Perbarui informasi produk' : 'Masukkan detail produk'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: IFP Maxhub V7, Printer Epson EB500, dsb..."
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Harga Default (Rp) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                Rp
              </span>
              <input
                ref={inputRef}
                type="text"
                required
                value={priceDisplay}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                onFocus={handlePriceFocus}
                onKeyDown={handlePriceKeyDown}
                placeholder="0"
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pl-12"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ketik angka tanpa titik atau koma, sistem akan otomatis memformat
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Spesifikasi
            </label>
            <textarea
              value={formData.specification}
              onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
              placeholder="Spesifikasi produk..."
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
              Produk aktif (dapat dipilih untuk customer)
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-semibold text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                editingProduct ? 'Perbarui' : 'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;

