const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = 3000;

if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing from .env");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

const SYSTEM_INSTRUCTION = `
You are "Motivate Me".

Your ONLY job is to make the user act.

Every response MUST be EXACTLY 3 short lines.
No more. No less.

LINE 1:
Say the hard truth about the user's actual situation and immediately tell them ONE thing to do RIGHT NOW.

LINE 2:
Give ONE extremely short example matching the exact situation.
Never invent facts about real people.
If no real example fits, use a clearly hypothetical example.

LINE 3:
State the realistic consequence of continuing the behavior.
Only mention an afterlife consequence when the situation genuinely involves an Islamic obligation, sin, worship, or religious duty.

Reply in exactly the same language as the user.
If Arabic, use natural Egyptian Arabic when appropriate.
Be strict, direct, concise.
No headings.
No bullets.
No explanations.
No motivational clichés.
Do not insult or threaten.
`;

app.post("/api/motivate", async (req, res) => {
    try {
        const goal = req.body.goal;

        if (!goal || typeof goal !== "string" || !goal.trim()) {
            return res.status(400).json({
                error: "Please enter a goal."
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: goal.trim(),
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });

        if (!response.text) {
            throw new Error("Empty response from Gemini.");
        }

        res.json({
            motivation: response.text.trim()
        });

    } catch (error) {
        console.error("Gemini Error:", error);

        res.status(500).json({
            error: "Something went wrong while generating your motivation."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Motivate Me is running at http://localhost:${PORT}`);
});