const API_KEYS = [
  import.meta.env.GEMINI_API_KEY,
  import.meta.env.GEMINI_API_KEY_2,
  import.meta.env.GEMINI_API_KEY_3
];

let currentKeyIndex = 0;

const getApiKey = () => API_KEYS[currentKeyIndex];

const switchKey = () => {
  if (currentKeyIndex < API_KEYS.length - 1) {
    currentKeyIndex++;
    console.log("🔁 Switching Gemini API key");
    return true;
  }
  return false;
};

export const callGemini = async (prompt: string) => {
  while (true) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${getApiKey()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();
      return data;

    } catch (err) {
      console.log("❌ Key failed:", currentKeyIndex);

      const switched = switchKey();
      if (!switched) {
        throw new Error("All Gemini keys failed 🚨");
      }
    }
  }
};