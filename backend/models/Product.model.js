import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        images: {
            type: [String],
            validate: {
                validator: function (v) {
                    return v && v.length > 0 && v.length <= 5;
                },
                message: "You must provide at least 1 and at most 5 images.",
            },
        },
        category: {
            type: String,
            enum: ["Books", "Electronics", "Stationery", "Uniform", "Other"],
            default: "Other",
        },
        condition: {
            type: String,
            enum: ["New", "Like New", "Good", "Fair"],
            default: "Good",
        },
        location: {
            type: String,
            required: true, // e.g., "Library", "Canteen"
        },
        status: {
            type: String,
            enum: ["Available", "Sold"],
            default: "Available",
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
