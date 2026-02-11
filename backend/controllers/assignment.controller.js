
import Assignment from "../models/Assignment.model.js";
import Subject from "../models/Subject.model.js";
import User from "../models/User.model.js";

export const createAssignment = async (req, res) => {
    try {
        const { title, description, subjectId, deadline } = req.body;
        const auth0Id = req.auth?.sub;

        if (!auth0Id) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }

        const user = await User.findOne({ auth0Id });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can create assignments.", success: false });
        }

        if (!title || !subjectId || !deadline) {
            return res.status(400).json({
                message: "Title, Subject, and Deadline are required.",
                success: false,
            });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({
                message: "Subject not found.",
                success: false,
            });
        }

        // Check if the user is the creator of the subject or an authorized teacher
        // logic for authorization if strictly needed, but req.id implies logged in user

        const assignment = await Assignment.create({
            title,
            description,
            subject: subjectId,
            teacher: user._id,
            deadline,
        });

        return res.status(201).json({
            message: "Assignment created successfully.",
            success: true,
            assignment,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error.",
            success: false,
        });
    }
};

export const getAssignmentsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;

        const assignments = await Assignment.find({ subject: subjectId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            assignments,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error.",
            success: false,
        });
    }
};

export const deleteAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await Assignment.findByIdAndDelete(assignmentId);

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "Assignment deleted successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        })
    }
}
