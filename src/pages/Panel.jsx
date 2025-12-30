import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SalesWorkspace from '../components/SalesWorkspace';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, Notification03Icon, UserCircleIcon } from '@hugeicons/core-free-icons';

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
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <HugeiconsIcon icon={Menu01Icon} size={24} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <HugeiconsIcon icon={Notification03Icon} size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button className="flex items-center gap-2 p-1 pr-3 hover:bg-slate-50 rounded-full transition-all">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <HugeiconsIcon icon={UserCircleIcon} size={24} />
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin User</span>
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        {activeTab === 'sales' ? (
          <SalesWorkspace />
        ) : (
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
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
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"          onClick={() => setIsOpen(true)}
        />
      )}
    </div>
  );
};export default Panel;