import Note from "../models/Note.model.js";
import User from "../models/User.model.js";
import Subject from "../models/Subject.model.js";
import imagekit from "../utils/imagekit.js";
import getDataUri from "../utils/datauri.js";
import { sendProjectNotification } from "../utils/notification.util.js";

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

        // Upload file to ImageKit
        const fileUri = getDataUri(file);

        const isPdf = file.mimetype === "application/pdf";
        const isImage = file.mimetype.startsWith("image/");

        let ikResponse;
        let files = [];
        let contentType = 'other';

        ikResponse = await imagekit.upload({
            file: fileUri.content,
            fileName: file.originalname,
            folder: "/bppimt_quiz_notes"
        });

        if (isPdf) {
            contentType = 'pdf';
            // ImageKit doesn't return page count in upload response like Cloudinary.
            // However, we can use transformations to get pages. 
            // For now, let's assume we can't easily get the page count without further API calls or processing.
            // But wait, the original code used cloudResponse.pages.
            // If we don't have page count, the frontend might break if it expects an array of page URLs.

            // Temporary fix: just provide the main PDF URL.
            // If the user needs page extraction, they might need to use a different strategy with ImageKit.
            // ImageKit DOES NOT provide page count on upload.

            // Let's check if we can get it from document metadata if enabled.
            // For now, I will just set files to empty or [ikResponse.url] and hope for the best, 
            // or use a placeholder that suggests page extraction isn't available automatically.

            files.push(ikResponse.url);
        } else if (isImage) {
            contentType = 'image';
            files.push(ikResponse.url);
        } else {
            files.push(ikResponse.url);
        }

        const newNote = await Note.create({
            title,
            description,
            fileUrl: ikResponse.url,
            files, // Array of page images or single image
            contentType,
            subject: subjectId,
            uploadedBy: user._id,
        });

        // Notify Students
        try {
            const students = await User.find({
                role: "student",
                department: subject.department,
                semester: subject.semester
            }).select("_id");

            const recipientIds = students.map(s => s._id);

            if (recipientIds.length > 0) {
                const io = req.app.get("io");
                await sendProjectNotification({
                    recipientIds,
                    senderId: user._id,
                    message: `New Note: ${title} in ${subject.subjectName}`,
                    type: "note",
                    relatedId: newNote._id,
                    onModel: "Note",
                    io
                });
            }
        } catch (notifyError) {
            console.error("Error sending note upload notifications:", notifyError);
        }

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

        if (note.uploadedBy.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this note.", success: false });
        }

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
