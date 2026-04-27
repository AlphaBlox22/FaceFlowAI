import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const prompt = `Analyze this person's face across multiple dimensions. Provide a structured, professional, and constructive analysis. 
      Avoid harsh or insulting language. Focus on facial symmetry, skin quality, jawline, eyes, nose, lips, and grooming.
      Provide scores from 1-10. Also provide a "potential score" they could reach with optimized grooming, lifestyle, and skincare.
      
      EXTREMELY IMPORTANT: Identify 5-8 key "landmarks" or specific areas of interest on the face.
      For each landmark, provide:
      1. Label (e.g., "Left Eye", "Jaw Angle", "T-Zone")
      2. x and y coordinates (0-100 normalized percentage of the image)
      3. type ("point" for specifics or "box" for regions)
      4. width/height if it is a box
      5. a technical "value" or status (e.g., "98% Symmetry", "Clear", "High Definition")
      
      Return the result in JSON format.`;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
          }
        }
      ]);

      const text = result.response.text();
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "You are Ashu AI, a specialized consultant for skin, hair, and overall grooming. You are part of the FaceFlow AI app. Be helpful, professional, and knowledgeable. Base your advice on dermatological best practices but include a disclaimer that you are an AI and not a doctor. Use a supportive and clean tone."
      });

      const chat = model.startChat({
        history: history.slice(0, -1),
      });

      const result = await chat.sendMessage(message);
      res.json({ text: result.response.text() });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
