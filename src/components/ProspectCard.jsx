import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon, AiChat02Icon, Clock01Icon, Delete02Icon, CheckmarkCircle02Icon, StarIcon, Bookmark01Icon, File01Icon, PackageIcon } from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ProductDetailModal from './ProductDetailModal';

// Helper function to format time difference (for status and FU)
const formatTimeDiff = (fromDate, toDate = new Date()) => {
  if (!fromDate) return null;
  const from = new Date(fromDate);

  // Adjust for timezone offset (assuming backend sends UTC times)
  // For +7 timezone, getTimezoneOffset() returns -420 minutes
  const timezoneOffsetMs = toDate.getTimezoneOffset() * 60 * 1000;
  const adjustedToDate = new Date(toDate.getTime() + timezoneOffsetMs);

  const diffMs = adjustedToDate - from;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit`;
  if (diffHours < 24) return `${diffHours} jam`;
  return `${diffDays} hari kalender`;
};

const ProspectCard = ({ data, onDetailsClick }) => {
    // Tooltip helpers
    const [showStatusTooltip, setShowStatusTooltip] = useState(false);
    const [showFUTooltip, setShowFUTooltip] = useState(false);
    const [statusTooltipPos, setStatusTooltipPos] = useState({});
    const [fuTooltipPos, setFUTooltipPos] = useState({});
    
    // Products modal state
    const [showProductModal, setShowProductModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    
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

    // Penjelasan status time
    const getStatusTooltipText = () => {
      if (!statusTimeText) return '';
      // Ambil angka dan satuan
      const match = statusTimeText.match(/(\d+)\s*(\w+)/);
      let satuan = 'waktu';
      let angka = '';
      if (match) {
        angka = match[1];
        satuan = match[2];
      }
      // Penjelasan status
      return `Sudah ${angka} ${satuan === 'hari' ? 'hari kalender' : satuan} sebagai ${statusLabel || 'prospek'}`;
    };

    // Penjelasan FU
    const getFUTooltipText = () => {
      if (!lastFUText) return '';
      if (lastFUText === 'Baru saja') return 'Prospek ini baru saja diperbarui hasil pelaksanaan mandatorynya.';
      return `Prospek ini diperbarui hasil pelaksanaan mandatorynya pada ${lastFUText} lalu.`;
    };
  const customer = data?.customer || {};
  const statusChangedAt = customer.status_changed_at;
  const statusLabel = customer.status;
  const kpi = data?.kpi || {};
  const stats = data?.stats || { percent: 0 };
  const kpiHistory = data?.kpi_progress_history || [];
  const lastFollowUpAt = data?.last_followup_at || null;
  const user = useAuth().user;

  // State for time counter text (last FU)
  // Untuk lastFU, hilangkan kata 'kalender' jika ada
  const cleanLastFUText = (txt) => txt ? txt.replace(' hari kalender', ' hari') : txt;
  const [lastFUText, setLastFUText] = useState(cleanLastFUText(formatTimeDiff(lastFollowUpAt)));

  // Format FU display text
  const getFUDisplayText = (text) => {
    if (text === 'Baru saja') return 'Baru saja diperbarui';
    return `Diperbarui ${text} lalu`;
  };
  // State for time counter status
  const [statusTimeText, setStatusTimeText] = useState(formatTimeDiff(statusChangedAt));

  // Update counters every minute
  useEffect(() => {
    const updateTexts = () => {
      setLastFUText(cleanLastFUText(formatTimeDiff(lastFollowUpAt)));
      setStatusTimeText(formatTimeDiff(statusChangedAt));
    };
    updateTexts();
    const interval = setInterval(updateTexts, 60000);
    return () => clearInterval(interval);
  }, [lastFollowUpAt, statusChangedAt]);

  // helper to style category badge
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

  console.log("🃏 Is Dev Mode:", user.is_developer_mode);

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

  const handleResetProspect = async (customerId) => {
      if (!confirm("Semua progress, file, dan skor customer ini akan DIHAPUS PERMANEN. Lanjutkan?")) return;
      
      try {
          await api.delete(`/progress/reset-prospect/${customerId}`);
          alert("Data prospek berhasil di-reset.");
          // Refresh data list customer Anda di sini
      } catch (err) {
          alert(err.response?.data?.message || "Gagal melakukan reset.");
      }
  };

  // Handle WhatsApp call
  const handleWhatsApp = () => {
    // Get phone number from customer
    const phoneNumber = customer?.phone_number;
    
    if (!phoneNumber) {
      alert('Nomor telepon tidak tersedia');
      return;
    }
    
    // Format nomor: hapus semua non-digit, ganti 0 dengan 62
    let formattedNumber = phoneNumber.replace(/\D/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '62' + formattedNumber.substring(1);
    }
    
    // Buka WhatsApp
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  // Filter previous KPIs (non-current)
  const previousKPIs = kpiHistory.filter(k => !k.is_current);
  const completedPrevious = previousKPIs.filter(k => k.is_completed).length;

  // Get current KPI
  const currentKPI = kpiHistory.find(k => k.is_current);
  const currentPoints = currentKPI ? (currentKPI.percent / 100) * (currentKPI.kpi_weight || 0) : 0;

  return (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm hover:shadow-md transition">

    {/* HEADER */}
    <div className="flex justify-between items-start gap-3 mb-3">
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
          {customer?.pic || 'Unnamed PIC'}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
          {customer?.institution || 'No institution'}
        </p>

        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getCategoryStyles(customer?.category)}`}>
            {customer?.category || 'General'}
          </span>

          {/* Show display_name if available, otherwise show sub_category */}
          {(customer?.display_name || customer?.sub_category) && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded border bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {customer.display_name || customer.sub_category}
            </span>
          )}
        </div>
      </div>

      {/* SCORE */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 mb-0.5">
          <HugeiconsIcon icon={StarIcon} size={12} className="text-amber-500" />
          <span className="text-xs font-bold text-amber-700">
            {formatPoints(totalEarnedPoints)}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          / {formatPoints(maxPossiblePoints)}
        </span>
      </div>
    </div>

    {/* STATUS + FU */}
    <div className="flex items-center gap-3 mb-3 text-[11px]">
      {/* Status Time Bubble */}
      {statusTimeText && (
        <div
          className="flex items-center gap-1 text-red-600 dark:text-red-400 relative group cursor-pointer"
          onMouseEnter={e => {
            setShowStatusTooltip(true);
            const rect = e.currentTarget.getBoundingClientRect();
            const vw = window.innerWidth;
            let style = { left: '50%', transform: 'translateX(-50%)' };
            if (rect.left < 180) style = { left: 0, right: 'auto', transform: 'none' };
            else if (vw - rect.right < 180) style = { right: 0, left: 'auto', transform: 'none' };
            setStatusTooltipPos(style);
          }}
          onMouseLeave={() => setShowStatusTooltip(false)}
        >
          <HugeiconsIcon icon={Clock01Icon} size={10} />
          <span>{statusTimeText}</span>
          {showStatusTooltip && (
            <div
              className="absolute z-50 top-full mt-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] px-2 py-1.5 rounded shadow-lg border border-slate-200 dark:border-slate-600 max-w-xs wrap-break-words whitespace-pre-line min-w-32"
              style={statusTooltipPos}
            >
              {getStatusTooltipText()}
            </div>
          )}
        </div>
      )}
      {/* Last FU Bubble */}
      <div
        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 relative group cursor-pointer"
        onMouseEnter={e => {
          setShowFUTooltip(true);
          const rect = e.currentTarget.getBoundingClientRect();
          const vw = window.innerWidth;
          let style = { left: '50%', transform: 'translateX(-50%)' };
          if (rect.left < 180) style = { left: 0, right: 'auto', transform: 'none' };
          else if (vw - rect.right < 180) style = { right: 0, left: 'auto', transform: 'none' };
          setFUTooltipPos(style);
        }}
        onMouseLeave={() => setShowFUTooltip(false)}
      >
        <HugeiconsIcon icon={Clock01Icon} size={10} />
        <span>{lastFUText ? getFUDisplayText(lastFUText) : 'Belum FU'}</span>
        {showFUTooltip && (
          <div
            className="absolute z-50 top-full mt-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] px-2 py-1.5 rounded shadow-lg border border-slate-200 dark:border-slate-600 max-w-xs wrap-break-words whitespace-pre-line min-w-32"
            style={fuTooltipPos}
          >
            {getFUTooltipText()}
          </div>
        )}
      </div>
    </div>

    {/* CURRENT KPI */}
    {currentKPI && (
      <div className="mb-3 p-2.5 bg-indigo-50/50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800">
        <div className="flex justify-between items-start mb-1.5">
          <div className="flex flex-col flex-1 min-w-0 pr-2">
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-0.5">
              Current Stage
            </span>
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 leading-tight line-clamp-2">
              {currentKPI.kpi_description}
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 block leading-none">
              {Math.round(currentKPI.percent)}%
            </span>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium mt-0.5 block">
              {formatPoints(currentPoints)}/{currentKPI.kpi_weight} pts
            </span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-indigo-100 dark:bg-indigo-800 rounded-full overflow-hidden mb-1">
          <div 
            className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-300" 
            style={{ width: `${currentKPI.percent}%` }} 
          />
        </div>
        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
          {currentKPI.completed_count}/{currentKPI.assigned_count} tasks selesai
        </div>
      </div>
    )}

    {/* PRODUCTS BOX - Hanya tampilkan jika ada produk */}
    <div 
      onClick={handleProductClick}
      className="mb-3 p-2.5 bg-emerald-50/50 dark:bg-emerald-900/20 rounded border border-emerald-100 dark:border-emerald-800 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg shrink-0">
            <HugeiconsIcon icon={PackageIcon} size={12} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block">
              Produk
            </span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 leading-tight line-clamp-2 block relative">
              {customer?.products && customer.products.length > 0 
                ? customer.products.map(p => p.name).join(', ')
                : 'Tidak ada produk'
              }
              {customer?.products && customer.products.length > 0 && (
                <span className="absolute top-0 right-0 h-full w-8 bg-linear-to-r from-transparent to-emerald-50" />
              )}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0 pl-2">
          <span className="text-sm font-bold text-emerald-600 block">
            {customer?.products?.length || 0}
          </span>
          <span className="text-[10px] text-emerald-500 font-medium">
            {customer?.products?.length === 1 ? 'Produk' : 'Produk'}
          </span>
        </div>
      </div>
    </div>

    {/* PREVIOUS KPI Stages */}
    {previousKPIs.length > 0 && (
      <div className="space-y-1.5 mb-3">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
          Previous Stages
        </span>
        {previousKPIs.map((kpiItem) => {
          const earnedPoints = (kpiItem.percent / 100) * (kpiItem.kpi_weight || 0);
          
          return (
            <div key={kpiItem.kpi_id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 transition-colors">
              <HugeiconsIcon 
                icon={CheckmarkCircle02Icon} 
                size={14} 
                className={kpiItem.is_completed ? 'text-emerald-500' : 'text-slate-300'} 
              />
              <span className="text-xs text-slate-600 flex-1 truncate font-normal">
                {kpiItem.kpi_description}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-xs font-medium ${
                  kpiItem.is_completed ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {Math.round(kpiItem.percent)}%
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({formatPoints(earnedPoints)})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* FOOTER */}
    <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 dark:border-slate-700">
      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
        KPI: <span className="font-semibold">{kpi?.code || 'N/A'}</span>
      </span>

      <div className="flex items-center gap-1.5">
        <button 
          onClick={handleWhatsApp}
          className="p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title="Hubungi via WhatsApp"
        >
          <HugeiconsIcon icon={CallIcon} size={12} />
        </button>

        <button
          onClick={() => onDetailsClick?.(data)}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1 rounded flex items-center gap-1 transition-colors"
        >
          Checklist <HugeiconsIcon icon={AiChat02Icon} size={12} />
        </button>

        {/* Hanya tampilkan tombol delete jika developer mode */}
        {user.is_developer_mode ? (
          <button
            onClick={() => handleResetProspect(customer.id)}
            className="p-1 rounded bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white transition-colors"
            title="Developer: Reset Prospect Data"
          >
            <HugeiconsIcon icon={Delete02Icon} size={12} />
          </button>
        ) : null}
      </div>
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

export default ProspectCard;