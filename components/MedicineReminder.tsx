import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Clock, 
  Plus, 
  Check, 
  Trash2, 
  Bell, 
  Calendar,
  ChevronRight,
  AlertCircle,
  History,
  Info,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase, { isSupabaseConfigured } from '../supabase';

interface Reminder {
  id?: string;
  user_id: string;
  medicine_name: string;
  dosage: string;
  time: string;
  frequency: string;
  is_taken: boolean;
  last_taken_at?: string;
}

const MedicineReminder: React.FC<{ userId: string }> = ({ userId }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeNotification, setActiveNotification] = useState<Reminder | null>(null);

  const [formData, setFormData] = useState({
    medicine_name: '',
    dosage: '',
    time: '08:00',
    frequency: 'Daily'
  });

  useEffect(() => {
    fetchReminders();
    
    // Notification Simulation Logic
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const dueReminder = reminders.find(r => r.time === currentTime && !r.is_taken);
      if (dueReminder && !activeNotification) {
        setActiveNotification(dueReminder);
        if (soundEnabled) {
          // Play a gentle notification sound (simulated)
          console.log("🔔 Notification for:", dueReminder.medicine_name);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [userId, reminders, soundEnabled, activeNotification]);

  const fetchReminders = async () => {
    setLoading(true);
    
    if (!isSupabaseConfigured) {
      const localReminders = localStorage.getItem(`med_reminders_${userId}`);
      setReminders(localReminders ? JSON.parse(localReminders) : []);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('medicine_reminders')
      .select('*')
      .eq('user_id', userId)
      .order('time', { ascending: true });

    if (error) {
      console.error('Error fetching reminders:', error);
    } else {
      setReminders(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.medicine_name) return;

    const payload = {
      user_id: userId,
      ...formData,
      is_taken: false
    };

    if (!isSupabaseConfigured) {
      const newReminder = { ...payload, id: Date.now().toString() };
      const updatedReminders = [...reminders, newReminder];
      setReminders(updatedReminders);
      localStorage.setItem(`med_reminders_${userId}`, JSON.stringify(updatedReminders));
      setShowAddModal(false);
      setFormData({ medicine_name: '', dosage: '', time: '08:00', frequency: 'Daily' });
      return;
    }

    const { error } = await supabase
      .from('medicine_reminders')
      .insert([payload]);

    if (error) {
      alert('Error saving reminder: ' + error.message);
    } else {
      setShowAddModal(false);
      setFormData({ medicine_name: '', dosage: '', time: '08:00', frequency: 'Daily' });
      fetchReminders();
      // Success feedback
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl z-[100] animate-in slide-in-from-bottom duration-300';
      notification.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Medicine Reminder Set Successfully!';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  };

  const toggleTaken = async (id: string, currentStatus: boolean) => {
    if (!isSupabaseConfigured) {
      const updatedReminders = reminders.map(r => 
        r.id === id ? { ...r, is_taken: !currentStatus, last_taken_at: !currentStatus ? new Date().toISOString() : undefined } : r
      );
      setReminders(updatedReminders);
      localStorage.setItem(`med_reminders_${userId}`, JSON.stringify(updatedReminders));
      if (activeNotification?.id === id) setActiveNotification(null);
      return;
    }

    const { error } = await supabase
      .from('medicine_reminders')
      .update({ 
        is_taken: !currentStatus,
        last_taken_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      fetchReminders();
      if (activeNotification?.id === id) setActiveNotification(null);
    }
  };

  const deleteReminder = async (id: string) => {
    if (!isSupabaseConfigured) {
      const updatedReminders = reminders.filter(r => r.id !== id);
      setReminders(updatedReminders);
      localStorage.setItem(`med_reminders_${userId}`, JSON.stringify(updatedReminders));
      return;
    }

    const { error } = await supabase
      .from('medicine_reminders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reminder:', error);
    } else {
      fetchReminders();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-slate-50 min-h-screen pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Medication Hub</h1>
          <p className="text-slate-500 font-medium">Smart scheduling & dose tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-2xl border transition-all ${soundEnabled ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            Add Medication
          </button>
        </div>
      </header>

      {/* Active Notification Banner */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-red-500 p-1 rounded-[32px] shadow-2xl shadow-red-200 overflow-hidden"
          >
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[30px] flex items-center gap-6 text-white">
              <div className="bg-white/20 p-4 rounded-2xl shrink-0 animate-bounce">
                <Bell size={32} className="text-white fill-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black">Time for your medication!</h3>
                <p className="text-red-100 font-bold">
                  Take {activeNotification.dosage} of {activeNotification.medicine_name} now.
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleTaken(activeNotification.id!, false)}
                  className="bg-white text-red-600 px-6 py-3 rounded-2xl font-black transition-all text-sm hover:bg-red-50"
                >
                  Mark as Taken
                </button>
                <button 
                  onClick={() => setActiveNotification(null)}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Today's Schedule</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{reminders.length} Medications</span>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="bg-white p-16 rounded-[48px] text-center border-2 border-dashed border-slate-200">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Pill className="text-slate-300" size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No medications set</h3>
              <p className="text-slate-500 max-w-xs mx-auto font-medium">Add your medications to get timely reminders and track your intake.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {reminders.map((reminder, idx) => (
                  <motion.div 
                    key={reminder.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-xl hover:shadow-slate-200/50 ${reminder.is_taken ? 'bg-slate-50/50' : ''}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center transition-all ${reminder.is_taken ? 'bg-slate-200 text-slate-400' : 'bg-emerald-50 text-emerald-600 shadow-inner'}`}>
                        <Pill size={40} className={reminder.is_taken ? '' : 'animate-pulse'} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-2xl font-black tracking-tight ${reminder.is_taken ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {reminder.medicine_name}
                          </h3>
                          {reminder.is_taken && (
                            <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">Taken</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-slate-400">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <Clock size={16} className="text-emerald-500" />
                            {reminder.time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            {reminder.frequency}
                          </span>
                          <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600 text-xs">{reminder.dosage}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleTaken(reminder.id!, reminder.is_taken)}
                        className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all active:scale-90 ${reminder.is_taken ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                      >
                        <Check size={28} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => deleteReminder(reminder.id!)}
                        className="w-14 h-14 rounded-[20px] bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <History className="text-emerald-500" size={24} />
              Recent History
            </h2>
            <div className="space-y-6">
              {reminders.filter(r => r.last_taken_at).length === 0 ? (
                <p className="text-slate-400 text-sm font-medium text-center py-4 italic">No recent activity</p>
              ) : (
                reminders.filter(r => r.last_taken_at).slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    {i !== 4 && <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-slate-100" />}
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-1">
                      <Check size={12} className="text-white" strokeWidth={4} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{r.medicine_name} taken</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {new Date(r.last_taken_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Today
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[40px] text-white shadow-2xl shadow-emerald-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10">
              <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <Info size={28} />
              </div>
              <h3 className="text-xl font-black mb-3">Health Tip</h3>
              <p className="text-emerald-100 text-sm font-medium leading-relaxed">
                Taking medications at the same time every day helps maintain a steady level of medicine in your body.
              </p>
              <button className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-xs transition-all uppercase tracking-widest">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[48px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-emerald-600" />
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">New Medication</h2>
              <p className="text-slate-500 font-medium mb-8">Set up a new dose reminder</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Medicine Name</label>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Pill size={20} />
                    </div>
                    <input 
                      type="text"
                      value={formData.medicine_name}
                      onChange={(e) => setFormData({...formData, medicine_name: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 pl-14 pr-6 focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-700 outline-none"
                      placeholder="e.g. Paracetamol"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Dosage</label>
                    <input 
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-700 outline-none"
                      placeholder="500mg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Time</label>
                    <input 
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-700 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Frequency</label>
                  <select 
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-700 outline-none appearance-none"
                  >
                    <option>Daily</option>
                    <option>Twice a day</option>
                    <option>Weekly</option>
                    <option>As needed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 rounded-[20px] font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 rounded-[20px] font-bold bg-emerald-600 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                >
                  Set Reminder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicineReminder;
