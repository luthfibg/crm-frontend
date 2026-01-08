// src/components/ReportWorkspace.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios'; // sesuaikan dengan path API wrapper Anda

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
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Report Workspace</h2>
            <div className="text-sm text-slate-500">Export per prospect • PDF / Excel (CSV) / Word</div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Range</label>
              <div className="flex gap-2">
                <button onClick={() => setRange('daily')} className={`px-3 py-1 rounded ${range==='daily' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>Daily</button>
                <button onClick={() => setRange('monthly')} className={`px-3 py-1 rounded ${range==='monthly' ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>Monthly</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Date / Month</label>
              {range === 'daily' ? (
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded" />
              ) : (
                <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full p-2 border rounded" />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full p-2 border rounded">
                <option value="pdf">PDF</option>
                <option value="excel">Excel (CSV)</option>
                <option value="word">Word (HTML)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-slate-500">Sales (optional)</label>
              {user?.role === 'administrator' ? (
                <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full p-2 border rounded">
                  <option value="">— all sales —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              ) : (
                <input type="text" value={user?.name || ''} disabled className="w-full p-2 border rounded bg-slate-50" />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500">&nbsp;</label>
              <div className="flex gap-2">
                <button onClick={fetchPreview} className="px-3 py-2 bg-slate-100 rounded">Refresh Preview</button>
                <button onClick={handleExport} className={`px-3 py-2 rounded ${loading ? 'bg-slate-200' : 'bg-amber-600 text-white'}`} disabled={loading}>
                  {loading ? 'Processing...' : `Export ${format.toUpperCase()}`}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {/* Preview table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">Preview (sample)</h3>
              <div className="text-xs text-slate-400">Data: Customers & KPI progress (latest)</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-2 text-left border">No</th>
                    <th className="p-2 text-left border">Customer</th>
                    <th className="p-2 text-left border">Institution</th>
                    <th className="p-2 text-left border">KPI %</th>
                  </tr>
                </thead>
                <tbody>
                  {previewLoading ? (
                    <tr><td colSpan="4" className="p-3 text-center">Loading…</td></tr>
                  ) : previewRows.length === 0 ? (
                    <tr><td colSpan="4" className="p-3 text-center">No data</td></tr>
                  ) : previewRows.map(r => (
                    <tr key={r.no}>
                      <td className="p-2 border">{r.no}</td>
                      <td className="p-2 border">{r.customer}</td>
                      <td className="p-2 border">{r.institution}</td>
                      <td className="p-2 border">{r.kpiPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Tip: Untuk PDF yang rapi, pasang package <strong>barryvdh/laravel-dompdf</strong> di backend. Untuk Excel (.xlsx) gunakan <strong>maatwebsite/excel</strong>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReportWorkspace;