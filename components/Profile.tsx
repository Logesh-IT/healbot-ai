
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { AuthService } from '../services/authService';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Calendar, Hash, Shield, Save, LogOut, Camera } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onLogout }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (user.id) {
        await AuthService.updateProfile(user.id, {
          username: formData.username,
          age: formData.age,
          gender: formData.gender,
        });
        onUpdate(formData);
        setMessage({ text: 'Profile updated successfully! ✅', type: 'success' });
        setIsEditing(false);
      }
    } catch (error: any) {
      setMessage({ text: `Error: ${error.message} ❌`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 text-white relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center border-4 border-white/30 overflow-hidden">
                <UserIcon size={64} className="text-white" />
              </div>
              <button className="absolute -bottom-2 -right-2 bg-white text-blue-600 p-3 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                <Camera size={20} />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black tracking-tight mb-2">{user.username}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/30">
                  {user.role}
                </span>
                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/30">
                  {user.patient_id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-12">
          {message.text && (
            <div className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 dark:text-slate-200 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 dark:text-slate-200 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Gender</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 dark:text-slate-200 appearance-none disabled:opacity-60"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 dark:shadow-none"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onLogout}
                className="md:w-auto px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
