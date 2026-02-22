import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ScentProfile {
  recommendation: string;
  suggestedNotes: string[];
  explanation: string;
}

export async function getScentRecommendation(preferences: string): Promise<ScentProfile> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user is looking for a perfume. Their preferences are: "${preferences}". 
    Suggest a scent profile, key notes they should look for, and a brief explanation of why this fits them.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendation: { type: Type.STRING },
          suggestedNotes: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          explanation: { type: Type.STRING }
        },
        required: ["recommendation", "suggestedNotes", "explanation"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
