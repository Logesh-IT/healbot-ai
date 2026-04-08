
import React, { useState, useEffect } from 'react';
import { UserHealthProfile } from '../types';
import supabase, { isSupabaseConfigured } from '../supabase';

interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  description: string;
  rating: number;
  tags: string[];
  price?: string;
  storeUrl?: string;
  secondaryStoreUrl?: string;
  category?: string;
  facilities?: string[];
  beds?: string;
  isTopRated?: boolean;
  workflow?: string[]; // Dynamic "Work Line"
}

interface BookingRecord {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceType: string;
  patientName: string;
  patientEmail: string;
  details: string;
  timestamp: string;
  status: 'Pending' | 'Confirmed' | 'Delivered';
}

const MOCK_DATA: Record<string, ServiceItem[]> = {
  doctors: [
    { id: 'd1', title: 'Dr. Sarah Mitchell', subtitle: 'Senior Cardiologist', meta: '15 Years Exp.', description: 'Specializes in non-invasive cardiology and preventative heart care.', rating: 4.9, tags: ['Heart', 'Surgery', 'Available'], workflow: ['Clinical Review', 'Matching Specialist', 'Live Consultation'] },
    { id: 'd2', title: 'Dr. James Wilson', subtitle: 'Pediatrician', meta: '8 Years Exp.', description: 'Expert in neonatal care and childhood nutrition.', rating: 4.7, tags: ['Kids', 'Vaccination'], workflow: ['History Check', 'Vitals Sync', 'Appointment'] },
    { id: 'd3', title: 'Dr. Ananya Rao', subtitle: 'Dermatologist', meta: '12 Years Exp.', description: 'Skin pathology and cosmetic dermatology expert.', rating: 4.8, tags: ['Skin', 'Laser'], workflow: ['Photo Analysis', 'Clinical Review', 'Prescription'] },
  ],
  telemedicine: [
    { id: 't1', title: 'Dr. Mark Henderson', subtitle: 'Remote General Physician', meta: 'Quick Response', description: 'Available for immediate video consultations regarding general symptoms.', rating: 4.9, tags: ['Video Call', 'Digital Prescription'], workflow: ['Triage Bot', 'Queue Assignment', 'Video Session'], price: '₹499.00' },
    { id: 't2', title: 'Dr. Elena Rossi', subtitle: 'Tele-Psychiatrist', meta: 'Expert Therapist', description: 'Mental wellness and stress management sessions via secure video link.', rating: 4.8, tags: ['Confidential', 'Video Call'], workflow: ['Pre-screening', 'Expert Match', '1-on-1 Session'], price: '₹1,200.00' },
  ],
  medicines: [
    { id: 'm1', title: 'Paracetamol / Calpol', category: 'Fever & Pain', subtitle: '500mg/650mg', meta: 'Strip of 15', description: 'Standard treatment for fever and mild to moderate pain relief.', rating: 4.8, tags: ['Fever', 'Pain', 'OTC'], price: '₹35.00', workflow: ['Inventory Check', 'Order Validation', 'Home Delivery'] },
    { id: 'm2', title: 'Ibuprofen Combination', category: 'Fever & Pain', subtitle: 'Dual Action', meta: 'Strip of 20', description: 'Powerful combination for muscle pain and inflammation.', rating: 4.6, tags: ['Muscle Pain', 'Inflammation'], price: '₹45.00', workflow: ['Stock Verification', 'Shipment', 'Doorstep Drop'] },
  ],
  labs: [
    { id: 'l1', title: 'Full Body Checkup (Comprehensive)', category: 'Health Package', subtitle: 'Diagnostic Center', meta: '80+ Vital Tests', description: 'Full screening of liver, kidney, thyroid, sugar, and lipid profiles. Recommended annually.', rating: 4.9, tags: ['Home Collection', 'Certified'], price: '₹1,999.00', workflow: ['Home Sample Collection', 'Lab Processing', 'Report Generation'] },
  ],
  hospitals: [
    { id: 'h1', title: 'City General Multispecialty', subtitle: 'Tertiary Care & Cardiac Center', meta: 'Metropolitan Area', description: 'A leading multispecialty facility known for 24/7 advanced cardiac support and robotic surgery excellence.', rating: 4.9, tags: ['Best in Region', '24/7 Emergency'], facilities: ['ICU', 'Emergency', 'Blood Bank'], beds: '600+ Beds', isTopRated: true, workflow: ['Emergency Triage', 'Bed Allocation', 'Surgical Readiness'] },
  ]
};

const MedicalServices: React.FC<{ type: string; onBack: () => void; userProfile: UserHealthProfile }> = ({ type, onBack, userProfile }) => {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [status, setStatus] = useState<'prompt' | 'loading' | 'active' | 'denied' | 'manual'>('prompt');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ServiceItem[]>([]);
  const [bookingItem, setBookingItem] = useState<ServiceItem | null>(null);
  const [bookingDetails, setBookingDetails] = useState({ date: '', time: '', reason: '', quantity: 1, address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const data = MOCK_DATA[type] || [];
    setResults(data.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    ));
  }, [search, type]);

  const requestLocation = () => {
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setStatus('active'); },
      () => setStatus('denied')
    );
  };

  const skipLocation = () => setStatus('manual');

  const performGlobalSearch = () => {
    if (!search.trim()) return;
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(search + ' ' + type + ' near me')}`, '_blank');
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingItem) return;
    setIsSubmitting(true);

    const newBooking: BookingRecord = {
      id: `BK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      serviceId: bookingItem.id,
      serviceTitle: bookingItem.title,
      serviceType: type.toUpperCase(),
      patientName: userProfile.name,
      patientEmail: userProfile.email,
      details: `${bookingDetails.reason || 'General Checkup'} | Qty: ${bookingDetails.quantity} | When: ${bookingDetails.date} ${bookingDetails.time} | At: ${bookingDetails.address || 'Saved Address'}`,
      timestamp: new Date().toISOString(),
      status: 'Pending'
    };

    const existing = JSON.parse(localStorage.getItem('hb_service_bookings') || '[]');
    localStorage.setItem('hb_service_bookings', JSON.stringify([newBooking, ...existing]));
    window.dispatchEvent(new Event('hb_data_changed'));

    // Save to Supabase if configured
    if (isSupabaseConfigured) {
      supabase.from('service_bookings').insert([newBooking]).then(({ error }) => {
        if (error) console.error("Error saving booking to Supabase:", error);
      });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setBookingItem(null);
      alert(`Booking Successful! Ref ID: ${newBooking.id}. Our team has notified the clinical administrator.`);
    }, 1500);
  };

  const titles: Record<string, string> = {
    doctors: 'Physical Consultations',
    telemedicine: 'Tele-Health & Video Consult',
    medicines: 'Pharmacy & Digital Prescription',
    labs: 'Diagnostic Lab Network',
    hospitals: 'Emergency Bed & Care Registry'
  };

  const icons: Record<string, string> = {
    doctors: 'fa-user-md text-blue-500',
    telemedicine: 'fa-video text-purple-500',
    medicines: 'fa-pills text-green-500',
    labs: 'fa-vial text-amber-500',
    hospitals: 'fa-hospital text-red-500'
  };

  if (status === 'prompt' || status === 'loading' || status === 'denied') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 bg-white">
        <div className={`w-28 h-28 rounded-[2rem] bg-slate-50 flex items-center justify-center text-4xl mb-8 shadow-inner border border-slate-100`}>
          <i className={`fas ${icons[type] || 'fa-map-marker-alt text-slate-400'}`}></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{titles[type]}</h2>
        <p className="text-slate-500 max-w-sm mb-12 font-medium leading-relaxed">
          Enable live-sync location to access the nearest authorized clinical network and available beds.
        </p>
        {status === 'loading' ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Scanning Registry...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button onClick={requestLocation} className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl">Use Live Location</button>
            <button onClick={skipLocation} className="bg-white border-2 border-slate-100 text-slate-500 px-10 py-5 rounded-3xl font-black text-xs uppercase hover:bg-slate-50 transition-all">Manual Global Search</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative overflow-hidden">
      
      {/* Dynamic Header */}
      <div className="bg-white p-6 border-b border-slate-200 sticky top-0 z-40 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-5">
           <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-all"><i className="fas fa-chevron-left"></i></button>
           <div>
             <h2 className="text-xl font-black text-slate-900 leading-none tracking-tight">{titles[type]}</h2>
             <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
               <i className="fas fa-circle-nodes"></i> Active Clinical Hub • {results.length} Nodes
             </p>
           </div>
        </div>
        
        <div className="flex-1 max-w-lg flex gap-2">
          <div className="relative flex-1">
             <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
             <input 
               type="text" 
               placeholder={`Search for specific ${type}...`} 
               value={search} 
               onChange={(e) => setSearch(e.target.value)} 
               className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 outline-none" 
             />
          </div>
          <button onClick={performGlobalSearch} className="bg-slate-900 text-white px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
            <i className="fas fa-globe"></i> Global Help
          </button>
        </div>
      </div>

      {/* Booking Modal Overlay */}
      {bookingItem && (
        <div className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase leading-none mb-1">Service Request</h3>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{bookingItem.title}</p>
                 </div>
                 <button onClick={() => setBookingItem(null)} className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 hover:bg-red-500 hover:text-white transition-all">
                   <i className="fas fa-times"></i>
                 </button>
              </div>
              <form onSubmit={handleBookingSubmit} className="p-8 space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Appt Date</label>
                      <input required type="date" value={bookingDetails.date} onChange={e => setBookingDetails({...bookingDetails, date: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl p-3 text-xs font-bold" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Time Slot</label>
                      <input required type="time" value={bookingDetails.time} onChange={e => setBookingDetails({...bookingDetails, time: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl p-3 text-xs font-bold" />
                    </div>
                 </div>
                 {type === 'medicines' && (
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Quantity</label>
                      <input type="number" min="1" value={bookingDetails.quantity} onChange={e => setBookingDetails({...bookingDetails, quantity: Number(e.target.value)})} className="w-full bg-slate-100 border-none rounded-xl p-3 text-xs font-bold" />
                    </div>
                 )}
                 <div>
                   <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Visit Reason / Clinical Symptoms</label>
                   <textarea required rows={2} value={bookingDetails.reason} onChange={e => setBookingDetails({...bookingDetails, reason: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl p-3 text-xs font-bold resize-none" placeholder="Briefly describe the clinical concern..."></textarea>
                 </div>
                 <div>
                   <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Delivery / Consultation Address</label>
                   <input value={bookingDetails.address} onChange={e => setBookingDetails({...bookingDetails, address: e.target.value})} className="w-full bg-slate-100 border-none rounded-xl p-3 text-xs font-bold" placeholder="Auto-populated from profile..." />
                 </div>
                 <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                   {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-double"></i>}
                   {type === 'medicines' ? 'Confirm Purchase' : 'Book Appointment'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {results.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 hover:border-blue-200 transition-all group flex flex-col h-full shadow-sm hover:shadow-xl relative overflow-hidden">
              {item.isTopRated && <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-3xl text-[8px] font-black uppercase tracking-widest">Top Rated</div>}
              
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight group-hover:text-blue-600">{item.title}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{item.subtitle}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400 text-[8px]">
                    {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-slate-200'}`}></i>)}
                  </div>
                  <span className="text-[10px] font-black text-slate-900">{item.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6 flex-1 line-clamp-3">{item.description}</p>

              {/* Dynamic Work Line (Workflow Visualization) */}
              <div className="mb-8 pt-6 border-t border-slate-50">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Clinical Workflow</p>
                 <div className="flex items-center gap-1">
                    {item.workflow?.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div className="relative group/tip">
                           <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-600' : 'bg-slate-200'} transition-all`}></div>
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block bg-slate-900 text-white text-[7px] font-black uppercase px-2 py-1 rounded whitespace-nowrap z-50">{step}</div>
                        </div>
                        {idx < (item.workflow?.length || 0) - 1 && <div className="flex-1 h-0.5 bg-slate-100"></div>}
                      </React.Fragment>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-[9px] font-black uppercase text-slate-400">Consultation Fee</span>
                    <span className="text-sm font-black text-slate-900">{item.price || 'Network Covered'}</span>
                 </div>
                 <button onClick={() => setBookingItem(item)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-50 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <i className="fas fa-calendar-plus"></i> {type === 'medicines' ? 'Buy Now' : 'Schedule Appointment'}
                 </button>
                 <button onClick={() => window.open(`tel:+910000000000`)} className="w-full py-3 bg-slate-50 text-slate-500 rounded-2xl font-black text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-white transition-all flex items-center justify-center gap-2">
                    <i className="fas fa-headset text-blue-400"></i> Contact Node
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 border-t border-slate-200 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
        Verified Clinical Registry Sync v9.1 • All bookings monitored by Command Center
      </div>
    </div>
  );
};

export default MedicalServices;
