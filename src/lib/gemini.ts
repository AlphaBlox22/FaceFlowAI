
import { AnalysisResult } from "../types";

export async function analyzeFace(imageBase64: string): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to analyze image");
  }

  return response.json();
}

export async function chatWithAshu(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to process chat");
  }

  const data = await response.json();
  return data.text || "I'm sorry, I couldn't process that.";
}
