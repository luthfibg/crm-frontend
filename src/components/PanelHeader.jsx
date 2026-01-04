import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Menu01Icon, 
  Notification03Icon, 
  UserCircleIcon,
  Trophy,
  StarIcon,
  TrendingUp
} from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PanelHeader = ({ isOpen, setIsOpen, activeTab }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    level: 1,
    totalCustomers: 0,
    activeCustomers: 0
  });
  const [loading, setLoading] = useState(false);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id || !showDropdown) return;
      
      setLoading(true);
      try {
        const response = await api.get(`/users/${user.id}/stats`);
        setUserStats(response.data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user?.id, showDropdown]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getLevelInfo = (level) => {
    const levels = {
      1: { name: 'Rookie', color: 'text-slate-600', bg: 'bg-slate-100' },
      2: { name: 'Junior', color: 'text-blue-600', bg: 'bg-blue-100' },
      3: { name: 'Senior', color: 'text-purple-600', bg: 'bg-purple-100' },
      4: { name: 'Expert', color: 'text-amber-600', bg: 'bg-amber-100' },
      5: { name: 'Master', color: 'text-red-600', bg: 'bg-red-100' },
    };
    return levels[level] || levels[1];
  };

  const levelInfo = getLevelInfo(user?.level || 1);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 relative z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        >
          <HugeiconsIcon icon={Menu01Icon} size={24} />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 capitalize">
          {activeTab.replace('-', ' ')}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Button */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
          <HugeiconsIcon icon={Notification03Icon} size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 pr-3 hover:bg-slate-50 rounded-full transition-all"
          >
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
              {user ? getInitials(user.name) : <HugeiconsIcon icon={UserCircleIcon} size={24} />}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-slate-700 leading-tight">
                {user?.name || 'Loading...'}
              </span>
              <span className={`text-[10px] font-bold ${levelInfo.color} leading-tight`}>
                {levelInfo.name} • Lv.{user?.level || 1}
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              {/* Header with Gradient */}
              <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-white font-bold text-base mb-0.5">{user?.name}</p>
                    <p className="text-indigo-100 text-xs">{user?.email}</p>
                  </div>
                  <div className={`px-2 py-1 ${levelInfo.bg} ${levelInfo.color} text-[10px] font-black rounded-full`}>
                    Lv.{user?.level || 1}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {/* Total Points */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5 border border-white/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <HugeiconsIcon icon={Trophy} size={14} className="text-amber-300" />
                      <span className="text-[10px] font-bold text-white/90 uppercase tracking-wide">
                        Total Points
                      </span>
                    </div>
                    {loading ? (
                      <div className="h-6 w-16 bg-white/30 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-xl font-black text-white">
                        {userStats.totalPoints?.toFixed(1) || '0.0'}
                      </p>
                    )}
                  </div>

                  {/* Active Customers */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5 border border-white/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <HugeiconsIcon icon={TrendingUp} size={14} className="text-emerald-300" />
                      <span className="text-[10px] font-bold text-white/90 uppercase tracking-wide">
                        Customers
                      </span>
                    </div>
                    {loading ? (
                      <div className="h-6 w-12 bg-white/30 rounded animate-pulse"></div>
                    ) : (
                      <p className="text-xl font-black text-white">
                        {userStats.activeCustomers || 0}
                        <span className="text-sm font-medium text-white/70">
                          /{userStats.totalCustomers || 0}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to profile
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 transition-colors flex items-center gap-2 group"
                >
                  <HugeiconsIcon icon={UserCircleIcon} size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="font-medium">Profile Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to performance
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 transition-colors flex items-center gap-2 group"
                >
                  <HugeiconsIcon icon={Trophy} size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="font-medium">My Performance</span>
                </button>

                <div className="h-px bg-slate-200 my-2"></div>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>

              {/* Footer Info */}
              <div className="bg-slate-50 px-4 py-2 border-t border-slate-200">
                <p className="text-[10px] text-slate-500 text-center">
                  Member since {new Date(user?.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay untuk menutup dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default PanelHeader;