import React, { useState, useEffect, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings02Icon } from '@hugeicons/core-free-icons';
import { SettingItem, SettingSection } from './SettingComponents';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const SettingWorkspace = ({ role = 'administrator' }) => {
  const { user, updateUser } = useAuth();
  const { settings, toggleSetting, updateSetting, resetSettings } = useSettings();
  const isAdmin = role === 'administrator';

  // State untuk loading status per toggle
  const [loadingStates, setLoadingStates] = useState({
    is_developer_mode: false,
    allow_force_push: false,
  });

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
    <main className="flex-1 overflow-hidden p-4 lg:p-6 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="h-full overflow-y-auto">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-linear-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-900/20 dark:to-purple-900/10 rounded-t-xl -mx-6 -mt-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                <HugeiconsIcon icon={Settings02Icon} className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Workspace Settings</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Kelola preferensi personal dan konfigurasi workspace Anda.
                </p>
              </div>
            </div>
          </div>
        </div>

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
              enabled={settings.autoAssign}
              onChange={() => toggleSetting('autoAssign')}
            />
            <SettingItem
              title="System Audit Logs"
              description="Record all user actions for security and compliance tracking."
              enabled={settings.auditLogs}
              onChange={() => toggleSetting('auditLogs')}
            />
          </SettingSection>
        )}

        {/* Regular Settings */}
        <SettingSection title="General Settings" showHeader={true}>
          <SettingItem
            title="After Sales Card Style"
            description="Gunakan kartu compact (slim) untuk kolom After Sales agar lebih hemat ruang."
            enabled={settings.afterSalesCardStyle === 'compact'}
            onChange={() => updateSetting('afterSalesCardStyle', settings.afterSalesCardStyle === 'compact' ? 'full' : 'compact')}
          />
          <SettingItem
            title="Dark Interface"
            description="Aktifkan tema gelap untuk mengurangi kelelahan mata."
            enabled={settings.darkMode}
            onChange={() => toggleSetting('darkMode')}
          />
        </SettingSection>

        {/* Action Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <button 
            onClick={() => {
              resetSettings();
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Reset to defaults
          </button>
          <button 
            onClick={() => {
              console.log('Current settings:', settings);
              alert('Settings tersimpan otomatis!');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </main>
  );
};

export default SettingWorkspace;