import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import './index.css'
import Panel from './pages/Panel'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import ProtectedRoutes from './components/ProtectedRoutes'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/app" element={<App />} />

            <Route path="/panel" element={
              <ProtectedRoutes>
                <Panel />
              </ProtectedRoutes>
            } />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </SettingsProvider>
  </React.StrictMode>
)