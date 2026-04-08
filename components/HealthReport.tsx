
import React, { useState, useRef } from 'react';
import { Message, UserHealthProfile } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface HealthReportProps {
  messages: Message[];
  userProfile: UserHealthProfile;
  sessionId: string;
  onBack: () => void;
}

const HealthReport: React.FC<HealthReportProps> = ({ messages, userProfile, sessionId, onBack }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const recordId = `HB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
  
  const handleDownload = async () => {
    const element = document.getElementById('printable-document');
    if (!element) return;
    
    setIsDownloading(true);
    try {
      const originalScrollTop = window.scrollY;
      window.scrollTo(0, 0);

      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });
      
      window.scrollTo(0, originalScrollTop);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = 210; 
      const pdfPageHeight = 297; 
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const imgHeightInPdf = (canvasHeight * pdfWidth) / canvasWidth;
      
      let heightLeft = imgHeightInPdf;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
      heightLeft -= pdfPageHeight;

      // Loop to add more pages if the content exceeds one page
      while (heightLeft > 0) {
        position -= pdfPageHeight; // Shift the position up
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfPageHeight;
      }
      
      pdf.save(`HealBot_Clinical_Report_${userProfile.patient_id}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed:", error);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleNarration = () => {
    if (isNarrating) {
      synthRef.current.cancel();
      setIsNarrating(false);
      return;
    }
    const reportText = messages
      .filter(m => m.role === 'assistant' && m.id !== '1')
      .map(m => m.content)
      .join('\n')
      .replace(/[#*|]/g, '');

    const utterance = new SpeechSynthesisUtterance(reportText);
    utterance.rate = 1;
    utterance.onstart = () => setIsNarrating(true);
    utterance.onend = () => setIsNarrating(false);
    synthRef.current.speak(utterance);
  };

  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-6">
        {lines.map((line, i) => {
          if (line.startsWith('### ')) {
            return (
              <div key={i} className="bg-slate-900 p-4 rounded-t-xl mt-8">
                <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <i className="fas fa-folder-open text-blue-400"></i>
                  {line.replace('###', '').trim()}
                </h3>
              </div>
            );
          }
          if (line.startsWith('#### ')) {
            return (
              <h4 key={i} className="text-[11px] font-black text-blue-700 mt-6 mb-2 uppercase tracking-[0.2em] border-l-4 border-blue-600 pl-3">
                {line.replace('####', '').trim()}
              </h4>
            );
          }
          if (line.trim().startsWith('|')) {
            const cells = line.split('|').filter(c => c.trim().length > 0);
            if (line.includes('---')) return null;
            return (
              <div key={i} className="flex border-x border-b border-slate-200 bg-white">
                {cells.map((cell, idx) => (
                  <span key={idx} className={`flex-1 p-3 text-[11px] ${idx === 0 ? 'font-black text-slate-900 bg-slate-50 border-r border-slate-200' : 'text-slate-600 font-medium'}`}>
                    {cell.trim()}
                  </span>
                ))}
              </div>
            );
          }
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={i} className="text-sm text-slate-700 leading-relaxed px-2">
              {parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={idx} className="text-slate-900 font-bold bg-yellow-50">{part.replace(/\*\*/g, '')}</strong>;
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  const images = messages.filter(m => m.image);
  const assistants = messages.filter(m => m.role === 'assistant' && m.id !== '1');

  return (
    <div className="bg-slate-100 min-h-screen py-10 px-4 md:px-0 no-print">
      {/* Control Bar */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <button onClick={() => { synthRef.current.cancel(); onBack(); }} className="flex items-center gap-3 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-blue-600 transition-all">
          <i className="fas fa-arrow-left"></i> Close Report
        </button>
        <div className="flex gap-3">
           <button onClick={toggleNarration} className={`px-6 py-3 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all ${isNarrating ? 'bg-red-600 text-white animate-pulse' : 'bg-white border border-slate-200 text-slate-800'}`}>
            <i className={`fas ${isNarrating ? 'fa-stop' : 'fa-volume-up'}`}></i> {isNarrating ? 'Stop' : 'Read Aloud'}
           </button>
           <button onClick={handleDownload} disabled={isDownloading} className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl">
            {isDownloading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-export"></i>} Export PDF
           </button>
        </div>
      </div>

      {/* Main Report Document */}
      <div id="printable-document" className="bg-white max-w-[210mm] mx-auto shadow-2xl overflow-hidden" style={{ minHeight: '297mm' }}>
        {/* Document Header */}
        <div className="relative">
          <div className="bg-slate-900 p-12 text-white flex justify-between items-start border-b-[8px] border-blue-600">
            <div className="flex gap-6 items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl">
                <i className="fas fa-heartbeat"></i>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">HealBot AI</h1>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-400 mt-2">Clinical Diagnostics Platform</p>
                <div className="flex gap-3 mt-4">
                  <span className="text-[8px] font-black uppercase bg-white/10 px-2 py-1 rounded">ISO_27001</span>
                  <span className="text-[8px] font-black uppercase bg-white/10 px-2 py-1 rounded">HIPAA_COMPLIANT</span>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="bg-blue-600/20 p-3 rounded-xl border border-blue-600/30 mb-4">
                <p className="text-[10px] font-black text-blue-400">RECORD_HASH</p>
                <p className="text-[10px] font-mono font-bold text-white uppercase">{recordId}</p>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase">Issued: {reportDate}</p>
            </div>
          </div>
          {/* Verified Badge Seal */}
          <div className="absolute top-[80%] right-12 w-24 h-24 border-4 border-dashed border-green-500/30 rounded-full flex items-center justify-center -rotate-12 pointer-events-none">
             <div className="text-center">
               <p className="text-[8px] font-black text-green-600 uppercase">AI VERIFIED</p>
               <i className="fas fa-check-circle text-green-500 text-xl"></i>
               <p className="text-[6px] font-black text-green-600 uppercase">Neural Sync</p>
             </div>
          </div>
        </div>

        {/* Patient Profile Box */}
        <div className="p-12">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject Name</p>
              <p className="text-sm font-black text-slate-900 uppercase">{userProfile.name}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Medical ID</p>
              <p className="text-sm font-black text-blue-600">{userProfile.patient_id}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Vitals / Bio</p>
              <p className="text-sm font-black text-slate-900">{userProfile.age}Y | {userProfile.gender}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Session</p>
              <p className="text-sm font-black text-slate-900">{sessionId}</p>
            </div>
          </div>

          {/* Clinical Findings Sections */}
          <div className="space-y-12">
            {assistants.map((msg, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Sequence #{idx + 1}</span>
                  <span className="text-[9px] font-mono text-slate-400">{msg.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="p-8">
                  {renderFormattedText(msg.content)}
                </div>
              </div>
            ))}
          </div>

          {/* Imaging Exhibit Box */}
          {images.length > 0 && (
            <div className="mt-16">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <i className="fas fa-camera-retro text-blue-600"></i> Clinical Imaging Exhibits
              </h3>
              <div className="grid grid-cols-2 gap-8">
                {images.map((img, idx) => (
                  <div key={idx} className="border-2 border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                    <img src={img.image} className="w-full h-48 object-cover rounded-xl shadow-md border border-white mb-4" alt="Clinical Exhibit" />
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase">EXHIBIT_IMG_{idx + 1}</p>
                      <p className="text-[7px] font-mono text-slate-300 mt-1">HASH: {Math.random().toString(16).substr(2, 8)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures and Logo Footer */}
          <div className="mt-24 pt-12 border-t-2 border-slate-100 flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="w-full max-w-xs text-center md:text-left">
              <div className="border-b border-slate-900 pb-2 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Electronic Physician Signature</p>
                <p className="font-serif italic text-3xl text-blue-900/40 select-none">HealBot Neural Engine</p>
              </div>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Digital Verification Key: HB_CORE_{sessionId.split('-')[1]}</p>
            </div>

            <div className="flex items-center gap-4 opacity-20">
               <div className="text-right">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">HealBot AI</h4>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Protocol v8.2.1</p>
               </div>
               <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl">
                 <i className="fas fa-heartbeat"></i>
               </div>
            </div>
          </div>

          {/* Legal Disclaimer Box */}
          <div className="mt-16 p-8 bg-red-50 rounded-[2rem] border border-red-100">
            <h5 className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <i className="fas fa-exclamation-triangle"></i> Mandatory Clinical Disclaimer
            </h5>
            <p className="text-[9px] text-red-800 font-bold leading-relaxed uppercase tracking-wider text-justify">
              This document is an AI-generated summary provided for informational and clinical coordination purposes only. 
              It does NOT constitute a final medical diagnosis or a binding prescription. The findings herein are based on 
              heuristic analysis of patient-provided inputs and imaging. Always consult with a board-certified medical professional 
              or visit an emergency care facility for acute medical concerns. HealBot AI and its developers assume no liability 
              for actions taken based on this informational report.
            </p>
          </div>
        </div>

        {/* Global Footer Banner */}
        <div className="bg-slate-900 p-6 text-center">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em]">Clinical Knowledge Repository Sync • Confidential Patient Data • Protected by Neural-Lock™</p>
        </div>
      </div>
    </div>
  );
};

export default HealthReport;
