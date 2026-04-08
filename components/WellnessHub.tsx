
import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type SubModule = 'diet' | 'calories' | 'workout' | 'weightloss';

const FOOD_DB: Record<string, number> = {
  'apple': 95, 'banana': 105, 'rice': 200, 'chicken': 250, 'bread': 80, 
  'egg': 70, 'milk': 120, 'paneer': 180, 'oats': 150, 'chapati': 70, 'dal': 100
};

const WellnessHub: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeModule, setActiveModule] = useState<SubModule>('diet');
  
  // Diet State
  const [dietForm, setDietForm] = useState({ age: 25, gender: 'Male', height: 175, weight: 70, goal: 'Maintain', type: 'Veg' });
  const [generatedDiet, setGeneratedDiet] = useState<any[]>([]);

  // Calorie State
  const [calorieLog, setCalorieLog] = useState<{item: string, cal: number, qty: number}[]>([]);
  const [foodInput, setFoodInput] = useState('');
  const [qtyInput, setQtyInput] = useState(1);

  // Workout State
  const [workoutLevel, setWorkoutLevel] = useState('Beginner');
  const [workoutDays, setWorkoutDays] = useState(3);
  const [routine, setRoutine] = useState<any[]>([]);

  // Weight Loss State
  const [weightGoal, setWeightGoal] = useState({ current: 70, target: 65, weeks: 8 });
  const [weightHistory, setWeightHistory] = useState([{ week: 0, weight: 70 }]);

  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedLogs = localStorage.getItem('wellness_calorie_log');
    if (savedLogs) setCalorieLog(JSON.parse(savedLogs));
  }, []);

  const calculateCalories = () => {
    // Mifflin-St Jeor Equation
    let bmr = (10 * dietForm.weight) + (6.25 * dietForm.height) - (5 * dietForm.age);
    bmr = dietForm.gender === 'Male' ? bmr + 5 : bmr - 161;
    
    const adjustment = dietForm.goal === 'Lose' ? -500 : dietForm.goal === 'Gain' ? 500 : 0;
    return Math.round(bmr * 1.2 + adjustment);
  };

  const generateDietPlan = () => {
    const dailyTarget = calculateCalories();
    const mockMeals = [
      { meal: 'Breakfast', items: dietForm.type === 'Veg' ? 'Oats with Fruit' : '3 Egg Omelette', cal: Math.round(dailyTarget * 0.25) },
      { meal: 'Lunch', items: dietForm.type === 'Veg' ? 'Dal, Rice & Veg' : 'Chicken Curry & Rice', cal: Math.round(dailyTarget * 0.35) },
      { meal: 'Snack', items: 'Nuts & Green Tea', cal: Math.round(dailyTarget * 0.1) },
      { meal: 'Dinner', items: dietForm.type === 'Veg' ? 'Paneer & Chapati' : 'Fish & Grilled Veg', cal: Math.round(dailyTarget * 0.3) },
    ];
    setGeneratedDiet(mockMeals);
  };

  const addCalorieItem = () => {
    const cal = (FOOD_DB[foodInput.toLowerCase()] || 100) * qtyInput;
    const newLog = [...calorieLog, { item: foodInput, cal, qty: qtyInput }];
    setCalorieLog(newLog);
    localStorage.setItem('wellness_calorie_log', JSON.stringify(newLog));
    setFoodInput('');
    setQtyInput(1);
  };

  const generateWorkout = () => {
    const plans: any = {
      'Beginner': ['Jumping Jacks', 'Squats', 'Wall Pushups', 'Walking'],
      'Intermediate': ['Burpees', 'Lunges', 'Standard Pushups', 'Plank']
    };
    const selected = plans[workoutLevel].map((ex: string) => ({
      exercise: ex, duration: workoutLevel === 'Beginner' ? '30s' : '60s', sets: 3
    }));
    setRoutine(selected);
  };

  const downloadPDF = async () => {
    if (!printableRef.current) return;
    try {
      const canvas = await html2canvas(printableRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = 210; 
      const pdfPageHeight = 297; 
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const imgHeightInPdf = (canvasHeight * pdfWidth) / canvasWidth;
      
      let heightLeft = imgHeightInPdf;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
      heightLeft -= pdfPageHeight;

      // Loop to add more pages
      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfPageHeight;
      }
      
      pdf.save(`HealBot_Wellness_Report.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      {/* Header */}
      <div className="bg-white p-6 border-b border-slate-200 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"><i className="fas fa-arrow-left"></i></button>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">Fitness & Nutrition Hub</h2>
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Wellness Intelligence Suite</p>
            </div>
          </div>
          <button onClick={downloadPDF} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all">
            <i className="fas fa-file-pdf"></i> Download Report
          </button>
        </div>
      </div>

      {/* Sub-Nav */}
      <div className="bg-white border-b border-slate-200 px-6 no-print">
        <div className="max-w-5xl mx-auto flex gap-8">
          {(['diet', 'calories', 'workout', 'weightloss'] as SubModule[]).map(mod => (
            <button 
              key={mod}
              onClick={() => setActiveModule(mod)}
              className={`py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeModule === mod ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              {mod.replace('loss', ' Loss')}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide" ref={printableRef}>
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* DIET MODULE */}
          {activeModule === 'diet' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm col-span-1 no-print">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">Personalize Plan</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase mb-1 block">Goal</label>
                    <select className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm" value={dietForm.goal} onChange={e => setDietForm({...dietForm, goal: e.target.value})}>
                      <option>Lose</option><option>Maintain</option><option>Gain</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase mb-1 block">Weight (kg)</label>
                      <input type="number" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm" value={dietForm.weight} onChange={e => setDietForm({...dietForm, weight: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase mb-1 block">Height (cm)</label>
                      <input type="number" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm" value={dietForm.height} onChange={e => setDietForm({...dietForm, height: Number(e.target.value)})} />
                    </div>
                  </div>
                  <button onClick={generateDietPlan} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all mt-4">Generate 7-Day Plan</button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">Daily Meal Structure</h3>
                {generatedDiet.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-6 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase text-orange-600 mb-1">Target Daily Intake</p>
                        <p className="text-3xl font-black text-slate-900">{calculateCalories()} kcal</p>
                      </div>
                      <i className="fas fa-utensils text-orange-200 text-4xl"></i>
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
                        <tr><th className="p-4 rounded-l-xl">Meal</th><th className="p-4">Recommended Items</th><th className="p-4 rounded-r-xl">Calories</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {generatedDiet.map((m, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-xs font-black text-slate-900">{m.meal}</td>
                            <td className="p-4 text-xs text-slate-600 font-medium">{m.items}</td>
                            <td className="p-4 text-xs font-bold text-orange-600">{m.cal} kcal</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <i className="fas fa-plate-wheat text-6xl mb-4"></i>
                    <p className="font-bold text-sm">Enter details to see your plan</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CALORIE MODULE */}
          {activeModule === 'calories' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm no-print">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">Quick Log</h3>
                  <div className="space-y-4">
                    <input list="foods" placeholder="What did you eat?" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm" value={foodInput} onChange={e => setFoodInput(e.target.value)} />
                    <datalist id="foods">
                      {Object.keys(FOOD_DB).map(f => <option key={f} value={f} />)}
                    </datalist>
                    <input type="number" placeholder="Qty (e.g. 1)" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm" value={qtyInput} onChange={e => setQtyInput(Number(e.target.value))} />
                    <button onClick={addCalorieItem} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all">Log Food</button>
                  </div>
                </div>

                <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Daily Burn Counter</h3>
                    <button onClick={() => {setCalorieLog([]); localStorage.removeItem('wellness_calorie_log');}} className="text-[10px] font-black uppercase text-red-500 hover:underline no-print">Reset Day</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Logged Today</p>
                      <p className="text-3xl font-black text-slate-900">{calorieLog.reduce((acc, curr) => acc + curr.cal, 0)} kcal</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                      <p className="text-[10px] font-black uppercase text-green-600 mb-2">Daily Remaining</p>
                      <p className="text-3xl font-black text-slate-900">{Math.max(0, 2500 - calorieLog.reduce((acc, curr) => acc + curr.cal, 0))} kcal</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {calorieLog.map((log, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase">{log.item}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Qty: {log.qty}</p>
                        </div>
                        <p className="text-xs font-black text-green-600">+{log.cal} kcal</p>
                      </div>
                    ))}
                    {calorieLog.length === 0 && <p className="text-center py-10 text-slate-300 font-bold italic">No food logged yet today.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORKOUT MODULE */}
          {activeModule === 'workout' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm no-print">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">Configure Intensity</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase mb-3 block">Level</label>
                    <div className="flex gap-2">
                      {['Beginner', 'Intermediate'].map(l => (
                        <button key={l} onClick={() => setWorkoutLevel(l)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${workoutLevel === l ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase mb-3 block">Frequency (Days/Week)</label>
                    <input type="range" min="1" max="7" value={workoutDays} onChange={e => setWorkoutDays(Number(e.target.value))} className="w-full accent-orange-600" />
                    <div className="flex justify-between text-[10px] font-black text-slate-400 mt-2"><span>1 Day</span><span>7 Days</span></div>
                  </div>
                  <button onClick={generateWorkout} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">Build Routine</button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">Home Training Plan</h3>
                {routine.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {routine.map((ex, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-400 transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-4">
                            <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-slate-900 shadow-sm">{i+1}</span>
                            <i className="fas fa-play text-slate-200 group-hover:text-blue-500 no-print"></i>
                          </div>
                          <h4 className="font-black text-slate-900 uppercase text-xs mb-1">{ex.exercise}</h4>
                          <p className="text-[10px] font-bold text-slate-400">{ex.duration} • {ex.sets} Sets • 30s Rest</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <i className="fas fa-dumbbell text-6xl mb-4"></i>
                    <p className="font-bold text-sm">Choose level to build your workout</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WEIGHT LOSS MODULE */}
          {activeModule === 'weightloss' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm md:col-span-1 no-print">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">Target Weight</h3>
                  <div className="space-y-4">
                    <input type="number" placeholder="Target (kg)" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold" value={weightGoal.target} onChange={e => setWeightGoal({...weightGoal, target: Number(e.target.value)})} />
                    <input type="number" placeholder="Timeframe (Weeks)" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold" value={weightGoal.weeks} onChange={e => setWeightGoal({...weightGoal, weeks: Number(e.target.value)})} />
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                      <p className="text-[10px] font-black uppercase text-blue-600">Weekly Goal</p>
                      <p className="text-xl font-black text-slate-900">{((weightGoal.current - weightGoal.target) / weightGoal.weeks).toFixed(2)} kg</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm md:col-span-3">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400">Longitudinal Progress</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { week: 'Start', w: weightGoal.current },
                        { week: 'Wk 2', w: weightGoal.current - 1.2 },
                        { week: 'Wk 4', w: weightGoal.current - 2.5 },
                        { week: 'Wk 6', w: weightGoal.current - 3.8 },
                        { week: 'Wk 8', w: weightGoal.target },
                      ]}>
                        <defs>
                          <linearGradient id="colorW" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="week" hide />
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip />
                        <Area type="monotone" dataKey="w" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorW)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-center px-4">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Loss</p>
                      <p className="text-2xl font-black text-slate-900">{weightGoal.current - weightGoal.target} kg</p>
                    </div>
                    <div className="text-center px-4 border-l border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p>
                      <p className="text-sm font-black text-orange-600 uppercase">On Track</p>
                    </div>
                    <div className="text-center px-4 border-l border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">End Goal</p>
                      <p className="text-sm font-black text-slate-900 uppercase font-mono">{weightGoal.target} kg</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="bg-white p-4 border-t border-slate-200 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest no-print">
        <i className="fas fa-shield-heart text-orange-400 mr-2"></i> Healthify Powered Lifestyle Guidance
      </div>
    </div>
  );
};

export default WellnessHub;
