
import React, { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceControlProps {
  onTranscript: (update: string | ((prev: string) => string)) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>('');

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const toggleListen = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    try {
      // Capture what is currently in the text box as a base
      onTranscript((prev: string) => {
        baseTextRef.current = prev || '';
        return prev;
      });

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let sessionFinalTranscript = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let newFinalInThisEvent = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinalInThisEvent += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        sessionFinalTranscript += newFinalInThisEvent;
        setInterimText(currentInterim);

        onTranscript(() => {
          const original = baseTextRef.current.trim();
          const sessionText = (sessionFinalTranscript + currentInterim).trim();
          
          if (!original) return sessionText;
          if (!sessionText) return original;
          return `${original} ${sessionText}`;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        // Don't stop on all errors, some are transient
        if (event.error === 'not-allowed') {
          alert("Microphone permission denied. Please allow microphone access.");
          stopListening();
        } else if (event.error === 'no-speech') {
          // Just ignore no-speech, keep listening if continuous
        } else {
          // For other errors, we might need to restart, but let's try to stay active
          console.warn("Recoverable speech error:", event.error);
        }
      };

      recognition.onend = () => {
        // If we are still supposed to be listening, restart it
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to restart recognition:", e);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
          setInterimText('');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (err) {
      console.error("Speech Recognition Error:", err);
      setIsListening(false);
    }
  }, [isListening, onTranscript, stopListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="relative flex items-center">
      <button
        onClick={toggleListen}
        type="button"
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative z-20 ${
          isListening 
            ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-110' 
            : 'text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200'
        }`}
        title={isListening ? "Stop Listening" : "Start Voice Input"}
      >
        <i className={`fas ${isListening ? 'fa-stop text-sm' : 'fa-microphone-alt text-xl'}`}></i>
        
        {isListening && (
          <div className="absolute inset-0 rounded-2xl animate-ping bg-red-600/30 -z-10"></div>
        )}
      </button>
      
      {isListening && (
        <div className="absolute right-full mr-4 bg-white border border-red-100 px-5 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 flex items-center gap-4 min-w-[180px] max-w-xs">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600 leading-none mb-1">Live Listening</span>
            <p className="text-[11px] font-bold text-slate-900 truncate italic">
              {interimText || "Listening..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceControl;
