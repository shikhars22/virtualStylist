import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeItem = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this clothing item and suggest 3 complete, distinct outfit options (Casual, Business, Night Out). 
            For each outfit, provide a detailed description of the pieces. 
            For each piece in the outfit, provide its name and a direct Google Shopping search URL to buy similar items online.
            Also provide a detailed prompt for generating a professional flat-lay image of the entire outfit including this item.
            Return the result in JSON format.`,
          },
        ],
      },
    ],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          itemName: { type: Type.STRING },
          colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
          style: { type: Type.STRING },
          outfits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["Casual", "Business", "Night Out"] },
                description: { type: Type.STRING },
                pieces: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      searchUrl: { type: Type.STRING, description: "A Google Shopping search URL for this piece." }
                    },
                    required: ["name", "searchUrl"]
                  } 
                },
                imagePrompt: { type: Type.STRING, description: "A detailed prompt for generating a flat-lay image of this outfit." },
              },
              required: ["type", "description", "pieces", "imagePrompt"],
            },
          },
        },
        required: ["itemName", "colorPalette", "style", "outfits"],
      },
    },
  });

  return JSON.parse(response.text);
};

export const generateOutfitImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A professional, high-end fashion flat-lay image of an outfit. ${prompt}. Clean background, studio lighting, aesthetic arrangement.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
};
