import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileUri = getDataUri(req.file);
        let resourceType = "auto";
        // Explicitly handle audio to ensure correct resource type in Cloudinary response if needed, 
        // though 'auto' usually works, identifying it as 'video' type in Cloudinary often.
        // We will rely on mime type to set our internal type.

        const mycloud = await cloudinary.uploader.upload(fileUri.content, {
            folder: "bppimt_quiz/chat_attachments",
            resource_type: "auto"
        });

        let type = mycloud.resource_type;
        if (req.file.mimetype.startsWith("audio/")) {
            type = "audio";
        }

        res.status(200).json({
            url: mycloud.secure_url,
            publicId: mycloud.public_id,
            type: type
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "File upload failed" });
    }
};
