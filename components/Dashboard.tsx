
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Message } from '../types';
import VideoBriefing from './VideoBriefing';
import { Shield, AlertTriangle, Activity, Globe } from 'lucide-react';

const Dashboard: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const [showVideoBriefing, setShowVideoBriefing] = useState(false);
  
  const assistantMessages = messages.filter(m => m.role === 'assistant' && m.id !== '1');
  const lastAssistantMsg = assistantMessages[assistantMessages.length - 1];
  const lastImageMessage = [...messages].reverse().find(m => m.image);

  // Data extraction for charts
  const userText = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || "";
  const symptomData = [
    { name: 'Fever/Temp', value: userText.includes('fever') || userText.includes('heat') ? 75 : 15 },
    { name: 'Pain Level', value: userText.includes('pain') || userText.includes('ache') ? 90 : 25 },
    { name: 'Visual Cues', value: lastImageMessage ? 85 : 10 },
    { name: 'Respiratory', value: userText.includes('cough') || userText.includes('breath') ? 70 : 20 },
    { name: 'Neurological', value: userText.includes('headache') || userText.includes('dizzy') ? 60 : 5 },
  ].sort((a, b) => b.value - a.value);

  const riskType = lastAssistantMsg?.content.includes('🔴') ? 'High' : 
                   lastAssistantMsg?.content.includes('🟡') ? 'Medium' : 'Low';
  
  const confidenceData = [
    { name: 'Low', value: riskType === 'Low' ? 85 : 5, color: '#22c55e' },
    { name: 'Medium', value: riskType === 'Medium' ? 75 : 15, color: '#eab308' },
    { name: 'High', value: riskType === 'High' ? 95 : 10, color: '#ef4444' },
  ];

  const trendData = messages.map((m, i) => {
    const text = m.content.toLowerCase();
    let score = 20; 
    if (text.includes('high') || text.includes('emergency') || text.includes('🔴')) score = 90;
    else if (text.includes('medium') || text.includes('consult') || text.includes('🟡')) score = 55;
    else if (text.includes('low') || text.includes('🟢')) score = 25;
    return { turn: `T-${i + 1}`, risk: score };
  });

  return (
    <div className="space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Page Header */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200 flex items-center gap-2">
              <Shield size={12} /> Government Portal Active
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Explainability</h2>
          <p className="text-slate-500 font-medium mt-2">Neural decision transparency and automated diagnostic reasoning logs</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-0">
          <button 
            onClick={() => setShowVideoBriefing(true)}
            className="px-8 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl flex items-center gap-3 active:scale-95"
          >
            <i className="fas fa-play-circle text-xl"></i> Cinematic AI Briefing
          </button>
        </div>
      </div>

      {/* Government Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'National Risk Level', value: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Shield },
          { label: 'Active Outbreaks', value: '02', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
          { label: 'System Health', value: '99.9%', color: 'text-blue-600', bg: 'bg-blue-50', icon: Activity },
          { label: 'Global Sync', value: 'Active', color: 'text-purple-600', bg: 'bg-purple-50', icon: Globe },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-[2.5rem] border border-white shadow-sm flex flex-col items-center text-center`}>
            <stat.icon className={`${stat.color} mb-3`} size={24} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {showVideoBriefing && lastAssistantMsg && (
        <VideoBriefing 
          reportText={lastAssistantMsg.content} 
          onClose={() => setShowVideoBriefing(false)} 
        />
      )}

      {/* Subsection 1: Live Diagnostic Feed */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
          <span className="w-12 h-px bg-slate-200"></span>
          Diagnostic Synthesis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-blue-600 uppercase">Reasoning Chain</h4>
            <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 min-h-[200px]">
              {lastAssistantMsg ? (
                <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                  "{lastAssistantMsg.content.substring(0, 450)}..."
                </p>
              ) : (
                <p className="text-slate-400 text-sm font-medium">Waiting for session data...</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black text-blue-600 uppercase">Input Extraction</h4>
            <div className="p-6 bg-slate-900 rounded-[2.5rem] h-full flex items-center justify-center overflow-hidden relative">
              {lastImageMessage ? (
                <>
                  <img src={lastImageMessage.image} className="w-full h-full object-cover opacity-40 blur-[2px]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                    <i className="fas fa-microscope text-3xl mb-3 text-blue-400"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">Vision Extraction Active</p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <i className="fas fa-terminal text-slate-700 text-3xl mb-4"></i>
                  <p className="text-[10px] font-black text-slate-600 uppercase">No Image Context</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Symptom Bar Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Feature Contribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptomData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 10, 10, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Pie Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Risk Confidence</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={confidenceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
