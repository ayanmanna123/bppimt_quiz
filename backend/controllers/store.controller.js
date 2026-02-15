import Product from "../models/Product.model.js";
import StoreConversation from "../models/StoreConversation.model.js";
import StoreMessage from "../models/StoreMessage.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import User from "../models/User.model.js"; // For populating user details if needed
import Notification from "../models/Notification.model.js";

// ==========================
// PRODUCT CONTROLLERS
// ==========================

export const createProduct = async (req, res) => {
    try {
        const { title, description, price, category, condition, location } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "At least one image is required." });
        }
        if (files.length > 5) {
            return res.status(400).json({ message: "Maximum 5 images allowed." });
        }

        const imageUrls = [];

        // Upload images to Cloudinary
        for (const file of files) {
            const fileUri = getDataUri(file);
            const mycloud = await cloudinary.uploader.upload(fileUri.content, {
                folder: "bppimt_quiz/store_products",
            });
            imageUrls.push(mycloud.secure_url);
        }

        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newProduct = new Product({
            seller: user._id,
            title,
            description,
            price,
            images: imageUrls,
            category,
            condition,
            location,
        });

        await newProduct.save();

        res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserProducts = async (req, res) => {
    try {
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const products = await Product.find({ seller: user._id })
            .populate("seller", "fullname picture universityNo")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: products.length, products });
    } catch (error) {
        console.error("Error fetching user products:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sortBy, condition } = req.query;
        const query = { status: "Available" }; // Only show available products by default

        // Filters
        if (category) query.category = category;
        if (condition) query.condition = condition;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Sorting
        let sortOptions = { createdAt: -1 }; // Default: Newest first
        if (sortBy === "price_asc") sortOptions = { price: 1 };
        if (sortBy === "price_desc") sortOptions = { price: -1 };

        const products = await Product.find(query)
            .populate("seller", "fullname picture universityNo")
            .sort(sortOptions);

        res.status(200).json({ success: true, count: products.length, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("seller", "fullname picture universityNo email");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check ownership
        if (product.seller.toString() !== user._id.toString()) { // Check if admin logic needs to be added here
            return res.status(403).json({ message: "Not authorized to delete this product" });
        }

        // Optional: Delete images from Cloudinary here to save space

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markAsSold = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (product.seller.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        product.status = "Sold";
        await product.save();

        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Error updating product status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ==========================
// CONVERSATION CONTROLLERS
// ==========================

export const startConversation = async (req, res) => {
    try {
        const { productId } = req.body;
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const buyerId = user._id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const sellerId = product.seller;

        // Don't allow messaging yourself
        if (sellerId.toString() === buyerId.toString()) {
            return res.status(400).json({ message: "You cannot message yourself about your own product." });
        }

        // Check if conversation already exists
        let conversation = await StoreConversation.findOne({
            product: productId,
            participants: { $all: [buyerId, sellerId] },
        });

        if (!conversation) {
            conversation = new StoreConversation({
                participants: [buyerId, sellerId],
                product: productId,
            });
            await conversation.save();
        }

        res.status(200).json({ success: true, conversationId: conversation._id });
    } catch (error) {
        console.error("Error starting conversation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });
        if (!user) return res.status(404).json({ message: "User not found" });
        const userId = user._id;

        const conversations = await StoreConversation.find({
            participants: userId,
        })
            .populate("participants", "fullname picture")
            .populate("product", "title price images status")
            .sort({ lastMessage: -1 });

        res.status(200).json({ success: true, conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content, attachments, replyTo } = req.body;
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });
        if (!user) return res.status(404).json({ message: "User not found" });
        const senderId = user._id;

        const conversation = await StoreConversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Verify participant
        if (!conversation.participants.includes(senderId)) {
            return res.status(403).json({ message: "Not a participant in this conversation" });
        }

        const newMessage = new StoreMessage({
            conversationId,
            sender: senderId,
            content: content || "",
            attachments: attachments || [],
            replyTo: replyTo || null,
        });

        await newMessage.save();

        conversation.lastMessage = new Date();
        await conversation.save();

        const populatedMessage = await newMessage.populate([
            { path: "sender", select: "fullname picture" },
            {
                path: "replyTo",
                select: "sender content attachments",
                populate: { path: "sender", select: "fullname" }
            }
        ]);

        // Re-fetch conversation with population to send to client for "New Conversation" updates
        const populatedConversation = await StoreConversation.findById(conversationId)
            .populate("participants", "fullname picture")
            .populate("product", "title price images status");

        // Real-time update via Socket.io
        const io = req.app.get("io");

        // 1. Emit Message to ALL participants (including sender for real-time update)
        if (io) {
            conversation.participants.forEach(participantId => {
                io.to(participantId.toString()).emit("newStoreMessage", {
                    message: populatedMessage,
                    conversationId: conversation._id,
                    conversation: populatedConversation
                });
            });
        }

        // 2. Persistent Notifications & Notification Event (Recipients Only)
        const notifications = conversation.participants
            .filter(p => p.toString() !== senderId.toString())
            .map(async (participantId) => {
                try {
                    const notification = await Notification.create({
                        recipient: participantId,
                        sender: senderId,
                        type: "chat",
                        onModel: "Chat",
                        relatedId: conversation._id,
                        message: `Store: New message about ${populatedConversation.product?.title || 'product'}`,
                    });

                    if (io) {
                        io.to(participantId.toString()).emit("newNotification", notification);
                    }
                } catch (err) {
                    console.error("Failed to create notification for", participantId, err);
                }
            });

        await Promise.all(notifications);

        res.status(200).json({ success: true, message: populatedMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });
        if (!user) return res.status(404).json({ message: "User not found" });
        const userId = user._id;

        const conversation = await StoreConversation.findById(conversationId)
            .populate("product", "title price images status seller");

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const messages = await StoreMessage.find({ conversationId })
            .sort({ timestamp: 1 }) // Chronological order
            // .skip((page - 1) * limit) // Implement pagination if needed
            // .limit(parseInt(limit))
            .populate("sender", "fullname picture")
            .populate({
                path: "replyTo",
                select: "sender content attachments",
                populate: { path: "sender", select: "fullname" }
            })
            .populate("reactions.user", "fullname picture");

        res.status(200).json({ success: true, conversation: { ...conversation.toObject(), messages } });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ==========================
// NEW STORE CHAT FEATURES
// ==========================

export const deleteStoreMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });
        if (!user) return res.status(404).json({ message: "User not found" });

        const message = await StoreMessage.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        if (message.sender.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this message" });
        }

        await StoreMessage.findByIdAndDelete(messageId);

        // Notify via socket
        const conversation = await StoreConversation.findById(message.conversationId);
        const io = req.app.get("io");
        if (io && conversation) {
            conversation.participants.forEach(participantId => {
                io.to(participantId.toString()).emit("storeMessageDeleted", {
                    messageId,
                    conversationId: conversation._id
                });
            });
        }

        res.status(200).json({ success: true, messageId, message: "Message deleted" });
    } catch (error) {
        console.error("Error deleting store message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateStoreMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });
        if (!user) return res.status(404).json({ message: "User not found" });

        const message = await StoreMessage.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        if (message.sender.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to edit this message" });
        }

        message.content = content;
        await message.save();

        const populatedMessage = await message.populate([
            { path: "sender", select: "fullname picture" },
            {
                path: "replyTo",
                select: "sender content attachments",
                populate: { path: "sender", select: "fullname" }
            },
            { path: "reactions.user", select: "fullname picture" }
        ]);

        const conversation = await StoreConversation.findById(message.conversationId);
        const io = req.app.get("io");
        if (io && conversation) {
            conversation.participants.forEach(participantId => {
                io.to(participantId.toString()).emit("storeMessageUpdated", populatedMessage);
            });
        }

        res.status(200).json({ success: true, message: populatedMessage });
    } catch (error) {
        console.error("Error updating store message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const togglePinStoreMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        // Anyone in conversation can pin? Or just seller? Let's allow both participants.
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });
        if (!user) return res.status(404).json({ message: "User not found" });

        const message = await StoreMessage.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        const conversation = await StoreConversation.findById(message.conversationId);
        if (!conversation.participants.includes(user._id)) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        message.isPinned = !message.isPinned;
        await message.save();

        const populatedMessage = await message.populate("sender", "fullname picture");

        const io = req.app.get("io");
        if (io) {
            conversation.participants.forEach(participantId => {
                io.to(participantId.toString()).emit("storeMessageUpdated", populatedMessage);
            });
        }

        res.status(200).json({ success: true, message: populatedMessage });
    } catch (error) {
        console.error("Error toggling pin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addStoreReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });
        if (!user) return res.status(404).json({ message: "User not found" });

        const message = await StoreMessage.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Check duplicates
        if (!message.reactions.some(r => r.user.toString() === user._id.toString() && r.emoji === emoji)) {
            message.reactions.push({ user: user._id, emoji });
            await message.save();
        }

        const populatedMessage = await message.populate([
            { path: "sender", select: "fullname picture" },
            { path: "reactions.user", select: "fullname picture" },
            {
                path: "replyTo",
                select: "sender content attachments",
                populate: { path: "sender", select: "fullname" }
            }
        ]);

        const conversation = await StoreConversation.findById(message.conversationId);
        const io = req.app.get("io");
        if (io && conversation) {
            conversation.participants.forEach(participantId => {
                io.to(participantId.toString()).emit("storeMessageUpdated", populatedMessage);
            });
        }

        res.status(200).json({ success: true, message: populatedMessage });
    } catch (error) {
        console.error("Error adding reaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const searchStoreMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { query } = req.query;

        if (!query) return res.status(200).json([]);

        const messages = await StoreMessage.find({
            conversationId,
            content: { $regex: query, $options: "i" }
        })
            .sort({ timestamp: -1 })
            .populate("sender", "fullname picture");

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Error searching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeStoreReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });
        if (!user) return res.status(404).json({ message: "User not found" });

        const message = await StoreMessage.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        const initialLength = message.reactions.length;
        message.reactions = message.reactions.filter(r => !(r.user.toString() === user._id.toString() && r.emoji === emoji));

        if (message.reactions.length !== initialLength) {
            await message.save();
        }

        const populatedMessage = await message.populate([
            { path: "sender", select: "fullname picture" },
            { path: "reactions.user", select: "fullname picture" },
            {
                path: "replyTo",
                select: "sender content attachments",
                populate: { path: "sender", select: "fullname" }
            }
        ]);

        const conversation = await StoreConversation.findById(message.conversationId);
        const io = req.app.get("io");
        if (io && conversation) {
            conversation.participants.forEach(participantId => {
                io.to(participantId.toString()).emit("storeMessageUpdated", populatedMessage);
            });
        }

        res.status(200).json({ success: true, message: populatedMessage });
    } catch (error) {
        console.error("Error removing reaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
