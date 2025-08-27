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
                       Format response as pure JSON only.
                       Each question must have: "question", "options" (array of 4), "answer". 
                       Do not include explanations or markdown.`,
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

    // ✅ Clean unwanted markdown or text
    text = text.replace(/```json|```/g, "").trim();

    // ✅ Try parsing safely
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse failed, raw response:", text);
      return [];
    }

    return parsed;
  } catch (err) {
    console.error("Gemini API Error:", err.response?.data || err.message);
    return [];
  }
};

