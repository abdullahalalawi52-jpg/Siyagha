import { GoogleGenAI } from "@google/genai";
import { SAFETY_SETTINGS } from "../config";

export const safeGenerate = async (ai: GoogleGenAI, params: {
  model: string;
  contents: any;
  config?: Record<string, any>;
}) => {
  const fallbackChain = [params.model, "gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-lite-latest"];
  const modelsToTry = Array.from(new Set(fallbackChain.filter(Boolean)));

  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: params.contents,
        config: { 
          safetySettings: SAFETY_SETTINGS, 
          ...(params.config || {}) 
        },
      });
      return response;
    } catch (error: any) {
      lastError = error;
      console.warn(`[Gemini Model Fallback] Model ${currentModel} encountered error: ${error.message || error}. Retrying fallback...`);
    }
  }

  throw lastError || new Error("Failed to generate content across all Gemini models");
};
