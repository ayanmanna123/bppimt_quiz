import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MemoryVectorStore } from "../utils/MemoryVectorStore.js";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

let store = null;

// ES module-friendly __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initSupportBot = async () => {
    try {
        console.log("Initializing SupportBot with local knowledge base...");
        // Resolve absolute path to chatbot_kb.json
        const kbPath = path.join(__dirname, "../data/chatbot_kb.json");

        // Check if file exists
        if (!fs.existsSync(kbPath)) {
            console.error(`❌ chatbot_kb.json file not found at ${kbPath}`);
            return;
        }

        const data = JSON.parse(fs.readFileSync(kbPath, "utf-8"));

        const embeddings = new HuggingFaceTransformersEmbeddings({
            modelName: "Xenova/all-MiniLM-L6-v2",
        });

        store = await MemoryVectorStore.fromTexts(
            data.map((d) => d.question),
            data.map((d) => ({ answer: d.answer })),
            embeddings,
        );

        console.log("✅ SupportBot knowledge base initialized locally!");
    } catch (error) {
        console.error("❌ Failed to initialize SupportBot:", error);
        // We don't throw here to avoid crashing the server on startup, 
        // but the chat endpoint will try to re-init or fail gracefully.
    }
};

export const handleChat = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
    }

    try {
        // Lazy init if store is not ready
        if (!store) {
            console.log("⚙️ Store not ready, attempting to reinitialize SupportBot...");
            await initSupportBot();
            if (!store) {
                return res.status(503).json({
                    success: true,
                    response: "I'm still waking up. Please try again in a moment!"
                });
            }
        }

        console.log("ChatBot request received:", message);

        // Perform similarity search
        // We ask for top 1 result
        const result = await store.similaritySearch(message, 1);

        // You might want to check the score if possible to avoid bad matches, 
        // but MemoryVectorStore.similaritySearch doesn't always return score easily 
        // without similaritySearchWithScore. 
        // For now, we take the best match.

        let responseText = "I'm not sure about that. Try asking about specific topics related to the portal.";

        if (result && result.length > 0) {
            responseText = result[0].metadata.answer;
        }

        return res.status(200).json({ success: true, response: responseText });

    } catch (error) {
        console.error("ChatBot Detailed Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
// Trigger restart
