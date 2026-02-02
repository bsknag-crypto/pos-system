
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, CartItem, Category, Customer, Salesman, ShopSettings } from '../types';
import { getRecipeSuggestions } from '../services/gemini';

interface PosTerminalProps {
  products: Product[];
  customers: Customer[];
  salesmen: Salesman[];
  shopSettings: ShopSettings;
  onCheckout: (items: CartItem[], total: number, amountGiven: number, salesmanId: string, customerId?: string) => void;
  onAddCustomer: (customer: Customer) => void;
  onAddSalesman: (name: string, code: string) => void;
  enforceSalesman?: Salesman;
}

const PosTerminal: React.FC<PosTerminalProps> = ({ products, customers, salesmen, shopSettings, onCheckout, onAddCustomer, onAddSalesman, enforceSalesman }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');
  const [amountGiven, setAmountGiven] = useState<string>('');
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<string>(enforceSalesman?.id || salesmen[0]?.id || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  const [quickAddSearch, setQuickAddSearch] = useState('');
  const quickAddRef = useRef<HTMLInputElement>(null);

  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '' });

  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [aiRecipe, setAiRecipe] = useState<string | null>(null);
  
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastSale, setLastSale] = useState<{
    id: string;
    timestamp: number;
    items: CartItem[];
    total: number;
    given: number;
    change: number;
    profit: number;
    salesman: string;
    customer: string;
  } | null>(null);

  useEffect(() => {
    if (enforceSalesman) {
      setSelectedSalesmanId(enforceSalesman.id);
    }
  }, [enforceSalesman]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = filter === 'All' || p.category === filter;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, filter, search]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setLastSale(null);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setAiRecipe(null);
  };

  const handleQuickAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickAddSearch) {
      const match = products.find(p => 
        p.name.toLowerCase().includes(quickAddSearch.toLowerCase()) || 
        p.id.toLowerCase() === quickAddSearch.toLowerCase()
      );
      if (match) {
        addToCart(match);
        setQuickAddSearch('');
      }
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const masterProduct = products.find(p => p.id === productId);
        const maxStock = masterProduct ? masterProduct.stock : item.quantity;
        const newQty = Math.max(0, Math.min(item.quantity + delta, maxStock));
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleAiSuggestion = async () => {
    if (cart.length === 0) {
      setAiRecipe("Add items to your cart for recipe ideas!");
      return;
    }
    setIsRecipeLoading(true);
    try {
      const suggestion = await getRecipeSuggestions(cart.map(i => ({ name: i.name, quantity: i.quantity })));
      setAiRecipe(suggestion || "No suggestions available.");
    } catch (error) {
      console.error(error);
      setAiRecipe("AI Chef service unavailable.");
    } finally {
      setIsRecipeLoading(false);
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.phone) return;
    const customer: Customer = {
      id: 'c' + Date.now(),
      name: newCust.name,
      phone: newCust.phone,
      points: 0
    };
    onAddCustomer(customer);
    setIsAddingCustomer(false);
    setNewCust({ name: '', phone: '' });
    setSelectedCustomerId(customer.id);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const given = parseFloat(amountGiven) || 0;
  const changeDue = given > 0 ? given - total : 0;

  const handleCheckout = () => {
    if (cart.length === 0 || !selectedSalesmanId) return;
    const saleProfit = cart.reduce((acc, item) => acc + (item.price - item.costPrice) * item.quantity, 0);
    const salesman = salesmen.find(s => s.id === selectedSalesmanId)?.name || 'Unknown';
    const customer = customers.find(c => c.id === selectedCustomerId)?.name || 'Walk-in';
    const saleId = Math.random().toString(36).substring(2, 10).toUpperCase();

    const saleData = { 
      id: saleId,
      timestamp: Date.now(),
      items: [...cart],
      total, 
      given, 
      change: changeDue, 
      profit: saleProfit, 
      salesman, 
      customer 
    };

    setLastSale(saleData);
    onCheckout(cart, total, given, selectedSalesmanId, selectedCustomerId || undefined);
    setCart([]);
    setAmountGiven('');
    setSelectedCustomerId('');
  };

  const handlePrint = () => {
    window.print();
  };

  const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all";

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Product Browsing Area */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Visual product search..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full md:max-w-md">
            {['All', ...Object.values(Category)].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat as Category | 'All')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === cat ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto flex-1 pr-1">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              disabled={product.stock <= 0}
              onClick={() => addToCart(product)}
              className={`bg-white p-3 rounded-2xl border flex flex-col justify-between h-32 transition-all text-left shadow-sm ${
                product.stock <= 0 ? 'opacity-50 grayscale' : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 active:scale-95'
              }`}
            >
              <div>
                <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{product.category}</span>
                <h3 className="font-bold text-slate-800 text-xs leading-tight mt-1.5 line-clamp-2 uppercase">{product.name}</h3>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                   <p className="text-emerald-700 font-black text-sm">RS {product.price.toFixed(0)}</p>
                   <span className="text-[9px] text-slate-400 font-bold">Qty: {product.stock}</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shadow-sm">+</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Command Sidebar */}
      <div className="w-full lg:w-[480px] flex flex-col gap-4">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl flex-1 flex flex-col overflow-hidden relative">
          
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="font-black text-slate-900 text-2xl uppercase tracking-tighter">Receipt</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {enforceSalesman ? `Operator: ${enforceSalesman.name}` : 'Terminal 01'}
                </p>
              </div>
            </div>
            <button onClick={() => { setCart([]); setLastSale(null); }} className="px-4 py-1.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-100 transition-colors border border-red-100">Clear</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {lastSale ? (
              <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center px-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-lg border-2 border-white">✓</div>
                <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs mb-6">Success</h3>
                
                <div className="w-full space-y-4 bg-slate-900 p-6 rounded-[2rem] shadow-xl text-left border border-slate-700">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Grand Total</span>
                    <span className="text-white font-black text-3xl tracking-tighter">RS {lastSale.total.toFixed(0)}</span>
                  </div>
                  <div className="pt-4 space-y-2 border-t border-slate-800">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Received</span>
                      <span className="text-emerald-400 font-black">RS {lastSale.given.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl mt-2">
                      <span className="text-[10px] font-black text-blue-400 uppercase">Change Due</span>
                      <span className="text-2xl font-black text-blue-400">RS {lastSale.change.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full mt-8">
                  <button 
                    onClick={() => setShowPrintModal(true)}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
                  >
                    Print Receipt
                  </button>
                  <button 
                    onClick={() => setLastSale(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
                  >
                    New Order
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 py-8">
                <span className="text-7xl mb-4 grayscale opacity-20">📜</span>
                <p className="font-black uppercase tracking-[0.3em] text-[10px]">Empty Cart</p>
              </div>
            ) : (
              <div className="space-y-5">
                 <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <label className="text-[8px] font-black text-emerald-700 uppercase tracking-widest ml-1 mb-1 block">Scan / Quick Add</label>
                    <input 
                        ref={quickAddRef}
                        type="text"
                        className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-emerald-300"
                        placeholder="Type name or ID..."
                        value={quickAddSearch}
                        onChange={(e) => setQuickAddSearch(e.target.value)}
                        onKeyDown={handleQuickAdd}
                    />
                 </div>

                 <div className="space-y-3 pb-4 border-b border-slate-100">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center gap-4 animate-fade-in group">
                        <div className="flex-1">
                            <h4 className="text-xs font-black text-slate-800 uppercase leading-none group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">RS {item.price}</span>
                                <span className="w-0.5 h-0.5 bg-slate-200 rounded-full"></span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.quantity} {item.unit}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 font-black bg-white rounded shadow-sm">-</button>
                            <span className="text-[10px] font-black w-3 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-emerald-500 font-black bg-white rounded shadow-sm">+</button>
                        </div>
                        <p className="text-sm font-black text-slate-900 w-24 text-right">RS {(item.price * item.quantity).toFixed(0)}</p>
                        </div>
                    ))}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Salesman</label>
                        </div>
                        <select 
                            className={`${inputClasses} py-2 !text-xs ${enforceSalesman ? 'bg-slate-100 cursor-not-allowed text-slate-400' : ''}`}
                            value={selectedSalesmanId}
                            disabled={!!enforceSalesman}
                            onChange={(e) => setSelectedSalesmanId(e.target.value)}
                        >
                            {salesmen.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Customer</label>
                            <button onClick={() => setIsAddingCustomer(true)} className="text-[7px] font-black uppercase text-emerald-600 hover:underline">New</button>
                        </div>
                        <select 
                            className={`${inputClasses} py-2 !text-xs`}
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                        >
                            <option value="">Walk-in</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {!lastSale && cart.length > 0 && (
            <div className="p-4 bg-slate-900 text-white space-y-4 rounded-t-[2.5rem] border-t border-slate-700">
              <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-emerald-400 tracking-tighter">RS {total.toFixed(0)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Cash Received</label>
                    <div className="flex gap-1">
                        {[500, 1000, 5000].map(val => (
                            <button 
                                key={val} 
                                onClick={() => setAmountGiven(val.toString())}
                                className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-black hover:bg-slate-700 transition-colors"
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-2xl font-black text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner text-center"
                  value={amountGiven}
                  onChange={(e) => setAmountGiven(e.target.value)}
                />
              </div>

              {given > 0 && (
                <div className="flex justify-between items-center p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Balance</span>
                  <span className={`text-xl font-black ${changeDue < 0 ? 'text-red-500' : 'text-blue-400'}`}>
                    RS {changeDue.toFixed(0)}
                  </span>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || (given > 0 && changeDue < 0) || (given === 0 && cart.length > 0)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-black py-4 rounded-[1.5rem] shadow-xl transition-all text-base uppercase tracking-widest active:scale-95"
              >
                Complete Sale
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white border border-slate-200 p-3 rounded-[1.5rem] shadow-sm flex items-center gap-3 group cursor-pointer hover:border-emerald-300 transition-colors" onClick={handleAiSuggestion}>
           <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-lg group-hover:scale-105 transition-transform">✨</div>
           <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-[7px] font-black uppercase tracking-widest text-emerald-600">AI Chef</h3>
                    <span className="text-[6px] font-black bg-emerald-50 px-1 py-0.5 rounded uppercase">Tips</span>
                </div>
                <p className="text-[9px] font-medium leading-tight text-slate-500 line-clamp-1">
                    {isRecipeLoading ? 'Thinking...' : aiRecipe || 'Click for recipe ideas.'}
                </p>
           </div>
        </div>
      </div>

      {/* Customer Registration Modal */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <form onSubmit={handleCreateCustomer} className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
                <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Register Loyalty Member</h3>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
                        <input required className={inputClasses} value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} placeholder="Customer Name" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone Number</label>
                        <input required className={inputClasses} value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} placeholder="07XXXXXXXX" />
                    </div>
                </div>
                <div className="flex gap-4 pt-10">
                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700">Confirm</button>
                    <button type="button" onClick={() => setIsAddingCustomer(false)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-200">Cancel</button>
                </div>
            </form>
        </div>
      )}

      {/* Receipt Print Preview Modal */}
      {showPrintModal && lastSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Receipt Preview</h3>
               <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            {/* The Print Area */}
            <div className="p-8 bg-white font-mono text-slate-800 text-[11px] leading-tight space-y-4 print:p-0" id="print-area">
              <div className="text-center space-y-1">
                <h1 className="text-lg font-bold uppercase tracking-tighter">{shopSettings.name}</h1>
                <p className="whitespace-pre-wrap">{shopSettings.address}</p>
                <p>Tel: {shopSettings.phone}</p>
                <p>--------------------------------</p>
              </div>
              
              <div className="space-y-0.5">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(lastSale.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Receipt #:</span>
                  <span>{lastSale.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Salesman:</span>
                  <span>{lastSale.salesman}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{lastSale.customer}</span>
                </div>
              </div>
              
              <p>--------------------------------</p>
              
              <div className="space-y-1">
                {lastSale.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span className="uppercase">{item.name}</span>
                      <span>{item.price * item.quantity}.00</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 pl-2">
                      <span>{item.quantity} {item.unit} x {item.price}.00</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <p>--------------------------------</p>
              
              <div className="space-y-1 font-bold">
                <div className="flex justify-between text-sm">
                  <span>TOTAL:</span>
                  <span>RS {lastSale.total}.00</span>
                </div>
                <div className="flex justify-between font-normal">
                  <span>CASH RECEIVED:</span>
                  <span>RS {lastSale.given}.00</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span>CHANGE DUE:</span>
                  <span>RS {lastSale.change}.00</span>
                </div>
              </div>
              
              <p>--------------------------------</p>
              
              <div className="text-center space-y-1 pt-2">
                <p className="font-bold">{shopSettings.receiptFooter}</p>
                <p>Visit us at {shopSettings.website}</p>
                <p className="text-[9px]">FreshFlow POS v2.5</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
               <button 
                 onClick={handlePrint}
                 className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-emerald-600 transition-all"
               >
                 Execute Print
               </button>
               <button 
                 onClick={() => setShowPrintModal(false)}
                 className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles for Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm; /* Standard receipt width */
            margin: 0;
            padding: 5mm;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PosTerminal;
