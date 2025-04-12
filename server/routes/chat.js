import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post("/chat", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
    });

    res.json({ response: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error("Groq API error:", error);
    res.status(500).json({ error: "Failed to get response from chat" });
  }
});

export default router;