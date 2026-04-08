
import React, { useState } from 'react';
import { 
  BarChart as BarIcon, 
  PieChart as PieIcon, 
  TrendingUp, 
  FileText, 
  Shield, 
  Users, 
  Globe, 
  Zap,
  ChevronRight,
  ArrowUpRight,
  Download,
  Filter,
  Search,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';

const PolicyAnalytics: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState('6m');

  const allocationData = [
    { name: 'Rural Infrastructure', value: 45, color: '#6366f1' },
    { name: 'Disease Surveillance', value: 25, color: '#10b981' },
    { name: 'Emergency Services', value: 20, color: '#ef4444' },
    { name: 'Digital Health', value: 10, color: '#f59e0b' },
  ];

  const trendData = [
    { month: 'Oct', rural: 42, urban: 65 },
    { month: 'Nov', rural: 45, urban: 62 },
    { month: 'Dec', rural: 52, urban: 58 },
    { month: 'Jan', rural: 58, urban: 55 },
    { month: 'Feb', rural: 65, urban: 52 },
    { month: 'Mar', rural: 72, urban: 48 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Database size={24} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">National Health Policy Analytics</h1>
            </div>
            <p className="text-slate-500 font-medium">Data-Driven Decision Support System • Public Health Resource Optimization</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
              <Download size={18} /> Export Report
            </button>
            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 flex items-center gap-2">
              <Shield size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Authorized Access Only</span>
            </div>
          </div>
        </header>

        {/* Policy Recommendations */}
        <div className="bg-indigo-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="text-indigo-400" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tight">AI-Generated Policy Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white/10 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <TrendingUp className="text-emerald-400" size={20} />
                  Rural Infrastructure Pivot
                </h3>
                <p className="text-sm font-medium text-indigo-100 leading-relaxed mb-6">
                  Data suggests a 25% increase in respiratory cases in rural Salem. Recommendation: Allocate 15% more oxygen concentrators and mobile clinics to the region.
                </p>
                <button className="text-xs font-black uppercase tracking-widest text-indigo-300 hover:text-white flex items-center gap-2">
                  View Analysis <ChevronRight size={14} />
                </button>
              </div>
              <div className="p-8 bg-white/10 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Users className="text-blue-400" size={20} />
                  Preventative Care Expansion
                </h3>
                <p className="text-sm font-medium text-indigo-100 leading-relaxed mb-6">
                  Early screening for metabolic disorders has reduced hospitalization costs by 18% in urban centers. Recommendation: Scale program to all tier-2 cities.
                </p>
                <button className="text-xs font-black uppercase tracking-widest text-indigo-300 hover:text-white flex items-center gap-2">
                  View Analysis <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resource Allocation */}
          <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Budget Allocation</h3>
            <div className="h-64 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {allocationData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Healthcare Access Trends */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Healthcare Access Index</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rural vs Urban Comparison</p>
              </div>
              <div className="flex gap-2">
                {['1m', '3m', '6m', '1y'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="rural" name="Rural Access" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="urban" name="Urban Access" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
            <Globe className="text-blue-600" size={24} />
            Integrated Data Sources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'MoHFW Datasets', status: 'Synced', time: '2m ago' },
              { name: 'WHO Global Feed', status: 'Live', time: 'Real-time' },
              { name: 'District Health Reports', status: 'Synced', time: '1h ago' },
              { name: 'Anonymized User Data', status: 'Active', time: 'Real-time' },
            ].map((source, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="text-sm font-black text-slate-900 mb-2">{source.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    {source.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{source.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyAnalytics;
