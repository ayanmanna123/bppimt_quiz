import imagekit from "../utils/imagekit.js";
import getDataUri from "../utils/datauri.js";

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileUri = getDataUri(req.file);

        const ikResponse = await imagekit.upload({
            file: fileUri.content, // base64 string
            fileName: req.file.originalname,
            folder: "/bppimt_quiz/chat_attachments"
        });

        let type = ikResponse.fileType; // 'image', 'non-image'
        if (req.file.mimetype.startsWith("audio/")) {
            type = "audio";
        } else if (req.file.mimetype.startsWith("video/")) {
            type = "video";
        } else if (req.file.mimetype === "application/pdf") {
            type = "pdf";
        }

        res.status(200).json({
            url: ikResponse.url,
            fileId: ikResponse.fileId,
            type: type
        });
    } catch (error) {
        console.error("Error uploading file to ImageKit:", error);
        res.status(500).json({ message: "File upload failed" });
    }
};
