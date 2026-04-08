
import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  Calendar, 
  Droplets, 
  QrCode, 
  Download, 
  Share2, 
  CheckCircle2, 
  Lock,
  ChevronRight,
  CreditCard,
  History,
  FileText,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HealthID as HealthIDType } from '../types';

const HealthID: React.FC<{ user: any; onBack: () => void }> = ({ user, onBack }) => {
  const [healthID, setHealthID] = useState<HealthIDType>({
    id: 'HID-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    abhaNumber: '91-4285-1920-3344',
    name: user?.username || 'Rajesh Kumar',
    dob: '15-08-1992',
    gender: user?.gender || 'Male',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HID-91428519203344',
    bloodGroup: 'O+ Positive'
  });

  const [activeTab, setActiveTab] = useState<'card' | 'records' | 'history'>('card');

  const records = [
    { id: 'r1', title: 'Blood Analysis Report', date: '24 Mar 2026', hospital: 'Apollo Hospitals', type: 'Laboratory' },
    { id: 'r2', title: 'COVID-19 Vaccination', date: '12 Jan 2026', hospital: 'Govt. Health Center', type: 'Vaccination' },
    { id: 'r3', title: 'General Checkup', date: '05 Nov 2025', hospital: 'Fortis Healthcare', type: 'Consultation' },
  ];

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Shield size={24} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">National Health ID (ABHA)</h1>
            </div>
            <p className="text-slate-500 font-medium">Secure Digital Health Records • Ayushman Bharat Digital Mission</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none h-12 px-6 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Share2 size={18} /> Share ID
            </button>
            <button className="flex-1 md:flex-none h-12 px-6 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
              <Download size={18} /> Download Card
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-200/50 rounded-2xl w-full md:w-fit">
          {['card', 'records', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              {/* Health Card */}
              <div className="lg:col-span-3">
                <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden aspect-[1.6/1]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full -ml-24 -mb-24 blur-3xl"></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                          <Shield size={28} />
                        </div>
                        <div>
                          <h2 className="text-xl font-black uppercase tracking-tighter leading-none">Ayushman Bharat</h2>
                          <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Digital Health Mission</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Health ID Number</p>
                        <p className="text-lg font-black tracking-widest">{healthID.abhaNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Full Name</p>
                          <h3 className="text-2xl font-black uppercase tracking-tight">{healthID.name}</h3>
                        </div>
                        <div className="flex gap-8">
                          <div>
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Date of Birth</p>
                            <p className="font-bold">{healthID.dob}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Gender</p>
                            <p className="font-bold">{healthID.gender}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Blood Group</p>
                            <p className="font-bold">{healthID.bloodGroup}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl shadow-lg">
                        <img src={healthID.qrCode} alt="QR Code" className="w-24 h-24" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Verified Identity</h4>
                      <p className="text-xs font-bold text-slate-500">Linked with Aadhaar</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Lock size={28} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">End-to-End Encryption</h4>
                      <p className="text-xs font-bold text-slate-500">Secure Data Vault</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Health ID Benefits</h3>
                  <div className="space-y-6">
                    {[
                      { icon: CreditCard, title: 'Cashless Treatment', desc: 'Accepted at all govt. and empaneled hospitals.' },
                      { icon: History, title: 'Unified History', desc: 'Access your medical history across any hospital.' },
                      { icon: Shield, title: 'Insurance Integration', desc: 'Direct link with Ayushman Bharat insurance.' }
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                          <benefit.icon size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{benefit.title}</h4>
                          <p className="text-xs font-bold text-slate-500 leading-relaxed">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <QrCode size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tight">Scan & Share</h4>
                      <p className="text-xs font-bold text-slate-400">Share with Doctor</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">
                    Allow healthcare providers to access your records securely by scanning your QR code.
                  </p>
                  <button className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all">
                    Generate One-Time Access
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'records' && (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {records.map((record) => (
                  <div key={record.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <FileText size={28} />
                      </div>
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                        <Download size={20} />
                      </button>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{record.title}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{record.type}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">{record.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Activity size={14} className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{record.hospital}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all gap-4 min-h-[250px]">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Download size={32} className="rotate-180" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm font-black uppercase tracking-tight">Upload New Record</h4>
                    <p className="text-xs font-bold">PDF, JPG or PNG</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Access History</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Who accessed your health records</p>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  { provider: 'Apollo Hospitals', purpose: 'General Consultation', date: '24 Mar 2026, 10:45 AM', status: 'Authorized' },
                  { provider: 'Dr. Sarah Wilson', purpose: 'Prescription Update', date: '18 Mar 2026, 02:30 PM', status: 'Authorized' },
                  { provider: 'Max Healthcare', purpose: 'Emergency Access', date: '10 Mar 2026, 11:20 PM', status: 'Emergency' },
                  { provider: 'Govt. Health Portal', purpose: 'Profile Sync', date: '01 Mar 2026, 09:00 AM', status: 'System' }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.provider}</h4>
                        <p className="text-xs font-bold text-slate-500">{item.purpose}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">{item.date}</p>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        item.status === 'Emergency' ? 'text-red-500' : 'text-emerald-500'
                      }`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HealthID;
