// src/components/ReportWorkspace.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  Calendar, 
  Download, 
  RefreshCw, 
  FileText, 
  BarChart3,
  Filter,
  Users,
  CalendarRange
} from 'lucide-react';

const ReportWorkspace = ({ user }) => {
  const [range, setRange] = useState('monthly'); // daily|monthly
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [format, setFormat] = useState('pdf'); // pdf|excel|word
  const [userId, setUserId] = useState(''); // optional filter
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // load some users for filter if admin
    if (user?.role === 'administrator') {
      api.get('/users').then(res => setUsers(res.data)).catch(() => {});
    }
  }, [user]);

  const fetchPreview = async () => {
    setPreviewLoading(true);
    setError(null);
    try {
      // Uses existing endpoint that returns customers + daily goals
      const res = await api.get('/daily-goals');
      // Format preview rows: no, customer, institution, current KPI percent (approx)
      const rows = (res.data?.data || []).map((c, i) => ({
        no: i + 1,
        customer: c.customer?.pic || '—',
        institution: c.customer?.institution || '—',
        kpiPercent: Math.round(c.stats?.percent || 0)
      }));
      setPreviewRows(rows.slice(0, 50));
    } catch (e) {
      setError('Gagal memuat preview. Cek koneksi.');
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    // initial preview
    fetchPreview();
  }, []);

  const getFilenameFromHeader = (header) => {
    if (!header) return null;
    const match = /filename="?(.*?)"?($|;)/i.exec(header);
    return match ? match[1] : null;
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        format,
        range,
        ...(range === 'daily' ? { date: date || new Date().toISOString().slice(0,10) } : {}),
        ...(range === 'monthly' ? { month: month || new Date().toISOString().slice(0,7) } : {}),
        ...(userId ? { user_id: userId } : {})
      };

      const res = await api.get('/reports/progress', {
        params,
        responseType: 'blob', // file blob
        headers: { Accept: '*/*' }
      });

      const contentDisposition = res.headers['content-disposition'] || res.headers['Content-Disposition'];
      const filename = getFilenameFromHeader(contentDisposition) || `progress_report.${format === 'excel' ? 'csv' : format === 'word' ? 'doc' : 'pdf'}`;

      const blob = new Blob([res.data], { type: res.data.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Gagal mengunduh laporan. Cek log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 lg:p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Report Workspace</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Generate and export progress reports</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">PDF • Excel • Word</span>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="p-6 bg-slate-50/30 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Report Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Range Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                  <CalendarRange className="w-3.5 h-3.5" />
                  Time Range
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setRange('daily')} 
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      range === 'daily' 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    Daily
                  </button>
                  <button 
                    onClick={() => setRange('monthly')} 
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      range === 'monthly' 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Date/Month Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {range === 'daily' ? 'Select Date' : 'Select Month'}
                </label>
                <div className="relative">
                  {range === 'daily' ? (
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  ) : (
                    <input 
                      type="month" 
                      value={month} 
                      onChange={(e) => setMonth(e.target.value)} 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Format Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Export Format
                </label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel (CSV)</option>
                  <option value="word">Word (HTML)</option>
                </select>
              </div>

              {/* User Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Sales Person
                </label>
                {user?.role === 'administrator' ? (
                  <select 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">All Sales</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={user?.name || ''} 
                    disabled 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200">
              <button 
                onClick={fetchPreview} 
                disabled={previewLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${previewLoading ? 'animate-spin' : ''}`} />
                {previewLoading ? 'Refreshing...' : 'Refresh Preview'}
              </button>
              
              <button 
                onClick={handleExport} 
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Download className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                {loading ? 'Processing...' : `Export ${format.toUpperCase()}`}
              </button>

              {previewRows.length > 0 && (
                <div className="ml-auto text-xs text-slate-500 font-medium">
                  Showing {previewRows.length} records in preview
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Data Preview</h3>
                  <p className="text-xs text-slate-500">Sample of customers & KPI progress</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wide">
                        No
                      </th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wide">
                        Customer Name
                      </th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wide">
                        Institution
                      </th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wide text-right">
                        KPI Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewLoading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-slate-500 font-medium">Loading preview data...</p>
                          </div>
                        </td>
                      </tr>
                    ) : previewRows.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="p-4 bg-slate-100 rounded-full">
                              <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-slate-700">No data available</p>
                              <p className="text-xs text-slate-500 mt-1">Try refreshing or adjusting your filters</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      previewRows.map((row) => (
                        <tr 
                          key={row.no} 
                          className="group hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xs font-bold">
                              {row.no}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-slate-700">
                              {row.customer}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">
                              {row.institution}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <div className="flex-1 max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    row.kpiPercent >= 80 ? 'bg-green-500' :
                                    row.kpiPercent >= 50 ? 'bg-amber-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(row.kpiPercent, 100)}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-bold min-w-[48px] text-right ${
                                row.kpiPercent >= 80 ? 'text-green-600' :
                                row.kpiPercent >= 50 ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {row.kpiPercent}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {previewRows.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-800">
                  <span className="font-bold">💡 Tip:</span> The preview shows up to 50 records. The exported file will contain all matching data based on your selected filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReportWorkspace;
