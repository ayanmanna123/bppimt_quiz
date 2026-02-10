import connectToMongo from "./utils/db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { auth } from "express-oauth2-jwt-bearer";
import userrouter from "./routes/auth.routes.js";
import SubjectRoute from "./routes/subject.routes.js";
import quizeRoute from "./routes/quize.routes.js";
import reasultRoute from "./routes/result.routes.js";
import dashBordRoute from "./routes/dashbord.routes.js";
import adminRoute from "./routes/admin.routes.js";
import classroomRoute from "./routes/classRoom.routes.js";
import attendanceToggleRoutes from "./routes/attendanceToggle.routes.js";
import weaknessRoute from "./routes/weakness.routes.js";

dotenv.config();
connectToMongo();

const app = express();
const port = process.env.PORT || 8000;

// ✅ CORS Options
const corsOptions = {
  origin: ["http://localhost:5173", "https://bppimt-quiz.vercel.app"],
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
app.use("/api/v1/user", userrouter);
app.use("/api/v1/subject", SubjectRoute);
app.use("/api/v1/quize", quizeRoute);
app.use("/api/v1/reasult", reasultRoute);
app.use("/api/v1/dashbord", dashBordRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/attandance", classroomRoute);
app.use("/api/v1/attendance-toggle", attendanceToggleRoutes);
app.use("/api/v1/weakness", weaknessRoute);

app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "ayanmanna858@gmail.com",
      subject: "✅ Test Email",
      text: "Hello Ayan, this works with App Password!",
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

// ✅ Server Listener
app.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
