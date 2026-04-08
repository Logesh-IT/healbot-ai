
import React from 'react';

interface HealthContentProps {
  onBack: () => void;
}

const HealthContent: React.FC<HealthContentProps> = ({ onBack }) => {
  const topics = [
    {
      id: 'tips',
      title: 'Daily Health Tips',
      icon: 'fas fa-lightbulb',
      color: 'bg-amber-500',
      shadow: 'shadow-amber-200',
      items: [
        { title: 'Stay Hydrated', description: 'Drink at least 8 glasses of water daily for optimal organ function.', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800' },
        { title: 'Quality Sleep', description: 'Aim for 7-9 hours of restful sleep to allow your body to repair itself.', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800' },
        { title: 'Mindful Eating', description: 'Pay attention to your hunger cues and savor every bite of your meal.', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'nutrition',
      title: 'Nutrition & Diet',
      icon: 'fas fa-apple-alt',
      color: 'bg-green-500',
      shadow: 'shadow-green-200',
      items: [
        { title: 'Plant-Based Power', description: 'Incorporate more legumes, nuts, and seeds for sustainable energy.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800' },
        { title: 'Healthy Fats', description: 'Avocados and olive oil are essential for brain health and hormone production.', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800' },
        { title: 'Fiber Focus', description: 'Whole grains and vegetables keep your digestive system running smoothly.', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'exercise',
      title: 'Exercise Routines',
      icon: 'fas fa-running',
      color: 'bg-blue-500',
      shadow: 'shadow-blue-200',
      items: [
        { title: 'Morning Mobility', description: 'Start your day with 10 minutes of dynamic stretching to wake up your joints.', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800' },
        { title: 'Strength Training', description: 'Build muscle mass to boost your metabolism and protect your bones.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800' },
        { title: 'Cardio Health', description: '30 minutes of brisk walking can significantly improve heart health.', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800' }
      ]
    },
    {
      id: 'mental',
      title: 'Mental Health',
      icon: 'fas fa-brain',
      color: 'bg-purple-500',
      shadow: 'shadow-purple-200',
      items: [
        { title: 'Stress Management', description: 'Practice box breathing for 5 minutes when feeling overwhelmed.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800' },
        { title: 'Digital Detox', description: 'Unplug from screens 1 hour before bed to reduce anxiety levels.', image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800' },
        { title: 'Gratitude Journaling', description: 'Write down 3 things you are thankful for every evening.', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800' }
      ]
    }
  ];

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <i className="fas fa-arrow-left text-xs"></i>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-3xl shadow-xl shadow-slate-200">
            <i className="fas fa-book-medical"></i>
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Health Knowledge Hub</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curated Medical Insights for Daily Living</p>
          </div>
        </div>

        <div className="space-y-20">
          {topics.map((topic) => (
            <section key={topic.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 ${topic.color} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg ${topic.shadow}`}>
                  <i className={topic.icon}></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{topic.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {topic.items.map((item, idx) => (
                  <div key={idx} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Read More <i className="fas fa-arrow-right ml-2"></i></span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h4 className="text-lg font-black text-slate-900 mb-3 uppercase tracking-tight leading-tight">{item.title}</h4>
                      <p className="text-sm font-bold text-slate-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthContent;
