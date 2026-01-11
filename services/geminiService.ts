
import { GoogleGenAI } from "@google/genai";

// Fixed: Instantiating GoogleGenAI inside functions using process.env.API_KEY directly.
export const generateVisionBoardImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A highly aesthetic, Pinterest-style mood board image representing: ${prompt}. High quality, cohesive colors, soft lighting.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Fixed: Iterate through all parts to find the image part.
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating vision board image:", error);
    return null;
  }
};

export const getPlannerSuggestions = async (currentContext: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${currentContext}. Provide 3 short, inspiring productivity tips and a suggested self-care activity for today. Format as JSON.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    // Fixed: Accessing .text as a property.
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error getting planner suggestions:", error);
    return null;
  }
};
