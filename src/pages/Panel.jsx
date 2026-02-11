import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SalesWorkspace from '../components/SalesWorkspace';
import ProspectWorkspace from '../components/ProspectWorkspace';
import KPIWorkspace from '../components/KPIWorkspace';
import PanelHeader from '../components/PanelHeader';
import SettingWorkspace from '../components/SettingWorkspace';
import { useAuth } from '../context/AuthContext';
import ReportWorkspace from '../components/ReportWorkspace';
import ProductWorkspace from '../components/ProductWorkspace';

const Panel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PanelHeader 
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          activeTab={activeTab}
          user={user}
        />

        {/* Main Workspace */}
        {activeTab === 'sales' ? (
          <SalesWorkspace user={user} />
        ) : activeTab === 'laporan' ? (
          <ReportWorkspace user={user} />
        ) : activeTab === 'prospek' ? (
          <ProspectWorkspace user={user} />
        ) : activeTab === 'kpi' ? (
          <KPIWorkspace user={user} />
        ) : activeTab === 'pengaturan' ? (
          <SettingWorkspace 
            role={user?.role}
          />
        ) : activeTab === 'produk' ? (
          <ProductWorkspace user={user} />
        ) : (
          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-[calc(100vh-160px)] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-400 dark:text-slate-500 font-medium">Konten {activeTab} akan muncul di sini</p>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Mobile Overlay */}
      {!isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(true)}
        />
      )}
    </div>
  );
};

export default Panel;
