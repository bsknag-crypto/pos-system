
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Sale, Salesman } from '../types';

interface AnalyticsProps {
  sales: Sale[];
  salesmen: Salesman[];
}

const Analytics: React.FC<AnalyticsProps> = ({ sales, salesmen }) => {
  const totalRevenue = sales.reduce((a, b) => a + b.total, 0);
  const totalProfit = sales.reduce((a, b) => a + b.profit, 0);
  const totalItems = sales.reduce((a, b) => a + b.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  
  // Calculate revenue per salesman
  const salesmanData = salesmen.map(s => {
    const sSales = sales.filter(sale => sale.salesmanId === s.id);
    return {
      name: s.name,
      revenue: sSales.reduce((acc, sale) => acc + sale.total, 0),
      count: sSales.length
    };
  });

  const mockHourlyData = [
    { hour: '8 AM', amount: 1200 },
    { hour: '10 AM', amount: 4500 },
    { hour: '12 PM', amount: 8900 },
    { hour: '2 PM', amount: 6400 },
    { hour: '4 PM', amount: 11000 },
    { hour: '6 PM', amount: 13000 },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-black text-slate-800">Performance Center</h2>
        <p className="text-slate-500 font-medium">Monitoring store efficiency and team results</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue', value: `RS ${totalRevenue.toLocaleString()}`, color: 'bg-emerald-50 text-emerald-700', icon: '💰' },
          { label: 'Net Profit', value: `RS ${totalProfit.toLocaleString()}`, color: 'bg-blue-50 text-blue-700', icon: '📈' },
          { label: 'Inventory Out', value: totalItems.toLocaleString(), color: 'bg-purple-50 text-purple-700', icon: '📦' },
          { label: 'Transactions', value: sales.length, color: 'bg-slate-100 text-slate-700', icon: '🧾' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{m.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{m.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${m.color}`}>{m.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200">
           <h3 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.2em]">Salesman Performance</h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={salesmanData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200">
           <h3 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.2em]">Revenue Mix</h3>
           <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={salesmanData}
                            dataKey="revenue"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                        >
                            {salesmanData.map((_, index) => (
                                <Cell key={index} fill={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][index % 4]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
           </div>
           <div className="mt-4 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Ranking</p>
                <div className="mt-2 space-y-1">
                    {salesmanData.sort((a,b) => b.revenue - a.revenue).map((s, i) => (
                        <div key={i} className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">{i+1}. {s.name}</span>
                            <span className="text-slate-900">RS {s.revenue.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Full Transaction Log</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 tracking-widest">
                <tr>
                    <th className="px-6 py-4">Ref</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Salesman</th>
                    <th className="px-6 py-4">Profit</th>
                    <th className="px-6 py-4">Balance</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {sales.length > 0 ? sales.map(s => (
                    <tr key={s.id} className="text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">#{s.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-slate-900 font-black">RS {s.total}</td>
                    <td className="px-6 py-4 text-blue-600 uppercase tracking-tighter text-xs">
                        {salesmen.find(sm => sm.id === s.salesmanId)?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-emerald-600">RS {s.profit}</td>
                    <td className="px-6 py-4 text-slate-400">RS {s.changeDue}</td>
                    </tr>
                )) : (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest opacity-30">Waiting for first sale...</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
