
import React, { useState } from 'react';
import { 
  WifiOff, 
  MapPin, 
  PhoneCall, 
  Users, 
  Stethoscope, 
  Calendar, 
  MessageSquare, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Info,
  Radio,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

const RuralHealthPortal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [offlineMode, setOfflineMode] = useState(false);

  const villages = [
    { name: 'Dharmapuri District', centers: 12, status: 'Active', distance: '4.2 km' },
    { name: 'Salem Rural', centers: 8, status: 'Active', distance: '12.5 km' },
    { name: 'Erode North', centers: 15, status: 'Active', distance: '8.1 km' },
  ];

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <MapPin size={24} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Rural Healthcare Access</h1>
            </div>
            <p className="text-slate-500 font-medium">Bridging the gap for remote communities • Offline-First Medical Assistance</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setOfflineMode(!offlineMode)}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${offlineMode ? 'bg-amber-600 text-white shadow-lg shadow-amber-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <WifiOff size={18} />
              {offlineMode ? 'Offline Mode Active' : 'Enable Offline Mode'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Tele-Consultation for Rural Centers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button className="p-8 bg-emerald-600 text-white rounded-[2.5rem] flex flex-col items-start gap-4 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 group">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <PhoneCall size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-black uppercase tracking-tight">Connect to Doctor</h3>
                      <p className="text-xs font-medium text-emerald-100">Instant connection to available government medical officers</p>
                    </div>
                    <ArrowRight className="mt-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                  
                  <button className="p-8 bg-slate-900 text-white rounded-[2.5rem] flex flex-col items-start gap-4 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Radio size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-black uppercase tracking-tight">Community Radio</h3>
                      <p className="text-xs font-medium text-slate-400">Listen to local health alerts and wellness broadcasts</p>
                    </div>
                    <ArrowRight className="mt-4 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Nearby Health Centers */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nearby Primary Health Centers</h2>
                <button className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {villages.map((v, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                        <Stethoscope size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{v.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{v.centers} Active Centers • {v.distance}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {v.status}
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Offline Sync Card */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <WifiOff className="text-amber-400" size={24} />
                <h3 className="text-xl font-black uppercase tracking-tight">Offline Sync</h3>
              </div>
              <p className="text-sm font-medium text-slate-400 leading-relaxed mb-8">
                Download essential medical guides and symptom checkers for use in areas with no internet connectivity.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs font-bold">First Aid Guide</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase">Downloaded</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs font-bold">Symptom Checker</span>
                  <button className="text-[10px] font-black text-blue-400 uppercase hover:underline">Download (2MB)</button>
                </div>
              </div>
              <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all">
                Sync All Data
              </button>
            </div>

            {/* Community Support */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Community Support</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Health Volunteers</h4>
                    <p className="text-xs font-medium text-slate-500 mt-1">Connect with 12 volunteers in your area for immediate assistance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Blood Donors</h4>
                    <p className="text-xs font-medium text-slate-500 mt-1">8 verified blood donors available within 5km radius.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuralHealthPortal;
