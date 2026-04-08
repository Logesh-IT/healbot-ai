
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { UserHealthProfile } from '../types';
import { HealBotService } from '../services/geminiService';

interface LiveVoiceModeProps {
  userProfile: UserHealthProfile;
  sessionId: string;
  onBack: () => void;
}

const LiveVoiceMode: React.FC<LiveVoiceModeProps> = ({ userProfile, sessionId, onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [status, setStatus] = useState<'Idle' | 'Connecting...' | 'Ready' | 'Error'>('Idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const healBot = useRef(new HealBotService());
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    return () => endLiveSession();
  }, []);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startLiveSession = async () => {
    try {
      setStatus('Connecting...');
      setErrorMessage(null);

      // Initialize Audio Contexts - must be done in response to user gesture
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (inputAudioContextRef.current.state === 'suspended') {
        await inputAudioContextRef.current.resume();
      }
      if (outputAudioContextRef.current.state === 'suspended') {
        await outputAudioContextRef.current.resume();
      }

      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = healBot.current.connectLive({
        onopen: () => {
          setStatus('Ready');
          setIsActive(true);
          
          const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
          scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            if (isMuted) return;
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            
            // Check for user speaking (simple threshold)
            const sum = inputData.reduce((a, b) => a + Math.abs(b), 0);
            setIsUserSpeaking(sum > 10);

            const pcmBlob = createBlob(inputData);
            sessionPromise.then((session) => {
              session.sendRealtimeInput({ audio: pcmBlob });
            });
          };

          source.connect(scriptProcessorRef.current);
          scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          
          if (base64EncodedAudioString) {
            setIsBotSpeaking(true);
            const ctx = outputAudioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            
            const audioBuffer = await decodeAudioData(
              decode(base64EncodedAudioString),
              ctx,
              24000,
              1,
            );
            
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNodeRef.current!);
            source.addEventListener('ended', () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsBotSpeaking(false);
            });

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          if (message.serverContent?.interrupted) {
            for (const source of sourcesRef.current.values()) {
              try { source.stop(); } catch(e) {}
              sourcesRef.current.delete(source);
            }
            nextStartTimeRef.current = 0;
            setIsBotSpeaking(false);
          }
        },
        onerror: (e: any) => {
          console.error("Live API Error:", e);
          setStatus('Error');
          setErrorMessage(e.message || "Connection error occurred.");
        },
        onclose: () => {
          setIsActive(false);
          setStatus('Idle');
        }
      }, {
        name: userProfile.name,
        patient_id: userProfile.patient_id,
        sessionId: sessionId
      });

    } catch (err: any) {
      console.error("Failed to initialize voice mode", err);
      setStatus('Error');
      setErrorMessage(err.message || "Permission denied or hardware error.");
    }
  };

  const endLiveSession = () => {
    setIsActive(false);
    streamRef.current?.getTracks().forEach(t => t.stop());
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white relative overflow-hidden">
      {/* Immersive background orbital waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className={`w-[30rem] h-[30rem] border-2 border-blue-500 rounded-full animate-ping duration-[3000ms] ${isBotSpeaking ? 'opacity-100 scale-125' : 'opacity-0 scale-100'} transition-all`}></div>
        <div className={`absolute w-[20rem] h-[20rem] border border-blue-400 rounded-full animate-pulse ${isBotSpeaking || isUserSpeaking ? 'opacity-100' : 'opacity-20'} transition-all`}></div>
      </div>

      <div className="z-10 text-center space-y-12 max-w-lg px-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className={`w-3 h-3 rounded-full ${status === 'Ready' ? 'bg-green-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`}></div>
            <h2 className="text-sm font-black uppercase tracking-[0.5em] text-slate-400">{status}</h2>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">HealBot Live</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Connected as {userProfile.name} • {userProfile.patient_id}</p>
        </div>

        {/* Dynamic Voice Ripples */}
        <div className="h-48 flex items-center justify-center gap-1">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={`w-2 rounded-full transition-all duration-150 ${isBotSpeaking ? 'bg-blue-500' : isUserSpeaking ? 'bg-red-500' : 'bg-slate-700'}`}
              style={{ 
                height: `${isBotSpeaking || isUserSpeaking ? Math.random() * 100 + 20 : 10}%`,
                transitionDelay: `${i * 50}ms`
              }}
            ></div>
          ))}
        </div>

        <div className="p-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-[3rem] space-y-6">
          {status === 'Idle' || status === 'Error' ? (
            <div className="space-y-4">
              {status === 'Error' && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-xs font-bold">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {errorMessage || "Failed to access microphone. Please check system permissions."}
                </div>
              )}
              <p className="text-sm font-medium text-slate-300 italic leading-relaxed">
                Ready to start your secure clinical voice session?
              </p>
              <button 
                onClick={startLiveSession}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                <i className="fas fa-play"></i>
                Start Live Session
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-300 italic leading-relaxed">
                {isBotSpeaking ? "HealBot is speaking..." : isUserSpeaking ? "Listening to you..." : "Speak naturally. I'm listening."}
              </p>
              
              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                >
                  <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-xl`}></i>
                </button>
                <button 
                  onClick={onBack}
                  className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl"
                >
                  End Session
                </button>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <p className="text-[8px] font-black uppercase text-blue-500 mb-1">Active ID</p>
            <p className="text-[10px] font-mono font-bold text-slate-400">{sessionId}</p>
          </div>
          <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <p className="text-[8px] font-black uppercase text-blue-500 mb-1">Latency</p>
            <p className="text-[10px] font-mono font-bold text-slate-400">Optimized (Low)</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-[9px] font-black uppercase text-slate-700 tracking-[0.4em]">Secure Multi-Modal Neural Sync v7.0</p>
      </div>
    </div>
  );
};

export default LiveVoiceMode;
