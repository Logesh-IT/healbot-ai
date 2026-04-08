import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2,
  Phone,
  Mail,
  Video,
  Plus,
  ArrowLeft,
  CalendarCheck,
  Stethoscope,
  X,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase, { isSupabaseConfigured } from '../supabase';

interface Doctor {
  id: string;
  name: string;
  specialist: string;
  experience: string;
  rating: number;
  phone: string;
  email: string;
  address: string;
  image: string;
  availability: string;
}

interface Appointment {
  id?: string;
  user_id: string;
  doctor_id: string;
  doctor_name: string;
  specialist: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  type: 'In-Person' | 'Telemedicine';
}

const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Johnson',
    specialist: 'Cardiologist',
    experience: '15 Years',
    rating: 4.9,
    phone: '+1 234 567 8901',
    email: 'sarah.j@healbot.com',
    address: 'Heart Care Center, 123 Medical Plaza, NY',
    image: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200&h=200',
    availability: 'Mon-Fri, 09:00 - 05:00'
  },
  {
    id: 'd2',
    name: 'Dr. Michael Chen',
    specialist: 'Neurologist',
    experience: '12 Years',
    rating: 4.8,
    phone: '+1 234 567 8902',
    email: 'm.chen@healbot.com',
    address: 'Brain & Spine Institute, 456 Neuro Way, CA',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
    availability: 'Tue-Sat, 10:00 - 06:00'
  },
  {
    id: 'd3',
    name: 'Dr. Emily Williams',
    specialist: 'Pediatrician',
    experience: '10 Years',
    rating: 4.9,
    phone: '+1 234 567 8903',
    email: 'e.williams@healbot.com',
    address: 'Kids Health Clinic, 789 Family St, TX',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200',
    availability: 'Mon-Thu, 08:00 - 04:00'
  }
];

const AppointmentBooking: React.FC<{ userId: string }> = ({ userId }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'doctors' | 'my-appointments'>('doctors');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'In-Person' as Appointment['type']
  });

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, [userId]);

  const fetchDoctors = async () => {
    if (!isSupabaseConfigured) {
      setDoctors(DEFAULT_DOCTORS);
      return;
    }

    const { data, error } = await supabase
      .from('doctors')
      .select('*');

    if (error) {
      console.error('Error fetching doctors:', error);
      setDoctors(DEFAULT_DOCTORS); // Fallback to defaults on error
    } else {
      setDoctors(data && data.length > 0 ? data : DEFAULT_DOCTORS);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    
    if (!isSupabaseConfigured) {
      const localApts = localStorage.getItem('hb_appointments');
      const allApts = localApts ? JSON.parse(localApts) : [];
      // Filter for current user
      setAppointments(allApts.filter((a: any) => a.user_id === userId));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        // Fallback to local
        const localApts = localStorage.getItem('hb_appointments');
        const allApts = localApts ? JSON.parse(localApts) : [];
        setAppointments(allApts.filter((a: any) => a.user_id === userId));
      } else {
        setAppointments(data || []);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      const localApts = localStorage.getItem('hb_appointments');
      const allApts = localApts ? JSON.parse(localApts) : [];
      setAppointments(allApts.filter((a: any) => a.user_id === userId));
    }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!selectedDoctor) return;

    const payload: Appointment = {
      user_id: userId,
      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.name,
      specialist: selectedDoctor.specialist,
      ...formData,
      status: 'Pending'
    };

    const newApt: Appointment = { ...payload, id: Date.now().toString() };
    
    // Always save to local for admin visibility in demo mode
    const localApts = JSON.parse(localStorage.getItem('hb_appointments') || '[]');
    localStorage.setItem('hb_appointments', JSON.stringify([newApt, ...localApts]));
    window.dispatchEvent(new Event('hb_data_changed'));

    if (!isSupabaseConfigured) {
      setAppointments(prev => [newApt, ...prev]);
      setShowBookingModal(false);
      setView('my-appointments');
      return;
    }

    const { error } = await supabase
      .from('appointments')
      .insert([payload]);

    if (error) {
      alert('Error booking appointment: ' + error.message);
    } else {
      setShowBookingModal(false);
      fetchAppointments();
      setView('my-appointments');
      // Success feedback
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl z-[100] animate-in slide-in-from-bottom duration-300';
      notification.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Appointment Booked Successfully!';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {view === 'doctors' ? 'Book Appointment' : 'My Appointments'}
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">
            {view === 'doctors' ? 'Find and book top-rated specialists' : 'Manage your upcoming consultations'}
          </p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setView('doctors')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'doctors' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            Find Doctors
          </button>
          <button 
            onClick={() => setView('my-appointments')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'my-appointments' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            My Schedule ({appointments.length})
          </button>
        </div>
      </header>

      {view === 'doctors' ? (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
              <input 
                type="text"
                placeholder="Search doctors by name, specialty, or clinic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-none rounded-[32px] py-6 pl-16 pr-8 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 outline-none"
              />
            </div>
            <button className="flex items-center gap-2 bg-white border-none px-8 py-4 rounded-[32px] font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={24} />
              Filter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor, idx) => (
              <motion.div 
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-8 rounded-[48px] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-10 -mt-10 group-hover:bg-blue-600 transition-all duration-500" />
                
                <div className="relative z-10 flex items-start gap-6 mb-8">
                  <div className="relative shrink-0">
                    <img 
                      src={doctor.image || `https://picsum.photos/seed/${doctor.id}/200/200`} 
                      alt={doctor.name}
                      className="w-24 h-24 rounded-[32px] object-cover shadow-xl border-4 border-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-blue-600 transition-all">{doctor.name}</h3>
                    </div>
                    <p className="text-blue-600 font-black text-xs uppercase tracking-widest mt-1">{doctor.specialist}</p>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mt-2 w-fit">
                      <Star size={10} fill="currentColor" />
                      {doctor.rating} Rating
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin size={18} />
                    </div>
                    <span className="line-clamp-1">{doctor.address}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Clock size={18} />
                    </div>
                    <span>{doctor.availability}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Star size={18} />
                    </div>
                    <span>{doctor.experience} Experience</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                  <a href={`tel:${doctor.phone}`} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
                    <Phone size={14} />
                    Call
                  </a>
                  <a href={`mailto:${doctor.email}`} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
                    <Mail size={14} />
                    Email
                  </a>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setShowBookingModal(true);
                    }}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-[24px] font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Book Appointment
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white p-20 rounded-[60px] text-center border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarCheck className="text-slate-300" size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No appointments scheduled</h3>
              <p className="text-slate-500 max-w-xs mx-auto font-medium">You haven't booked any consultations yet. Start by finding a specialist.</p>
              <button 
                onClick={() => setView('doctors')}
                className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-[24px] font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all"
              >
                Find Doctors
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {appointments.map((apt, idx) => (
                  <motion.div 
                    key={apt.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-8 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-xl hover:shadow-slate-200/50 transition-all"
                  >
                    <div className="flex items-center gap-8 w-full md:w-auto">
                      <div className="w-20 h-20 rounded-[32px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        {apt.type === 'Telemedicine' ? <Video size={36} /> : <Stethoscope size={36} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{apt.doctor_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-4">{apt.specialist}</p>
                        <div className="flex flex-wrap gap-6 text-slate-500 text-sm font-bold">
                          <span className="flex items-center gap-2">
                            <Calendar size={18} className="text-slate-300" />
                            {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock size={18} className="text-slate-300" />
                            {apt.time}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin size={18} className="text-slate-300" />
                            {apt.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                      <button className="flex-1 md:flex-none px-8 py-4 bg-slate-50 text-slate-600 rounded-[24px] font-black text-sm hover:bg-slate-100 transition-all">
                        Reschedule
                      </button>
                      <button className="flex-1 md:flex-none px-8 py-4 bg-red-50 text-red-600 rounded-[24px] font-black text-sm hover:bg-red-600 hover:text-white transition-all">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-blue-600" />
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Book Appointment</h2>
                  <p className="text-slate-500 font-medium mt-1">With {selectedDoctor.name}</p>
                </div>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Consultation Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setFormData({...formData, type: 'In-Person'})}
                      className={`flex flex-col items-center justify-center gap-3 py-6 rounded-[32px] font-black transition-all border-2 ${formData.type === 'In-Person' ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 border-transparent'}`}
                    >
                      <MapPin size={24} />
                      <span className="text-xs uppercase tracking-widest">In-Person</span>
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, type: 'Telemedicine'})}
                      className={`flex flex-col items-center justify-center gap-3 py-6 rounded-[32px] font-black transition-all border-2 ${formData.type === 'Telemedicine' ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 border-transparent'}`}
                    >
                      <Video size={24} />
                      <span className="text-xs uppercase tracking-widest">Tele-Video</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Select Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-[20px] py-4 pl-14 pr-6 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Select Time Slot</label>
                    <div className="relative">
                      <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <select 
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-[20px] py-4 pl-14 pr-6 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 appearance-none outline-none"
                      >
                        {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-4 rounded-[20px] font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBook}
                  className="flex-1 py-4 rounded-[20px] font-black bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentBooking;
