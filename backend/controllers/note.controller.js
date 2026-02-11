import Note from "../models/Note.model.js";
import User from "../models/User.model.js";
import Subject from "../models/Subject.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import axios from 'axios';
import archiver from 'archiver';

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

        const isPdf = file.mimetype === "application/pdf";
        const isImage = file.mimetype.startsWith("image/");

        // Define upload options - PDF must be uploaded as 'image' to enable page extraction
        const uploadOptions = {
            folder: "bppimt_quiz_notes",
            resource_type: isPdf ? "image" : "auto",
        };

        if (isPdf) {
            // For PDFs, we want to ensure we can extract pages.
            // Cloudinary treats PDF as image for page extraction.
            // upload_stream is safer for larger files if used, but here using base64 via dataUri
            // If dataUri fails for large PDFs, might need stream, but keeping consistent with existing pattern
            // BUT datauri with large PDF might be an issue. existing code used buffer stream for raw.
            // Let's use stream for PDF too, but resource_type 'image'.
        }

        let cloudResponse;
        let files = [];
        let contentType = 'other';

        if (isPdf) {
            contentType = 'pdf';
            // Upload as image to get pages support
            cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                ...uploadOptions,
                pages: true // Ask for page count and info
            });

            // Generate URLs for each page
            // URL format: https://res.cloudinary.com/<cloud_name>/image/upload/pg_<page_number>/v<version>/<public_id>.jpg
            // cloudResponse.secure_url gives the PDF url.
            // cloudResponse.pages gives the count (on some plans/SDK versions), or we might need to assume 1 if missing.
            // Actually, 'pages' in upload response is available if pages=true is set.

            const pageCount = cloudResponse.pages || 1;

            // Construct the base URL parts to insert pg_x
            // Or simpler: use cloudinary.url() helper if available, but manual string manip is fine if standard.
            // Safe approach: replace '/upload/' with '/upload/pg_${i}/' and change extension to .jpg

            const baseUrl = cloudResponse.secure_url;
            // baseUrl ends in .pdf usually.

            for (let i = 1; i <= pageCount; i++) {
                // Insert pg_i after /upload/
                // And replace extension
                // Regex to find /upload/ and append pg
                // Use regex for case insensitive .pdf replacement
                const pageUrl = baseUrl.replace(/\/upload\//, `/upload/pg_${i}/`).replace(/\.pdf$/i, '.jpg');
                files.push(pageUrl);
            }

        } else if (isImage) {
            contentType = 'image';
            cloudResponse = await cloudinary.uploader.upload(fileUri.content, uploadOptions);
            files.push(cloudResponse.secure_url);
        } else {
            // Other files (raw)
            cloudResponse = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ ...uploadOptions, resource_type: 'raw' }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                stream.end(file.buffer);
            });
            files.push(cloudResponse.secure_url);
        }

        const newNote = await Note.create({
            title,
            description,
            fileUrl: cloudResponse.secure_url, // Main file (PDF or Image)
            files, // Array of page images or single image
            contentType,
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



export const downloadNoteZip = async (req, res) => {
    try {
        const { noteId } = req.params;
        console.log(`[ZIP_DOWNLOAD] Attempting to download ZIP for note: ${noteId}`);

        const note = await Note.findById(noteId);

        if (!note) {
            console.log(`[ZIP_DOWNLOAD] Note not found: ${noteId}`);
            return res.status(404).json({ message: "Note not found", success: false });
        }

        // If no split files, redirect to original or handle single file
        // Or if it wasn't a PDF upload originally.
        if (!note.files || note.files.length === 0) {
            return res.redirect(note.fileUrl);
        }

        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        archive.on('error', function (err) {
            console.error("Archiver error:", err);
            if (!res.headersSent) {
                res.status(500).send({ error: err.message });
            }
        });

        // Good practice to listen for warnings
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                console.warn("Archiver warning:", err);
            } else {
                console.error("Archiver error:", err);
                throw err;
            }
        });

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${note.title.replace(/\s+/g, '_')}_images.zip"`);

        archive.pipe(res);

        // Fetch and append each image
        for (let i = 0; i < note.files.length; i++) {
            const url = note.files[i];

            try {
                const response = await axios.get(url, { responseType: 'stream' });

                // Determine extension from URL
                const ext = url.split('.').pop().split('?')[0] || 'jpg';
                const filename = `page_${i + 1}.${ext}`;

                archive.append(response.data, { name: filename });
            } catch (err) {
                console.error(`Failed to fetch image ${url}`, err.message);
                // Continue or fail? Let's continue but maybe add a text file error log to zip?
                // For now just skip.
            }
        }

        await archive.finalize();

    } catch (error) {
        console.error("[ZIP_DOWNLOAD] Download Zip Error:", error);
        // If headers already sent, we can't send JSON error.
        if (!res.headersSent) {
            return res.status(500).json({
                message: "Error generating ZIP",
                success: false,
                error: error.message
            });
        }
    }
};
