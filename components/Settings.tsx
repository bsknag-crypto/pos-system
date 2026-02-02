
import React, { useState } from 'react';
import { ShopSettings } from '../types';

interface SettingsProps {
  settings: ShopSettings;
  onUpdateSettings: (settings: ShopSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const [form, setForm] = useState<ShopSettings>({ ...settings });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
  };

  const inputClasses = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-300";

  return (
    <div className="space-y-10 pb-20 animate-fade-in max-w-4xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">System Settings</h2>
        </div>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] ml-4">Configuration & Print Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Legal Name</label>
            <input 
              className={inputClasses} 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. FreshFlow Retail"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
            <textarea 
              className={`${inputClasses} min-h-[80px]`}
              value={form.address} 
              onChange={e => setForm({ ...form, address: e.target.value })} 
              placeholder="Store location..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
              <input 
                className={inputClasses} 
                value={form.phone} 
                onChange={e => setForm({ ...form, phone: e.target.value })} 
                placeholder="+94 ..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
              <input 
                className={inputClasses} 
                value={form.website} 
                onChange={e => setForm({ ...form, website: e.target.value })} 
                placeholder="www.yoursite.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receipt Footer Message</label>
            <input 
              className={inputClasses} 
              value={form.receiptFooter} 
              onChange={e => setForm({ ...form, receiptFooter: e.target.value })} 
              placeholder="Thank you for shopping!"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-slate-100"
            >
              Apply Global Changes
            </button>
          </div>
        </form>

        {/* Real-time Receipt Preview */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Live Header Preview</h3>
          <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-slate-200 shadow-inner flex flex-col items-center justify-center font-mono text-[11px] leading-tight text-slate-800">
            <div className="w-full max-w-[200px] text-center space-y-1">
              <h1 className="text-lg font-bold uppercase tracking-tighter mb-2 break-words">{form.name || 'Store Name'}</h1>
              <p className="break-words">{form.address || 'Address Line'}</p>
              <p>Tel: {form.phone || '000-0000000'}</p>
              <p className="mt-4 pt-4 border-t border-slate-100 text-[10px] opacity-50">--------------------------------</p>
              <p className="italic mt-2">{form.website || 'www.freshflow.lk'}</p>
              <p className="font-bold mt-4 uppercase text-[9px] tracking-widest">{form.receiptFooter}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
            <div className="flex gap-4 items-start">
               <span className="text-2xl">💡</span>
               <div>
                  <h4 className="font-black text-blue-900 text-xs uppercase mb-1">Receipt Logic</h4>
                  <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                    Changes made here will be reflected instantly across all terminal sessions. Ensure the address matches your legal business registration for tax compliance.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
