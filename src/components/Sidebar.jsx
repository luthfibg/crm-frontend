import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  UserGroupIcon, 
  Target02Icon, 
  ChartPie, 
  Settings02Icon,
  Menu01Icon,
  DashboardSpeed02Icon,
  Logout01Icon 
} from '@hugeicons/core-free-icons';

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab }) => {
  const menus = [
    { id: 'sales', label: 'Tim Sales', icon: UserGroupIcon },
    { id: 'prospek', label: 'Prospek', icon: Target02Icon },
    { id: 'laporan', label: 'Laporan', icon: ChartPie },
    { id: 'kpi', label: 'KPI', icon: DashboardSpeed02Icon },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings02Icon },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out 
      ${isOpen ? 'w-64' : 'w-20'} lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-50">
          <div className="min-w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
          </div>
          {isOpen && <span className="ml-3 font-bold text-xl text-slate-800 truncate">CRM Pro</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {menus.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all group
                ${activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <HugeiconsIcon 
                icon={item.icon} 
                size={24} 
                variant={activeTab === item.id ? "solid" : "outline"}
                className="min-w-6"
              />
              {isOpen && <span className="ml-3 font-medium truncate">{item.label}</span>}
              {!isOpen && (
                <div className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-50">
          <button className="w-full flex items-center p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <HugeiconsIcon icon={Logout01Icon} size={24} />
            {isOpen && <span className="ml-3 font-medium">Keluar</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;