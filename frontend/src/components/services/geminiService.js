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


export const generateWeaknessAttackQuiz = async (results) => {
  try {
    // 1. Analyze weak areas
    const weakAreas = results.reduce((acc, result) => {
      const subject = result.quiz?.subject?.subjectName || "General";
      const percentage = (result.score / (result.quiz.marks * result.quiz.totalQuestions)) * 100;

      if (percentage < 60) {
        if (!acc[subject]) acc[subject] = 0;
        acc[subject]++;
      }
      return acc;
    }, {});

    const sortedWeaknesses = Object.entries(weakAreas)
      .sort(([, a], [, b]) => b - a)
      .map(([subject]) => subject);

    if (sortedWeaknesses.length === 0) {
      return {
        questions: [],
        message: "You're doing great! No specific weak areas detected."
      };
    }

    const focusTopic = sortedWeaknesses[0]; // Target the biggest weakness

    // 2. Generate detailed quiz for the weak topic
    const text = await generateContent(`
      Generate 5 hard-level multiple choice questions about "${focusTopic}".
      Focus on complex concepts where students usually make mistakes.
      Format response as pure JSON only.
      Each question must have: "question", "options" (array of 4), "answer".
      Do not include explanations or markdown.
    `);

    // ✅ Clean & Parse
    const cleanText = text.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleanText);

    return {
      questions,
      focusTopic,
      message: `We noticed you've been struggling with ${focusTopic}. Here's a weakness attack quiz to help you improve!`
    };

  } catch (err) {
    console.error("Weakness Attack Error:", err);
    return { questions: [], message: "Failed to generate weakness quiz." };
  }
};

// Helper for raw generation to reuse logic
const generateContent = async (prompt) => {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data.candidates[0].content.parts[0].text;
};
