
import React, { useState, useEffect } from 'react';
import { InsurancePlan, InsuranceRequest } from '../types';
import supabase, { isSupabaseConfigured } from '../supabase';

type InsuranceView = 'TYPES' | 'RECOMMEND' | 'DETAILS' | 'BOOK' | 'HISTORY';

const MOCK_PLANS: InsurancePlan[] = [
  {
    id: 'p1',
    name: 'HealBot Individual Silver',
    type: 'Individual',
    premium: 5500,
    coverage: '₹5,00,000',
    benefits: ['100% Bill Payment', 'Pre/Post Hospitalization', 'AYUSH Coverage', 'No Room Rent Capping'],
    waitingPeriod: '2 Years for Pre-existing',
    taxBenefit: 'Upto ₹25,000 under Section 80D'
  },
  {
    id: 'p2',
    name: 'Family Floater Gold',
    type: 'Family',
    premium: 12500,
    coverage: '₹10,00,000',
    benefits: ['Maternity & Newborn Cover', 'Restoration of Sum Insured', 'Modern Treatment Coverage'],
    waitingPeriod: '3 Years for Pre-existing',
    taxBenefit: 'Upto ₹50,000 under Section 80D'
  },
  {
    id: 'p3',
    name: 'Senior Care Platinum',
    type: 'Senior',
    premium: 18000,
    coverage: '₹7,50,000',
    benefits: ['OPD Consultations included', 'No Medical Screening required', 'Home Care Cover'],
    waitingPeriod: '1 Year for Pre-existing',
    taxBenefit: 'Upto ₹50,000 under Section 80D'
  },
  {
    id: 'p4',
    name: 'Critical Illness Shield',
    type: 'Critical',
    premium: 8500,
    coverage: '₹20,00,000 (Lumpsum)',
    benefits: ['Coverage for 32 Illnesses', 'Global Second Opinion', 'Income Tax Benefits'],
    waitingPeriod: '90 Days Initial Waiting',
    taxBenefit: 'Upto ₹25,000 under Section 80D'
  }
];

const InsuranceModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [view, setView] = useState<InsuranceView>('TYPES');
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [history, setHistory] = useState<InsuranceRequest[]>([]);
  
  // Reco Form
  const [recoForm, setRecoForm] = useState({
    age: 25,
    city: 'Tier 1',
    members: 1,
    illness: false,
    coverage: 500000
  });

  // Booking Form
  const [bookForm, setBookForm] = useState({ name: '', email: '', phone: '', pan: '' });

  useEffect(() => {
    const saved = localStorage.getItem('hb_insurance_requests');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleApply = (plan: InsurancePlan) => {
    setSelectedPlan(plan);
    setView('DETAILS');
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const newRequest: InsuranceRequest = {
      id: `POL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      userName: bookForm.name,
      userEmail: bookForm.email,
      premium: selectedPlan.premium,
      status: 'Submitted',
      timestamp: new Date().toISOString()
    };

    const updated = [newRequest, ...history];
    setHistory(updated);
    localStorage.setItem('hb_insurance_requests', JSON.stringify(updated));
    window.dispatchEvent(new Event('hb_data_changed'));

    if (isSupabaseConfigured) {
      supabase.from('insurance_requests').insert([newRequest]).then(({ error }) => {
        if (error) console.error("Error saving insurance request to Supabase:", error);
      });
    }
    setView('HISTORY');
  };

  const deleteRequest = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('hb_insurance_requests', JSON.stringify(updated));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Module Header */}
      <header className="bg-white p-6 border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Insurance Hub</h2>
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1">Health & Financial Protection</p>
            </div>
          </div>
          <nav className="flex bg-slate-100 p-1 rounded-xl">
            {(['TYPES', 'RECOMMEND', 'HISTORY'] as InsuranceView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  view === v || (v === 'TYPES' && (view === 'DETAILS' || view === 'BOOK'))
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v === 'TYPES' ? 'Plans' : v === 'RECOMMEND' ? 'Get Advice' : 'My Requests'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto">
          
          {/* STAGE 1: INSURANCE TYPES PAGE */}
          {view === 'TYPES' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-12 text-center max-w-2xl mx-auto">
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Discover Health Protection Plans</h3>
                <p className="text-slate-500 font-medium">Select a category to find plans tailored to your specific healthcare and financial requirements.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_PLANS.map((plan) => (
                  <div key={plan.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-blue-300 transition-all group flex flex-col h-full shadow-sm hover:shadow-xl">
                    <div className="mb-6">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <i className={`fas ${plan.type === 'Individual' ? 'fa-user' : plan.type === 'Family' ? 'fa-users' : plan.type === 'Senior' ? 'fa-person-cane' : 'fa-skull-crossbones'}`}></i>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight">{plan.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{plan.type} Coverage</p>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.benefits.slice(0, 3).map((b, i) => (
                        <li key={i} className="text-xs font-bold text-slate-600 flex items-center gap-2">
                          <i className="fas fa-check text-green-500 text-[10px]"></i> {b}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-6 border-t border-slate-50">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-slate-400">Premium</span>
                        <span className="text-lg font-black text-slate-900">₹{plan.premium.toLocaleString()} <span className="text-[10px] font-medium text-slate-400">/ yr</span></span>
                      </div>
                      <button onClick={() => handleApply(plan)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                        Explore Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 2: RECOMMENDATION ENGINE */}
          {view === 'RECOMMEND' && (
            <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <i className="fas fa-brain"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Plan Recommender</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Smart Logic Algorithm</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Your Age</label>
                    <input type="number" value={recoForm.age} onChange={e => setRecoForm({...recoForm, age: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Location</label>
                    <select value={recoForm.city} onChange={e => setRecoForm({...recoForm, city: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold">
                      <option>Tier 1 (Metro)</option>
                      <option>Tier 2 (Urban)</option>
                      <option>Tier 3 (Rural)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Coverage Needs</label>
                  <input type="range" min="300000" max="2500000" step="100000" value={recoForm.coverage} onChange={e => setRecoForm({...recoForm, coverage: Number(e.target.value)})} className="w-full accent-blue-600" />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 mt-2">
                    <span>₹3 Lakh</span>
                    <span className="text-blue-600">Selected: ₹{recoForm.coverage.toLocaleString()}</span>
                    <span>₹25 Lakh</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <input type="checkbox" checked={recoForm.illness} onChange={e => setRecoForm({...recoForm, illness: e.target.checked})} className="w-5 h-5 rounded-md" />
                  <label className="text-xs font-bold text-slate-700">Do you have existing medical conditions? (Diabetes, BP, etc.)</label>
                </div>
                <button 
                  onClick={() => {
                    const best = recoForm.age > 55 ? MOCK_PLANS[2] : recoForm.members > 1 ? MOCK_PLANS[1] : MOCK_PLANS[0];
                    handleApply(best);
                  }}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                  Generate Recommendations
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: PLAN DETAILS PAGE */}
          {view === 'DETAILS' && selectedPlan && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
              <div className="p-12 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">{selectedPlan.name}</h3>
                  <div className="flex gap-4">
                    <span className="bg-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Premium Coverage</span>
                    <span className="bg-slate-800 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Section 80D Tax Benefit</span>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Annual Premium</p>
                  <p className="text-4xl font-black text-white">₹{selectedPlan.premium.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Key Coverage Benefits</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedPlan.benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-check text-xs"></i>
                          </div>
                          <span className="text-sm font-bold text-slate-700">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100">
                    <h5 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3">Tax Savings</h5>
                    <p className="text-sm font-bold text-amber-900 leading-relaxed">{selectedPlan.taxBenefit}</p>
                  </div>
                </div>
                <div className="space-y-10">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Waiting Periods & Exclusions</h4>
                    <div className="space-y-4">
                      <div className="p-6 border border-slate-100 rounded-2xl flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Pre-existing Diseases</span>
                        <span className="text-xs font-black text-slate-900 uppercase">{selectedPlan.waitingPeriod}</span>
                      </div>
                      <div className="p-6 border border-slate-100 rounded-2xl flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Initial Waiting Period</span>
                        <span className="text-xs font-black text-slate-900 uppercase">30 Days</span>
                      </div>
                      <div className="p-6 border border-slate-100 rounded-2xl flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Sum Insured Restoration</span>
                        <span className="text-xs font-black text-green-600 uppercase">Immediate</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setView('BOOK')}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all"
                  >
                    Proceed to Application
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: APPLY / BOOK INSURANCE */}
          {view === 'BOOK' && selectedPlan && (
            <div className="max-w-xl mx-auto bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Application Form</h3>
                <p className="text-xs font-bold text-slate-400 mt-2">Securing your policy for: <span className="text-blue-600">{selectedPlan.name}</span></p>
              </div>
              <form onSubmit={submitApplication} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Full Legal Name</label>
                  <input required value={bookForm.name} onChange={e => setBookForm({...bookForm, name: e.target.value})} type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" placeholder="As per PAN Card" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Email Address</label>
                    <input required value={bookForm.email} onChange={e => setBookForm({...bookForm, email: e.target.value})} type="email" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Phone Number</label>
                    <input required value={bookForm.phone} onChange={e => setBookForm({...bookForm, phone: e.target.value})} type="tel" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">PAN Number (Optional)</label>
                  <input value={bookForm.pan} onChange={e => setBookForm({...bookForm, pan: e.target.value})} type="text" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" placeholder="ABCDE1234F" />
                </div>
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Total Payable</p>
                    <p className="text-2xl font-black text-slate-900">₹{selectedPlan.premium.toLocaleString()}</p>
                  </div>
                  <i className="fas fa-shield-check text-3xl text-blue-200"></i>
                </div>
                <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-green-700 transition-all">
                  Submit & Book Policy
                </button>
              </form>
            </div>
          )}

          {/* STAGE 5: MY INSURANCE REQUESTS PAGE */}
          {view === 'HISTORY' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Policy Vault</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{history.length} ACTIVE APPLICATIONS</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {history.length > 0 ? history.map(req => (
                  <div key={req.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-200 transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">{req.status}</span>
                        <span className="text-[9px] font-mono text-slate-300">REF: {req.id}</span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 mb-1">{req.planName}</h4>
                      <p className="text-xs font-bold text-slate-500">Applicant: {req.userName} • Premium: ₹{req.premium.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Applied Date</p>
                        <p className="text-xs font-bold text-slate-900">{new Date(req.timestamp).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => deleteRequest(req.id)} className="w-12 h-12 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-200 border-dashed">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 text-3xl">
                      <i className="fas fa-file-invoice"></i>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">No Active Requests</h4>
                    <p className="text-slate-400 font-bold mb-8 max-w-xs mx-auto text-sm">You haven't submitted any insurance applications yet.</p>
                    <button onClick={() => setView('TYPES')} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100">
                      Browse Plans Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Module Footer */}
      <footer className="bg-white p-5 border-t border-slate-200 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] no-print">
        <i className="fas fa-shield-halved text-amber-500 mr-2"></i> Clinical Protection Registry v2.1 • Local Storage Persistence Active
      </footer>
    </div>
  );
};

export default InsuranceModule;
