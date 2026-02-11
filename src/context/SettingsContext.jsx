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
        // Ensure darkMode is properly preserved (could be true or false)
        const loadedSettings = { 
          ...defaultSettings, 
          ...parsed, 
          darkMode: typeof parsed.darkMode === 'boolean' ? parsed.darkMode : false 
        };
        console.log('🔧 Loaded settings from localStorage:', loadedSettings);
        return loadedSettings;
      } catch (error) {
        console.error('❌ Error parsing settings:', error);
        return defaultSettings;
      }
    }
    console.log('🆕 Using default settings:', defaultSettings);
    return defaultSettings;
  });

  // Apply/remove 'dark' class whenever darkMode setting changes (including initial mount)
  useEffect(() => {
    console.log('🔄 Dark mode state:', settings.darkMode);
    console.log('📊 Current HTML classes:', document.documentElement.className);
    
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      console.log('✅ Added dark class to <html>');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('✅ Removed dark class from <html>');
    }
    
    console.log('📊 Updated HTML classes:', document.documentElement.className);
    
    // Also save to localStorage on change
    localStorage.setItem('appSettings', JSON.stringify(settings));
    console.log('💾 Saved to localStorage:', settings);
  }, [settings.darkMode]); // Only depend on darkMode, not entire settings object

  // Update a single setting
  const updateSetting = (key, value) => {
    console.log(`🔧 updateSetting called: ${key} = ${value}`);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Toggle a boolean setting
  const toggleSetting = (key) => {
    setSettings(prev => {
      const newValue = !prev[key];
      console.log(`🔄 toggleSetting: ${key} changed from ${prev[key]} to ${newValue}`);
      return { ...prev, [key]: newValue };
    });
  };

  // Reset to defaults
  const resetSettings = () => {
    console.log('🔄 Resetting settings to defaults');
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
