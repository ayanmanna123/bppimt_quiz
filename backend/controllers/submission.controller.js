
import Submission from "../models/Submission.model.js";
import Assignment from "../models/Assignment.model.js";
import User from "../models/User.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import archiver from "archiver";
import axios from "axios";

export const submitHomework = async (req, res) => {
    try {
        const { assignmentId } = req.body;
        const auth0Id = req.auth?.sub;
        const file = req.file;

        if (!auth0Id) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }

        const user = await User.findOne({ auth0Id });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (!file) {
            return res.status(400).json({
                message: "No file uploaded.",
                success: false,
            });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found",
                success: false
            })
        }

        // Check if submission already exists for this student and assignment? 
        // Allowing re-submission for now or multiple files? Let's assume one submission per assignment for simplicity, or just append.
        // For now, simple create.

        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            resource_type: "auto" // Allow pdfs, images, etc.
        });

        const submission = await Submission.create({
            assignment: assignmentId,
            student: user._id,
            fileUrl: cloudResponse.secure_url,
            originalFileName: file.originalname,
        });

        return res.status(201).json({
            message: "Homework submitted successfully.",
            success: true,
            submission,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error.",
            success: false,
        });
    }
};

export const getSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const submissions = await Submission.find({ assignment: assignmentId })
            .populate("student", "fullname email universityNo")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            submissions,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error.",
            success: false,
        });
    }
};

export const downloadAllSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = await Submission.find({ assignment: assignmentId }).populate("student", "fullname universityNo");

        if (!submissions || submissions.length === 0) {
            return res.status(404).json({
                message: "No submissions found.",
                success: false,
            });
        }

        const archive = archiver("zip", {
            zlib: { level: 9 },
        });

        res.attachment(`submissions-${assignmentId}.zip`);

        archive.pipe(res);

        for (const sub of submissions) {
            try {
                const response = await axios.get(sub.fileUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data, 'binary');
                const fileName = `${sub.student.universityNo || sub.student.fullname}_${sub.originalFileName || 'submission'}`;
                archive.append(buffer, { name: fileName });
            } catch (err) {
                console.error(`Failed to download file for submission ${sub._id}:`, err);
                // Continue with other files even if one fails
            }
        }

        await archive.finalize();

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Server error during download.",
                success: false,
            });
        }
    }
};
