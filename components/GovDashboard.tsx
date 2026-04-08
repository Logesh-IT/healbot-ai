
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Shield, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Map as MapIcon, 
  Activity, 
  Bell, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  CheckCircle2,
  Clock,
  Ambulance,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Outbreak, EmergencyRequest, Severity } from '../types';

const GovDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([
    { id: '1', disease: 'Dengue', location: 'Chennai, Tamil Nadu', severity: Severity.CRITICAL, cases: 142, status: 'Active', timestamp: new Date().toISOString(), lat: 13.0827, lng: 80.2707 },
    { id: '2', disease: 'Viral Fever', location: 'Bangalore, Karnataka', severity: Severity.MODERATE, cases: 85, status: 'Under Observation', timestamp: new Date().toISOString(), lat: 12.9716, lng: 77.5946 },
    { id: '3', disease: 'Malaria', location: 'Kochi, Kerala', severity: Severity.MILD, cases: 24, status: 'Contained', timestamp: new Date().toISOString(), lat: 9.9312, lng: 76.2673 },
  ]);

  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([
    { id: 'e1', userId: 'u1', userName: 'Rajesh Kumar', location: { lat: 13.0827, lng: 80.2707 }, type: 'Cardiac', status: 'Dispatched', timestamp: new Date().toISOString(), ambulanceId: 'AMB-042' },
    { id: 'e2', userId: 'u2', userName: 'Anjali Sharma', location: { lat: 12.9716, lng: 77.5946 }, type: 'Accident', status: 'Pending', timestamp: new Date().toISOString() },
  ]);

  const stats = [
    { label: 'Active Outbreaks', value: '12', change: '+2', trend: 'up', icon: AlertCircle, color: 'text-red-500' },
    { label: 'Total Patients Monitored', value: '1.2M', change: '+14K', trend: 'up', icon: Users, color: 'text-blue-500' },
    { label: 'Emergency Response Time', value: '8.4m', change: '-1.2m', trend: 'down', icon: Clock, color: 'text-emerald-500' },
    { label: 'Health ID Adoption', value: '84%', change: '+5%', trend: 'up', icon: Shield, color: 'text-purple-500' },
  ];

  const trendData = [
    { name: 'Mon', cases: 400, emergencies: 240 },
    { name: 'Tue', cases: 300, emergencies: 139 },
    { name: 'Wed', cases: 200, emergencies: 980 },
    { name: 'Thu', cases: 278, emergencies: 390 },
    { name: 'Fri', cases: 189, emergencies: 480 },
    { name: 'Sat', cases: 239, emergencies: 380 },
    { name: 'Sun', cases: 349, emergencies: 430 },
  ];

  const regionData = [
    { name: 'North', value: 400 },
    { name: 'South', value: 700 },
    { name: 'East', value: 300 },
    { name: 'West', value: 500 },
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Shield size={24} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">National Health Command Center</h1>
            </div>
            <p className="text-slate-500 font-medium">Government of India • Ministry of Health & Family Welfare</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none h-12 px-6 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Download size={18} /> Export Data
            </button>
            <button className="flex-1 md:flex-none h-12 px-6 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
              <Bell size={18} /> Broadcast Alert
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-slate-50 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trend Analysis */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Disease Surveillance Trends</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weekly Propagation Analysis</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold">7 Days</button>
                <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold">30 Days</button>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="cases" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCases)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Regional Load</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-6">
              {regionData.map((region, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-sm font-bold text-slate-600">{region.name} Zone</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{region.value} Cases</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Outbreaks and Emergencies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Outbreaks */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Outbreaks</h2>
              <button className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">View Map</button>
            </div>
            <div className="space-y-4">
              {outbreaks.map((outbreak) => (
                <div key={outbreak.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${
                      outbreak.severity === Severity.CRITICAL ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      <Activity size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{outbreak.disease}</h4>
                      <p className="text-xs font-bold text-slate-500">{outbreak.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{outbreak.cases}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Cases</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Response */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Live SOS Requests</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Monitoring</span>
              </div>
            </div>
            <div className="space-y-4">
              {emergencies.map((emergency) => (
                <div key={emergency.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-red-200 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200">
                      <Ambulance size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{emergency.userName}</h4>
                      <p className="text-xs font-bold text-slate-500">{emergency.type} Emergency • {emergency.status}</p>
                    </div>
                  </div>
                  <button className="h-12 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                    Track
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Public Health Campaigns */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Ayushman Bharat Awareness Drive</h2>
              <p className="text-blue-100 font-medium mb-8">Launch national awareness campaigns for vaccination drives and clean water initiatives directly from the command center.</p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all">
                  Launch Campaign
                </button>
                <button className="px-8 py-4 bg-blue-500/30 text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500/40 transition-all">
                  View Analytics
                </button>
              </div>
            </div>
            <div className="w-full md:w-64 h-64 bg-white/10 rounded-[2.5rem] backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center p-8 text-center">
              <TrendingUp size={48} className="mb-4 text-blue-200" />
              <h4 className="text-2xl font-black mb-1">14.2M</h4>
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Total Reach Today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovDashboard;
