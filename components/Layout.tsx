
import React from 'react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setView: (view: View) => void;
  userRole: 'ADMIN' | 'SALESMAN';
  onLogout: () => void;
  isSyncing?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, userRole, onLogout, isSyncing }) => {
  const allNavItems = [
    { id: View.TERMINAL, icon: '🛒', label: 'POS Terminal', roles: ['ADMIN', 'SALESMAN'] },
    { id: View.INVENTORY, icon: '📦', label: 'Inventory', roles: ['ADMIN'] },
    { id: View.STAFF, icon: '👥', label: 'Staff Hub', roles: ['ADMIN'] },
    { id: View.ANALYTICS, icon: '📊', label: 'Analytics', roles: ['ADMIN'] },
    { id: View.SETTINGS, icon: '⚙️', label: 'Settings', roles: ['ADMIN'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-8">
          <h1 className="text-2xl font-black text-emerald-600 flex items-center gap-2 tracking-tighter">
            <span className="text-3xl">🥬</span> FreshFlow
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">DB: Cloud Connected</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${
                activeView === item.id
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 border border-emerald-500'
                  : 'text-slate-500 hover:bg-slate-50 font-bold'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-black text-xs uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-3">
          {isSyncing && (
             <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Saving to Cloud</span>
             </div>
          )}
          
          <div className="bg-slate-900 text-white rounded-[2rem] p-5 shadow-lg relative overflow-hidden group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{userRole} MODE</p>
            <p className="text-sm font-black truncate">Secure Session</p>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 -rotate-45 translate-x-8 -translate-y-8 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform"></div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
          >
            End Shift
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h1 className="text-xl font-black text-emerald-600">FreshFlow</h1>
          <button onClick={onLogout} className="text-xs font-black text-red-500 uppercase">Shift End</button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
