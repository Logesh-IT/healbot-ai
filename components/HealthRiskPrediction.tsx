
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  Zap, 
  Brain, 
  Heart, 
  Stethoscope,
  ArrowUpRight,
  Info,
  PieChart as PieIcon,
  BarChart as BarIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const HealthRiskPrediction: React.FC<{ user: any; onBack: () => void }> = ({ user, onBack }) => {
  const [riskScore, setRiskScore] = useState(24);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const riskData = [
    { name: 'Jan', score: 15 },
    { name: 'Feb', score: 18 },
    { name: 'Mar', score: 24 },
  ];

  const categories = [
    { name: 'Cardiovascular', risk: 'Low', score: 12, color: '#10b981' },
    { name: 'Respiratory', risk: 'Moderate', score: 35, color: '#f59e0b' },
    { name: 'Metabolic', risk: 'Low', score: 18, color: '#10b981' },
    { name: 'Mental Health', risk: 'Low', score: 22, color: '#10b981' },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Brain size={24} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">AI Health Risk Prediction</h1>
            </div>
            <p className="text-slate-500 font-medium">Predictive Analytics for Chronic Disease Trends • Personalized Risk Assessment</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 flex items-center gap-2">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">AI Engine Active</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Risk Score */}
          <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Personal Health Risk Score</h3>
            
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="24"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke={riskScore > 50 ? '#ef4444' : riskScore > 30 ? '#f59e0b' : '#10b981'}
                  strokeWidth="24"
                  strokeDasharray="691"
                  initial={{ strokeDashoffset: 691 }}
                  animate={{ strokeDashoffset: 691 - (691 * riskScore) / 100 }}
                  transition={{ duration: 2, delay: 0.5 }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-6xl font-black text-slate-900">{riskScore}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Risk</span>
              </div>
            </div>

            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
              Your overall health risk is currently low. Based on your recent symptom history and activity data, you are in a healthy range.
            </p>

            <button className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              Generate Detailed Report
            </button>
          </div>

          {/* Risk Trends */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Risk Propagation Trend</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">3-Month Predictive Analysis</p>
              </div>
              <BarIcon className="text-slate-300" size={24} />
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {categories.map((cat, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{cat.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat.risk} Risk</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-slate-900">{cat.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-indigo-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-indigo-400" size={24} />
                <h2 className="text-3xl font-black uppercase tracking-tight">AI Predictive Insights</h2>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <TrendingUp size={16} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-indigo-100 leading-relaxed">
                    Based on your current activity levels, your cardiovascular risk is projected to decrease by 12% over the next 6 months if current habits are maintained.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                    <AlertCircle size={16} className="text-amber-400" />
                  </div>
                  <p className="text-sm font-medium text-indigo-100 leading-relaxed">
                    Slight increase in respiratory symptoms noted in your area. AI recommends monitoring for seasonal allergies or viral trends.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 h-64 bg-white/10 rounded-[2.5rem] backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center p-8 text-center">
              <Heart size={48} className="mb-4 text-rose-400 animate-pulse" />
              <h4 className="text-2xl font-black mb-1">98.4%</h4>
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Prediction Confidence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRiskPrediction;
