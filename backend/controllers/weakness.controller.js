import WeaknessResult from "../models/WeaknessResult.model.js";
import User from "../models/User.model.js";

export const saveWeaknessResult = async (req, res) => {
    try {
        const { topic, score, totalQuestions, questions, submittedAt } = req.body;
        const userId = req.auth.sub; // From checkJwt middleware (Auth0)

        const user = await User.findOne({ auth0Id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const result = await WeaknessResult.create({
            student: user._id,
            topic,
            score,
            totalQuestions,
            questions,
            submittedAt: submittedAt || Date.now(),
        });

        return res.status(201).json({
            message: "Weakness quiz result saved successfully",
            success: true,
            result,
        });
    } catch (error) {
        console.error("Error saving weakness result:", error);
        return res.status(500).json({
            message: "Server error while saving result",
            success: false,
        });
    }
};

export const getWeaknessHistory = async (req, res) => {
    try {
        const userId = req.auth.sub;
        const user = await User.findOne({ auth0Id: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Optional: Filter by subject if provided in query
        const { subject } = req.query;
        let query = { student: user._id };

        if (subject) {
            query.topic = { $regex: subject, $options: "i" }; // Case-insensitive partial match
        }

        const history = await WeaknessResult.find(query).sort({ submittedAt: -1 });

        return res.status(200).json({
            message: "Weakness history fetched",
            success: true,
            history,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching history",
            success: false,
        });
    }
};
