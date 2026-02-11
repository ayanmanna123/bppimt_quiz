import mongoose from "mongoose";
import dotenv from "dotenv";
import Note from "./models/Note.model.js";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const checkNotes = async () => {
    await connectDB();

    try {
        // Find the most recent note
        const note = await Note.findOne().sort({ createdAt: -1 });

        if (!note) {
            console.log("No notes found.");
        } else {
            console.log("Most recent note:");
            console.log("ID:", note._id);
            console.log("Title:", note.title);
            console.log("File URL:", note.fileUrl);
            console.log("Files Array Length:", note.files ? note.files.length : 'undefined');
            console.log("Files:", note.files);
            console.log("Content Type:", note.contentType);
        }

    } catch (error) {
        console.error("Error fetching notes:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected");
    }
};

checkNotes();
