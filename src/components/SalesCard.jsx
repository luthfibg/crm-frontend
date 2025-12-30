import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { User02Icon, Calendar02Icon, Money01Icon } from '@hugeicons/core-free-icons';

const formatCurrency = (v) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);

export default function SalesCard({ sale }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <HugeiconsIcon icon={User02Icon} size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-slate-800 truncate">{sale.title}</h3>
              <span className="text-xs text-slate-400">• {sale.stage}</span>
            </div>
            <p className="text-xs text-slate-500 truncate">{sale.client}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800">{formatCurrency(sale.value)}</div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <HugeiconsIcon icon={Money01Icon} size={14} />
              <span>{sale.probability}%</span>
            </div>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="text-sm text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-md bg-indigo-50"
            aria-expanded={open}
          >
            {open ? 'Collapse' : 'Details'}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Progress</span>
          <span className="text-xs font-medium text-slate-700">{sale.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-2 bg-linear-to-r from-indigo-500 to-cyan-400"
            style={{ width: `${sale.progress}%` }}
          />
        </div>
      </div>

      {open && (
        <div className="mt-4 border-t border-slate-100 pt-3 space-y-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Calendar02Icon} size={16} />
            <span>Expected close: {sale.expectedClose}</span>
          </div>

          <div className="space-y-2">
            {sale.stages.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs text-slate-700">{s.name}</div>
                  <div className="text-xs text-slate-400 truncate">{s.note}</div>
                </div>
                <div className="w-36 ml-4">
                  <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 ${s.progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                      style={{ width: `${s.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}