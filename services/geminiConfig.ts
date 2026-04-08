import { GoogleGenAI } from "@google/genai";

export const GEMINI_KEYS = [
  "AIzaSyDW78llOEcGFDkTUut4BC59-UdZyYtrm-E",
  "AIzaSyDklRIU0l0Nc-o7iarhtEIyujNU_Ta9eVY",
  "AIzaSyBrP6wlnv-Q6zqg71zDfAqjLI068UqAvsY",
  "AIzaSyCgpwSHFEMLbsFxqKP505y7mxCvE373q3s"
  
];

let currentKeyIndex = 0;

export const getGeminiKey = () => {
  return GEMINI_KEYS[currentKeyIndex];
};

export const rotateGeminiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
  console.log(`Rotated to Gemini API Key index: ${currentKeyIndex}`);
  return GEMINI_KEYS[currentKeyIndex];
};

export const createGeminiClient = () => {
  return new GoogleGenAI({ apiKey: getGeminiKey() });
};
