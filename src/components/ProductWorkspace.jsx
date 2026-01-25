import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  PackageIcon, 
  PlusSignIcon, 
  Edit01Icon, 
  Trash2,
  Search01Icon,
  Refresh01Icon
} from '@hugeicons/core-free-icons';
import api from '../api/axios';

const ProductWorkspace = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    default_price: '',
    description: '',
    is_active: true
  });

  const isAdmin = user?.role === 'administrator';

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { search: search || undefined };
      const response = await api.get('/products', { params });
      setProducts(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        default_price: product.default_price || '',
        description: product.description || '',
        is_active: product.is_active ?? true
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        default_price: '',
        description: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      default_price: '',
      description: '',
      is_active: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        default_price: parseInt(formData.default_price) || 0,
        description: formData.description,
        is_active: formData.is_active
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      handleCloseModal();
      fetchProducts();
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

  const formatCurrency = (amount) => {
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
  };

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
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <button
                onClick={fetchProducts}
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
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide w-12">
                        No
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                        Nama Produk
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide w-32">
                        Harga Default
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                        Deskripsi
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wide w-24 text-center">
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
                            <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xs font-bold">
                              {index + 1}
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
                            <span className="text-sm text-slate-500 max-w-xs truncate block" title={product.description || '-'}>
                              {product.description || '-'}
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
        <div className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
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
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
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
                  placeholder="Contoh: Paket Silver, Gold, Platinum..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Harga Default (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.default_price}
                  onChange={(e) => setFormData({ ...formData, default_price: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi produk..."
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
                  onClick={handleCloseModal}
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
      )}
    </main>
  );
};

export default ProductWorkspace;

