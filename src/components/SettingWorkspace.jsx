import React, { useState } from 'react';

const SettingItem = ({ title, description, enabled, onChange }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-slate-900">{title}</span>
      <span className="text-xs text-slate-500">{description}</span>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-blue-600' : 'bg-slate-200'
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

const SettingSection = ({ title, children, showHeader }) => (
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

const SettingWorkspace = ({ role = 'administrator' }) => {
    const isAdmin = role === 'administrator';

    // Dummy State
    const [settings, setSettings] = useState({
        is_developer_mode: user.is_developer_mode,
        allow_force_push: user.allow_force_push,
        notifications: true,
        pushAlerts: false,
        darkMode: false,
        publicProfile: true,
        autoAssign: true,
        auditLogs: true,
        enforce2FA: false,
        apiAccess: true,
    });

    const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleToggle = async (key) => {
        const newValue = !settings[key];
        try {
            await api.patch('/user/update-settings', { [key]: newValue });
            setSettings(prev => ({ ...prev, [key]: newValue }));
            // Update global context jika perlu
        } catch (err) {
            alert("Gagal update setting");
        }
    };

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50">
      <div className="w-full mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Workspace Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal preferences and workspace configurations.
          </p>
        </header>

        {/* Admin Specific Settings */}
        {isAdmin && (
          <SettingSection title="Administrator Settings" showHeader={isAdmin}>
            <SettingItem
              title="Automatic Lead Assignment"
              description="Automatically distribute incoming leads to active sales representatives."
              enabled={settings.autoAssign}
              onChange={() => toggle('autoAssign')}
            />
            <SettingItem
              title="System Audit Logs"
              description="Record all user actions for security and compliance tracking."
              enabled={settings.auditLogs}
              onChange={() => toggle('auditLogs')}
            />
            <SettingItem
              title="Enforce 2FA"
              description="Require two-factor authentication for all workspace members."
              enabled={settings.enforce2FA}
              onChange={() => toggle('enforce2FA')}
            />
            <SettingItem
              title="Global API Access"
              description="Enable or disable third-party integration capabilities for the team."
              enabled={settings.apiAccess}
              onChange={() => toggle('apiAccess')}
            />
          </SettingSection>
        )}

        {/* Regular Settings */}
        <SettingSection title="General Settings" showHeader={isAdmin}>
          <SettingItem
            title="Email Notifications"
            description="Receive daily summaries and activity alerts via email."
            enabled={settings.notifications}
            onChange={() => toggle('notifications')}
          />
          <SettingItem
            title="Desktop Push Alerts"
            description="Show real-time notifications on your desktop even when the app is closed."
            enabled={settings.pushAlerts}
            onChange={() => toggle('pushAlerts')}
          />
          <SettingItem
            title="Dark Interface"
            description="Switch to a dark-themed workspace layout to reduce eye strain."
            enabled={settings.darkMode}
            onChange={() => toggle('darkMode')}
          />
          <SettingItem
            title="Public Profile Visibility"
            description="Allow other team members to see your activity status and contact info."
            enabled={settings.publicProfile}
            onChange={() => toggle('publicProfile')}
          />
        </SettingSection>

        {/* Action Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            Reset to defaults
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
};

export default SettingWorkspace;