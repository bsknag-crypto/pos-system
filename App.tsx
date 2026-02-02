
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import PosTerminal from './components/PosTerminal';
import Analytics from './components/Analytics';
import Inventory from './components/Inventory';
import StaffManagement from './components/StaffManagement';
import Settings from './components/Settings';
import Login from './components/Login';
import { View, Sale, CartItem, Product, Customer, Salesman, AuthUser, ShopSettings } from './types';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_SALESMEN } from './constants';

// Keys for localStorage
const DB_KEYS = {
  PRODUCTS: 'ff_db_products',
  CUSTOMERS: 'ff_db_customers',
  SALESMEN: 'ff_db_salesmen',
  SALES_HISTORY: 'ff_db_sales_history',
  SETTINGS: 'ff_db_settings'
};

const App: React.FC = () => {
  // Database hydration logic
  const loadFromDb = <T,>(key: string, defaultValue: T): T => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  };

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [activeView, setActiveView] = useState<View>(View.TERMINAL);
  const [isDbReady, setIsDbReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // State initialized from "Database" (localStorage)
  const [products, setProducts] = useState<Product[]>(() => loadFromDb(DB_KEYS.PRODUCTS, MOCK_PRODUCTS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromDb(DB_KEYS.CUSTOMERS, MOCK_CUSTOMERS));
  const [salesmen, setSalesmen] = useState<Salesman[]>(() => loadFromDb(DB_KEYS.SALESMEN, MOCK_SALESMEN));
  const [salesHistory, setSalesHistory] = useState<Sale[]>(() => loadFromDb(DB_KEYS.SALES_HISTORY, []));
  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => loadFromDb(DB_KEYS.SETTINGS, {
    name: 'FreshFlow Retail',
    address: '123 Grocery Lane, Colombo 07',
    phone: '+94 11 2345678',
    website: 'www.freshflow.lk',
    receiptFooter: 'THANK YOU FOR SHOPPING!'
  }));

  const [showNotification, setShowNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Sync state to Database whenever it changes
  useEffect(() => {
    if (!isDbReady) {
      setIsDbReady(true);
      return;
    }

    setIsSyncing(true);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(customers));
    localStorage.setItem(DB_KEYS.SALESMEN, JSON.stringify(salesmen));
    localStorage.setItem(DB_KEYS.SALES_HISTORY, JSON.stringify(salesHistory));
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(shopSettings));
    
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [products, customers, salesmen, salesHistory, shopSettings, isDbReady]);

  const handleCheckout = (items: CartItem[], total: number, amountGiven: number, salesmanId: string, customerId?: string) => {
    const saleProfit = items.reduce((acc, item) => acc + (item.price - item.costPrice) * item.quantity, 0);

    setProducts(prevProducts => 
      prevProducts.map(product => {
        const purchasedItem = items.find(item => item.id === product.id);
        if (purchasedItem) return { ...product, stock: Math.max(0, product.stock - purchasedItem.quantity) };
        return product;
      })
    );

    if (customerId) {
      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, points: c.points + Math.floor(total * 0.01) } : c
      ));
    }

    const changeDue = amountGiven - total;
    const newSale: Sale = {
      id: Math.random().toString(36).substring(7).toUpperCase(),
      timestamp: Date.now(),
      items: [...items],
      total,
      amountGiven,
      changeDue: Math.max(0, changeDue),
      profit: saleProfit,
      salesmanId,
      customerId,
      paymentMethod: 'Cash' 
    };

    setSalesHistory(prev => [newSale, ...prev]);
    setShowNotification({ message: `Sale Recorded. Change: RS ${newSale.changeDue}`, type: 'success' });
  };

  const handleAddSalesman = (name: string, code: string) => {
    const s: Salesman = { id: Math.random().toString(36).substring(7), name, code };
    setSalesmen(prev => [...prev, s]);
    setShowNotification({ message: `Staff profile for ${name} created`, type: 'success' });
  };

  const handleUpdateSalesman = (s: Salesman) => {
    setSalesmen(prev => prev.map(item => item.id === s.id ? s : item));
    setShowNotification({ message: `Profile updated: ${s.name}`, type: 'success' });
  };

  const handleDeleteSalesman = (id: string) => {
    setSalesmen(prev => prev.filter(s => s.id !== id));
    setShowNotification({ message: `Staff profile removed`, type: 'error' });
  };

  const handleLogout = () => {
    setAuthUser(null);
    setActiveView(View.TERMINAL);
  };

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  if (!authUser) {
    return <Login salesmen={salesmen} onLogin={setAuthUser} onRegisterSalesman={handleAddSalesman} />;
  }

  const renderView = () => {
    switch (activeView) {
      case View.TERMINAL: 
        return (
          <PosTerminal 
            products={products} 
            customers={customers} 
            salesmen={salesmen} 
            shopSettings={shopSettings}
            onCheckout={handleCheckout} 
            onAddCustomer={(c) => setCustomers(p => [...p, c])}
            onAddSalesman={handleAddSalesman}
            enforceSalesman={authUser.role === 'SALESMAN' ? authUser.profile : undefined}
          />
        );
      case View.ANALYTICS: 
        return <Analytics sales={salesHistory} salesmen={salesmen} />;
      case View.STAFF:
        return <StaffManagement salesmen={salesmen} onAddSalesman={handleAddSalesman} onUpdateSalesman={handleUpdateSalesman} onDeleteSalesman={handleDeleteSalesman} />;
      case View.INVENTORY: 
        return <Inventory products={products} onAddProduct={(p) => setProducts(prev => [p, ...prev])} onUpdateProduct={(p) => setProducts(prev => prev.map(i => i.id === p.id ? p : i))} onDeleteProduct={(id) => setProducts(prev => prev.filter(p => p.id !== id))} />;
      case View.SETTINGS:
        return <Settings settings={shopSettings} onUpdateSettings={(s) => { setShopSettings(s); setShowNotification({ message: 'Global settings updated', type: 'success' }); }} />;
      default: 
        return <PosTerminal products={products} customers={customers} salesmen={salesmen} shopSettings={shopSettings} onCheckout={handleCheckout} onAddCustomer={(c) => setCustomers(p => [...p, c])} onAddSalesman={handleAddSalesman} />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      setView={setActiveView} 
      userRole={authUser.role} 
      onLogout={handleLogout}
      isSyncing={isSyncing}
    >
      {renderView()}
      {showNotification && (
        <div className="fixed bottom-10 right-10 px-8 py-5 rounded-[2rem] shadow-2xl bg-slate-900 text-white flex items-center gap-4 z-50 border border-slate-700 animate-slide-up">
          <span className="text-2xl">{showNotification.type === 'success' ? '🚀' : '⚠️'}</span>
          <span className="font-black uppercase tracking-tight">{showNotification.message}</span>
        </div>
      )}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </Layout>
  );
};

export default App;
