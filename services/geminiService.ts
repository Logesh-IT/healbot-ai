import { GoogleGenAI, Modality } from "@google/genai";
import { MEDICAL_SYSTEM_INSTRUCTION } from "../constants";
import { getGeminiKey, rotateGeminiKey, GEMINI_KEYS } from "./geminiConfig";

export class HealBotService {
  public ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: getGeminiKey() });
  }

  async getResponse(
    prompt: string,
    history: any[] = [],
    location?: { lat: number; lng: number },
    imageBase64?: string
  ) {
    if (!navigator.onLine) {
      return {
        text: "I'm currently offline. I can't access my neural network right now, but I'll be back as soon as you're reconnected! In the meantime, you can still access your local health records and wellness tools.",
        groundingChunks: [],
        isEmergency: false,
        isOfflineResponse: true
      };
    }

    const tryGenerate = async (retryCount = 0): Promise<any> => {
      try {
        const model = 'gemini-3-flash-preview';
        const ai = new GoogleGenAI({ apiKey: getGeminiKey() });

        const tools: any[] = [];
        let toolConfig: any = undefined;

        if (location) {
          tools.push({ googleMaps: {} });
          toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: location.lat,
                longitude: location.lng
              }
            }
          };
        } else {
          tools.push({ googleSearch: {} });
        }

        const config: any = {
          systemInstruction: MEDICAL_SYSTEM_INSTRUCTION,
          tools,
          toolConfig,
        };

        const currentParts: any[] = [{ text: prompt }];
        
        if (imageBase64) {
          const mimeTypeMatch = imageBase64.match(/^data:(.*);base64,/);
          const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
          const data = imageBase64.split(',')[1] || imageBase64;
          
          currentParts.push({
            inlineData: {
              mimeType,
              data
            }
          });
        }

        const response = await ai.models.generateContent({
          model,
          contents: [
            ...history,
            { role: 'user', parts: currentParts }
          ],
          config
        });

        const text = response.text || '';
        
        return {
          text,
          groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
          isEmergency: text.toLowerCase().includes('emergency') || text.toLowerCase().includes('critical') || text.toLowerCase().includes('urgent')
        };
      } catch (error: any) {
        console.error("Gemini Service Error:", error);

        if (
          retryCount < GEMINI_KEYS.length - 1 &&
          (error.message?.includes('quota') ||
           error.message?.includes('429') ||
           error.status === 429)
        ) {
          console.warn("Quota exceeded, rotating key and retrying...");

          await new Promise(res => setTimeout(res, 1000));
          rotateGeminiKey();

          return tryGenerate(retryCount + 1);
        }

        throw error;
      }
    };

    return tryGenerate();
  }

  connectLive(callbacks: any, patientInfo: any) {
    const ai = new GoogleGenAI({ apiKey: getGeminiKey() });
    return ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: `
          ${MEDICAL_SYSTEM_INSTRUCTION}
          PATIENT CONTEXT:
          - Name: ${patientInfo.name}
          - Patient ID: ${patientInfo.patient_id}
          - Session ID: ${patientInfo.sessionId}
          VOICE MODE: Keep responses concise. You are a medical assistant speaking via audio.
        `,
      },
    });
  }
}