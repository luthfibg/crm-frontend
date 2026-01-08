import React, { useState, useEffect, useCallback } from 'react';
import { SettingItem, SettingSection } from './SettingComponents';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext'; // Import useAuth di sini

const SettingWorkspace = ({ role = 'administrator' }) => {
  const { user, updateUser } = useAuth(); // Ambil langsung dari context
  const isAdmin = role === 'administrator';
  
  // Local state for UI-only settings
  const [localSettings, setLocalSettings] = useState({
    notifications: true,
    darkMode: false,
    autoAssign: true,
    auditLogs: true,
  });

  // State untuk loading status per toggle
  const [loadingStates, setLoadingStates] = useState({
    is_developer_mode: false,
    allow_force_push: false,
  });

  // Toggle untuk local UI-only settings
  const toggleLocal = (key) => {
    setLocalSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle untuk server-synced settings
  const handleServerToggle = useCallback(async (key) => {
    if (!user || loadingStates[key]) return;
    
    const currentValue = Boolean(user[key]);
    const newValue = !currentValue;
    
    console.log(`Toggling ${key}: ${currentValue} -> ${newValue}`);
    
    // Set loading state
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    
    try {
      // Optimistic update langsung ke context
      const updatedUser = { ...user, [key]: newValue };
      updateUser(updatedUser);
      
      // Kirim ke server
      await api.patch('/user/update-settings', { 
        [key]: newValue ? 1 : 0 // Pastikan format boolean ke integer
      });
      
      console.log(`${key} updated successfully on server`);
      
      // Fetch fresh data untuk memastikan sinkronisasi
      setTimeout(async () => {
        try {
          const userResponse = await api.get(`/users/${user.id}`);
          console.log('Verified user data:', userResponse.data);
          
          // Update dengan data terbaru dari server
          if (userResponse.data) {
            updateUser(userResponse.data);
          }
        } catch (fetchError) {
          console.error('Error verifying update:', fetchError);
        }
      }, 500);
      
    } catch (err) {
      console.error('API Error:', err);
      console.error('Response:', err.response?.data);
      
      // Rollback ke nilai sebelumnya
      const rollbackUser = { ...user, [key]: currentValue };
      updateUser(rollbackUser);
      
      alert(`Gagal memperbarui pengaturan: ${err.response?.data?.message || err.message}`);
    } finally {
      // Reset loading state
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, [user, updateUser, loadingStates]);

  // Debug log untuk memantau perubahan
  useEffect(() => {
    console.log('Current user developer mode:', user?.is_developer_mode);
    console.log('Current user allow_force_push:', user?.allow_force_push);
  }, [user]);

  // Perbaikan: Gunakan langsung dari user, bukan state terpisah
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
        {isAdmin && user && (
          <SettingSection title="Developer Tools" showHeader={true}>
            <SettingItem
              title="Developer Mode"
              description="Aktifkan fitur reset data prospek dan debugging langsung di dashboard."
              enabled={Boolean(user.is_developer_mode)}
              danger={true}
              onChange={() => handleServerToggle('is_developer_mode')}
              loading={loadingStates.is_developer_mode}
            />
            <SettingItem
              title="Allow Force Push"
              description="Mengizinkan bypass validasi sistem saat melakukan update data sensitif."
              enabled={Boolean(user.allow_force_push)}
              onChange={() => handleServerToggle('allow_force_push')}
              loading={loadingStates.allow_force_push}
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