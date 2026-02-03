import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  PencilEdit01Icon, 
  Delete02Icon, 
  ArrowLeft01Icon, 
  ArrowRight01Icon,
  Search01Icon,
  Mail01Icon,
  CallIcon
} from '@hugeicons/core-free-icons';

const CustomerTable = () => {
  // Modal & edit state
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  // 1. PINDAHKAN SEMUA HOOK KE ATAS
  const [customers, setCustomers] = useState({
    data: [],
    meta: { current_page: 1, last_page: 1, total: 0 }
  });
  const [loading, setLoading] = useState(true);

  // Fungsi fetch yang diperbaiki
    // Handler Edit
    const handleEdit = (customer) => {
      setEditingCustomer(customer);
      setShowModal(true);
    };

    // Handler Delete
    const handleDelete = async (customerId) => {
      if (window.confirm('Hapus customer ini?')) {
        try {
          await api.delete(`/customers/${customerId}`);
          fetchCustomers(customers.meta.current_page);
        } catch (err) {
          alert('Gagal menghapus customer');
        }
      }
    };

    // Handler submit modal
    const handleModalSubmit = async (formData) => {
      if (editingCustomer) {
        // Edit customer
        try {
          await api.put(`/customers/${editingCustomer.id}`, formData);
          setShowModal(false);
          setEditingCustomer(null);
          fetchCustomers(customers.meta.current_page);
        } catch (err) {
          alert('Gagal mengedit customer');
        }
      }
    };
  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      // Tambahkan query param page untuk paginasi backend
      const response = await api.get(`/customers?page=${page}`);
      
      // Laravel Resource membungkus array di dalam property 'data'
      const rawData = response.data.data; 
      const meta = response.data.meta;

      const mappedData = rawData.map(item => {
        // Convert products array to comma-separated string
        let productsText = '-';
        if (item.products) {
          if (Array.isArray(item.products)) {
            productsText = item.products.map(p => p.name).join(', ');
          } else if (typeof item.products === 'string') {
            productsText = item.products;
          }
        }
        
        return {
          id: item.id,
          name: item.pic,
          institution: item.institution,
          position: item.position,
          email: item.email,
          phone_number: item.phone_number,
          category: item.category,
          notes: item.notes,
          products: productsText,
          productsArray: item.products || []
        };
      });

      setCustomers({
        data: mappedData,
        meta: meta
      });
    } catch (error) {
      console.error("Gagal mengambil data customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 2. KONDISI LOADING HARUS DI BAWAH SEMUA HOOK
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-slate-500 font-medium">Loading Customers Data...</span>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full flex flex-col p-4 lg:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
        
        {/* Table Filter/Search */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="relative w-72">
                <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search customers..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Total: {customers.meta.total} Customers
            </div>
        </div>

        {/* The Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Person in Charge</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Kategori</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Institution & Position</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Products</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Contact Info</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Notes</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-tighter text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.data.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                            {item.name ? item.name.charAt(0) : '?'}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{item.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{item.institution}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{item.position}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 max-w-48 truncate" title={item.products}>
                      {item.products || '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[12px] text-slate-600 font-medium flex items-center gap-1">
                            <HugeiconsIcon icon={Mail01Icon} size={12} className="text-slate-400" /> {item.email}
                        </span>
                        <span className="text-[12px] text-slate-600 font-medium flex items-center gap-1">
                            <HugeiconsIcon icon={CallIcon} size={12} className="text-slate-400" /> {item.phone_number}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 max-w-50 truncate" title={item.notes}>
                      {item.notes || '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all" onClick={() => handleEdit(item)}>
                        <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all" onClick={() => handleDelete(item.id)}>
                        <HugeiconsIcon icon={Delete02Icon} size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
                Showing page <b className="text-slate-800">{customers.meta.current_page}</b> of <b className="text-slate-800">{customers.meta.last_page}</b>
            </span>
            <div className="flex gap-2">
                <button 
                    onClick={() => fetchCustomers(customers.meta.current_page - 1)}
                    disabled={customers.meta.current_page === 1}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                </button>
                <button 
                    onClick={() => fetchCustomers(customers.meta.current_page + 1)}
                    disabled={customers.meta.current_page === customers.meta.last_page}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                </button>
            </div>
        </div>
      </div>
    {/* Modal Edit Customer */}
    <EditCustomerModal
      isOpen={showModal}
      onClose={() => { setShowModal(false); setEditingCustomer(null); }}
      onSuccess={() => { setShowModal(false); setEditingCustomer(null); fetchCustomers(customers.meta.current_page); }}
      customer={editingCustomer}
    />
  </div>
  );
};

export default CustomerTable;