import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectToMongo = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectToMongo;
