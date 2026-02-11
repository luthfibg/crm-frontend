import React from 'react';

export const SettingItem = ({ title, description, enabled, onChange, danger = false, loading = false }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex flex-col gap-0.5 pr-4">
      <span className={`text-sm font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
        {title}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
          enabled 
            ? danger ? 'bg-red-600' : 'bg-blue-600' 
            : 'bg-slate-300 dark:bg-slate-600'
        } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export const SettingSection = ({ title, children, showHeader }) => (
  <div className="mb-8">
    {showHeader && (
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </h3>
      </div>
    )}
    <div className="divide-y divide-slate-100 dark:divide-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6">
      {children}
    </div>
  </div>
);