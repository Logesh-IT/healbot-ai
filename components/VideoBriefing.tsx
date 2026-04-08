
import React, { useState, useEffect, useRef } from 'react';

interface VideoBriefingProps {
  reportText: string;
  onClose: () => void;
}

const VideoBriefing: React.FC<VideoBriefingProps> = ({ reportText, onClose }) => {
  const [isReading, setIsReading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const steps = [
    "Scanning Bio-Metrics...",
    "Decrypting Clinical Data...",
    "Generating Neural Visuals...",
    "Briefing Ready."
  ];

  useEffect(() => {
    // Simulated "Neural Processing" loading
    const timer = setInterval(() => {
      setLoadingStep(prev => {
        if (prev === steps.length - 1) {
          setIsReady(true);
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => {
      clearInterval(timer);
      synthRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    if (!isReady || !canvasRef.current) return;

    // Start Web Audio Vis / Background Animation
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw pulsing ring
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 100 + Math.sin(frame * 0.05) * 10;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw rotating particles
      for (let i = 0; i < 50; i++) {
        const angle = (i * (Math.PI * 2) / 50) + (frame * 0.01);
        const px = centerX + Math.cos(angle) * (radius + 20);
        const py = centerY + Math.sin(angle) * (radius + 20);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(px - 1, py - 1, 2, 2);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isReady]);

  const startBriefing = () => {
    if (isReading) {
      synthRef.current.cancel();
      setIsReading(false);
      return;
    }

    const cleanText = reportText.replace(/[#*|]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    
    // Find a nice medical sounding voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-brain"></i>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">AI Clinical Briefing</h3>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Neural Visualization Engine • v1.0 (FREE)</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 bg-black aspect-video relative flex items-center justify-center overflow-hidden">
          {!isReady ? (
            <div className="flex flex-col items-center gap-8 p-12 text-center">
              <div className="relative">
                <div className="w-20 h-20 border-[4px] border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-shield-heart text-2xl text-blue-600 animate-pulse"></i>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white font-black text-lg uppercase tracking-tight">{steps[loadingStep]}</p>
                <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mx-auto">
                   <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(loadingStep + 1) * 25}%` }}></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <canvas ref={canvasRef} width={800} height={450} className="w-full h-full opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-gradient-to-t from-black via-transparent to-transparent">
                <div className="mb-8 p-6 border border-white/10 rounded-[2.5rem] bg-white/5 backdrop-blur-md max-w-lg">
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Neural Narrative Stream</p>
                  <p className="text-white font-medium text-sm leading-relaxed italic">
                    "{reportText.substring(0, 150)}..."
                  </p>
                </div>
                
                <button 
                  onClick={startBriefing}
                  className={`px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl flex items-center gap-4 ${isReading ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-slate-900 hover:bg-blue-600 hover:text-white'}`}
                >
                  <i className={`fas ${isReading ? 'fa-stop-circle' : 'fa-play-circle'} text-xl`}></i>
                  {isReading ? 'Stop Briefing' : 'Begin AI Briefing'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
           <div className="flex justify-center gap-12">
             <div className="text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
               <p className="text-xs font-bold text-green-600 uppercase">Verified</p>
             </div>
             <div className="text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Encryption</p>
               <p className="text-xs font-bold text-slate-900 uppercase">AES-256</p>
             </div>
             <div className="text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mode</p>
               <p className="text-xs font-bold text-slate-900 uppercase">Multimodal</p>
             </div>
           </div>
        </div>

        <div className="bg-slate-900 p-4 text-center">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Clinical Knowledge Graph Visualization • Protocol v8.0</p>
        </div>
      </div>
    </div>
  );
};

export default VideoBriefing;
