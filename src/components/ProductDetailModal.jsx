import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CancelCircleIcon, PackageIcon } from '@hugeicons/core-free-icons';

const ProductDetailModal = ({ isOpen, onClose, products }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-[95%] max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-linear-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <HugeiconsIcon icon={PackageIcon} className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Daftar Produk</h3>
              <p className="text-xs text-slate-500">{products?.length || 0} produk terkait</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-emerald-100 rounded-full text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <HugeiconsIcon icon={CancelCircleIcon} size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!products || products.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-slate-100 rounded-full inline-block mb-3">
                <HugeiconsIcon icon={PackageIcon} className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">Tidak ada produk</p>
              <p className="text-xs text-slate-400 mt-1">Belum ada produk yang ditambahkan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product, index) => (
                <div 
                  key={product.id || index}
                  className="p-4 border border-slate-200 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-semibold text-slate-800 flex-1 pr-2">
                      {product.name}
                    </h4>
                    <span className="text-sm font-bold text-emerald-600 shrink-0">
                      {formatCurrency(product.default_price)}
                    </span>
                  </div>
                  
                  {product.specification && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 font-medium mb-1">Spesifikasi:</p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {product.specification}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

