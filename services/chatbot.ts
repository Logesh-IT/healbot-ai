import supabase from "../supabase";
import { createGeminiClient, rotateGeminiKey } from "./geminiConfig";
import { MEDICAL_SYSTEM_INSTRUCTION, GENERAL_SYSTEM_INSTRUCTION, EMERGENCY_SYSTEM_INSTRUCTION, GOV_SYSTEM_INSTRUCTION } from "../constants";

// 🔑 Multi-API Key System for Rotation (Now using geminiConfig)
let isGeminiDown = false;
let lastGeminiFailureTime = 0;

const checkGeminiStatus = () => {
  if (isGeminiDown) {
    const now = Date.now();
    if (now - lastGeminiFailureTime > 60000) {
      isGeminiDown = false;
      return true;
    }
    return false;
  }
  return true;
};

const markGeminiDown = () => {
  isGeminiDown = true;
  lastGeminiFailureTime = Date.now();
};

const getNextAIInstance = () => {
  return createGeminiClient();
};

// 🚀 Response Cache
const responseCache: Record<string, any> = {};

// 🌦 Weather (OpenWeather API)
export const getWeather = async (location?: { lat: number, lng: number }): Promise<string> => {
  const apiKey = process.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) return "Weather service is not configured (Missing API Key).";

  try {
    const lat = location?.lat || 12.9716; // Default to Bangalore
    const lon = location?.lng || 77.5946;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!res.ok) throw new Error("Weather API failed");
    const data = await res.json();

    return `
🌤 Weather in ${data.name}: ${data.weather[0].description}
🌡 Temp: ${data.main.temp}°C (Feels like ${data.main.feels_like}°C)
💧 Humidity: ${data.main.humidity}%
💨 Wind: ${data.wind.speed} m/s
`;
  } catch (e) {
    console.error("Weather Error:", e);
    return "Could not fetch real-time weather data.";
  }
};

// 🏥 Specialized Medical Handler
export const handleMedical = async (query: string): Promise<string | null> => {
  // 1. Check for symptoms/diseases in DB
  const diseaseInfo = await detectDisease(query);
  if (diseaseInfo) return diseaseInfo;

  // 2. Check for service bookings
  const bookingInfo = await handleServiceBooking(query);
  if (bookingInfo) return bookingInfo;

  return null; // Fallback to AI
};

// 🧠 Intent Detection (AI Function)
export const detectIntentAI = async (msg: string, imageBase64?: string): Promise<{ intent: string; response: string }> => {
  try {
    // Quick manual check for performance
    const m = msg.toLowerCase();
    
    // If there's an image, prioritize medical/clinical analysis unless it's clearly something else
    if (imageBase64 && (m.includes("what") || m.includes("analyze") || m.includes("report") || m.includes("scan") || m.includes("prescription") || msg.trim() === "")) {
      return { intent: "medical", response: "" };
    }

    if (m.includes("weather") || m.includes("rain") || m.includes("temperature")) return { intent: "weather", response: "" };
    if (m.includes("hospital") || m.includes("doctor") || m.includes("clinic") || m.includes("nearby")) return { intent: "location", response: "" };
    if (m.includes("pharmacy") || m.includes("medicine shop") || m.includes("chemist")) return { intent: "pharmacy", response: "" };
    if (m.includes("emergency") || m.includes("help me") || m.includes("sos") || m.includes("911") || m.includes("108")) return { intent: "emergency", response: "" };
    if (m.includes("food") || m.includes("diet") || m.includes("calorie") || m.includes("nutrition")) return { intent: "nutrition", response: "" };
    if (m.includes("pain") || m.includes("fever") || m.includes("symptom") || m.includes("disease")) return { intent: "medical", response: "" };
    if (m.includes("gov") || m.includes("government") || m.includes("national") || m.includes("policy") || m.includes("outbreak") || m.includes("surveillance")) return { intent: "gov", response: "" };

    const ai = getNextAIInstance();
    const prompt = `
Classify the user query into ONE word:
medical, nutrition, lifestyle, emergency, location, pharmacy, weather, gov, general

STRICT RULES:
1. If user asks about weather, return "weather".
2. If user asks for hospitals or doctors, return "location".
3. If user asks for pharmacy or medicine shops, return "pharmacy".
4. If user describes symptoms (fever, pain, etc.) or provides a medical scan/report, return "medical".
5. If user asks about food or diet, return "nutrition".
6. If user asks about government health policies, national statistics, outbreaks, or health IDs, return "gov".
7. Otherwise, return "general".

Query: "${msg}"
${imageBase64 ? "User has also uploaded an image (likely a medical scan or prescription)." : ""}

Return JSON ONLY:
{
  "intent": "one_word_category",
  "response": ""
}
`;

    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      const data = imageBase64.split(',')[1] || imageBase64;
      parts.push({ inlineData: { mimeType: "image/jpeg", data } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview", // Use lite for intent detection
      contents: [{ role: 'user', parts }],
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{"intent": "general", "response": ""}');
  } catch (error) {
    console.error("Intent Detection Error:", error);
    return { intent: "general", response: "" };
  }
};

// 🔁 Fetch Last Messages (Memory)
export const getChatHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("message, response")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;
    return (data || []).reverse();
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

// 🧠 Build Context for AI
export const buildContext = (history: any[], userMsg: string) => {
  let context = "Previous conversation:\n";
  history.forEach(h => {
    context += `User: ${h.message}\nBot: ${h.response}\n`;
  });
  context += `User: ${userMsg}`;
  return context;
};

// 🧠 Get User Profile (Long-Term Memory)
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_profile")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    return null;
  }
};

// 🍛 Nutrition Module
export const getFoodData = () => {
  return `
🥗 DAILY HEALTHY FOOD PLAN:

🍚 Breakfast:
- Idli + Sambar
- Oats + Milk + Fruits
- Eggs + Toast

🍛 Lunch:
- Rice + Dal + Vegetables
- Chicken / Paneer
- Curd

🍎 Snacks:
- Banana 🍌
- Nuts
- Juice

🍽 Dinner:
- Chapati + Veg curry
- Soup + Salad

💧 Drink 2-3L water daily
🚫 Avoid junk food
`;
};

// 📍 Location Module
export const getNearbyHospitals = (location?: { lat: number, lng: number }) => {
  if (!location) {
    return `
🏥 Nearby Hospitals:

1. Apollo Hospital
📍 2 km
📞 +91 9876543210

2. Fortis Hospital
📍 4 km
📞 +91 9123456780

🚨 Emergency: Call 108
`;
  }
  return null; // Let Gemini handle it with Maps tool
};

// 🏥 Pharmacy Module
export const getNearbyPharmacy = (location?: { lat: number, lng: number }) => {
  if (!location) return "Please enable location to find nearby pharmacies.";
  return null; // Let Gemini handle it with Maps tool
};

// 🚨 Emergency Module
export const handleEmergency = () => {
  return `
🚨 EMERGENCY ALERT

Call immediately:
📞 108 Ambulance
📞 102 Emergency

Do not delay.
`;
};

// 🧠 Save AI response to Knowledge Base for self-learning
export const saveToKnowledgeBase = async (question: string, answer: string, keywords: string = "") => {
  try {
    const cleanQuestion = question.trim().toLowerCase();
    // Avoid saving very short or generic questions
    if (cleanQuestion.length < 10) return;

    // Optional: Generate embedding if vector search is used
    let embedding = null;
    try {
      const ai = getNextAIInstance();
      const result = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: [cleanQuestion],
      });
      embedding = result.embeddings[0].values;
    } catch (e) {
      console.warn("Embedding generation failed, saving without embedding");
    }

    await supabase.from("knowledge_base").insert([
      {
        question: cleanQuestion,
        answer: answer,
        keywords: keywords || cleanQuestion,
        embedding: embedding
      }
    ]);
    console.log("🧠 Knowledge Base Updated (Self-Learning)");
  } catch (error) {
    console.error("Error saving to KB:", error);
  }
};

// 🔍 Fetch relevant context from Knowledge Base (RAG)
export const getContext = async (msg: string): Promise<string> => {
  try {
    // 1. Try Keyword Search (Fastest)
    const cleanMsg = msg.trim().toLowerCase();
    const words = cleanMsg.split(' ').filter(w => w.length > 3);
    
    if (words.length > 0) {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("answer")
        .ilike("question", `%${words[0]}%`)
        .limit(3);

      if (!error && data && data.length > 0) {
        return data.map(item => item.answer).join("\n\n");
      }
    }

    // 2. Try Vector Search (if embedding is possible)
    try {
      const ai = getNextAIInstance();
      const result = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: [cleanMsg],
      });
      const embedding = result.embeddings[0].values;
      
      if (embedding) {
        const { data: vectorData, error: vectorError } = await supabase.rpc('match_knowledge_base', {
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 3,
        });

        if (!vectorError && vectorData && vectorData.length > 0) {
          return vectorData.map((item: any) => item.answer).join("\n\n");
        }
      }
    } catch (e) {
      console.warn("Vector search failed or not configured");
    }

    return "";
  } catch (error) {
    console.error("Error fetching context:", error);
    return "";
  }
};

// 🏠 Local AI (Ollama) - Works if user has Ollama running locally
export const callLocalAI = async (query: string): Promise<string | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "llama3",
        prompt: `System: ${MEDICAL_SYSTEM_INSTRUCTION}\nUser: ${query}`,
        stream: false
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    return data.response;
  } catch (e) {
    console.warn("Local AI (Ollama) not available");
    return null;
  }
};

// 🏠 Local AI Streaming (Ollama)
export async function* callLocalAIStream(query: string) {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "llama3",
        prompt: `System: ${MEDICAL_SYSTEM_INSTRUCTION}\nUser: ${query}`,
        stream: true
      })
    });

    if (!response.ok) return;
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.response) yield json.response;
          if (json.done) return;
        } catch (e) {
          console.warn("Error parsing Ollama stream chunk", e);
        }
      }
    }
  } catch (e) {
    console.warn("Local AI Stream (Ollama) failed");
  }
}

// 🌐 Backup AI (OpenRouter)
export const callOpenRouter = async (query: string): Promise<string | null> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001", // Or another reliable model
        messages: [{ role: "user", content: query }]
      })
    });
    const result = await response.json();
    return result.choices[0]?.message?.content || null;
  } catch (e) {
    console.warn("OpenRouter backup failed");
    return null;
  }
};

// 🌐 Backup AI (Hugging Face)
export const callHuggingFace = async (query: string): Promise<string | null> => {
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfKey) return null;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      headers: { Authorization: `Bearer ${hfKey}` },
      method: "POST",
      body: JSON.stringify({ inputs: query }),
    });
    const result = await response.json();
    return result[0]?.generated_text || null;
  } catch (e) {
    console.warn("Hugging Face backup failed");
    return null;
  }
};

// 🧠 Rule-Based Local AI Fallback (Absolute Last Resort)
export const getLocalReply = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes("fever")) return "For fever, stay hydrated, rest, and monitor your temperature. If it exceeds 103°F (39.4°C) or lasts more than 3 days, consult a doctor.";
  if (m.includes("headache")) return "Headaches can be caused by stress, dehydration, or eye strain. Rest in a dark room and drink water. Seek immediate help if it's sudden and severe.";
  if (m.includes("cold") || m.includes("cough")) return "Common cold requires rest and plenty of fluids. Warm salt water gargles can help a sore throat. If breathing becomes difficult, seek medical attention.";
  if (m.includes("stomach") || m.includes("pain")) return "Abdominal pain has many causes. Avoid heavy meals. If the pain is sharp, localized, or accompanied by fever, please see a professional.";
  if (m.includes("emergency") || m.includes("help")) return "🚨 EMERGENCY: If you are experiencing severe symptoms like chest pain, difficulty breathing, or heavy bleeding, please call emergency services (911/108) immediately.";
  return "I'm currently analyzing your request using our local medical knowledge base. For a more detailed AI analysis, please ensure you have a stable connection. Always consult a doctor for clinical diagnosis.";
};

// 🏥 Symptom & Disease Detection Logic
export const detectDisease = async (message: string) => {
  try {
    const m = message.toLowerCase();
    const { data: symptoms } = await supabase.from("symptom_disease").select("*");
    if (!symptoms) return null;

    const match = symptoms.find(item => m.includes(item.symptom?.toLowerCase()));
    if (match) {
      const disease = match.disease;
      const { data: sev } = await supabase.from("severity").select("*").eq("symptom", match.symptom);
      if (sev?.[0]?.weight > 5) {
        return `⚠️ WARNING: Your symptoms (${match.symptom}) indicate a potentially serious condition. Please consult a doctor immediately.\n\nPossible Condition: ${disease}`;
      }
      const { data: desc } = await supabase.from("diseases").select("*").eq("disease", disease);
      const { data: prec } = await supabase.from("precautions").select("*").eq("disease", disease);

      let response = `🦠 Possible Condition: ${disease}\n\n`;
      if (desc?.[0]?.description) response += `📖 Description: ${desc[0].description}\n\n`;
      if (prec?.[0]) {
        response += `💊 Precautions:\n`;
        if (prec[0].precaution1) response += `- ${prec[0].precaution1}\n`;
        if (prec[0].precaution2) response += `- ${prec[0].precaution2}\n`;
        if (prec[0].precaution3) response += `- ${prec[0].precaution3}\n`;
      }
      return response;
    }
    return null;
  } catch (error) {
    console.error("Symptom Detection Error:", error);
    return null;
  }
};

// 📅 Handle Service Bookings
export const handleServiceBooking = async (message: string, userId?: string) => {
  const m = message.toLowerCase();
  if (m.includes("book") || m.includes("appointment") || m.includes("consult")) {
    if (!userId) return "Please sign in to book an appointment.";
    let service = "General Consultation";
    if (m.includes("doctor")) service = "Doctor Consultation";
    if (m.includes("lab") || m.includes("test")) service = "Lab Test";
    if (m.includes("pharmacy") || m.includes("medicine")) service = "Pharmacy Delivery";

    try {
      const { data: profile } = await supabase.from("users").select("username, email").eq("id", userId).single();
      await supabase.from("service_bookings").insert([{
        user_id: userId,
        service_title: service,
        service_type: "AI Requested",
        patient_name: profile?.username || "User",
        patient_email: profile?.email || "",
        details: `Requested via Chat: "${message}"`,
        status: "Pending"
      }]);
      return `✅ I've initiated a ${service} request for you. Our team will contact you shortly to confirm.`;
    } catch (error) {
      console.error("Booking Error:", error);
      return "I encountered an error while trying to book your appointment. Please try again later.";
    }
  }
  return null;
};

// 🏆 Main "Never Fail" AI Logic
export async function getAnswer(
  question: string, 
  history: any[] = [], 
  userId?: string, 
  location?: { lat: number; lng: number }, 
  imageBase64?: string,
  languageName: string = "English",
  isOnline: boolean = true,
  preferLocalAI: boolean = false
) {
  try {
    const cleanQuestion = question.trim();
    
    // 0️⃣ CHECK CACHE (Memory) - Standard optimization
    if (responseCache[cleanQuestion] && !imageBase64 && !location && history.length === 0) {
      console.log("⚡ From Local Cache");
      return responseCache[cleanQuestion];
    }

    // 1️⃣ INTENT DETECTION (Lightweight)
    const intentData = await detectIntentAI(cleanQuestion, imageBase64);
    const intent = intentData.intent;
    console.log(`🎯 Detected Intent: ${intent}`);

    // 2️⃣ MEMORY & CONTEXT BUILDING
    let memoryContext = "";
    let profileContext = "";
    
    // Only use memory if relevant (last 5 messages already fetched in getChatHistory)
    const useMemory = intent === "medical" || intent === "general";
    
    if (userId && useMemory) {
      const chatHistory = await getChatHistory(userId);
      memoryContext = buildContext(chatHistory, cleanQuestion);
      
      const profile = await getUserProfile(userId);
      if (profile) {
        profileContext = `User Profile: Diet: ${profile.diet || 'N/A'}, Goal: ${profile.health_goal || 'N/A'}, Allergies: ${profile.allergies || 'N/A'}`;
      }
    }

    // 3️⃣ RAG: FETCH CONTEXT
    const context = await getContext(cleanQuestion);
    
    // Fetch real-time weather if intent is weather
    let weatherContext = "";
    if (intent === "weather") {
      weatherContext = await getWeather(location);
    }

    const langContext = ` (Respond strictly in ${languageName} language)`;
    let fullPrompt = cleanQuestion + langContext;
    
    // Select System Instruction based on Intent
    let systemInstruction = MEDICAL_SYSTEM_INSTRUCTION;
    if (intent === "general") systemInstruction = GENERAL_SYSTEM_INSTRUCTION;
    if (intent === "emergency") systemInstruction = EMERGENCY_SYSTEM_INSTRUCTION;
    if (intent === "gov") systemInstruction = GOV_SYSTEM_INSTRUCTION;

    // If an image is present, always use Medical System Instruction for structured analysis
    // unless it's an emergency which has its own critical protocol
    if (imageBase64 && intent !== "emergency") {
      systemInstruction = MEDICAL_SYSTEM_INSTRUCTION;
    }

    if (memoryContext || context || profileContext || weatherContext) {
      fullPrompt = `
${profileContext ? `${profileContext}\n` : ""}
${memoryContext ? `Conversation History:\n${memoryContext}\n` : ""}
${context ? `Medical Context:\n${context}\n` : ""}
${weatherContext ? `Real-time Weather Data:\n${weatherContext}\n` : ""}

User Question: ${cleanQuestion}
${langContext}`;
    }

    // 4️⃣ GEMINI-FIRST SYSTEM (Primary Brain)
    if (checkGeminiStatus() && isOnline && navigator.onLine) {
      // Try up to 3 times with rotation
      for (let i = 0; i < 3; i++) {
        try {
          console.log(`🤖 Calling Gemini Pro (Attempt ${i + 1}/3)...`);
          const ai = getNextAIInstance();
          
          const tools: any[] = [];
          let toolConfig: any = undefined;
          
          // Use Google Maps for location-based intents, otherwise use Google Search
          if (location && (intent === "location" || intent === "pharmacy" || intent === "emergency")) {
            tools.push({ googleMaps: {} });
            toolConfig = { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } };
          } else {
            tools.push({ googleSearch: {} });
          }

          const currentParts: any[] = [{ text: fullPrompt }];
          if (imageBase64) {
            const data = imageBase64.split(',')[1] || imageBase64;
            currentParts.push({ inlineData: { mimeType: "image/jpeg", data } });
          }

          const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: [...history, { role: 'user', parts: currentParts }],
            config: { systemInstruction, tools, toolConfig, maxOutputTokens: 800 }
          });

          const answer = response.text || "No answer";
          return await handleSuccess(cleanQuestion, answer, userId, response, imageBase64, location, history);

        } catch (apiError: any) {
          console.warn(`Gemini Pro attempt ${i + 1} failed:`, apiError.message);
          const errorMessage = apiError.message?.toLowerCase() || "";
          if (errorMessage.includes('quota') || errorMessage.includes('429')) {
            rotateGeminiKey();
            if (i === 2) markGeminiDown();
          } else {
            break; // Stop if it's not a quota error
          }
        }
      }
    }

    // 5️⃣ MULTI-AI FALLBACK SYSTEM
    
    // Fallback 1: Gemini Lite
    try {
      console.log("🤖 Falling back to Gemini Lite...");
      const ai = getNextAIInstance();
      
      const currentParts: any[] = [{ text: fullPrompt }];
      if (imageBase64) {
        const data = imageBase64.split(',')[1] || imageBase64;
        currentParts.push({ inlineData: { mimeType: "image/jpeg", data } });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: [...history, { role: 'user', parts: currentParts }],
        config: { systemInstruction, maxOutputTokens: 800 }
      });
      return await handleSuccess(cleanQuestion, response.text || "", userId, response, imageBase64, location, history);
    } catch (e) {
      console.warn("Gemini Lite failed");
    }

    // Fallback 2: OpenRouter
    const orRes = await callOpenRouter(fullPrompt);
    if (orRes) return { text: orRes };

    // Fallback 3: Hugging Face
    const hfRes = await callHuggingFace(cleanQuestion);
    if (hfRes) return { text: hfRes };

    // Fallback 4: Local AI (Ollama)
    const localAIRes = await callLocalAI(cleanQuestion);
    if (localAIRes) return { text: localAIRes, isOffline: true };

    // Fallback 5: Manual Handlers (Supabase)
    if (intent === "medical" || intent === "emergency" || intent === "location" || intent === "pharmacy") {
      const medRes = await handleMedical(cleanQuestion);
      if (medRes) return { text: medRes };
    }
    if (intent === "nutrition") {
      return { text: getFoodData() };
    }

    // Fallback 6: RAG / Rule-based
    return { text: getLocalReply(cleanQuestion), isFromCache: true };

  } catch (error) {
    console.error("Final Fallback Error:", error);
    return { text: getLocalReply(question), isFromCache: true, isError: true };
  }
}

async function handleSuccess(cleanQuestion: string, answer: string, userId: string | undefined, response: any, imageBase64: string | undefined, location: any, history: any[]) {
  // SELF-LEARNING: SAVE TO KB
  if (!imageBase64 && !location && history.length === 0 && answer.length > 20) {
    saveToKnowledgeBase(cleanQuestion, answer);
  }

  // SAVE TO CHAT HISTORY
  if (userId) {
    await supabase.from("chats").insert({
      user_id: userId,
      message: cleanQuestion,
      response: answer,
      grounding_urls: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
        title: c.web?.title || c.maps?.title || "Reference",
        uri: c.web?.uri || c.maps?.uri || "#"
      })) || []
    });
  }

  const result = { 
    text: answer, 
    isFromCache: false,
    groundingUrls: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .map((c: any) => ({
        title: c.web?.title || c.maps?.title || "Reference",
        uri: c.web?.uri || c.maps?.uri || "#"
      }))
  };

  if (!imageBase64 && !location && history.length === 0) responseCache[cleanQuestion] = result;
  return result;
}

export async function* getAnswerStream(
  question: string, 
  history: any[] = [], 
  location?: { lat: number; lng: number }, 
  imageBase64?: string,
  languageName: string = "English",
  preferLocalAI: boolean = false,
  userId?: string
) {
  try {
    const cleanQuestion = question.trim();

    // 1️⃣ INTENT DETECTION (Lightweight)
    const intentData = await detectIntentAI(cleanQuestion, imageBase64);
    const intent = intentData.intent;
    console.log(`🎯 Detected Intent (Stream): ${intent}`);

    // 2️⃣ MEMORY & CONTEXT BUILDING
    let memoryContext = "";
    let profileContext = "";
    
    // Only use memory if relevant
    const useMemory = intent === "medical" || intent === "general";
    
    if (userId && useMemory) {
      const chatHistory = await getChatHistory(userId);
      memoryContext = buildContext(chatHistory, cleanQuestion);
      
      const profile = await getUserProfile(userId);
      if (profile) {
        profileContext = `User Profile: Diet: ${profile.diet || 'N/A'}, Goal: ${profile.health_goal || 'N/A'}, Allergies: ${profile.allergies || 'N/A'}`;
      }
    }

    // 3️⃣ RAG for streaming
    const context = await getContext(cleanQuestion);
    
    // Fetch real-time weather if intent is weather
    let weatherContext = "";
    if (intent === "weather") {
      weatherContext = await getWeather(location);
    }

    const langContext = ` (Respond strictly in ${languageName} language)`;
    let fullPrompt = cleanQuestion + langContext;
    
    // Select System Instruction based on Intent
    let systemInstruction = MEDICAL_SYSTEM_INSTRUCTION;
    if (intent === "general") systemInstruction = GENERAL_SYSTEM_INSTRUCTION;
    if (intent === "emergency") systemInstruction = EMERGENCY_SYSTEM_INSTRUCTION;
    if (intent === "gov") systemInstruction = GOV_SYSTEM_INSTRUCTION;

    // If an image is present, always use Medical System Instruction for structured analysis
    // unless it's an emergency which has its own critical protocol
    if (imageBase64 && intent !== "emergency") {
      systemInstruction = MEDICAL_SYSTEM_INSTRUCTION;
    }

    if (memoryContext || context || profileContext || weatherContext) {
      fullPrompt = `
${profileContext ? `${profileContext}\n` : ""}
${memoryContext ? `Conversation History:\n${memoryContext}\n` : ""}
${context ? `Medical Context:\n${context}\n` : ""}
${weatherContext ? `Real-time Weather Data:\n${weatherContext}\n` : ""}

User Question: ${cleanQuestion}
${langContext}`;
    }

    const tools: any[] = [];
    let toolConfig: any = undefined;
    if (location) {
      tools.push({ googleMaps: {} });
      toolConfig = { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } };
    } else {
      tools.push({ googleSearch: {} });
    }

    const currentParts: any[] = [{ text: fullPrompt }];
    if (imageBase64) {
      const data = imageBase64.split(',')[1] || imageBase64;
      currentParts.push({ inlineData: { mimeType: "image/jpeg", data } });
    }

    // 4️⃣ GEMINI-FIRST SYSTEM (Streaming)
    if (checkGeminiStatus() && navigator.onLine) {
      for (let i = 0; i < 3; i++) {
        try {
          console.log(`🤖 Calling Gemini Pro Stream (Attempt ${i + 1}/3)...`);
          const ai = getNextAIInstance();
          
          const tools: any[] = [];
          let toolConfig: any = undefined;
          
          // Use Google Maps for location-based intents, otherwise use Google Search
          if (location && (intent === "location" || intent === "pharmacy" || intent === "emergency")) {
            tools.push({ googleMaps: {} });
            toolConfig = { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } };
          } else {
            tools.push({ googleSearch: {} });
          }

          const responseStream = await ai.models.generateContentStream({
            model: "gemini-3.1-pro-preview",
            contents: [...history, { role: 'user', parts: currentParts }],
            config: { systemInstruction, tools, toolConfig, maxOutputTokens: 800 }
          });

          let fullAnswer = "";
          let groundingUrls: any[] = [];
          
          for await (const chunk of responseStream) {
            const text = chunk.text;
            fullAnswer += text;
            
            // Extract grounding metadata if available in the chunk
            const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
              groundingUrls = chunks.map((c: any) => ({
                title: c.web?.title || c.maps?.title || "Reference",
                uri: c.web?.uri || c.maps?.uri || "#"
              }));
            }
            
            yield { text, groundingUrls: groundingUrls.length > 0 ? groundingUrls : undefined };
          }

          if (!imageBase64 && !location && history.length === 0 && fullAnswer.length > 20) {
            saveToKnowledgeBase(cleanQuestion, fullAnswer);
          }
          return;
        } catch (e: any) {
          console.warn(`Gemini Pro Stream attempt ${i + 1} failed:`, e.message);
          const errorMessage = e.message?.toLowerCase() || "";
          if ((errorMessage.includes('quota') || errorMessage.includes('429')) && i < 2) {
            rotateGeminiKey();
            if (i === 2) markGeminiDown();
          } else {
            break;
          }
        }
      }
    }

    // 5️⃣ MULTI-AI FALLBACK SYSTEM (Streaming/Non-streaming)
    
    // Fallback 1: Gemini Lite
    try {
      const ai = getNextAIInstance();
      
      const currentParts: any[] = [{ text: fullPrompt }];
      if (imageBase64) {
        const data = imageBase64.split(',')[1] || imageBase64;
        currentParts.push({ inlineData: { mimeType: "image/jpeg", data } });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: [...history, { role: 'user', parts: currentParts }],
        config: { systemInstruction, maxOutputTokens: 500 }
      });
      yield { text: response.text || "" };
      return;
    } catch (e) {
      console.warn("Gemini Lite fallback failed");
    }

    // Fallback 2: Local AI (Ollama)
    let localAnswer = "";
    for await (const chunk of callLocalAIStream(question)) {
      localAnswer += chunk;
      yield { text: chunk };
    }

    if (!localAnswer) {
      // Fallback 5: Manual Handlers (Supabase)
      if (intent === "medical" || intent === "emergency" || intent === "location" || intent === "pharmacy") {
        const medRes = await handleMedical(cleanQuestion);
        if (medRes) {
          yield { text: medRes };
          return;
        }
      }
      if (intent === "nutrition") {
        yield { text: getFoodData() };
        return;
      }

      // Fallback 6: RAG / Rule-based
      yield { text: getLocalReply(question) };
    }
  } catch (error) {
    console.error("Streaming Error:", error);
    yield { text: getLocalReply(question) };
  }
}
