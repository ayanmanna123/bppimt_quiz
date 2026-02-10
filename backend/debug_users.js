import connectToMongo from "./utils/db.js";
import User from "./models/User.model.js";
import dotenv from "dotenv";

dotenv.config();

const debugUsers = async () => {
    try {
        await connectToMongo();
        console.log("Connected to MongoDB");

        const users = await User.find({});
        console.log(`Found ${users.length} users in the database:`);
        users.forEach(user => {
            console.log(`- Name: ${user.fullname}, Auth0Id: ${user.auth0Id}, Email: ${user.email}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error debugging users:", error);
        process.exit(1);
    }
};

debugUsers();
