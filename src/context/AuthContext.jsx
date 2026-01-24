import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Ambil data user dari localStorage saat pertama kali load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('User loaded from localStorage:', parsedUser);
      setUser(parsedUser);
    }
  }, []);

  const login = (userData, userToken) => {
    console.log('🔐 Login function called with:', { userData, tokenLength: userToken?.length });
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('💾 Data saved to localStorage');
  };

  // Function to update user and sync with localStorage
  const updateUser = (updatedUserData) => {
    console.log('Updating user in context:', updatedUserData);
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const logout = async () => {
    try {
      await api.post('/logout'); 
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,        // Keep original setUser
      updateUser,     // Add new updateUser
      token, 
      login, 
      logout, 
      isAdmin: user?.role === 'administrator' 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  
  return context;
}