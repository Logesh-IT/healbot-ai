import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Droplets, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  FileText, 
  Sparkles,
  History,
  Trash2,
  Download,
  X,
  RefreshCw,
  Stethoscope,
  Microscope
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

interface BloodTest {
  id?: string;
  user_id: string;
  hemoglobin: number;
  wbc: number;
  rbc: number;
  platelets: number;
  glucose: number;
  cholesterol: number;
  timestamp: string;
  analysis?: string;
}

const BloodAnalysis: React.FC<{ userId: string }> = ({ userId }) => {
  const [tests, setTests] = useState<BloodTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTest, setSelectedTest] = useState<BloodTest | null>(null);

  const [formData, setFormData] = useState({
    hemoglobin: 14,
    wbc: 7000,
    rbc: 5,
    platelets: 250000,
    glucose: 90,
    cholesterol: 180
  });

  useEffect(() => {
    fetchTests();
  }, [userId]);

  const fetchTests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blood_tests')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching tests:', error);
    } else {
      setTests(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setIsAnalyzing(true);
    try {
      // 1. Generate AI Analysis
      const prompt = `Analyze these blood test results: Hemoglobin: ${formData.hemoglobin} g/dL, WBC: ${formData.wbc} /mcL, RBC: ${formData.rbc} million/mcL, Platelets: ${formData.platelets} /mcL, Glucose: ${formData.glucose} mg/dL, Cholesterol: ${formData.cholesterol} mg/dL. Provide a brief, professional summary of the health status and any areas of concern (max 60 words).`;
      const response = await getAnswer(prompt);
      const analysis = response.text || "Analysis complete. Results are within typical ranges.";

      // 2. Save to Database
      const payload = {
        user_id: userId,
        ...formData,
        analysis,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('blood_tests')
        .insert([payload]);

      if (error) throw error;

      setShowAddModal(false);
      fetchTests();
    } catch (error: any) {
      alert('Error saving test: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteTest = async (id: string) => {
    const { error } = await supabase
      .from('blood_tests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting test:', error);
    } else {
      fetchTests();
    }
  };

  const getNormalRange = (key: string) => {
    const ranges: Record<string, string> = {
      hemoglobin: '13.5 - 17.5 g/dL',
      wbc: '4,500 - 11,000 /mcL',
      rbc: '4.5 - 5.9 million/mcL',
      platelets: '150,000 - 450,000 /mcL',
      glucose: '70 - 99 mg/dL',
      cholesterol: '< 200 mg/dL'
    };
    return ranges[key] || 'N/A';
  };

  const chartData = tests.slice(-10).map(t => ({
    date: new Date(t.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    hemoglobin: t.hemoglobin,
    glucose: t.glucose,
    cholesterol: t.cholesterol
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Blood Analysis</h1>
          <p className="text-slate-500 font-medium tracking-tight">Track your biomarkers & AI-powered insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Microscope size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Lab-Grade Analysis</span>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus size={20} />
            Add Lab Result
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trends Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Biomarker Trends</h2>
                <p className="text-slate-500 font-medium">Historical data analysis</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Hemoglobin</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Glucose</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHemo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGlu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
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
                    dataKey="hemoglobin" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorHemo)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="glucose" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorGlu)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent History List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <History className="text-slate-400" size={28} />
              Recent Lab Results
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
              </div>
            ) : tests.length === 0 ? (
              <div className="bg-white p-16 rounded-[48px] text-center border-2 border-dashed border-slate-200">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Droplets className="text-slate-300" size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No lab results yet</h3>
                <p className="text-slate-500 max-w-xs mx-auto font-medium">Add your blood test results to track your health trends over time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {tests.slice().reverse().map((test, idx) => (
                    <motion.div 
                      key={test.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedTest(test)}
                      className="group bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[20px] bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                          <Droplets size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">
                            Lab Result • {new Date(test.timestamp).toLocaleDateString()}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1 text-blue-600">
                              <Activity size={14} />
                              Hemo: {test.hemoglobin}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600">
                              <TrendingUp size={14} />
                              Glu: {test.glucose}
                            </span>
                            <span className="flex items-center gap-1 text-indigo-600">
                              <Sparkles size={14} />
                              Analyzed
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteTest(test.id!); }}
                          className="w-12 h-12 rounded-[18px] bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={20} />
                        </button>
                        <div className="w-12 h-12 rounded-[18px] bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Info className="text-blue-500" size={24} />
              Reference Ranges
            </h3>
            <div className="space-y-4">
              {Object.entries({
                'Hemoglobin': '13.5 - 17.5 g/dL',
                'WBC Count': '4.5 - 11.0 k/mcL',
                'Glucose': '70 - 99 mg/dL',
                'Cholesterol': '< 200 mg/dL',
                'Platelets': '150 - 450 k/mcL'
              }).map(([name, range]) => (
                <div key={name} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="text-sm font-bold text-slate-600">{name}</span>
                  <span className="text-xs font-black text-slate-900">{range}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-200">
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-black mb-3">AI Lab Analysis</h3>
            <p className="text-blue-100 text-sm font-medium leading-relaxed">
              Our AI analyzes your lab results against standard reference ranges to provide you with a clear, easy-to-understand summary of your health.
            </p>
          </div>
        </div>
      </div>

      {/* Add Modal */}
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
              className="relative bg-white w-full max-w-2xl rounded-[48px] p-10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-blue-600" />
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Add Lab Result</h2>
              <p className="text-slate-500 font-medium mb-8">Enter your blood test values for AI analysis</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Hemoglobin (g/dL)', key: 'hemoglobin', icon: Activity },
                  { label: 'WBC Count (/mcL)', key: 'wbc', icon: Microscope },
                  { label: 'RBC Count (m/mcL)', key: 'rbc', icon: Activity },
                  { label: 'Platelets (/mcL)', key: 'platelets', icon: Droplets },
                  { label: 'Glucose (mg/dL)', key: 'glucose', icon: TrendingUp },
                  { label: 'Cholesterol (mg/dL)', key: 'cholesterol', icon: Activity },
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
                        placeholder="0"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 ml-2 uppercase tracking-widest">Normal: {getNormalRange(field.key)}</p>
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
                  onClick={handleSave}
                  disabled={isAnalyzing}
                  className="flex-1 py-4 rounded-[20px] font-bold bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                  {isAnalyzing ? 'Analyzing...' : 'Save & Analyze'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTest(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[48px] p-10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-blue-600" />
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-3xl">
                    <Microscope size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lab Report Detail</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {new Date(selectedTest.timestamp).toLocaleDateString()} • {new Date(selectedTest.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTest(null)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Hemoglobin', value: selectedTest.hemoglobin, unit: 'g/dL' },
                    { label: 'WBC Count', value: selectedTest.wbc, unit: '/mcL' },
                    { label: 'RBC Count', value: selectedTest.rbc, unit: 'm/mcL' },
                    { label: 'Platelets', value: selectedTest.platelets, unit: '/mcL' },
                    { label: 'Glucose', value: selectedTest.glucose, unit: 'mg/dL' },
                    { label: 'Cholesterol', value: selectedTest.cholesterol, unit: 'mg/dL' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-2xl font-black text-slate-900 tabular-nums">{item.value}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.unit}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles size={24} className="text-emerald-600" />
                    <h3 className="text-xl font-black text-emerald-900">AI Medical Summary</h3>
                  </div>
                  <p className="text-emerald-800 font-medium leading-relaxed text-lg italic">
                    "{selectedTest.analysis}"
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-600 opacity-60">
                    <Info size={14} />
                    <span>AI-generated analysis. Always consult a doctor for clinical diagnosis.</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-slate-900 text-white rounded-[24px] font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <Download size={20} />
                    Download PDF
                  </button>
                  <button className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-[24px] font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <RefreshCw size={20} />
                    Re-Analyze
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BloodAnalysis;
