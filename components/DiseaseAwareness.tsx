import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  Activity,
  Thermometer,
  RefreshCw,
  Check,
  Wind,
  Bug,
  Stethoscope,
  Sparkles,
  X,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../supabase';
import { getAnswer } from '../services/chatbot';

interface Disease {
  id: string;
  disease: string;
  description: string;
  symptoms: string;
  precautions: string;
  severity: string;
  category: string;
}

const DiseaseAwareness: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const categories = ['All', 'Viral', 'Bacterial', 'Chronic', 'Respiratory', 'Other'];

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('diseases')
      .select('*')
      .order('disease', { ascending: true });

    if (error) {
      console.error('Error fetching diseases:', error);
    } else {
      setDiseases(data || []);
    }
    setLoading(false);
  };

  const handleSearchAi = async () => {
    if (!searchQuery) return;
    setIsAnalyzing(true);
    try {
      const prompt = `Provide a brief overview of the disease "${searchQuery}". Include symptoms, precautions, and severity level (max 60 words). Format as a structured summary.`;
      const response = await getAnswer(prompt);
      setAiInsight(response.text || "No information found.");
    } catch (err) {
      setAiInsight("I'm having trouble fetching AI insights right now. Please try again later.");
    }
    setIsAnalyzing(false);
  };

  const filteredDiseases = diseases.filter(d => {
    const matchesSearch = d.disease.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-100';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'low': return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Disease Awareness Hub</h1>
          <p className="text-slate-500 font-medium tracking-tight">AI-powered medical knowledge base</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search diseases, symptoms, or conditions..."
          className="w-full bg-white border-none rounded-[32px] py-6 pl-16 pr-40 shadow-sm focus:ring-2 focus:ring-slate-900 font-bold text-slate-700 outline-none"
        />
        <button 
          onClick={handleSearchAi}
          disabled={!searchQuery || isAnalyzing}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {isAnalyzing ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
          AI Search
        </button>
      </div>

      <AnimatePresence>
        {aiInsight && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-indigo-600 p-1 rounded-[32px] shadow-2xl shadow-indigo-200 overflow-hidden"
          >
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[30px] text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-black tracking-tight">AI Medical Insight</h3>
                <button onClick={() => setAiInsight(null)} className="ml-auto text-white/60 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <p className="text-lg font-medium leading-relaxed italic">
                {aiInsight}
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-100 opacity-60">
                <Info size={14} />
                <span>AI-generated content. Always consult a medical professional for diagnosis.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDiseases.map((disease, idx) => (
              <motion.div 
                key={disease.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedDisease(disease)}
                className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-slate-50 text-slate-900 p-4 rounded-3xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Activity size={32} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getSeverityColor(disease.severity)}`}>
                    {disease.severity} Severity
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-slate-900 transition-all">{disease.disease}</h3>
                <p className="text-slate-500 font-medium text-sm line-clamp-2 mb-6 leading-relaxed">
                  {disease.description}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{disease.category}</span>
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-all">
                    Learn More
                    <ArrowRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Disease Detail Modal */}
      <AnimatePresence>
        {selectedDisease && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDisease(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[48px] p-10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-slate-900" />
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 text-slate-900 p-4 rounded-3xl">
                    <Activity size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedDisease.disease}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mt-1 ${getSeverityColor(selectedDisease.severity)}`}>
                      {selectedDisease.severity} Severity
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDisease(null)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Info size={16} className="text-blue-500" />
                    Overview
                  </h3>
                  <p className="text-slate-700 font-medium leading-relaxed text-lg">
                    {selectedDisease.description}
                  </p>
                </section>

                <section className="bg-slate-50 p-8 rounded-[32px]">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Thermometer size={16} className="text-orange-500" />
                    Common Symptoms
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedDisease.symptoms.split(',').map((s, i) => (
                      <span key={i} className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-slate-700 shadow-sm border border-slate-100">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    Precautions & Care
                  </h3>
                  <div className="space-y-3">
                    {selectedDisease.precautions.split('.').filter(p => p.trim()).map((p, i) => (
                      <div key={i} className="flex items-start gap-3 bg-emerald-50/50 p-4 rounded-2xl">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={12} className="text-white" strokeWidth={4} />
                        </div>
                        <p className="text-slate-700 font-bold text-sm leading-relaxed">{p.trim()}.</p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="bg-slate-900 p-8 rounded-[32px] text-white flex items-center gap-6">
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <Stethoscope size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black mb-1">Need Professional Advice?</h4>
                    <p className="text-slate-400 text-sm font-medium">Book a consultation with our top specialists today.</p>
                  </div>
                  <button className="ml-auto bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">
                    Book Now
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

export default DiseaseAwareness;
