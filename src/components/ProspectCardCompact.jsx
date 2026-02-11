import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon, AiChat02Icon, PackageIcon } from '@hugeicons/core-free-icons';
import api from '../api/axios';
import ProductDetailModal from './ProductDetailModal';

const ProspectCardCompact = ({ data, onDetailsClick }) => {
  const customer = data?.customer || {};
  const kpiHistory = data?.kpi_progress_history || [];
  const stats = data?.stats || { percent: 0 };
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Format points dengan 1 desimal
  const formatPoints = (points) => {
    return points ? parseFloat(points).toFixed(1) : '0.0';
  };

  // Hitung total earned points dari semua KPI history
  const totalEarnedPoints = kpiHistory.reduce((sum, kpi) => {
    const earnedPoints = (kpi.percent / 100) * (kpi.kpi_weight || 0);
    return sum + earnedPoints;
  }, 0);

  // Hitung max possible points dari KPI yang sudah dilalui
  const maxPossiblePoints = kpiHistory.reduce((sum, kpi) => {
    return sum + (kpi.kpi_weight || 0);
  }, 0);

  // Get current KPI (last stage)
  // const currentKPI = kpiHistory.find(k => k.is_current);

  // Fetch products when modal opens
  const handleProductClick = async () => {
    const customerId = customer?.id || data?.customer_id;
    if (!customerId) return;

    setLoadingProducts(true);
    setShowProductModal(true);

    try {
      const response = await api.get(`/customers/${customerId}/products`);
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handle WhatsApp call
  const handleWhatsApp = () => {
    const phoneNumber = customer?.phone_number;

    if (!phoneNumber) {
      alert('Nomor telepon tidak tersedia');
      return;
    }

    let formattedNumber = phoneNumber.replace(/\D/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '62' + formattedNumber.substring(1);
    }

    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  // Helper to style category badge
  const getCategoryStyles = (category) => {
    const cat = category?.toLowerCase();
    switch (cat) {
      case 'pendidikan':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'pemerintahan':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'swasta':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };


  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col gap-2">
      {/* HEADER: PIC + Score + Product Icon */}
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
            {customer?.pic || 'Unnamed PIC'}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {customer?.institution || 'No institution'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {/* Score Badge */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 mb-0.5">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
              {formatPoints(totalEarnedPoints)}
            </span>
            <span className="text-[9px] text-amber-600 dark:text-amber-500">/{formatPoints(maxPossiblePoints)}</span>
          </div>
          {/* Product Icon Button */}
          <button
            onClick={handleProductClick}
            className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 transition-colors"
            title="Lihat Produk"
          >
            <HugeiconsIcon icon={PackageIcon} size={14} />
          </button>
        </div>
      </div>

      {/* CATEGORY BADGE */}
      <div className="flex gap-1.5">
        <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded border ${getCategoryStyles(customer?.category)}`}>
          {customer?.category || 'General'}
        </span>
        {(customer?.display_name || customer?.sub_category) && (
          <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded border bg-slate-50 text-slate-600 truncate">
            {customer.display_name || customer.sub_category}
          </span>
        )}
      </div>




      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-100 justify-between">
        <button
          onClick={handleWhatsApp}
          className="p-1.5 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
          title="WhatsApp"
        >
          <HugeiconsIcon icon={CallIcon} size={11} />
        </button>

        <button
          onClick={() => onDetailsClick?.(data)}
          className="text-[9px] font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 transition-colors flex-1 justify-center"
        >
          Details <HugeiconsIcon icon={AiChat02Icon} size={10} />
        </button>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        products={loadingProducts ? null : products}
      />
    </div>
  );
};

export default ProspectCardCompact;
