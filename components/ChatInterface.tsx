
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Language } from '../types';
import VoiceControl from './VoiceControl';
import Dashboard from './Dashboard';

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (text: string, image?: string) => void;
  isLowBandwidth: boolean;
  onGenerateReport: () => void;
  onClearHistory: () => void;
  lang: Language;
  isOnline: boolean;
  isTyping?: boolean;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  showAnalysis: boolean;
  setShowAnalysis: (show: boolean) => void;
  onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  onDeleteMessage: (messageId: string) => void;
  isTTSActive: boolean;
  setIsTTSActive: (active: boolean) => void;
}

const QUICK_SUGGESTIONS = [
  { text: "Recommend me hospitals and doctors nearby me with contact details", icon: "fa-hospital-user", color: "text-red-500" },
  { text: "Check my health insurance eligibility", icon: "fa-shield-heart", color: "text-amber-500" },
  { text: "Analyze a medical scan or prescription", icon: "fa-microscope", color: "text-blue-500" },
  { text: "What are the nearest pharmacies open now?", icon: "fa-pills", color: "text-green-500" }
];

const PLACEHOLDERS: Record<Language, string> = {
  [Language.EN]: "Ask anything or upload a medical scan...",
  [Language.TA]: "ஏதாவது கேளுங்கள் அல்லது மருத்துவ ஸ்கேன் பதிவேற்றவும்...",
  [Language.HI]: "कुछ भी पूछें या मेडिकल स्कैन अपलोड करें...",
  [Language.ES]: "Pregunta cualquier cosa o sube un escaneo médico...",
  [Language.AR]: "اسأل أي شيء أو ارفع فحصًا طبيًا..."
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSend, 
  isLowBandwidth, 
  onGenerateReport, 
  onClearHistory, 
  lang, 
  isOnline, 
  isTyping,
  showHistory,
  setShowHistory,
  showAnalysis,
  setShowAnalysis,
  onFeedback,
  onDeleteMessage,
  isTTSActive,
  setIsTTSActive
}) => {
  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !pendingImage) return;
    onSend(input.trim() || "Perform a full clinical analysis on this input.", pendingImage || undefined);
    setInput('');
    setPendingImage(null);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPendingImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      (videoRef.current?.srcObject as MediaStream)?.getTracks().forEach(t => t.stop());
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1920 } } 
        });
        setIsCameraActive(true);
        setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
      } catch (err) { alert("Camera failed."); }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setPendingImage(canvas.toDataURL('image/jpeg', 0.9));
      toggleCamera();
    }
  };

  const handleClearAll = () => {
    onClearHistory();
    setShowHistory(false);
    setShowClearConfirm(false);
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    if (!isTTSActive) return;
    const utterance = new SpeechSynthesisUtterance(text.replace(/#|\*|\|/g, ''));
    utterance.lang = lang === Language.TA ? 'ta-IN' : lang === Language.HI ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content !== "...") {
      speak(lastMessage.content);
    }
  }, [messages, isTTSActive]);

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('###')) {
        return <h3 key={i} className="text-xl font-black text-blue-700 mt-6 mb-3 border-b border-blue-100 pb-1 uppercase tracking-tight">{line.replace('###', '').trim()}</h3>;
      }
      if (line.startsWith('####')) {
        return <h4 key={i} className="text-sm font-black text-slate-800 mt-4 mb-2 uppercase tracking-widest bg-slate-50 p-2 rounded-lg">{line.replace('####', '').trim()}</h4>;
      }
      if (line.trim().startsWith('|') && line.includes('---')) return null;
      if (line.trim().startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim().length > 0);
        return (
          <div key={i} className="flex border-b border-slate-100 text-xs py-2 hover:bg-slate-50 transition-colors">
            {cells.map((cell, idx) => (
              <span key={idx} className={`flex-1 px-2 ${idx === 0 ? 'font-black text-slate-900' : 'text-slate-600'}`}>
                {cell.trim()}
              </span>
            ))}
          </div>
        );
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2 leading-relaxed">
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx} className="text-blue-600 font-bold">{part.replace(/\*\*/g, '')}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div 
      className="flex-1 flex flex-col bg-white overflow-hidden relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processFile(f); }}
    >
      {/* Header buttons moved to App.tsx */}

      {showHistory && (
        <div className={`absolute inset-y-0 ${lang === Language.AR ? 'right-0' : 'left-0'} w-80 bg-white border-r border-slate-200 z-40 shadow-2xl flex flex-col animate-in slide-in-from-${lang === Language.AR ? 'right' : 'left'} duration-300`}>
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Consultation Log</h3>
            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-red-500"><i className="fas fa-times"></i></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length <= 1 ? (
              <p className="text-xs text-slate-400 text-center mt-10 italic">No historical records found.</p>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border transition-all ${m.role === 'user' ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black uppercase text-slate-400">{m.role}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-slate-400 font-mono">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteMessage(m.id); }}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">{m.content.replace(/#|\|/g, '').substring(0, 80)}...</p>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-trash-alt"></i> Clear History
            </button>
          </div>
        </div>
      )}

      {showAnalysis && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-xl overflow-y-auto p-8 animate-in slide-in-from-top duration-300">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                <i className="fas fa-chart-line text-blue-600"></i> Clinical Explainability
              </h2>
              <button onClick={() => setShowAnalysis(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <Dashboard messages={messages} />
          </div>
        </div>
      )}

      {isCameraActive && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
          <video ref={videoRef} autoPlay playsInline muted className="flex-1 object-cover" />
          <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-8">
            <button onClick={toggleCamera} className="w-16 h-16 bg-white/10 backdrop-blur-3xl text-white rounded-full"><i className="fas fa-times text-xl"></i></button>
            <button onClick={capturePhoto} className="w-24 h-24 bg-white text-blue-600 rounded-full shadow-2xl active:scale-90 transition-all"><i className="fas fa-camera text-3xl"></i></button>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 pt-20 space-y-10 scrollbar-hide" dir={lang === Language.AR ? 'rtl' : 'ltr'}>
        {messages.map((m) => (
          <div key={m.id} className={`flex group ${m.role === 'user' ? (lang === Language.AR ? 'justify-start' : 'justify-end') : (lang === Language.AR ? 'justify-end' : 'justify-start')} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[85%] md:max-w-[70%] relative ${
              m.role === 'user' ? 'p-5 bg-slate-100 rounded-3xl text-slate-800' : 'p-0 text-slate-800'
            }`}>
              {m.role === 'assistant' && (
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 opacity-50 text-[10px] font-black uppercase tracking-widest text-blue-600">
                       <i className="fas fa-robot"></i> HealBot AI
                    </div>
                    <button 
                      onClick={() => onDeleteMessage(m.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Delete message"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                 </div>
              )}
              {m.role === 'user' && (
                <button 
                  onClick={() => onDeleteMessage(m.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-200 transition-all shadow-sm z-10 opacity-0 group-hover:opacity-100"
                  title="Delete message"
                >
                  <i className="fas fa-times text-[10px]"></i>
                </button>
              )}
              {m.image && <img src={m.image} className="w-full max-h-[30rem] object-contain rounded-3xl mb-6 border border-slate-100 shadow-xl" referrerPolicy="no-referrer" />}
              {m.content === "..." ? (
                <div className="flex gap-1 py-4">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              ) : (
                <>
                  <div className="text-[15px] leading-relaxed font-medium">
                    {renderContent(m.content)}
                  </div>
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => onFeedback(m.id, 'like')}
                        className={`text-xs flex items-center gap-2 transition-all ${m.feedback === 'like' ? 'text-green-600 font-black' : 'text-slate-400 hover:text-green-600'}`}
                      >
                        <i className={`fas fa-thumbs-up ${m.feedback === 'like' ? 'scale-110' : ''}`}></i> Helpful
                      </button>
                      <button 
                        onClick={() => onFeedback(m.id, 'dislike')}
                        className={`text-xs flex items-center gap-2 transition-all ${m.feedback === 'dislike' ? 'text-red-600 font-black' : 'text-slate-400 hover:text-red-600'}`}
                      >
                        <i className={`fas fa-thumbs-down ${m.feedback === 'dislike' ? 'scale-110' : ''}`}></i> Not Helpful
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border-t border-slate-100 no-print">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
             <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest px-2">Healthcare Quick Actions</p>
             <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSend(suggestion.text)}
                  className="flex-shrink-0 bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl text-[11px] font-black uppercase text-slate-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all flex items-center gap-3 shadow-sm"
                >
                  <i className={`fas ${suggestion.icon} ${suggestion.color} group-hover:text-white`}></i>
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>

          {pendingImage && (
            <div className="mb-4 relative w-32 h-32 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white">
              <img src={pendingImage} className="w-full h-full object-cover" />
              <button onClick={() => setPendingImage(null)} className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full text-xs"><i className="fas fa-trash"></i></button>
            </div>
          )}
          <form onSubmit={handleSubmit} dir={lang === Language.AR ? 'rtl' : 'ltr'} className="flex gap-4 items-end bg-slate-100 rounded-[2rem] p-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-inner">
            <div className={`flex gap-1 ${lang === Language.AR ? 'flex-row-reverse' : 'flex-row'}`}>
              <button type="button" onClick={toggleCamera} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-all"><i className="fas fa-camera"></i></button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-all"><i className="fas fa-paperclip"></i></button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => processFile(e.target.files?.[0]!)} />
            <div className="flex-1">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }} placeholder={PLACEHOLDERS[lang]} className="w-full bg-transparent border-none px-2 py-3 text-sm focus:ring-0 outline-none resize-none min-h-[44px] font-medium" rows={1} />
            </div>
            <div className={`flex items-center gap-2 ${lang === Language.AR ? 'flex-row-reverse' : 'flex-row'}`}>
              <button 
                type="button" 
                onClick={() => setIsTTSActive(!isTTSActive)} 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isTTSActive ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
                title={isTTSActive ? "Disable Voice Output" : "Enable Voice Output"}
              >
                <i className={`fas ${isTTSActive ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
              </button>
              <VoiceControl onTranscript={setInput} />
              <button type="submit" disabled={(!input.trim() && !pendingImage) || !isOnline} className="w-12 h-12 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50">
                <i className={`fas fa-arrow-${lang === Language.AR ? 'down' : 'up'}`}></i>
              </button>
            </div>
          </form>
          {!isOnline && (
            <p className="text-[10px] text-red-500 text-center mt-2 font-black uppercase tracking-widest animate-pulse">
              <i className="fas fa-wifi-slash mr-1"></i> You are currently offline. Please check your connection.
            </p>
          )}
          <p className="text-[10px] text-slate-400 text-center mt-4 font-black uppercase tracking-[0.2em]">Clinical Advice • Not a medical diagnosis • Call 911 for emergencies</p>
        </div>
      </div>

      {/* Clear History Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 p-10 text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto">
                <i className="fas fa-trash-alt"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Clear All History?</h3>
              <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">
                This will permanently delete all your consultation records, clinical bookings, and health logs. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleClearAll}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                >
                  Yes, Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInterface;
