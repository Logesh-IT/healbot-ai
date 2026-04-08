
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { SEVERITY_COLORS } from '../constants';
import { Loader2, ArrowLeft, Pill, Camera, Microscope, AlertTriangle, X, Image as ImageIcon } from 'lucide-react';
import { callLocalAI } from '../services/chatbot';
import { createGeminiClient, rotateGeminiKey } from '../services/geminiConfig';

interface MedicineAnalyzerProps {
  onBack: () => void;
}

const MedicineAnalyzer: React.FC<MedicineAnalyzerProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMedicine = async () => {
    if (!input && !image) return;
    setIsAnalyzing(true);
    setResult(null);

    const prompt = `Analyze this medicine. Provide:
    1. Medicine Name
    2. Primary Usage
    3. Common Side Effects
    4. Dosage Guidelines
    5. Safety Warnings
    
    Format the output clearly using Markdown headers and a table for side effects.
    If it's an image, identify the medicine from the packaging.
    If it's text, use the provided name: ${input}`;

    const tryAnalyze = async (retryCount = 0): Promise<void> => {
      try {
        const ai = createGeminiClient();
        
        let contents: any;
        if (image) {
          const data = image.split(',')[1];
          contents = {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data } }
            ]
          };
        } else {
          contents = { parts: [{ text: prompt }] };
        }

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents
        });

        setResult(response.text || "Could not analyze medicine.");
      } catch (error: any) {
        console.error("Medicine Analysis Error:", error);
        
        if (retryCount < 1 && (error.message?.includes('quota') || error.message?.includes('429') || error.status === 429)) {
          console.warn("Quota exceeded, rotating key and retrying...");
          rotateGeminiKey();
          return tryAnalyze(retryCount + 1);
        }

        // 🏠 Local AI Fallback (Text only for now)
        if (input) {
          const localRes = await callLocalAI(prompt);
          if (localRes) {
            setResult("⚠️ Using Local AI Analysis:\n\n" + localRes);
            return;
          }
        }
        
        setResult("### Error\nFailed to analyze medicine. Please ensure the image is clear or the name is correct.");
      }
    };

    await tryAnalyze();
    setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-12 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-200">
                <Pill className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Medicine Analyzer</h2>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Smart Pharmaceutical Identification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-2">Identify by Name</label>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter medicine name (e.g. Paracetamol)..."
                    className="w-full bg-white border-2 border-slate-100 rounded-3xl p-6 text-sm font-bold focus:border-blue-500 focus:ring-0 transition-all shadow-sm"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-slate-50 px-4 text-slate-400">OR</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-2">Identify by Image</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all bg-white shadow-sm">
                      <Camera className="w-8 h-8 text-slate-300 mb-4 group-hover:text-blue-500 transition-colors mx-auto" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Prescription or Packaging</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center items-center p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
                {image ? (
                  <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
                    <img src={image} alt="Medicine" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setImage(null)}
                      className="absolute top-4 right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600 text-4xl">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No Image Selected</p>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={analyzeMedicine}
              disabled={isAnalyzing || (!input && !image)}
              className="w-full mt-12 bg-blue-600 text-white p-8 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-200 disabled:shadow-none transition-all flex items-center justify-center gap-4"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Pharmaceutical Data...</span>
                </>
              ) : (
                <>
                  <Microscope className="w-5 h-5" />
                  <span>Start Analysis</span>
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="p-12 bg-white animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-slate-600 prose-p:font-medium prose-table:border prose-table:rounded-3xl prose-table:overflow-hidden">
                <Markdown>{result}</Markdown>
              </div>
              
              <div className="mt-12 p-8 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-6 items-start">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white text-xl shrink-0 shadow-lg shadow-amber-200">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-amber-800 mb-2">Medical Disclaimer</h4>
                  <p className="text-xs font-bold text-amber-700/80 leading-relaxed">
                    This analysis is provided by AI for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineAnalyzer;
