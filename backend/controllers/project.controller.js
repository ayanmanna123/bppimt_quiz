import Project from "../models/Project.model.js";
import User from "../models/User.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "", { apiVersion: "v1" });

const possibleModels = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro", "gemini-1.0-pro"];

// 1. Upload Project
export const uploadProject = async (req, res) => {
    try {
        const { title, description, category, hardware, software, fullGuide, attachments, isAiGenerated, originalRequirements } = req.body;
        const auth0Id = req.auth?.payload?.sub;

        // Find internal user ID from Auth0 ID
        const user = await User.findOne({ auth0Id });
        if (!user && auth0Id) {
            return res.status(404).json({ success: false, message: "User not found in database" });
        }

        // Validate category or fallback to "Other"
        const validCategories = ["Hardware", "Software", "IoT", "Robotics", "Web", "AI/ML", "Other"];
        const sanitizedCategory = validCategories.includes(category) ? category : "Other";

        const project = new Project({
            title,
            description,
            category: sanitizedCategory,
            hardware,
            software,
            fullGuide,
            attachments,
            isAiGenerated: isAiGenerated || false,
            originalRequirements,
            createdBy: user?._id || null,
        });

        await project.save();
        res.status(201).json({ success: true, project });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Discover Project Ideas (Search DB + AI)
export const discoverIdeas = async (req, res) => {
    try {
        const { requirements } = req.body;
        if (!requirements) {
            return res.status(400).json({ success: false, message: "Requirements are required" });
        }

        // Sanitize requirements for regex to avoid crashes on special characters
        const sanitizedReqs = requirements.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Search existing projects (basic fuzzy search or description match)
        const existingProjects = await Project.find({
            $or: [
                { description: { $regex: sanitizedReqs, $options: "i" } },
                { title: { $regex: sanitizedReqs, $options: "i" } }
            ]
        }).limit(3);

        // Generate new ideas with Gemini
        const prompt = `
            User Requirements: "${requirements}"
            Based on these requirements, suggest 3-5 unique project ideas.
            Format the response as a JSON array of objects with keys: "title", "description", "category", "hardware" (array), "software" (array).
            
            IMPORTANT: The "category" MUST be exactly one of the following values:
            ["Hardware", "Software", "IoT", "Robotics", "Web", "AI/ML", "Other"]
            
            Only return the JSON array.
        `;

        let aiIdeas = [];
        let success = false;
        let lastError = null;

        for (const modelId of possibleModels) {
            try {
                console.log(`Attempting discovery with model: ${modelId}`);
                const model = genAI.getGenerativeModel({ model: modelId });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text().trim();

                // Remove markdown code blocks if present
                const jsonStr = text.startsWith("```json") ? text.substring(7, text.length - 3) : text;
                aiIdeas = JSON.parse(jsonStr);
                success = true;
                console.log(`✅ Success with model: ${modelId}`);
                break;
            } catch (e) {
                console.warn(`⚠️ Discovery: Model ${modelId} failed:`, e.message);
                lastError = e;
                continue;
            }
        }

        if (!success && existingProjects.length === 0) {
            throw lastError || new Error("AI failed to generate ideas and no existing projects match.");
        }

        res.status(200).json({
            success: true,
            suggestedIdeas: [...existingProjects, ...aiIdeas]
        });
    } catch (error) {
        console.error("Error in discoverIdeas:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Generate Full Build Guide
export const generateGuide = async (req, res) => {
    try {
        const { projectIdea } = req.body; // Expecting { title, description, hardware, software }

        const prompt = `
            Project Title: ${projectIdea.title}
            Description: ${projectIdea.description}
            Hardware: ${projectIdea.hardware?.join(", ")}
            Software: ${projectIdea.software?.join(", ")}

            Generate a comprehensive build guide for this project including:
            1. Step-by-step assembly/implementation instructions.
            2. Source code (if applicable).
            3. A detailed circuit diagram explanation or a Mermaid.js diagram.
            
            Format the response in Markdown.
        `;

        let fullMarkdown = "";
        let success = false;
        let lastError = null;

        for (const modelId of possibleModels) {
            try {
                console.log(`Attempting guide generation with model: ${modelId}`);
                const model = genAI.getGenerativeModel({ model: modelId });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                fullMarkdown = response.text().trim();
                success = true;
                console.log(`✅ Success with model: ${modelId}`);
                break;
            } catch (e) {
                console.warn(`⚠️ Guide: Model ${modelId} failed:`, e.message);
                lastError = e;
                continue;
            }
        }

        if (!success) {
            throw lastError || new Error("Failed to generate project guide with available models.");
        }

        res.status(200).json({
            success: true,
            guide: fullMarkdown
        });
    } catch (error) {
        console.error("Error in generateGuide:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Get All Projects
export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate("createdBy", "fullname picture");
        res.status(200).json({ success: true, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
