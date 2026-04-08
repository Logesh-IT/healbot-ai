
import React, { useState, useEffect } from 'react';
import { User, InsuranceRequest, Hospital, Doctor, Pharmacy, InsurancePlan, HealthContent, ChatbotDataset } from '../types';
import supabase, { isSupabaseConfigured } from "../supabase";

interface BookingRecord {
  id: string;
  service_id: string;
  service_title: string;
  service_type: string;
  patient_name: string;
  patient_email: string;
  details: string;
  timestamp: string;
  status: 'Pending' | 'Confirmed' | 'Delivered';
}

interface AppointmentRecord {
  id: string;
  user_id: string;
  doctor_id: string;
  doctor_name: string;
  specialist: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  type: 'In-Person' | 'Telemedicine';
}

interface HealthRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  category: string;
  date: string;
  status: 'Pending' | 'Analyzed' | 'Error';
}

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [insuranceRequests, setInsuranceRequests] = useState<InsuranceRequest[]>([]);
  const [serviceBookings, setServiceBookings] = useState<BookingRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'STATS' | 'USERS' | 'BOOKINGS' | 'APPOINTMENTS' | 'RECORDS' | 'INSURANCE_REQUESTS' | 'HOSPITALS' | 'DOCTORS' | 'PHARMACIES' | 'INSURANCE' | 'CONTENT' | 'AI_TRAINING' | 'MENTAL_HEALTH'>('STATS');

  // Healthcare Data States
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [healthContent, setHealthContent] = useState<HealthContent[]>([]);
  const [aiDataset, setAiDataset] = useState<ChatbotDataset[]>([]);
  const [mentalHealthLogs, setMentalHealthLogs] = useState<any[]>([]);

  useEffect(() => {
    loadData();

    // Listen for local data changes
    const handleLocalChange = () => {
      console.log("Local data change detected, reloading...");
      loadData();
    };
    window.addEventListener('hb_data_changed', handleLocalChange);

    if (!isSupabaseConfigured) {
      return () => window.removeEventListener('hb_data_changed', handleLocalChange);
    }

    // Set up real-time subscriptions for all relevant tables
    const tables = [
      "users", 
      "service_bookings", 
      "appointments", 
      "health_records", 
      "insurance_requests",
      "hospitals",
      "doctors",
      "pharmacies",
      "insurance_plans",
      "health_content",
      "chatbot_dataset",
      "mental_health_logs"
    ];

    const channels = tables.map(table => {
      return supabase
        .channel(`admin-${table}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: table },
          () => {
            console.log(`Change detected in ${table}, reloading data...`);
            loadData();
          }
        )
        .subscribe();
    });

    return () => {
      window.removeEventListener('hb_data_changed', handleLocalChange);
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const loadData = async () => {
    const fetchTable = async (table: string) => {
      // Fallback to localStorage if Supabase is not configured
      if (!isSupabaseConfigured) {
        const localData = localStorage.getItem(`hb_${table}`);
        return localData ? JSON.parse(localData) : [];
      }

      try {
        const { data, error } = await supabase.from(table).select("*");
        if (error) {
          console.error(`Error fetching ${table}:`, error);
          // Fallback to localStorage on error
          const localData = localStorage.getItem(`hb_${table}`);
          return localData ? JSON.parse(localData) : [];
        }
        return data || [];
      } catch (err) {
        console.error(`Fetch failed for ${table}:`, err);
        const localData = localStorage.getItem(`hb_${table}`);
        return localData ? JSON.parse(localData) : [];
      }
    };

    const [
      usersData, 
      bookingsData, 
      appointmentsData,
      recordsData,
      insuranceRequestsData,
      hospitalsData, 
      doctorsData, 
      pharmaciesData, 
      insuranceData, 
      contentData, 
      aiData,
      mentalHealthData
    ] = await Promise.all([
      fetchTable("users"),
      fetchTable("service_bookings"),
      fetchTable("appointments"),
      fetchTable("health_records"),
      fetchTable("insurance_requests"),
      fetchTable("hospitals"),
      fetchTable("doctors"),
      fetchTable("pharmacies"),
      fetchTable("insurance_plans"),
      fetchTable("health_content"),
      fetchTable("chatbot_dataset"),
      fetchTable("mental_health_logs")
    ]);

    setUsers(usersData);
    setServiceBookings(bookingsData);
    setAppointments(appointmentsData);
    setHealthRecords(recordsData);
    setInsuranceRequests(insuranceRequestsData);
    setHospitals(hospitalsData);
    setDoctors(doctorsData);
    setPharmacies(pharmaciesData);
    setInsurancePlans(insuranceData);
    setHealthContent(contentData);
    setAiDataset(aiData);
    setMentalHealthLogs(mentalHealthData);
  };

  const deleteItem = async (table: string, id: string) => {
    if (window.confirm(`Are you sure you want to delete this record from ${table}?`)) {
      if (!isSupabaseConfigured) {
        const localData = JSON.parse(localStorage.getItem(`hb_${table}`) || '[]');
        const updated = localData.filter((item: any) => item.id !== id);
        localStorage.setItem(`hb_${table}`, JSON.stringify(updated));
        loadData();
        return;
      }

      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        alert(`Error deleting: ${error.message}`);
      } else {
        loadData();
      }
    }
  };

  const addItem = async (table: string, item: any) => {
    if (!isSupabaseConfigured) {
      const localData = JSON.parse(localStorage.getItem(`hb_${table}`) || '[]');
      localStorage.setItem(`hb_${table}`, JSON.stringify([item, ...localData]));
      loadData();
      return;
    }

    const { error } = await supabase.from(table).insert([item]);
    if (error) {
      alert(`Error adding: ${error.message}`);
    } else {
      loadData();
    }
  };

  const updateItem = async (table: string, id: string, data: any) => {
    if (!isSupabaseConfigured) {
      const localData = JSON.parse(localStorage.getItem(`hb_${table}`) || '[]');
      const updated = localData.map((item: any) => item.id === id ? { ...item, ...data } : item);
      localStorage.setItem(`hb_${table}`, JSON.stringify(updated));
      loadData();
      return;
    }

    const { error } = await supabase.from(table).update(data).eq("id", id);
    if (error) {
      alert(`Error updating: ${error.message}`);
    } else {
      loadData();
    }
  };

  const clearAllBookings = async () => {
    if (window.confirm("Purge all clinical task records? This cannot be undone.")) {
      const { error } = await supabase.from("service_bookings").delete().neq("id", "0");
      if (error) {
        alert(`Error purging: ${error.message}`);
      } else {
        loadData();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 h-full overflow-hidden">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-xl shadow-xl shadow-amber-900/40">
               <i className="fas fa-user-shield"></i>
             </div>
             <div>
               <h2 className="text-2xl font-black uppercase tracking-tighter">Command Center</h2>
               <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Clinical Governance Oversight</p>
             </div>
          </div>
          <div className="flex flex-wrap bg-slate-800 p-1 rounded-2xl gap-1">
            {(['STATS', 'USERS', 'BOOKINGS', 'APPOINTMENTS', 'RECORDS', 'INSURANCE_REQUESTS', 'HOSPITALS', 'DOCTORS', 'PHARMACIES', 'INSURANCE', 'CONTENT', 'AI_TRAINING', 'MENTAL_HEALTH'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === 'STATS' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Total Patients</p>
                  <p className="text-4xl font-black text-slate-900">{users.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Clinical Tasks</p>
                  <p className="text-4xl font-black text-blue-600">{serviceBookings.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Appointments</p>
                  <p className="text-4xl font-black text-rose-600">{appointments.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Health Records</p>
                  <p className="text-4xl font-black text-emerald-600">{healthRecords.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Hospitals</p>
                  <p className="text-4xl font-black text-purple-600">{hospitals.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Doctors</p>
                  <p className="text-4xl font-black text-green-600">{doctors.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Pharmacies</p>
                  <p className="text-4xl font-black text-amber-600">{pharmacies.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Insurance Plans</p>
                  <p className="text-4xl font-black text-pink-600">{insurancePlans.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Health Content</p>
                  <p className="text-4xl font-black text-cyan-600">{healthContent.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">AI Training Items</p>
                  <p className="text-4xl font-black text-indigo-600">{aiDataset.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Mental Health Logs</p>
                  <p className="text-4xl font-black text-violet-600">{mentalHealthLogs.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'BOOKINGS' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Global Clinical Task Registry</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">Ref ID</th><th className="px-8 py-4">Service & Type</th><th className="px-8 py-4">Patient Detail</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {serviceBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-black text-blue-600">{b.id}</td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-slate-900 text-sm">{b.service_title}</p>
                           <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{b.service_type}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-slate-700 text-xs">{b.patient_name}</p>
                           <p className="text-[10px] text-slate-400 font-medium max-w-xs truncate">{b.details}</p>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase">{b.status}</span>
                        </td>
                        <td className="px-8 py-6">
                           <button onClick={() => deleteItem("service_bookings", b.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'APPOINTMENTS' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Global Appointment Registry</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">ID</th><th className="px-8 py-4">Doctor</th><th className="px-8 py-4">Date & Time</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-black text-blue-600">{a.id}</td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-slate-900 text-sm">{a.doctor_name}</p>
                           <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{a.specialist}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-slate-700 text-xs">{a.date}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{a.time}</p>
                        </td>
                        <td className="px-8 py-6">
                           <select 
                            value={a.status} 
                            onChange={(e) => updateItem("appointments", a.id, { status: e.target.value })}
                            className={`bg-slate-100 border-none rounded-lg text-[9px] font-black uppercase p-2 focus:ring-2 focus:ring-blue-500 ${a.status === 'Confirmed' ? 'text-green-600' : 'text-amber-600'}`}
                           >
                             <option>Pending</option>
                             <option>Confirmed</option>
                             <option>Completed</option>
                             <option>Cancelled</option>
                           </select>
                        </td>
                        <td className="px-8 py-6">
                           <button onClick={() => deleteItem("appointments", a.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr><td colSpan={5} className="py-32 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No appointments currently active</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'RECORDS' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Global Health Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">ID</th><th className="px-8 py-4">File Name</th><th className="px-8 py-4">Category</th><th className="px-8 py-4">Date</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {healthRecords.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-black text-blue-600">{r.id}</td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-slate-900 text-sm">{r.file_name}</p>
                           <a href={r.file_url} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">View File</a>
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-700 uppercase">{r.category}</td>
                        <td className="px-8 py-6 text-xs text-slate-500">{r.date}</td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${r.status === 'Analyzed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                              {r.status}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <button onClick={() => deleteItem("health_records", r.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                        </td>
                      </tr>
                    ))}
                    {healthRecords.length === 0 && (
                      <tr><td colSpan={6} className="py-32 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No health records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'INSURANCE_REQUESTS' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Global Insurance Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">ID</th><th className="px-8 py-4">Plan</th><th className="px-8 py-4">Patient</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {insuranceRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-black text-blue-600">{r.id}</td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-slate-900 text-sm">{r.planName}</p>
                           <p className="text-[9px] font-black text-pink-600 uppercase tracking-widest">${r.premium}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-slate-700 text-xs">{r.userName}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{r.userEmail}</p>
                        </td>
                        <td className="px-8 py-6">
                           <select 
                            value={r.status} 
                            onChange={(e) => updateItem("insurance_requests", r.id, { status: e.target.value })}
                            className={`bg-slate-100 border-none rounded-lg text-[9px] font-black uppercase p-2 focus:ring-2 focus:ring-blue-500 ${r.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}
                           >
                             <option>Submitted</option>
                             <option>Processing</option>
                             <option>Active</option>
                           </select>
                        </td>
                        <td className="px-8 py-6">
                           <button onClick={() => deleteItem("insurance_requests", r.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                        </td>
                      </tr>
                    ))}
                    {insuranceRequests.length === 0 && (
                      <tr><td colSpan={5} className="py-32 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No insurance requests found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'HOSPITALS' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Hospital Directory</h3>
                <button 
                  onClick={() => {
                    const name = prompt("Hospital Name:");
                    const address = prompt("Address:");
                    const type = prompt("Type (Hospital/Clinic/Pharmacy):") as any;
                    if (name && address) {
                      addItem("hospitals", { name, address, type, rating: 4.5, isOpen: true, lat: 13.0827, lng: 80.2707 });
                    }
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200"
                >
                  Add Hospital
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">Name</th><th className="px-8 py-4">Type</th><th className="px-8 py-4">Address</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hospitals.map(h => (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-900 text-sm">{h.name}</td>
                        <td className="px-8 py-6"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase">{h.type}</span></td>
                        <td className="px-8 py-6 text-xs text-slate-500">{h.address}</td>
                        <td className="px-8 py-6"><button onClick={() => deleteItem("hospitals", h.id!)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'DOCTORS' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Medical Staff Registry</h3>
                <button 
                  onClick={() => {
                    const name = prompt("Doctor Name:");
                    const specialist = prompt("Specialist:");
                    if (name && specialist) {
                      addItem("doctors", { name, specialist, experience: "10+ Years", rating: 4.8, availability: "Mon-Fri" });
                    }
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-200"
                >
                  Add Doctor
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">Name</th><th className="px-8 py-4">Specialist</th><th className="px-8 py-4">Availability</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-900 text-sm">{d.name}</td>
                        <td className="px-8 py-6 text-xs font-bold text-blue-600 uppercase">{d.specialist}</td>
                        <td className="px-8 py-6 text-xs text-slate-500">{d.availability}</td>
                        <td className="px-8 py-6"><button onClick={() => deleteItem("doctors", d.id!)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'USERS' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Master Patient Registry</h3>
                <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full">{users.length} Users</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">ID</th><th className="px-8 py-4">Name</th><th className="px-8 py-4">Age/Sex</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.email} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-black text-blue-600">{u.patient_id}</td>
                        <td className="px-8 py-6 font-bold text-slate-900 text-sm">{u.username}<p className="text-[10px] font-medium text-slate-400 lowercase">{u.email}</p></td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-700 uppercase">{u.age}Y | {u.gender}</td>
                        <td className="px-8 py-6"><button onClick={() => deleteItem("users", u.id!)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'PHARMACIES' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Pharmacy Network</h3>
                <button 
                  onClick={() => {
                    const name = prompt("Pharmacy Name:");
                    const address = prompt("Address:");
                    if (name && address) {
                      addItem("pharmacies", { name, address, rating: 4.2, isOpen: true });
                    }
                  }}
                  className="bg-amber-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-200"
                >
                  Add Pharmacy
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">Name</th><th className="px-8 py-4">Address</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pharmacies.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-900 text-sm">{p.name}</td>
                        <td className="px-8 py-6 text-xs text-slate-500">{p.address}</td>
                        <td className="px-8 py-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.isOpen ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{p.isOpen ? 'Open' : 'Closed'}</span></td>
                        <td className="px-8 py-6"><button onClick={() => deleteItem("pharmacies", p.id!)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'PHARMACIES' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Pharmacy Network</h3>
                <button 
                  onClick={() => {
                    const name = prompt("Pharmacy Name:");
                    const address = prompt("Address:");
                    if (name && address) {
                      addItem("pharmacies", { name, address, rating: 4.6, isOpen: true, deliveryAvailable: true });
                    }
                  }}
                  className="bg-amber-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-200"
                >
                  Add Pharmacy
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">Name</th><th className="px-8 py-4">Address</th><th className="px-8 py-4">Delivery</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pharmacies.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-900 text-sm">{p.name}</td>
                        <td className="px-8 py-6 text-xs text-slate-500">{p.address}</td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.deliveryAvailable ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                              {p.deliveryAvailable ? 'Available' : 'No Delivery'}
                           </span>
                        </td>
                        <td className="px-8 py-6"><button onClick={() => deleteItem("pharmacies", p.id!)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'INSURANCE' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Insurance Plans</h3>
                <button 
                  onClick={() => {
                    const name = prompt("Plan Name:");
                    const premium = Number(prompt("Premium:"));
                    if (name) {
                      addItem("insurance_plans", { name, premium, type: 'Individual', coverage: "Standard", benefits: ["Checkups"], waitingPeriod: "30 Days", taxBenefit: "80D" });
                    }
                  }}
                  className="bg-pink-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-200"
                >
                  Add Plan
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">Plan Name</th><th className="px-8 py-4">Premium</th><th className="px-8 py-4">Type</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {insurancePlans.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-900 text-sm">{i.name}</td>
                        <td className="px-8 py-6 font-mono text-xs font-black text-pink-600">${i.premium}</td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase">{i.type}</td>
                        <td className="px-8 py-6"><button onClick={() => deleteItem("insurance_plans", i.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'CONTENT' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Health Content Management</h3>
                <button 
                  onClick={() => {
                    const title = prompt("Title:");
                    const category = prompt("Category (Tips/Nutrition/Exercise/MentalHealth):") as any;
                    if (title) {
                      addItem("health_content", { title, category, description: "New health tip", content: "Details here", image: "https://picsum.photos/seed/health/800/600" });
                    }
                  }}
                  className="bg-cyan-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-200"
                >
                  Add Content
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">Title</th><th className="px-8 py-4">Category</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {healthContent.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-900 text-sm">{c.title}</td>
                        <td className="px-8 py-6 text-xs font-bold text-cyan-600 uppercase">{c.category}</td>
                        <td className="px-8 py-6"><button onClick={() => deleteItem("health_content", c.id!)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'AI_TRAINING' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">AI Chatbot Training Panel</h3>
                <button 
                  onClick={() => {
                    const question = prompt("Question:");
                    const answer = prompt("Answer:");
                    if (question && answer) {
                      addItem("chatbot_dataset", { question, answer, category: "General" });
                    }
                  }}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200"
                >
                  Add Training Pair
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">Question</th><th className="px-8 py-4">Answer</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aiDataset.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 text-xs font-bold text-slate-900 max-w-xs truncate">{a.question}</td>
                        <td className="px-8 py-6 text-xs text-slate-500 max-w-md truncate">{a.answer}</td>
                        <td className="px-8 py-6"><button onClick={() => deleteItem("chatbot_dataset", a.id!)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'DOCTORS' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Medical Staff Registry</h3>
                <button 
                  onClick={() => {
                    const name = prompt("Doctor Name:");
                    const specialist = prompt("Specialist:");
                    if (name && specialist) {
                      addItem("doctors", { name, specialist, experience: "10+ Years", rating: 4.8, availability: "Mon-Fri" });
                    }
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-200"
                >
                  Add Doctor
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">Name</th><th className="px-8 py-4">Specialist</th><th className="px-8 py-4">Availability</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-900 text-sm">{d.name}</td>
                        <td className="px-8 py-6 text-xs font-bold text-blue-600 uppercase">{d.specialist}</td>
                        <td className="px-8 py-6 text-xs text-slate-500">{d.availability}</td>
                        <td className="px-8 py-6"><button onClick={() => deleteItem("doctors", d.id!)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'BOOKINGS' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Global Clinical Task Registry</h3>
                {serviceBookings.length > 0 && (
                  <button 
                    onClick={clearAllBookings}
                    className="text-[10px] font-black uppercase text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-all"
                  >
                    Purge All Records
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50">
                    <tr><th className="px-8 py-4">Ref ID</th><th className="px-8 py-4">Service & Type</th><th className="px-8 py-4">Patient Detail</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {serviceBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-black text-blue-600">{b.id}</td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-slate-900 text-sm">{b.service_title}</p>
                           <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{b.service_type}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-bold text-slate-700 text-xs">{b.patient_name}</p>
                           <p className="text-[10px] text-slate-400 font-medium max-w-xs truncate">{b.details}</p>
                        </td>
                        <td className="px-8 py-6">
                           <select 
                            value={b.status} 
                            onChange={(e) => updateItem("service_bookings", b.id, { status: e.target.value })}
                            className={`bg-slate-100 border-none rounded-lg text-[9px] font-black uppercase p-2 focus:ring-2 focus:ring-blue-500 ${b.status === 'Confirmed' ? 'text-green-600' : 'text-amber-600'}`}
                           >
                             <option>Pending</option>
                             <option>Confirmed</option>
                             <option>Delivered</option>
                           </select>
                        </td>
                        <td className="px-8 py-6">
                           <button onClick={() => deleteItem("service_bookings", b.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                        </td>
                      </tr>
                    ))}
                    {serviceBookings.length === 0 && (
                      <tr><td colSpan={5} className="py-32 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No clinical tasks currently active</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'MENTAL_HEALTH' && (
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Mental Health Registry</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Emotional Well-being Logs</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mood</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stress</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentalHealthLogs.map((log: any) => (
                      <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-6 font-mono text-[10px] text-slate-400">{log.user_id}</td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                             log.mood === 'Happy' ? 'bg-yellow-50 text-yellow-600' : 
                             log.mood === 'Sad' ? 'bg-indigo-50 text-indigo-600' : 
                             'bg-slate-50 text-slate-600'
                           }`}>{log.mood}</span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500" style={{ width: `${log.stress_level * 10}%` }}></div>
                           </div>
                           <span className="text-[9px] font-black text-slate-400 mt-1 block">{log.stress_level}/10</span>
                        </td>
                        <td className="px-8 py-6 text-xs font-medium text-slate-600 max-w-xs truncate">{log.notes || '-'}</td>
                        <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-8 py-6">
                           <button onClick={() => deleteItem("mental_health_logs", log.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt"></i></button>
                        </td>
                      </tr>
                    ))}
                    {mentalHealthLogs.length === 0 && (
                      <tr><td colSpan={6} className="py-32 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No mental health logs found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="bg-white p-4 border-t border-slate-200 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
        <i className="fas fa-microchip text-blue-500 mr-2"></i> Neural-Link Operational • Clinical Governance Console v9.2
      </div>
    </div>
  );
};

export default AdminDashboard;
