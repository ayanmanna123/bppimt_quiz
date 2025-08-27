import axios from "axios";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateQuizQuestions = async (topic, count) => {
  try {
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: `Generate ${count} multiple choice questions about ${topic}.
                       Format response as valid JSON only (no markdown).
                       Each question should have: "question", "options", "answer".`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
      }
    );

    let text = res.data.candidates[0].content.parts[0].text;

    // ✅ Clean Markdown (if any sneaks in)
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini API Error:", err);
    return [];
  }
};
