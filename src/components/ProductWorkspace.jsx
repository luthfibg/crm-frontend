import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  PackageIcon, 
  PlusSignIcon, 
  Edit01Icon, 
  Trash2,
  Search01Icon,
  Refresh01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import api from '../api/axios';
import AddProductModal from './AddProductModal';

const ProductWorkspace = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    has_more: false
  });

  const isAdmin = user?.role === 'administrator';

  useEffect(() => {
    fetchProducts();
  }, [search, pagination.current_page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { 
        search: search || undefined,
        page: pagination.current_page,
        per_page: pagination.per_page
      };
      const response = await api.get('/products', { params });
      
      const data = response.data;
      setProducts(data.data || []);
      setPagination(prev => ({
        ...prev,
        current_page: data.pagination?.current_page || 1,
        last_page: data.pagination?.last_page || 1,
        per_page: data.pagination?.per_page || 10,
        total: data.pagination?.total || 0,
        has_more: data.pagination?.has_more || false
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${product.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/products/${product.id}`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.message || 'Gagal menghapus produk');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setPagination(prev => ({ ...prev, current_page: newPage }));
    }
  };

  const formatCurrency = (amount) => {
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
  };

  // Calculate starting number for this page
  const startNumber = (pagination.current_page - 1) * pagination.per_page + 1;

  return (
    <main className="flex-1 p-4 lg:p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-linear-to-br from-indigo-50/50 to-purple-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <HugeiconsIcon icon={PackageIcon} className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Manajemen Produk</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Kelola daftar produk yang ditawarkan</p>
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={18} />
                  Tambah Produk
                </button>
              )}
            </div>
          </div>

          {/* Filter & Search */}
          <div className="p-6 bg-slate-50/30 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Cari Produk</h3>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama produk..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPagination(prev => ({ ...prev, current_page: 1 }));
                  }}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <button
                onClick={() => {
                  setPagination(prev => ({ ...prev, current_page: 1 }));
                  fetchProducts();
                }}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <HugeiconsIcon icon={Refresh01Icon} size={18} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          {/* Products Table */}
          <div className="p-6">
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide w-16">
                        No
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                        Nama Produk
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide w-36">
                        Harga Default
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                        Spesifikasi
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide w-28 text-center">
                        Status
                      </th>
                      {isAdmin && (
                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide w-32 text-right">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-slate-500 font-medium">Loading...</p>
                          </div>
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="p-4 bg-slate-100 rounded-full">
                              <HugeiconsIcon icon={PackageIcon} className="w-8 h-8 text-slate-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-slate-700">
                                {search ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {search ? 'Coba kata kunci lain' : 'Tambahkan produk pertama Anda'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((product, index) => (
                        <tr key={product.id} className="group hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="w-10 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xs font-bold">
                              {startNumber + index}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-slate-700 block">
                              {product.name}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(product.default_price)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-500 max-w-xs truncate block" title={product.specification || '-'}>
                              {product.specification || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              product.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {product.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenModal(product)}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <HugeiconsIcon icon={Edit01Icon} size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(product)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus"
                                >
                                  <HugeiconsIcon icon={Trash2} size={18} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="mt-4 flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-sm text-slate-600">
                  Menampilkan <span className="font-semibold">{startNumber}</span> - <span className="font-semibold">{Math.min(startNumber + products.length - 1, pagination.total)}</span> dari <span className="font-semibold">{pagination.total}</span> produk
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1 || loading}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                    Prev
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, pagination.last_page))].map((_, i) => {
                      let pageNum;
                      if (pagination.last_page <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.current_page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.current_page >= pagination.last_page - 2) {
                        pageNum = pagination.last_page - 4 + i;
                      } else {
                        pageNum = pagination.current_page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-all ${
                            pagination.current_page === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={!pagination.has_more || loading}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-800">
                <span className="font-bold">💡 Tips:</span> Produk yang ditambahkan akan muncul di laporan sales untuk setiap customer yang membeli produk tersebut.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <AddProductModal 
          isOpen={showModal} 
          onClose={handleCloseModal} 
          onSuccess={fetchProducts}
          editingProduct={editingProduct}
        />
      )}
    </main>
  );
};

export default ProductWorkspace;

