
import React, { useState } from 'react';
import { LogEntry } from '../types';

interface LogsProps {
  logs: LogEntry[];
}

const Logs: React.FC<LogsProps> = ({ logs }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'ALL' || log.type === filter;
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                          log.action.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getLogTypeStyles = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ERROR': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">System Activity Logs</h2>
          <p className="text-slate-500 font-medium">Audit trail of all administrative and terminal actions</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold text-xs">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Logging Live
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        {/* Filters Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {['ALL', 'SUCCESS', 'INFO', 'WARNING', 'ERROR'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                  filter === type 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search by action or message..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-6 py-5">Event Type</th>
                <th className="px-6 py-5">Action</th>
                <th className="px-6 py-5">Description</th>
                <th className="px-8 py-5 text-right">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-700">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${getLogTypeStyles(log.type)}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{log.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 max-w-md line-clamp-1 group-hover:line-clamp-none transition-all">
                        {log.message}
                      </p>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {log.user}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <span className="text-4xl mb-2">📜</span>
                      <p className="text-slate-500 font-bold">No log entries found matching your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex justify-between items-center">
          <span>Entries: {filteredLogs.length} of {logs.length}</span>
          <div className="flex gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-60"></span>
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-30"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
