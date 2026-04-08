
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAnswer } from '../services/chatbot';
import { Language } from '../types';

interface AnalysisType {
  id: string;
  name: string;
  icon: string;
  description: string;
  examples: string[];
}

const ANALYSIS_TYPES: AnalysisType[] = [
  {
    id: 'radiology',
    name: 'Radiology Imaging',
    icon: 'fa-radiation',
    description: 'X-ray, CT Scan, and MRI analysis for bones and internal organs.',
    examples: ['Chest X-ray', 'Brain MRI', 'Abdominal CT']
  },
  {
    id: 'skin',
    name: 'Skin & External',
    icon: 'fa-hand-dots',
    description: 'Detection of skin diseases, infections, and eye conditions.',
    examples: ['Acne', 'Melanoma', 'Retina Scan']
  },
  {
    id: 'heart',
    name: 'Heart & Signals',
    icon: 'fa-heart-pulse',
    description: 'ECG and EEG signal analysis for heart and brain health.',
    examples: ['ECG Strip', 'EEG Graph']
  },
  {
    id: 'dental',
    name: 'Dental Imaging',
    icon: 'fa-tooth',
    description: 'Analysis of dental X-rays for decay and jaw issues.',
    examples: ['Dental X-ray', 'Jaw Scan']
  },
  {
    id: 'lab',
    name: 'Lab & Microscopic',
    icon: 'fa-microscope',
    description: 'Analysis of blood cell images and microscopic samples.',
    examples: ['Blood Smear', 'Cell Count']
  }
];

const MedicalImageAnalysis: React.FC<{ lang: Language; isOnline: boolean; onBack: () => void }> = ({ lang, isOnline, onBack }) => {
  const [selectedType, setSelectedType] = useState<AnalysisType | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image || !selectedType) return;

    setIsAnalyzing(true);
    try {
      const languageName = lang === Language.EN ? "English" : lang === Language.HI ? "Hindi" : lang === Language.TA ? "Tamil" : lang === Language.ES ? "Spanish" : "Arabic";
      const prompt = `Analyze this medical image (${selectedType.name}). Detect possible issues, provide a detailed observation, and suggest next steps. Note: This is an AI-assisted observation, not a final diagnosis.`;
      const response = await getAnswer(prompt, [], undefined, undefined, image, languageName, isOnline);
      setResult(response.text);
    } catch (error) {
      setResult("Analysis failed. Please try again with a clearer image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">Medical Image Analysis</h2>
          <p className="text-slate-500 max-w-2xl">Advanced AI-powered analysis for various types of medical imaging. Upload your scan for an instant observation.</p>
        </div>
        <button 
          onClick={onBack}
          className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Select Analysis Type</h3>
          {ANALYSIS_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => { setSelectedType(type); setImage(null); setResult(null); }}
              className={`w-full p-6 rounded-[2rem] border-2 transition-all text-left flex items-start gap-4 ${
                selectedType?.id === type.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                selectedType?.id === type.id ? 'bg-white/20' : 'bg-slate-50 text-blue-600'
              }`}>
                <i className={`fas ${type.icon}`}></i>
              </div>
              <div>
                <p className="font-bold mb-1">{type.name}</p>
                <p className={`text-[10px] leading-relaxed ${selectedType?.id === type.id ? 'text-blue-100' : 'text-slate-400'}`}>
                  {type.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedType ? (
              <motion.div
                key={selectedType.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm min-h-[600px] flex flex-col"
              >
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase">{selectedType.name}</h3>
                    <div className="flex gap-2 mt-2">
                      {selectedType.examples.map(ex => (
                        <span key={ex} className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider">{ex}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-2xl">
                    <i className={`fas ${selectedType.icon}`}></i>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-slate-50 rounded-[2.5rem] p-8 relative overflow-hidden group">
                  {image ? (
                    <div className="w-full h-full relative">
                      <img src={image} className="w-full h-full object-contain rounded-2xl" alt="Medical Scan" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => { setImage(null); setResult(null); }}
                        className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-4xl mb-6 mx-auto group-hover:scale-110 transition-all">
                        <i className="fas fa-cloud-upload-alt"></i>
                      </div>
                      <p className="text-slate-400 font-bold mb-2">Drag & drop or click to upload</p>
                      <p className="text-[10px] text-slate-300 uppercase tracking-widest">Supports JPG, PNG, DICOM</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-10 flex gap-4">
                  <button
                    disabled={!image || isAnalyzing}
                    onClick={runAnalysis}
                    className={`flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
                      !image || isAnalyzing 
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin"></i>
                        Analyzing Scan...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-microscope"></i>
                        Run AI Analysis
                      </>
                    )}
                  </button>
                </div>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-10 p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100"
                  >
                    <div className="flex items-center gap-3 mb-4 text-blue-600">
                      <i className="fas fa-robot"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">AI Observation Result</span>
                    </div>
                    <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {result}
                    </div>
                    <div className="mt-6 pt-6 border-t border-blue-100 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">
                        <i className="fas fa-exclamation-triangle"></i>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold italic">
                        Disclaimer: This analysis is generated by AI for informational purposes only. Please consult a qualified radiologist or doctor for a clinical diagnosis.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-100">
                <div className="w-32 h-32 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-200 text-5xl mb-8">
                  <i className="fas fa-images"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-300 uppercase mb-4">No Analysis Selected</h3>
                <p className="text-slate-400 max-w-xs text-sm">Please select an imaging type from the left panel to begin your AI-assisted analysis.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  </div>
);
};

export default MedicalImageAnalysis;
