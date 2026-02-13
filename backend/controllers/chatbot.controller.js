import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const kbPath = path.join(__dirname, "../data/chatbot_kb.json");

export const handleChat = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
    }

    try {
        console.log("ChatBot request received:", message);

        // 1. Check Knowledge Base
        if (!fs.existsSync(kbPath)) {
            console.error("Knowledge base file not found at:", kbPath);
            return res.status(200).json({ success: true, response: "I'm having trouble accessing my knowledge base. Please try again later!" });
        }

        const kbData = JSON.parse(fs.readFileSync(kbPath, "utf-8"));
        const lowerMessage = message.toLowerCase();

        const directMatch = kbData.find(item =>
            lowerMessage.includes(item.question.toLowerCase()) ||
            item.question.toLowerCase().includes(lowerMessage)
        );

        if (directMatch) {
            console.log("Direct match found in KB");
            return res.status(200).json({ success: true, response: directMatch.answer });
        }

        // 2. If no direct match, call Hugging Face
        console.log("No direct match, calling Hugging Face...");
        const hfApiKey = process.env.HUGGINGFACE_API_KEY;

        if (!hfApiKey) {
            console.log("No Hugging Face API key, returning default response");
            return res.status(200).json({
                success: true,
                response: "I'm not sure about that. Try asking about 'how to create a subject' or 'how to create a quiz'!"
            });
        }

        try {
            const hfResponse = await axios.post(
                "https://api-inference.huggingface.co/models/openai-community/gpt2",
                { inputs: message },
                {
                    headers: {
                        Authorization: `Bearer ${hfApiKey}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 5000 // 5 seconds timeout
                }
            );

            const botResponse = hfResponse.data[0]?.generated_text || hfResponse.data.generated_text || (typeof hfResponse.data === 'string' ? hfResponse.data : "I'm having trouble thinking right now.");
            console.log("Hugging Face response received:", botResponse);
            return res.status(200).json({ success: true, response: botResponse });
        } catch (hfError) {
            console.error("Hugging Face API Error:", hfError.message);
            // Fallback message if AI fails
            return res.status(200).json({
                success: true,
                response: "I'm feeling a bit overwhelmed right now. Ask me about how to create a subject or quiz, or try again in a moment!"
            });
        }
    } catch (error) {
        console.error("ChatBot Detailed Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
