import Product from "../models/Product.model.js";
import StoreConversation from "../models/StoreConversation.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import User from "../models/User.model.js"; // For populating user details if needed

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
                messages: [],
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
        const { content, attachments } = req.body;
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

        const newMessage = {
            sender: senderId,
            content: content || "",
            attachments: attachments || [],
            timestamp: new Date(),
        };

        conversation.messages.push(newMessage);
        conversation.lastMessage = new Date();
        await conversation.save();

        // Real-time update via Socket.io
        const io = req.app.get("io");
        if (io) {
            const socketMessage = {
                ...newMessage,
                sender: {
                    _id: user._id,
                    fullname: user.fullname,
                    picture: user.picture
                }
            };

            conversation.participants.forEach(participantId => {
                io.to(participantId.toString()).emit("newStoreMessage", {
                    message: socketMessage,
                    conversationId: conversation._id
                });
            });
        }

        res.status(200).json({ success: true, message: newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });
        if (!user) return res.status(404).json({ message: "User not found" });
        const userId = user._id;

        const conversation = await StoreConversation.findById(conversationId)
            .populate("messages.sender", "fullname picture")
            .populate("product", "title price images status seller");

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.status(200).json({ success: true, conversation });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
