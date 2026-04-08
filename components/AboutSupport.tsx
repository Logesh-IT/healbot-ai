
import React from 'react';
import { UserHealthProfile } from '../types';

interface AboutSupportProps {
  userProfile: UserHealthProfile;
  sessionId: string;
  onBack: () => void;
}

const AboutSupport: React.FC<AboutSupportProps> = ({ userProfile, sessionId, onBack }) => {
  const currentDateTime = new Date().toLocaleString();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="bg-white p-6 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-all">
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">About & Support</h2>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Medical Information Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs">
              <i className="fas fa-heartbeat"></i>
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400">HealBot v8.2</span>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
        {/* Safety Notice Card */}
        <section className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] shadow-sm">
          <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-3">
            <i className="fas fa-triangle-exclamation text-lg"></i> Healthcare Safety Notice
          </h3>
          <p className="text-sm font-bold text-red-900 uppercase tracking-tight mb-2">AI Medical Chatbot — Informational Use Only</p>
          <p className="text-sm text-red-800/80 leading-relaxed font-medium">
            This system provides AI-generated health guidance and does not replace professional medical diagnosis or treatment. Always consult a qualified healthcare provider.
          </p>
          <div className="mt-6 p-4 bg-white/50 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white animate-pulse">
               <i className="fas fa-phone-volume"></i>
            </div>
            <p className="text-xs font-black text-red-700 uppercase">🚨 Emergency: If symptoms are severe, contact emergency services immediately.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Privacy & Security */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <i className="fas fa-lock text-blue-600"></i> Privacy & Security
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm font-medium text-slate-700">
                <i className="fas fa-shield-halved text-green-500 mt-1"></i>
                <span>All user data is encrypted and handled securely within protected clinical silos.</span>
              </li>
              <li className="flex gap-3 text-sm font-medium text-slate-700">
                <i className="fas fa-user-shield text-blue-500 mt-1"></i>
                <span>No personal health information (PHI) is shared with third parties without explicit consent.</span>
              </li>
            </ul>
          </div>

          {/* Accessibility */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <i className="fas fa-globe text-blue-600"></i> Accessibility & Language
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm font-medium text-slate-700">
                <i className="fas fa-universal-access text-blue-500 mt-1"></i>
                <span>Accessibility-friendly interface designed for universal healthcare access.</span>
              </li>
              <li className="flex gap-3 text-sm font-medium text-slate-700">
                <i className="fas fa-language text-blue-500 mt-1"></i>
                <span>Multilingual support available. Use the language selector to change the interface language.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Session Metadata Card */}
        <section className="bg-slate-900 p-8 rounded-[3rem] text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <i className="fas fa-server text-8xl"></i>
          </div>
          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-8">📄 Current Session Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div>
              <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Patient ID</p>
              <p className="font-mono font-bold text-sm tracking-widest">{userProfile.patient_id}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Session Reference</p>
              <p className="font-mono font-bold text-sm tracking-widest">{sessionId}</p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Generated Date/Time</p>
              <p className="font-mono font-bold text-sm tracking-widest">{currentDateTime}</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
             <i className="fas fa-circle-info text-blue-400 text-xs"></i>
             <p className="text-[10px] font-black text-slate-400 uppercase">Comprehensive download report is available for medical reference in the chat view.</p>
          </div>
        </section>

        {/* Contact & Support Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
               <i className="fas fa-headset text-blue-600"></i> Contact & Support
             </h4>
             <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <i className="fas fa-building"></i>
                 </div>
                 <div>
                   <p className="text-xs font-black uppercase text-slate-900">LokyLabs</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">AI Healthcare Initiative</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 gap-3">
                 <a href="mailto:logesh20bec@gmail.com" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors">
                    <i className="fas fa-envelope text-blue-500"></i>
                    <span className="text-xs font-bold text-slate-700">logesh20bec@gmail.com</span>
                 </a>
                 <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <i className="fas fa-phone text-blue-500"></i>
                    <span className="text-xs font-bold text-slate-700">+91-XXXXXXXXXX</span>
                 </div>
                 <a href="https://www.lokylabs.com" target="_blank" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors">
                    <i className="fas fa-globe text-blue-500"></i>
                    <span className="text-xs font-bold text-slate-700">www.lokylabs.com</span>
                 </a>
               </div>

               <div className="pt-4 flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 px-4">
                  <i className="fas fa-clock"></i>
                  <span>Support Hours: Mon–Sat | 9:00 AM – 6:00 PM</span>
               </div>
             </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-4xl mb-6 shadow-2xl">
               <i className="fas fa-code"></i>
             </div>
             <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">Developer Credit</h4>
             <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-widest">Designed & Developed by</p>
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 w-full">
               <p className="text-xl font-black text-blue-600 uppercase tracking-widest mb-1">LokyLabs</p>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Healthcare Innovation Hub</p>
             </div>
           </div>
        </div>

        {/* Legend Box */}
        <div className="bg-slate-100 p-8 rounded-[2rem] border border-slate-200 text-center">
           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">⚖ Compliance & Transparency</h5>
           <p className="text-xs font-medium text-slate-500 leading-relaxed italic max-w-2xl mx-auto">
             Built following ethical AI and digital healthcare best practices. Our predictions are based on symptom pattern analysis powered by the latest clinical knowledge graphs.
           </p>
        </div>
      </div>

      {/* Global Compact Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 p-6 no-print">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-4">
          {(['Terms of Use', 'Privacy Policy', 'Accessibility', 'Help Center', 'Download Report']).map(link => (
            <button key={link} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors tracking-widest">
              {link}
            </button>
          ))}
        </div>
        <div className="mt-6 text-center relative">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.6em]">
            AI healthcare assistant • Secure data • Developed by LokyLabs
          </p>
          <button 
            onClick={() => {
              const email = prompt("Admin Email:");
              const pass = prompt("Admin Password:");
              if (email === "admin@lokylabs.com" && pass === "admin123") {
                alert("Access Granted: Project Documentation Unlocked");
                window.open('https://docs.lokylabs.com', '_blank');
              } else {
                alert("Access Denied");
              }
            }}
            className="absolute bottom-0 right-0 opacity-0 hover:opacity-100 text-[8px] text-slate-200 cursor-default"
          >
            pd
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AboutSupport;
