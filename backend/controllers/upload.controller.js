import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileUri = getDataUri(req.file);
        const mycloud = await cloudinary.uploader.upload(fileUri.content, {
            folder: "bppimt_quiz/chat_attachments",
            resource_type: "auto" // Auto detect image/video/raw
        });

        res.status(200).json({
            url: mycloud.secure_url,
            publicId: mycloud.public_id,
            type: mycloud.resource_type
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "File upload failed" });
    }
};
