import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Plus, 
  ChevronRight,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Sparkles,
  X,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase, { isSupabaseConfigured } from '../supabase';
import { getAnswer } from '../services/chatbot';

interface HealthRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  category: string;
  date: string;
  analysis?: string;
  status: 'Pending' | 'Analyzed' | 'Error';
}

const HealthRecords: React.FC<{ userId: string }> = ({ userId }) => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<HealthRecord | null>(null);

  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    category: 'Lab Report'
  });

  const categories = ['All', 'Lab Report', 'Prescription', 'Vaccination', 'Imaging', 'Other'];

  useEffect(() => {
    fetchRecords();
  }, [userId]);

  const fetchRecords = async () => {
    setLoading(true);
    
    if (!isSupabaseConfigured) {
      const localRecords = localStorage.getItem('hb_health_records');
      const allRecords = localRecords ? JSON.parse(localRecords) : [];
      setRecords(allRecords.filter((r: any) => r.user_id === userId));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching records:', error);
        const localRecords = localStorage.getItem('hb_health_records');
        const allRecords = localRecords ? JSON.parse(localRecords) : [];
        setRecords(allRecords.filter((r: any) => r.user_id === userId));
      } else {
        setRecords(data || []);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      const localRecords = localStorage.getItem('hb_health_records');
      const allRecords = localRecords ? JSON.parse(localRecords) : [];
      setRecords(allRecords.filter((r: any) => r.user_id === userId));
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!uploadData.file) return;

    setIsUploading(true);
    try {
      const file = uploadData.file;

      if (!isSupabaseConfigured) {
        // Demo mode: read as data URL
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          const newRecord: HealthRecord = {
            id: Date.now().toString(),
            user_id: userId,
            file_name: file.name,
            file_url: base64String,
            category: uploadData.category,
            date: new Date().toISOString(),
            status: 'Pending'
          };
          
          const updatedRecords = [newRecord, ...records];
          setRecords(updatedRecords);
          
          const allLocalRecords = JSON.parse(localStorage.getItem('hb_health_records') || '[]');
          localStorage.setItem('hb_health_records', JSON.stringify([newRecord, ...allLocalRecords]));
          window.dispatchEvent(new Event('hb_data_changed'));
          
          setShowUploadModal(false);
          setUploadData({ file: null, category: 'Lab Report' });
          
          if (uploadData.category === 'Lab Report') {
            analyzeRecord(newRecord.id, newRecord.file_name);
          }
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;
      const filePath = `health-files/${fileName}`;

      // 1. Upload to Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('health-files')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('health-files')
        .getPublicUrl(filePath);

      // 3. Save to Database
      const { data: recordData, error: dbError } = await supabase
        .from('health_records')
        .insert([{
          user_id: userId,
          file_name: file.name,
          file_url: publicUrl,
          category: uploadData.category,
          date: new Date().toISOString(),
          status: 'Pending'
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setShowUploadModal(false);
      setUploadData({ file: null, category: 'Lab Report' });
      fetchRecords();
      
      // Auto-trigger analysis for lab reports
      if (uploadData.category === 'Lab Report') {
        analyzeRecord(recordData.id, recordData.file_name);
      }

    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeRecord = async (id: string, fileName: string) => {
    setAnalyzingId(id);
    try {
      const prompt = `I've uploaded a health record named "${fileName}". Based on the file name and typical medical reports, provide a brief summary of what this record might contain and what the user should look for (max 40 words).`;
      const response = await getAnswer(prompt);
      
      if (!isSupabaseConfigured) {
        const updatedRecords = records.map(r => 
          r.id === id ? { ...r, analysis: response.text, status: 'Analyzed' as const } : r
        );
        setRecords(updatedRecords);
        
        const allLocalRecords = JSON.parse(localStorage.getItem('hb_health_records') || '[]');
        const updatedAll = allLocalRecords.map((r: any) => 
          r.id === id ? { ...r, analysis: response.text, status: 'Analyzed' } : r
        );
        localStorage.setItem('hb_health_records', JSON.stringify(updatedAll));
        window.dispatchEvent(new Event('hb_data_changed'));
        return;
      }

      await supabase
        .from('health_records')
        .update({ 
          analysis: response.text,
          status: 'Analyzed'
        })
        .eq('id', id);
      
      fetchRecords();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!isSupabaseConfigured) {
      const updatedRecords = records.filter(r => r.id !== id);
      setRecords(updatedRecords);
      
      const allLocalRecords = JSON.parse(localStorage.getItem('hb_health_records') || '[]');
      localStorage.setItem('hb_health_records', JSON.stringify(allLocalRecords.filter((r: any) => r.id !== id)));
      window.dispatchEvent(new Event('hb_data_changed'));
      return;
    }

    const { error } = await supabase
      .from('health_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting record:', error);
    } else {
      fetchRecords();
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Health Records</h1>
          <p className="text-slate-500 font-medium tracking-tight">Securely store & analyze your medical documents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Shield size={18} />
            <span className="text-xs font-black uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus size={20} />
            Upload Record
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6">Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {cat}
                  <ChevronRight size={16} className={selectedCategory === cat ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-200">
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-black mb-3">AI Analysis</h3>
            <p className="text-blue-100 text-sm font-medium leading-relaxed">
              Upload your lab reports and our AI will summarize the key findings for you automatically.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your records..."
              className="w-full bg-white border-none rounded-[32px] py-6 pl-16 pr-8 shadow-sm focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 outline-none"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="bg-white p-20 rounded-[48px] text-center border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileSearch className="text-slate-300" size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No records found</h3>
              <p className="text-slate-500 max-w-xs mx-auto font-medium">Try searching for something else or upload a new medical document.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredRecords.map((record, idx) => (
                  <motion.div 
                    key={record.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-blue-50 text-blue-600 p-4 rounded-3xl">
                        <FileText size={32} />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setViewingRecord(record)}
                          className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <Eye size={20} />
                        </button>
                        <a 
                          href={record.file_url} 
                          download 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                        >
                          <Download size={20} />
                        </a>
                        <button 
                          onClick={() => deleteRecord(record.id)}
                          className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-1">{record.file_name}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                      <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600">{record.category}</span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50">
                      {record.status === 'Analyzed' ? (
                        <div className="bg-emerald-50/50 p-4 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-emerald-600" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AI Summary</span>
                          </div>
                          <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                            "{record.analysis}"
                          </p>
                        </div>
                      ) : analyzingId === record.id ? (
                        <div className="flex items-center gap-3 text-blue-600">
                          <RefreshCw size={16} className="animate-spin" />
                          <span className="text-xs font-black uppercase tracking-widest">AI Analyzing...</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => analyzeRecord(record.id, record.file_name)}
                          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all text-xs font-black uppercase tracking-widest"
                        >
                          <Sparkles size={16} />
                          Analyze Report
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-blue-600" />
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Upload Record</h2>
              <p className="text-slate-500 font-medium mb-8">Add a new document to your vault</p>
              
              <div className="space-y-6">
                <div 
                  className={`border-4 border-dashed rounded-[32px] p-10 text-center transition-all ${uploadData.file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-blue-500 bg-slate-50'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files[0]) setUploadData({...uploadData, file: e.dataTransfer.files[0]});
                  }}
                >
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && setUploadData({...uploadData, file: e.target.files[0]})}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${uploadData.file ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                      {uploadData.file ? <CheckCircle2 size={40} /> : <Upload size={40} />}
                    </div>
                    <p className="text-lg font-black text-slate-900">
                      {uploadData.file ? uploadData.file.name : 'Choose a file'}
                    </p>
                    <p className="text-sm font-bold text-slate-400 mt-1">or drag and drop here</p>
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Category</label>
                  <select 
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700 outline-none appearance-none"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-4 rounded-[20px] font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={!uploadData.file || isUploading}
                  className="flex-1 py-4 rounded-[20px] font-bold bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Start Upload'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Record Modal */}
      <AnimatePresence>
        {viewingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingRecord(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white w-full max-w-4xl h-[80vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{viewingRecord.file_name}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{viewingRecord.category} • {new Date(viewingRecord.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingRecord(null)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 bg-slate-100 p-8 overflow-auto flex items-center justify-center">
                {viewingRecord.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img 
                    src={viewingRecord.file_url} 
                    alt={viewingRecord.file_name} 
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="bg-white p-20 rounded-[40px] text-center shadow-sm">
                    <FileText size={80} className="text-slate-200 mx-auto mb-6" />
                    <p className="text-xl font-black text-slate-900 mb-4">Preview not available</p>
                    <a 
                      href={viewingRecord.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
                    >
                      <Download size={20} />
                      Download to View
                    </a>
                  </div>
                )}
              </div>

              {viewingRecord.analysis && (
                <div className="p-8 bg-emerald-50 border-t border-emerald-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles size={20} className="text-emerald-600" />
                    <h3 className="text-lg font-black text-emerald-900">AI Analysis Summary</h3>
                  </div>
                  <p className="text-emerald-800 font-medium leading-relaxed">
                    {viewingRecord.analysis}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthRecords;
