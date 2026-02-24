import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "", { apiVersion: "v1" });

export const enhanceText = async (req, res) => {
    try {
        const { text, type } = req.body;
        console.log("AI Enhancement Request:", { type, textLength: text?.length });

        if (!text) {
            return res.status(400).json({ success: false, message: "Text is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ GEMINI_API_KEY missing in .env");
            return res.status(500).json({
                success: false,
                message: "Gemini API key is not configured in the backend."
            });
        }

        console.log("Using Gemini API Key:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");

        let prompt = "";
        if (type === "grammar") {
            prompt = `Correct the grammar and spelling of the following text, making it sound natural and professional. Only return the corrected text, nothing else:\n\n"${text}"`;
        } else if (type === "vocab") {
            prompt = `Improve the vocabulary and phrasing of the following text to make it more sophisticated and engaging. Only return the improved text, nothing else:\n\n"${text}"`;
        } else if (type === "translate") {
            prompt = `Translate the following text into clear, natural English. Only return the translated text, nothing else:\n\n"${text}"`;
        } else {
            prompt = `Improve the following text. Only return the improved text, nothing else:\n\n"${text}"`;
        }

        // Robust model selection: try multiple models during the actual generation call
        // Some models might be 404/unavailable for specific keys/regions
        const possibleModels = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro", "gemini-1.0-pro"];
        let resultText = "";
        let success = false;

        for (const modelId of possibleModels) {
            try {
                console.log(`Attempting generation with model: ${modelId}`);
                const model = genAI.getGenerativeModel({ model: modelId });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                resultText = response.text().trim();
                success = true;
                console.log(`✅ Success with model: ${modelId}`);
                break;
            } catch (e) {
                console.warn(`⚠️ Model ${modelId} failed:`, e.message);
                continue;
            }
        }

        if (!success) {
            throw new Error("All available AI models failed to process the request.");
        }

        return res.status(200).json({
            success: true,
            enhancedText: resultText
        });

    } catch (error) {
        console.error("AI Enhancement Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to enhance text using AI",
            error: error.message
        });
    }
};
