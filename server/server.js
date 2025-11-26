// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

console.log("Starting AI server...");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// יצירת לקוח OpenAI מהמפתח שב-.env
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// בדיקה שהשרת חי
app.get("/", (req, res) => {
  res.send("Trip AI server is running");
});

// הנקודה שה-React קורא אליה
app.post("/api/trip-plan", async (req, res) => {
  try {
    const { tripRequest } = req.body;

    if (!tripRequest) {
      return res.status(400).json({ error: "tripRequest is required" });
    }

    const lang = tripRequest.language === "he" ? "Hebrew" : "English";
const prompt = `
You are a professional travel planner for Israeli travelers.

User trip data (JSON):
${JSON.stringify(tripRequest, null, 2)}

Guidelines:
- "budgetLevel" plus "budgetAmount" (if not null) should guide how expensive hotels/activities can be.
- If "preferredDestination" is not null:
  * First consider planning the trip in that destination.
  * If it clearly does not fit the budget, season, or typical travel constraints,
    explain briefly why and suggest 1–3 alternative destinations that are as similar
    as possible in vibe (for example: instead of Zanzibar you might suggest Greek islands, etc.).
- If "travelersType" is "couple" and "style" includes "honeymoon":
  * Choose romantic destinations, etc...
- If "travelersType" is "couple" and "style" includes "babymoon":
  * This is a pregnancy trip. Prefer pregnancy-friendly destinations...
- Always adapt to the month/season and departure airport when choosing destinations.

Answer in ${lang}.

Your response must include:
1. Recommended destination(s) and why they fit this couple/travel style (mention specifically if it is honeymoon or babymoon).
2. Day-by-day itinerary for all ${tripRequest.nights} nights.
3. Budget notes (what level of prices to expect, using budgetAmount if available).
4. Tips relevant to Israeli travelers (Shabbat, kosher options, medical considerations for pregnancy if babymoon, etc when relevant).
`.trim();

    console.log("Calling OpenAI for trip plan...");

    // שימוש במודל chat יציב
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // דגם טקסט זול ומהיר
      messages: [
        { role: "system", content: "You are an expert travel planner." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const text = completion.choices?.[0]?.message?.content || "";

    if (!text) {
      console.error("Empty response from OpenAI:", completion);
      return res.status(500).json({
        error: "Empty response from OpenAI",
      });
    }

    res.json({ planText: text });
  } catch (err) {
  console.error("AI error:", err?.response?.data || err);
    res.status(500).json({
      error: "Failed to generate plan from AI",
    details: err?.response?.data || err.message,
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`AI server listening on http://localhost:${PORT}`);
});
