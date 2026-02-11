
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
        const isPdf = file.mimetype === "application/pdf";
        const isImage = file.mimetype.startsWith("image/");

        const uploadOptions = {
            folder: "bppimt_quiz_submissions",
            resource_type: isPdf ? "image" : "auto",
        };

        let cloudResponse;

        if (isPdf) {
            cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                ...uploadOptions,
                pages: true // request pages info just in case, facilitates consistent handling
            });
        } else if (isImage) {
            cloudResponse = await cloudinary.uploader.upload(fileUri.content, uploadOptions);
        } else {
            // For other file types (zip, docx, etc.), use raw
            // Note: 'auto' might interpret correctly, but explicit raw is safer for non-media
            cloudResponse = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ ...uploadOptions, resource_type: 'raw' }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                stream.end(file.buffer);
            });
        }

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

        // Set headers before piping
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="submissions-${assignmentId}.zip"`);

        archive.pipe(res);

        archive.on('error', (err) => {
            console.error("Archiver error:", err);
            if (!res.headersSent) {
                res.status(500).send({ error: err.message });
            }
        });

        for (const sub of submissions) {
            try {
                // Using stream like note.controller.js
                const response = await axios.get(sub.fileUrl, { responseType: 'stream' });

                // Construct safe filename
                const safeName = (sub.student?.fullname || "Unknown").replace(/[^a-z0-9]/gi, '_');
                const originalName = sub.originalFileName || `submission_${sub._id}`;
                const fileName = `${safeName}_${originalName}`;

                archive.append(response.data, { name: fileName });
            } catch (err) {
                console.error(`Failed to download file for submission ${sub._id} (${sub.fileUrl}):`, err.message);
                // Optionally append a text file with the error log for this specific file
                archive.append(Buffer.from(`Failed to download: ${err.message}`), { name: `ERROR_${sub._id}.txt` });
            }
        }

        await archive.finalize();

    } catch (error) {
        console.error("Global Download Error:", error);
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Server error during download.",
                success: false,
            });
        }
    }
};
