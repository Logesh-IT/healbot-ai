import React, { useState, useEffect, useRef } from 'react';
import { 
  Smile, 
  Meh, 
  Frown, 
  Wind, 
  Heart, 
  MessageCircle, 
  Plus, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Brain,
  Coffee,
  Sun,
  Moon
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
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import supabase, { isSupabaseConfigured } from '../supabase';
import { getAnswer } from '../services/chatbot';

interface MoodLog {
  id?: string;
  user_id: string;
  mood: string;
  stress_level: number;
  notes: string;
  timestamp: string;
}

const MentalHealth: React.FC<{ userId: string }> = ({ userId }) => {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [userInput, setUserInput] = useState("");
  
  const [formData, setFormData] = useState({
    mood: 'Happy',
    stress_level: 3,
    notes: ''
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchLogs();
    
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setUserInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [userId]);

  useEffect(() => {
    if (isListening) {
      recognitionRef.current?.start();
    } else {
      recognitionRef.current?.stop();
    }
  }, [isListening]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiResponse, isTyping]);

  const fetchLogs = async () => {
    setLoading(true);
    
    if (!isSupabaseConfigured) {
      const localLogs = localStorage.getItem('hb_mental_health_logs');
      const allLogs = localLogs ? JSON.parse(localLogs) : [];
      setLogs(allLogs.filter((l: any) => l.user_id === userId));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mental_health_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching logs:', error);
        const localLogs = localStorage.getItem('hb_mental_health_logs');
        const allLogs = localLogs ? JSON.parse(localLogs) : [];
        setLogs(allLogs.filter((l: any) => l.user_id === userId));
      } else {
        setLogs(data || []);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      const localLogs = localStorage.getItem('hb_mental_health_logs');
      const allLogs = localLogs ? JSON.parse(localLogs) : [];
      setLogs(allLogs.filter((l: any) => l.user_id === userId));
    }
    setLoading(false);
  };

  const handleSaveLog = async () => {
    const payload = {
      user_id: userId,
      ...formData,
      timestamp: new Date().toISOString()
    };

    // Always save to local for admin visibility in demo mode
    const localLogs = JSON.parse(localStorage.getItem('hb_mental_health_logs') || '[]');
    localStorage.setItem('hb_mental_health_logs', JSON.stringify([payload, ...localLogs]));
    window.dispatchEvent(new Event('hb_data_changed'));

    if (!isSupabaseConfigured) {
      setShowLogModal(false);
      fetchLogs();
      handleAiSupport(`I'm feeling ${formData.mood} with a stress level of ${formData.stress_level}/10. ${formData.notes}`);
      return;
    }

    const { error } = await supabase
      .from('mental_health_logs')
      .insert([payload]);

    if (error) {
      alert('Error saving log: ' + error.message);
    } else {
      setShowLogModal(false);
      fetchLogs();
      // Trigger AI support after logging
      handleAiSupport(`I'm feeling ${formData.mood} with a stress level of ${formData.stress_level}/10. ${formData.notes}`);
    }
  };

  const handleAiSupport = async (input: string) => {
    setIsTyping(true);
    setChatMode(true);
    try {
      const prompt = `You are a compassionate AI Therapist. The user says: "${input}". Provide a supportive, empathetic response (max 50 words) and suggest one small mindfulness activity.`;
      const response = await getAnswer(prompt);
      setAiResponse(response.text || "I'm here for you. Take a deep breath and remember that you're doing your best.");
    } catch (err) {
      setAiResponse("I'm here to listen. Tell me more about how you're feeling.");
    }
    setIsTyping(false);
  };

  const moodIcons: Record<string, any> = {
    'Happy': { icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    'Neutral': { icon: Meh, color: 'text-blue-500', bg: 'bg-blue-50' },
    'Sad': { icon: Frown, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    'Anxious': { icon: Wind, color: 'text-purple-500', bg: 'bg-purple-50' },
    'Angry': { icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  };

  const chartData = logs.slice(-7).map(log => ({
    day: new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
    stress: log.stress_level,
    moodScore: log.mood === 'Happy' ? 5 : log.mood === 'Neutral' ? 3 : 1
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mindful Space</h1>
          <p className="text-slate-500 font-medium tracking-tight">Your companion for mental well-being</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setChatMode(!chatMode)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${chatMode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            <MessageCircle size={20} />
            {chatMode ? 'Close AI Therapist' : 'Talk to AI Therapist'}
          </button>
          <button 
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus size={20} />
            Log Mood
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Mood Trends Chart */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Emotional Trends</h2>
                <p className="text-slate-500 font-medium">Your stress & mood levels over the past week</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Stress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Mood</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="stress" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorStress)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moodScore" 
                    stroke="#facc15" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#facc15', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Relief Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Breathe', desc: '4-7-8 Technique', icon: Wind, color: 'bg-blue-500' },
              { title: 'Meditate', desc: '5 min session', icon: Brain, color: 'bg-indigo-500' },
              { title: 'Journal', desc: 'Write it out', icon: Sparkles, color: 'bg-purple-500' },
            ].map((item, idx) => (
              <motion.button
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 text-left group"
              >
                <div className={`${item.color} text-white p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-all`}>
                  <item.icon size={28} />
                </div>
                <h3 className="font-black text-slate-900">{item.title}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{item.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* AI Therapist Chat */}
          <AnimatePresence mode="wait">
            {chatMode ? (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[40px] shadow-xl border border-slate-100 flex flex-col h-[600px] overflow-hidden"
              >
                <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-black tracking-tight">AI Therapist</h3>
                      <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Always here to listen</p>
                    </div>
                  </div>
                  <button onClick={() => setChatMode(false)} className="text-white/60 hover:text-white">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Sparkles size={14} className="text-indigo-600" />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        Hello. I'm your AI companion. How are you feeling today? You can talk to me about anything on your mind.
                      </p>
                    </div>
                  </div>

                  {aiResponse && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Sparkles size={14} className="text-indigo-600" />
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{aiResponse}</p>
                      </div>
                    </div>
                  )}

                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <Sparkles size={14} className="text-indigo-600" />
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-6 border-t border-slate-50">
                  <div className="relative">
                    <input 
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (handleAiSupport(userInput), setUserInput(""))}
                      placeholder="Type your message..."
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-14 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                      onClick={() => { handleAiSupport(userInput); setUserInput(""); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="flex justify-center mt-4">
                    <button 
                      onClick={() => setIsListening(!isListening)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {isListening ? <Mic size={14} /> : <MicOff size={14} />}
                      {isListening ? 'Listening...' : 'Voice Support'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 mb-6">Recent Moods</h3>
                  <div className="space-y-4">
                    {logs.slice(-5).reverse().map((log, idx) => {
                      const MoodInfo = moodIcons[log.mood] || moodIcons['Neutral'];
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <div className={`${MoodInfo.bg} ${MoodInfo.color} p-2 rounded-xl`}>
                              <MoodInfo.icon size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{log.mood}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {new Date(log.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-900">Stress: {log.stress_level}/10</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-200">
                  <h3 className="text-xl font-black mb-2">Daily Quote</h3>
                  <p className="text-indigo-100 italic font-medium leading-relaxed">
                    "Self-care is not selfish. You cannot pour from an empty cup."
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600" />
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">How are you?</h2>
              <p className="text-slate-500 font-medium mb-8">Log your current state of mind</p>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Select Mood</label>
                  <div className="flex justify-between">
                    {Object.entries(moodIcons).map(([name, info]) => (
                      <button
                        key={name}
                        onClick={() => setFormData({...formData, mood: name})}
                        className={`flex flex-col items-center gap-2 transition-all ${formData.mood === name ? 'scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                      >
                        <div className={`${info.bg} ${info.color} p-4 rounded-2xl shadow-sm`}>
                          <info.icon size={28} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Stress Level</label>
                    <span className="text-lg font-black text-indigo-600">{formData.stress_level}/10</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="10"
                    value={formData.stress_level}
                    onChange={(e) => setFormData({...formData, stress_level: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Notes (Optional)</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] p-6 focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-700 outline-none resize-none h-32"
                    placeholder="What's on your mind?"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-4 rounded-[20px] font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveLog}
                  className="flex-1 py-4 rounded-[20px] font-bold bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Save Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentalHealth;
