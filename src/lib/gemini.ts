
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeFace(imageBase64: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze this person's face across multiple dimensions. Provide a structured, professional, and constructive analysis. 
            Avoid harsh or insulting language. Focus on facial symmetry, skin quality, jawline, eyes, nose, lips, and grooming.
            Provide scores from 1-10. Also provide a "potential score" they could reach with optimized grooming, lifestyle, and skincare.
            
            EXTREMELY IMPORTANT: Identify 5-8 key "landmarks" or specific areas of interest on the face.
            For each landmark, provide:
            1. Label (e.g., "Left Eye", "Jaw Angle", "T-Zone")
            2. x and y coordinates (0-100 normalized percentage of the image)
            3. type ("point" for specifics or "box" for regions)
            4. width/height if it is a box
            5. a technical "value" or status (e.g., "98% Symmetry", "Clear", "High Definition")
            
            Return the result in JSON format.`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["scores", "potential", "breakdown", "landmarks", "recommendations", "summary"],
        properties: {
          scores: {
            type: Type.OBJECT,
            required: ["overall", "structure", "skin", "grooming", "harmony"],
            properties: {
              overall: { type: Type.NUMBER },
              structure: { type: Type.NUMBER },
              skin: { type: Type.NUMBER },
              grooming: { type: Type.NUMBER },
              harmony: { type: Type.NUMBER }
            }
          },
          potential: {
            type: Type.OBJECT,
            required: ["score", "explanation"],
            properties: {
              score: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            }
          },
          breakdown: {
            type: Type.OBJECT,
            required: ["symmetry", "skin", "jawline", "eyes", "nose", "lips", "hair"],
            properties: {
              symmetry: { type: Type.STRING },
              skin: { type: Type.STRING },
              jawline: { type: Type.STRING },
              eyes: { type: Type.STRING },
              nose: { type: Type.STRING },
              lips: { type: Type.STRING },
              hair: { type: Type.STRING }
            }
          },
          landmarks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["label", "x", "y", "type"],
              properties: {
                label: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ["point", "box"] },
                value: { type: Type.STRING },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER }
              }
            }
          },
          recommendations: {
            type: Type.OBJECT,
            required: ["skincare", "grooming", "lifestyle", "advanced"],
            properties: {
              skincare: { type: Type.ARRAY, items: { type: Type.STRING } },
              grooming: { type: Type.ARRAY, items: { type: Type.STRING } },
              lifestyle: { type: Type.ARRAY, items: { type: Type.STRING } },
              advanced: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          summary: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as AnalysisResult;
}

export async function chatWithAshu(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: "You are Ashu AI, a specialized consultant for skin, hair, and overall grooming. You are part of the FaceFlow AI app. Be helpful, professional, and knowledgeable. Base your advice on dermatological best practices but include a disclaimer that you are an AI and not a doctor. Use a supportive and clean tone."
    }
  });

  return result.text || "I'm sorry, I couldn't process that.";
}
