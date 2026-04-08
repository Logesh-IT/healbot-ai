import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Droplets, 
  Moon, 
  Flame, 
  Plus, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Heart,
  Zap,
  Watch,
  Info,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../supabase';
import { getAnswer } from '../services/chatbot';

interface Metric {
  id?: string;
  user_id: string;
  steps: number;
  water: number;
  sleep: number;
  calories: number;
  heart_rate: number;
  timestamp: string;
}

const HealthDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [todayMetric, setTodayMetric] = useState<Metric | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiTip, setAiTip] = useState<string>("Analyzing your health data for personalized insights...");
  const [isSyncing, setIsSyncing] = useState(false);
  const [watchActive, setWatchActive] = useState(true);
  
  // Smartwatch Simulation State
  const [simSteps, setSimSteps] = useState(0);
  const [simHeartRate, setSimHeartRate] = useState(72);
  const [simCalories, setSimCalories] = useState(0);

  const [formData, setFormData] = useState({
    steps: 0,
    water: 0,
    sleep: 0,
    calories: 0,
    heart_rate: 70
  });

  const syncInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMetrics();
    generateAiTip();
    
    // Smartwatch Simulation Logic
    if (watchActive) {
      syncInterval.current = setInterval(() => {
        setSimSteps(prev => prev + Math.floor(Math.random() * 5));
        setSimHeartRate(prev => {
          const change = Math.floor(Math.random() * 3) - 1;
          const newVal = prev + change;
          return Math.max(60, Math.min(100, newVal));
        });
      }, 3000);
    }

    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, [userId, watchActive]);

  useEffect(() => {
    // Auto-calculate calories from steps
    setSimCalories(Math.floor(simSteps * 0.04));
  }, [simSteps]);

  const fetchMetrics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching metrics:', error);
    } else {
      setMetrics(data || []);
      const today = new Date().toISOString().split('T')[0];
      const todayData = (data || []).find(m => m.timestamp.startsWith(today));
      if (todayData) {
        setTodayMetric(todayData);
        setSimSteps(todayData.steps);
        setSimHeartRate(todayData.heart_rate);
        setSimCalories(todayData.calories);
      }
    }
    setLoading(false);
  };

  const generateAiTip = async () => {
    try {
      const prompt = `Based on a user with ${simSteps} steps, ${todayMetric?.water || 0}L water, and ${todayMetric?.sleep || 0}h sleep, give a short, punchy health tip (max 20 words).`;
      const response = await getAnswer(prompt);
      setAiTip(response.text || "Keep moving and stay hydrated for optimal health!");
    } catch (err) {
      setAiTip("Consistency is key! Try to reach your step goal today.");
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      user_id: userId,
      steps: simSteps,
      water: todayMetric?.water || 0,
      sleep: todayMetric?.sleep || 0,
      calories: simCalories,
      heart_rate: simHeartRate,
      timestamp: new Date().toISOString()
    };

    let error;
    if (todayMetric?.id) {
      const { error: updateError } = await supabase
        .from('health_metrics')
        .update(payload)
        .eq('id', todayMetric.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('health_metrics')
        .insert([payload]);
      error = insertError;
    }

    setTimeout(() => {
      setIsSyncing(false);
      fetchMetrics();
      generateAiTip();
    }, 1500);
  };

  const handleSaveManual = async () => {
    const payload = {
      user_id: userId,
      ...formData,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase.from('health_metrics').insert([payload]);

    if (error) {
      alert('Error saving metrics: ' + error.message);
    } else {
      setShowAddModal(false);
      fetchMetrics();
    }
  };

  const stats = [
    { label: 'Steps', value: simSteps, goal: 10000, unit: 'steps', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', barColor: 'bg-blue-500' },
    { label: 'Water', value: todayMetric?.water || 0, goal: 3, unit: 'L', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-50', barColor: 'bg-cyan-500' },
    { label: 'Sleep', value: todayMetric?.sleep || 0, goal: 8, unit: 'hrs', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', barColor: 'bg-indigo-500' },
    { label: 'Calories', value: simCalories, goal: 2500, unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', barColor: 'bg-orange-500' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Health Pulse</h1>
          <p className="text-slate-500 font-medium">Real-time vitals & AI insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${watchActive ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
            <Watch size={18} className={watchActive ? 'animate-pulse' : ''} />
            <span className="text-xs font-bold uppercase tracking-wider">{watchActive ? 'Watch Connected' : 'Watch Disconnected'}</span>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} />}
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* AI Insight Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-1 rounded-[32px] shadow-2xl shadow-blue-200"
      >
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-[30px] flex items-center gap-6 text-white">
          <div className="bg-white/20 p-4 rounded-2xl shrink-0">
            <Zap size={32} className="text-yellow-300 fill-yellow-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-2 py-0.5 rounded-md">AI Intelligence</span>
              <span className="text-xs text-blue-100 opacity-80">• Just now</span>
            </div>
            <p className="text-lg font-bold leading-tight">
              {aiTip}
            </p>
          </div>
          <button 
            onClick={generateAiTip}
            className="hidden md:block bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl font-bold transition-all text-sm"
          >
            Refresh Insight
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                  <stat.icon size={28} />
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Progress</p>
                  <p className="text-slate-900 font-bold">{Math.floor((stat.value / stat.goal) * 100)}%</p>
                </div>
              </div>
              <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">{stat.label}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black text-slate-900 tabular-nums">{stat.value}</span>
                <span className="text-slate-400 font-bold text-sm">{stat.unit}</span>
              </div>
              <div className="mt-6 w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((stat.value / stat.goal) * 100, 100)}%` }}
                  className={`h-full ${stat.barColor} transition-all duration-1000`} 
                />
              </div>
              <div className="flex justify-between mt-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Goal: {stat.goal} {stat.unit}</p>
                {stat.value >= stat.goal && (
                  <span className="text-[10px] text-green-500 font-black uppercase">Goal Reached!</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Activity Trends</h2>
              <p className="text-slate-500 font-medium">Step count analysis for the past week</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
              <button className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold shadow-sm">Steps</button>
              <button className="px-4 py-2 text-slate-400 rounded-xl text-xs font-bold hover:text-slate-600 transition-all">Calories</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.slice(-7)}>
                <defs>
                  <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  itemStyle={{ fontWeight: 800, color: '#1e293b' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="steps" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSteps)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Heart className="text-red-500 fill-red-500" size={24} />
                Live Vitals
              </h2>
              <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Heart Rate</p>
                  <p className="text-3xl font-black text-slate-900 tabular-nums">{simHeartRate} <span className="text-sm font-bold text-slate-400">BPM</span></p>
                </div>
                <div className="h-16 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.slice(-10).map(m => ({ ...m, hr: m.heart_rate }))}>
                      <Line type="step" dataKey="hr" stroke="#ef4444" strokeWidth={3} dot={false} animationDuration={1000} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sleep Quality</p>
                  <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Optimal</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent flex items-center justify-center">
                    <span className="text-lg font-black text-slate-900">88%</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Deep Sleep: 2h 15m</p>
                    <p className="text-xs text-slate-400 font-medium">REM: 1h 45m</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                <Info size={20} />
              </div>
              <h3 className="font-bold text-slate-900">Health Score</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-blue-600">92</span>
              <span className="text-slate-400 font-bold mb-1">/ 100</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 font-medium leading-relaxed">
              Your health score is in the top 5% of users in your age group. Keep up the great work!
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-blue-600" />
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Manual Log</h2>
              <p className="text-slate-500 font-medium mb-8">Enter your vitals manually</p>
              
              <div className="space-y-6">
                {[
                  { label: 'Steps', key: 'steps', icon: Activity, unit: 'steps' },
                  { label: 'Water (Liters)', key: 'water', icon: Droplets, unit: 'L' },
                  { label: 'Sleep (Hours)', key: 'sleep', icon: Moon, unit: 'hrs' },
                  { label: 'Calories', key: 'calories', icon: Flame, unit: 'kcal' },
                  { label: 'Heart Rate', key: 'heart_rate', icon: Heart, unit: 'bpm' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{field.label}</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                        <field.icon size={20} />
                      </div>
                      <input 
                        type="number"
                        value={formData[field.key as keyof typeof formData]}
                        onChange={(e) => setFormData({...formData, [field.key]: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 pl-14 pr-6 focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700 outline-none"
                        placeholder={`0 ${field.unit}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 rounded-[20px] font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveManual}
                  className="flex-1 py-4 rounded-[20px] font-bold bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Save Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthDashboard;
