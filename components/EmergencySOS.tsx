import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Users, 
  Shield, 
  ChevronRight, 
  Activity,
  Heart,
  Navigation,
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Hospital,
  Stethoscope,
  PhoneCall,
  Volume2,
  VolumeX,
  RefreshCw,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../supabase';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const EmergencySOS: React.FC<{ userId: string }> = ({ userId }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sosActive, setSosActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>("Detecting location...");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [status, setStatus] = useState<string>("Ready to assist");
  const [ambulanceStatus, setAmbulanceStatus] = useState<'none' | 'booking' | 'dispatched' | 'arrived'>('none');
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchContacts();
    getUserLocation();
  }, [userId]);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching contacts:', error);
    } else {
      setContacts(data || []);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          fetchNearbyHospitals(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation Error:", error);
          setAddress("Location access denied. Please enable GPS.");
        }
      );
    }
  };

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    // Simulated nearby hospitals
    setNearbyHospitals([
      { name: "City General Hospital", distance: "0.8 km", phone: "911-1001", status: "Emergency Ready" },
      { name: "St. Jude Medical Center", distance: "1.5 km", phone: "911-1002", status: "Trauma Center" },
      { name: "Wellness Care Clinic", distance: "2.3 km", phone: "911-1003", status: "Urgent Care" },
    ]);
  };

  const startSOS = () => {
    setIsActivating(true);
    setCountdown(5);
    setStatus("Initiating Emergency Protocol...");
    
    countdownInterval.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current!);
          activateSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setIsActivating(false);
    setSosActive(false);
    setStatus("SOS Cancelled");
    setTimeout(() => setStatus("Ready to assist"), 2000);
  };

  const activateSOS = async () => {
    setSosActive(true);
    setStatus("ALERTS SENT SUCCESSFULLY");
    setAmbulanceStatus('booking');
    
    // Simulate sending alerts
    console.log("🚨 SOS ACTIVATED! Alerts sent to:", contacts.map(c => c.phone));
    
    // Auto-book nearest ambulance
    setTimeout(() => {
      setAmbulanceStatus('dispatched');
      setStatus("AMBULANCE DISPATCHED - ETA 8 MINS");
    }, 3000);

    // Save SOS event to Supabase
    await supabase.from('sos_events').insert([{
      user_id: userId,
      location: location,
      timestamp: new Date().toISOString(),
      status: 'Active'
    }]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Emergency SOS</h1>
          <p className="text-slate-500 font-medium tracking-tight">Instant help when you need it most</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-2xl border transition-all ${soundEnabled ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Shield size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Secure & Encrypted</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOS Activation Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className={`absolute inset-0 bg-red-600 transition-all duration-1000 ${isActivating || sosActive ? 'opacity-5' : 'opacity-0'}`} />
            
            <AnimatePresence mode="wait">
              {!isActivating && !sosActive ? (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-8 relative z-10"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                    <button 
                      onClick={startSOS}
                      className="w-48 h-48 bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl shadow-red-200 hover:bg-red-700 transition-all active:scale-90 group"
                    >
                      <AlertTriangle size={64} className="mb-2 group-hover:scale-110 transition-all" />
                      <span className="text-2xl font-black uppercase tracking-widest">SOS</span>
                    </button>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Press & Hold to Activate</h2>
                    <p className="text-slate-500 font-medium mt-2">This will notify emergency services and your contacts</p>
                  </div>
                </motion.div>
              ) : isActivating && !sosActive ? (
                <motion.div 
                  key="countdown"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-8 relative z-10"
                >
                  <div className="text-[120px] font-black text-red-600 tabular-nums leading-none">
                    {countdown}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sending Alerts...</h2>
                    <p className="text-slate-500 font-medium mt-2">Protocol initiated. Tap cancel to stop.</p>
                  </div>
                  <button 
                    onClick={cancelSOS}
                    className="bg-slate-900 text-white px-12 py-4 rounded-3xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Cancel SOS
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="active"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-8 relative z-10"
                >
                  <div className="w-48 h-48 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-200 mx-auto">
                    <CheckCircle2 size={80} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Alerts Dispatched</h2>
                    <p className="text-slate-500 font-medium mt-2">Help is on the way. Stay calm and stay where you are.</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={cancelSOS}
                      className="bg-slate-100 text-slate-600 px-8 py-4 rounded-3xl font-black transition-all hover:bg-slate-200"
                    >
                      I'm Safe Now
                    </button>
                    <button className="bg-red-600 text-white px-8 py-4 rounded-3xl font-black shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2">
                      <PhoneCall size={20} />
                      Call 911
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ambulance Tracking */}
          <AnimatePresence>
            {ambulanceStatus !== 'none' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-200 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <Navigation size={28} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Ambulance Tracking</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vehicle ID: AMB-042 • Driver: Suresh</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-blue-400">08:42</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimated Arrival</p>
                  </div>
                </div>

                <div className="relative h-2 bg-slate-800 rounded-full mb-8 overflow-hidden">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Status</p>
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-tight">En Route to Location</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Hospital Alerted</p>
                    <p className="text-sm font-bold text-blue-400 uppercase tracking-tight">Apollo Hospitals (Ready)</p>
                  </div>
                  <button className="h-full bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                    <Phone size={16} /> Call Driver
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Bar */}
          <div className="bg-slate-900 p-6 rounded-[32px] text-white flex items-center justify-between shadow-xl shadow-slate-200">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${sosActive ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-sm font-black uppercase tracking-[0.2em]">{status}</span>
            </div>
            <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-2">
                <Shield size={14} className="text-blue-500" />
                GPS Tracking Active
              </span>
              <span className="flex items-center gap-2">
                <Bell size={14} className="text-yellow-500" />
                Alerts Ready
              </span>
            </div>
          </div>

          {/* Nearby Hospitals */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Hospital className="text-blue-600" size={28} />
              Nearby Hospitals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nearbyHospitals.map((h, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                      <Navigation size={20} />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{h.distance}</span>
                  </div>
                  <h3 className="font-black text-slate-900 mb-1">{h.name}</h3>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">{h.status}</p>
                  <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">
                    <Phone size={14} />
                    {h.phone}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Location Card */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <MapPin className="text-red-500" size={24} />
              Current Location
            </h3>
            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-6">
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                {address}
              </p>
            </div>
            <button 
              onClick={getUserLocation}
              className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh Location
            </button>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Users className="text-blue-600" size={24} />
                Emergency Contacts
              </h3>
              <button className="text-blue-600 hover:text-blue-700">
                <Plus size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {contacts.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-bold">No contacts added</p>
                </div>
              ) : (
                contacts.map((contact, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                        {contact.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{contact.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{contact.relation}</p>
                      </div>
                    </div>
                    <button className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-50 transition-all">
                      <Phone size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Emergency Kit */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-[40px] text-white shadow-2xl shadow-red-200">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <AlertCircle size={24} />
              First Aid Guide
            </h3>
            <div className="space-y-3">
              {[
                "Check for breathing",
                "Stop any bleeding",
                "Keep the person warm",
                "Don't move if neck injury"
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-red-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  {tip}
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-4 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-xs transition-all uppercase tracking-widest">
              View Full Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;
