import React, { useState, useEffect, useRef } from 'react';
import { SettingItem, SettingSection } from './SettingComponents';
import api from '../api/axios';

const SettingWorkspace = ({ user, updateUser, role = 'administrator' }) => {
  const isAdmin = role === 'administrator';
  const isUpdating = useRef(false); // Track if we're in the middle of an update

  // Local state for UI-only settings
  const [localSettings, setLocalSettings] = useState({
    notifications: true,
    darkMode: false,
    autoAssign: true,
    auditLogs: true,
  });

  // Server-synced settings
  const [serverSettings, setServerSettings] = useState({
    is_developer_mode: user?.is_developer_mode || false,
    allow_force_push: user?.allow_force_push || false,
  });

  // Sync server settings when user prop changes (but not during our own updates)
  useEffect(() => {
    if (user && !isUpdating.current) {
      console.log('Syncing settings from user prop:', user);
      setServerSettings({
        is_developer_mode: Boolean(user.is_developer_mode),
        allow_force_push: Boolean(user.allow_force_push),
      });
    }
  }, [user]);

  // Toggle for local UI-only settings
  const toggleLocal = (key) => {
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle for server-synced settings
  const handleServerToggle = async (key) => {
    const newValue = !serverSettings[key];
    
    // Set flag to prevent sync loop
    isUpdating.current = true;
    
    // Optimistic update
    setServerSettings(prev => ({ ...prev, [key]: newValue }));
    
    try {
      await api.patch('/user/update-settings', { [key]: newValue });
      console.log(`${key} updated successfully`);
      
      // Fetch fresh user data
      if (user?.id) {
        const userResponse = await api.get(`/users/${user.id}`);
        console.log('Fetched updated user:', userResponse.data);
        
        // Update parent context
        if (updateUser && userResponse.data) {
          updateUser(userResponse.data);
        }
      }
      
    } catch (err) {
      console.error('API Error:', err);
      console.error('Response:', err.response?.data);
      
      // Rollback on error
      setServerSettings(prev => ({ ...prev, [key]: !newValue }));
      alert(`Gagal memperbarui pengaturan: ${err.response?.data?.message || err.message}`);
    } finally {
      // Reset flag after a short delay to allow context update to propagate
      setTimeout(() => {
        isUpdating.current = false;
      }, 100);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50">
      <div className="w-full mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Workspace Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal preferences and workspace configurations.
          </p>
        </header>

        {/* DEVELOPER MODE SECTION */}
        {isAdmin && (
          <SettingSection title="Developer Tools" showHeader={true}>
            <SettingItem
              title="Developer Mode"
              description="Aktifkan fitur reset data prospek dan debugging langsung di dashboard."
              enabled={serverSettings.is_developer_mode}
              danger={true}
              onChange={() => handleServerToggle('is_developer_mode')}
            />
            <SettingItem
              title="Allow Force Push"
              description="Mengizinkan bypass validasi sistem saat melakukan update data sensitif."
              enabled={serverSettings.allow_force_push}
              onChange={() => handleServerToggle('allow_force_push')}
            />
          </SettingSection>
        )}

        {/* Admin Specific Settings */}
        {isAdmin && (
          <SettingSection title="Administrator Settings" showHeader={true}>
            <SettingItem
              title="Automatic Lead Assignment"
              description="Automatically distribute incoming leads to active sales representatives."
              enabled={localSettings.autoAssign}
              onChange={() => toggleLocal('autoAssign')}
            />
            <SettingItem
              title="System Audit Logs"
              description="Record all user actions for security and compliance tracking."
              enabled={localSettings.auditLogs}
              onChange={() => toggleLocal('auditLogs')}
            />
          </SettingSection>
        )}

        {/* Regular Settings */}
        <SettingSection title="General Settings" showHeader={true}>
          <SettingItem
            title="Email Notifications"
            description="Receive daily summaries and activity alerts via email."
            enabled={localSettings.notifications}
            onChange={() => toggleLocal('notifications')}
          />
          <SettingItem
            title="Dark Interface"
            description="Switch to a dark-themed workspace layout to reduce eye strain."
            enabled={localSettings.darkMode}
            onChange={() => toggleLocal('darkMode')}
          />
        </SettingSection>

        {/* Action Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <button 
            onClick={() => {
              setLocalSettings({
                notifications: true,
                darkMode: false,
                autoAssign: true,
                auditLogs: true,
              });
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Reset to defaults
          </button>
          <button 
            onClick={() => {
              console.log('Saving local settings:', localSettings);
              alert('Local settings saved (UI only)');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
};

export default SettingWorkspace;