import React from 'react';

export const SettingItem = ({ title, description, enabled, onChange, danger = false }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex flex-col gap-0.5 pr-4">
      <span className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-slate-900'}`}>
        {title}
      </span>
      <span className="text-xs text-slate-500">{description}</span>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? (danger ? 'bg-red-600' : 'bg-blue-600') : 'bg-slate-200'
      }`}
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
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </h3>
      </div>
    )}
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-6">
      {children}
    </div>
  </div>
);