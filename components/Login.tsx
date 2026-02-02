
import React, { useState } from 'react';
import { Salesman, AuthUser } from '../types';

interface LoginProps {
  salesmen: Salesman[];
  onLogin: (user: AuthUser) => void;
  onRegisterSalesman: (name: string, code: string) => void;
}

const Login: React.FC<LoginProps> = ({ salesmen, onLogin, onRegisterSalesman }) => {
  const [mode, setMode] = useState<'SELECT' | 'ADMIN_AUTH' | 'REGISTER'>('SELECT');
  const [adminCode, setAdminCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === '1234') {
      onLogin({ role: 'ADMIN' });
    } else {
      alert('Invalid Admin Code');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newCode) {
      onRegisterSalesman(newName, newCode);
      setMode('SELECT');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding */}
        <div className="text-white space-y-6">
          <div className="flex items-center gap-4">
             <span className="text-6xl bg-emerald-500 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl">🥬</span>
             <div>
                <h1 className="text-5xl font-black tracking-tighter">FreshFlow</h1>
                <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs">Retail Ecosystem v2.5</p>
             </div>
          </div>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Empowering grocery retail with real-time stock control, loyalty tracking, and unified sales management.
          </p>
          <div className="flex gap-3">
             <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex-1">
                <span className="text-emerald-500 block font-black text-xl mb-1">99.9%</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Uptime</span>
             </div>
             <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex-1">
                <span className="text-emerald-500 block font-black text-xl mb-1">Fast</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Checkout</span>
             </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
          {mode === 'SELECT' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-white text-3xl font-black tracking-tight mb-2">Welcome Back</h2>
                <p className="text-slate-400 font-medium">Select your profile to start shift</p>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {salesmen.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onLogin({ role: 'SALESMAN', profile: s })}
                    className="w-full bg-white/5 hover:bg-emerald-500 text-white p-4 rounded-2xl flex items-center justify-between border border-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4 text-left">
                       <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs group-hover:bg-white/20">{s.name.charAt(0)}</span>
                       <div>
                          <p className="font-black text-sm uppercase">{s.name}</p>
                          <p className="text-[10px] text-slate-400 group-hover:text-white/70">{s.code}</p>
                       </div>
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <button onClick={() => setMode('REGISTER')} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all">Register New Profile</button>
                <button onClick={() => setMode('ADMIN_AUTH')} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest transition-all">Administrator Login</button>
              </div>
            </div>
          )}

          {mode === 'ADMIN_AUTH' && (
            <form onSubmit={handleAdminSubmit} className="space-y-8 animate-fade-in">
               <div>
                  <h2 className="text-white text-3xl font-black tracking-tight mb-2">Master Access</h2>
                  <p className="text-slate-400 font-medium">Enter system override code</p>
               </div>
               <input 
                  type="password" 
                  autoFocus
                  placeholder="••••"
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-3xl px-8 py-6 text-4xl text-center font-black text-emerald-500 outline-none focus:border-emerald-500 transition-all"
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value)}
               />
               <div className="flex gap-4">
                  <button type="submit" className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest">Verify</button>
                  <button type="button" onClick={() => setMode('SELECT')} className="px-6 py-4 bg-white/5 text-slate-400 rounded-2xl font-black uppercase hover:bg-white/10">Back</button>
               </div>
               <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">Default Demo Code: 1234</p>
            </form>
          )}

          {mode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-6 animate-fade-in">
               <div>
                  <h2 className="text-white text-3xl font-black tracking-tight mb-2">Staff Registration</h2>
                  <p className="text-slate-400 font-medium">Create your salesman profile</p>
               </div>
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
                    <input required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Sunil Perera" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Employee Code</label>
                    <input required className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="e.g. EMP400" />
                  </div>
               </div>
               <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest">Create Profile</button>
                  <button type="button" onClick={() => setMode('SELECT')} className="px-6 py-4 bg-white/5 text-slate-400 rounded-2xl font-black uppercase hover:bg-white/10">Cancel</button>
               </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
