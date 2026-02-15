import express from "express";
import multer from "multer";
import {
    createProduct,
    getAllProducts,
    getProductById,
    deleteProduct,
    markAsSold,
    startConversation,
    getConversations,
    sendMessage,
    getConversationMessages,
} from "../controllers/store.controller.js";

const router = express.Router();

// Multer setup for image uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("audio/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images and audio files are allowed"), false);
        }
    },
});

// Product Routes
router.post("/create", upload.array("images", 5), createProduct);
router.get("/all", getAllProducts);
router.get("/product/:id", getProductById);
router.delete("/product/:id", deleteProduct);
router.put("/product/:id/sold", markAsSold);

// Conversation Routes
router.post("/conversation", startConversation);
router.get("/conversations", getConversations);
router.post("/message/:conversationId", sendMessage);
router.get("/message/:conversationId", getConversationMessages);

export default router;
