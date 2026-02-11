import axios from 'axios';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Note from './models/Note.model.js';

dotenv.config();

const testDownload = async () => {
    // 1. Get a Note ID
    await mongoose.connect(process.env.MONGO_URI);
    const note = await Note.findOne().sort({ createdAt: -1 });
    await mongoose.disconnect();

    if (!note) {
        console.log("No note found to test.");
        return;
    }

    const noteId = note._id.toString();
    console.log(`Testing download for note: ${noteId}`);
    console.log(`Title: ${note.title}`);

    // 2. Hit the endpoint
    const url = `http://localhost:5000/api/v1/note/${noteId}/download`;
    console.log(`Fetching ${url}...`);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        console.log("Response headers:", response.headers);

        const writer = fs.createWriteStream('debug_endpoint_output.zip');
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log("Download complete. Check debug_endpoint_output.zip");

    } catch (error) {
        console.error("Error hiting endpoint:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
};

testDownload();
