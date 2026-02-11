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
        // Ensure darkMode is boolean and default is false
        return { ...defaultSettings, ...parsed, darkMode: !!parsed.darkMode };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    // Apply dark mode to document
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Update a single setting
  const updateSetting = (key, value) => {
    setSettings(prev => {
      // If updating darkMode, update document class immediately
      if (key === 'darkMode') {
        if (value) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { ...prev, [key]: value };
    });
  };

  // Toggle a boolean setting
  const toggleSetting = (key) => {
    setSettings(prev => {
      const newValue = !prev[key];
      // If toggling darkMode, update document class immediately
      if (key === 'darkMode') {
        if (newValue) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { ...prev, [key]: newValue };
    });
  };

  // Reset to defaults
  const resetSettings = () => {
    setSettings(() => {
      document.documentElement.classList.remove('dark');
      return defaultSettings;
    });
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
