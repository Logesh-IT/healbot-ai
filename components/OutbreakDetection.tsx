
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Map as MapIcon, 
  TrendingUp, 
  Users, 
  Bell, 
  ShieldAlert,
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Severity, Outbreak } from '../types';

const OutbreakDetection: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeOutbreaks, setActiveOutbreaks] = useState<Outbreak[]>([
    { id: '1', disease: 'Dengue', location: 'Chennai, Tamil Nadu', severity: Severity.CRITICAL, cases: 142, status: 'Active', timestamp: new Date().toISOString(), lat: 13.0827, lng: 80.2707 },
    { id: '2', disease: 'Viral Fever', location: 'Bangalore, Karnataka', severity: Severity.MODERATE, cases: 85, status: 'Under Observation', timestamp: new Date().toISOString(), lat: 12.9716, lng: 77.5946 },
    { id: '3', disease: 'Malaria', location: 'Kochi, Kerala', severity: Severity.MILD, cases: 24, status: 'Contained', timestamp: new Date().toISOString(), lat: 9.9312, lng: 76.2673 },
  ]);

  const [predictions, setPredictions] = useState([
    { id: 'p1', disease: 'Influenza', location: 'Mumbai, Maharashtra', probability: 84, trend: 'Increasing', riskLevel: 'High' },
    { id: 'p2', disease: 'Cholera', location: 'Kolkata, West Bengal', probability: 62, trend: 'Stable', riskLevel: 'Medium' },
    { id: 'p3', disease: 'Zika Virus', location: 'Hyderabad, Telangana', probability: 35, trend: 'Decreasing', riskLevel: 'Low' },
  ]);

  const [selectedRegion, setSelectedRegion] = useState('All Regions');

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                <ShieldAlert size={24} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Disease Surveillance System</h1>
            </div>
            <p className="text-slate-500 font-medium">Early Warning & Outbreak Prediction • National Health Intelligence</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search region or disease..." 
                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              />
            </div>
            <button className="h-12 px-6 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
              <Filter size={18} /> Filter
            </button>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900">12</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Outbreaks</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Activity size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900">1,242</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">New Cases (24h)</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900">84%</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Prediction Accuracy</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Outbreaks List */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Outbreaks</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Monitoring</span>
              </div>
            </div>
            <div className="space-y-4">
              {activeOutbreaks.map((outbreak) => (
                <div key={outbreak.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-red-200 transition-all">
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

          {/* AI Outbreak Prediction */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">AI Outbreak Prediction</h2>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                Powered by Gemini
              </div>
            </div>
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{prediction.disease}</h4>
                      <p className="text-xs font-bold text-slate-500">{prediction.location} • {prediction.riskLevel} Risk</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{prediction.probability}%</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Probability</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <div className="flex gap-4">
                <Info className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs font-bold text-blue-800 leading-relaxed">
                  AI analysis of user symptom clusters indicates a potential viral fever outbreak in Mumbai within the next 48-72 hours. Early warning alerts have been dispatched to local health authorities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Health Pulse Integration */}
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-blue-400" size={24} />
                <h2 className="text-3xl font-black uppercase tracking-tight">Geo-Spatial Heatmap</h2>
              </div>
              <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                Visualize disease propagation in real-time across districts and states. Identify red zones and safe zones to optimize resource allocation and emergency response.
              </p>
              <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                Open Interactive Map
              </button>
            </div>
            <div className="w-full md:w-80 aspect-square bg-white/5 rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-48 h-48 bg-red-500/20 rounded-full animate-ping"></div>
                <div className="absolute w-32 h-32 bg-red-500/40 rounded-full animate-pulse"></div>
                <MapIcon size={64} className="text-white relative z-10" />
              </div>
              <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Surveillance Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutbreakDetection;
