import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SalesWorkspace from '../components/SalesWorkspace';
import ProspectWorkspace from '../components/ProspectWorkspace';
import KPIWorkspace from '../components/KPIWorkspace';
import PanelHeader from '../components/PanelHeader'; // ← Import component baru

const Panel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ← Gunakan PanelHeader component */}
        <PanelHeader 
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          activeTab={activeTab}
        />

        {/* Main Workspace */}
        {activeTab === 'sales' ? (
          <SalesWorkspace />
        ) : activeTab === 'prospek' ? (
          <ProspectWorkspace />
        ) : activeTab === 'kpi' ? (
          <KPIWorkspace />
        ) : (
          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 h-[calc(100vh-160px)] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-400 font-medium">Konten {activeTab} akan muncul di sini</p>
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