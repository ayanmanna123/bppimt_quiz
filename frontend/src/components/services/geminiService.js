import axios from "axios";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateQuizQuestions = async (topic, count, context = "") => {
  try {
    let promptText = `Generate ${count} multiple choice questions about "${topic}".`;

    if (context && context.trim() !== "") {
      promptText = `Generate ${count} multiple choice questions based STRICTLY on the following text:
      
      "${context}"
      
      The questions should be about "${topic}" (or general understanding if topic is generic).`;
    }

    promptText += `
      Format response as pure JSON only.
      Each question must have: "question", "options" (array of 4), "answer". 
      Do not include explanations or markdown.`;

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: promptText,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
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
    console.error("Gemini API Error:", JSON.stringify(err.response?.data || err.message, null, 2));
    return [];
  }
};

export const explainAnswer = async (question, userAnswer, correctAnswer) => {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Explain why the correct answer to the following question is "${correctAnswer}" and why the user's answer "${userAnswer}" is incorrect.
                       Question: "${question}"
                       Keep the explanation concise and helpful for a student.`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("Gemini API Error:", JSON.stringify(err.response?.data || err.message, null, 2));
    return "Failed to get explanation.";
  }
};

