
import React, { useState } from 'react';
import { Salesman } from '../types';

interface StaffManagementProps {
  salesmen: Salesman[];
  onUpdateSalesman: (salesman: Salesman) => void;
  onDeleteSalesman: (id: string) => void;
  onAddSalesman: (name: string, code: string) => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ salesmen, onUpdateSalesman, onDeleteSalesman, onAddSalesman }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', code: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', code: '' });

  const startEdit = (s: Salesman) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, code: s.code });
  };

  const handleSave = () => {
    if (editingId) {
      onUpdateSalesman({ id: editingId, ...editForm });
      setEditingId(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.code) return;
    onAddSalesman(newStaff.name, newStaff.code);
    setNewStaff({ name: '', code: '' });
    setShowAdd(false);
  };

  const inputClasses = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-800 outline-none focus:border-emerald-500 transition-all uppercase placeholder:text-slate-300";

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Staff Hub</h2>
          </div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] ml-4">Authorized Personnel Management</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)} 
          className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:bg-emerald-600 active:scale-95 shadow-2xl shadow-slate-200"
        >
          <span className="relative z-10">+ Register New Officer</span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Active Force</p>
          <p className="text-3xl font-black text-emerald-900">{salesmen.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Roles Assigned</p>
          <p className="text-3xl font-black text-blue-900">Standard Sales</p>
        </div>
        <div className="bg-slate-100 border border-slate-200 p-6 rounded-3xl">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Terminal Status</p>
          <p className="text-3xl font-black text-slate-700">Online</p>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {salesmen.map(s => (
          <div key={s.id} className="group bg-white p-1 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 border border-slate-100 relative">
            <div className="p-8">
              {editingId === s.id ? (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                    <input 
                      className={inputClasses} 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Officer Code</label>
                    <input 
                      className={inputClasses} 
                      value={editForm.code} 
                      onChange={e => setEditForm({...editForm, code: e.target.value})} 
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSave} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100">Save</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Exit</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-8">
                     <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-xl group-hover:bg-emerald-600 transition-colors duration-500">
                        {s.name.charAt(0)}
                     </div>
                     <div className="flex flex-col gap-2">
                        <button onClick={() => startEdit(s)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 flex items-center justify-center transition-all">✏️</button>
                        <button onClick={() => onDeleteSalesman(s.id)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">🗑️</button>
                     </div>
                  </div>
                  
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{s.name}</h3>
                     <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {s.code}</p>
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Authority</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Standard</span>
                     </div>
                     <div className="text-right">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Shift Log</span>
                        <span className="text-[10px] font-black text-slate-800 uppercase block">Terminal 01</span>
                     </div>
                  </div>
                  
                  {/* Visual ID Strip */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-[2.5rem] group-hover:bg-emerald-500 transition-colors overflow-hidden">
                    <div className="w-1/3 h-full bg-emerald-500 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000"></div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Empty Placeholder Card */}
        <button 
          onClick={() => setShowAdd(true)}
          className="border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center py-12 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
        >
          <span className="text-4xl mb-4 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all">➕</span>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] group-hover:text-emerald-600 transition-colors">Add New Profile</span>
        </button>
      </div>

      {/* Registration Modal Overlay */}
      {showAdd && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[500] flex items-center justify-center p-6 animate-fade-in">
            <form onSubmit={handleAddSubmit} className="bg-white w-full max-w-md p-12 rounded-[3.5rem] shadow-2xl border border-white/20">
               <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-emerald-600 text-white rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-emerald-200">👤</div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">New Enrollment</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnel Registration System</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Legal Full Name</label>
                    <input 
                      required 
                      className={inputClasses} 
                      value={newStaff.name} 
                      onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
                      placeholder="e.g. ARUNA PERERA"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Internal Officer Code</label>
                    <input 
                      required 
                      className={inputClasses} 
                      value={newStaff.code} 
                      onChange={e => setNewStaff({...newStaff, code: e.target.value})} 
                      placeholder="e.g. STF-001"
                    />
                  </div>
               </div>

               <div className="flex gap-4 pt-12">
                  <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95">Complete Setup</button>
                  <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Abort</button>
               </div>
            </form>
         </div>
      )}
    </div>
  );
};

export default StaffManagement;
