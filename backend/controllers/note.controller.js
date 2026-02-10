import Note from "../models/Note.model.js";
import User from "../models/User.model.js";
import Subject from "../models/Subject.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const uploadNote = async (req, res) => {
    try {
        const { title, description, subjectId } = req.body;
        const file = req.file;

        if (!title || !subjectId || !file) {
            return res.status(400).json({
                message: "Title, Subject ID, and File are required.",
                success: false,
            });
        }

        const userId = req.auth?.sub; // Assuming Auth0 sub is used
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }

        const user = await User.findOne({ auth0Id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (user.role !== "teacher") {
            return res.status(403).json({
                message: "Only teachers can upload notes.",
                success: false,
            });
        }

        // Verify Subject
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found.", success: false });
        }

        // Upload file to Cloudinary
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            resource_type: "auto", // Auto-detect file type (image, video, raw/pdf)
            folder: "bppimt_quiz_notes",
        });

        const newNote = await Note.create({
            title,
            description,
            fileUrl: cloudResponse.secure_url,
            subject: subjectId,
            uploadedBy: user._id,
        });

        return res.status(201).json({
            message: "Note uploaded successfully.",
            note: newNote,
            success: true,
        });

    } catch (error) {
        console.error("Upload Note Error:", error);
        return res.status(500).json({
            message: "Server error while uploading note.",
            success: false,
            error: error.message,
        });
    }
};

export const getNotesBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;

        if (!subjectId) {
            return res.status(400).json({ message: "Subject ID is required", success: false });
        }

        const notes = await Note.find({ subject: subjectId })
            .populate("uploadedBy", "fullname")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Notes fetched successfully.",
            notes,
            success: true,
        });

    } catch (error) {
        console.error("Get Notes Error:", error);
        return res.status(500).json({
            message: "Server error while fetching notes.",
            success: false,
            error: error.message,
        });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.auth?.sub;

        const user = await User.findOne({ auth0Id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: "Note not found", success: false });
        }

        // Only uploader or maybe admin can delete (assuming current user is uploader for now)
        if (note.uploadedBy.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this note.", success: false });
        }

        // Optional: Delete from cloudinary (requires public_id storage, skipping for now)

        await note.deleteOne();

        return res.status(200).json({
            message: "Note deleted successfully.",
            success: true,
        });

    } catch (error) {
        console.error("Delete Note Error:", error);
        return res.status(500).json({
            message: "Server error while deleting note.",
            success: false,
            error: error.message
        });
    }
}
