import connectToMongo from "./utils/db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { auth } from "express-oauth2-jwt-bearer";

dotenv.config();
connectToMongo();

const app = express();
const port = process.env.PORT || 8000;

// ✅ CORS Options
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Auth0 JWT Check
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

// enforce on all secured endpoints
app.use(jwtCheck);

// ✅ Secured Test Route
app.get("/authorized", (req, res) => {
  res.send("Secured Resource");
});

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Public Test Route
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello from backend",
  });
});

// ✅ API Routes

// ✅ Server Listener
app.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
