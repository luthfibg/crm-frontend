import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

// Default settings
const defaultSettings = {
  afterSalesCardStyle: 'compact', // 'compact' or 'full'
  darkMode: false,
  notifications: true,
  autoAssign: true,
  auditLogs: true,
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure darkMode is boolean, default to false if not set
        return { ...defaultSettings, ...parsed, darkMode: parsed.darkMode || false };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Apply/remove 'dark' class whenever darkMode setting changes
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Also save to localStorage on change
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // Update a single setting
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Toggle a boolean setting
  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      toggleSetting,
      resetSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
