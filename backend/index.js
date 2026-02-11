import connectToMongo from "./utils/db.js";
import User from "./models/User.model.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { auth } from "express-oauth2-jwt-bearer";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

// Middlewares
import errorHandler from "./middlewares/errorHandler.js";

// Routes
import userrouter from "./routes/auth.routes.js";
import SubjectRoute from "./routes/subject.routes.js";
import quizeRoute from "./routes/quize.routes.js";
import reasultRoute from "./routes/result.routes.js";
import dashBordRoute from "./routes/dashbord.routes.js";
import adminRoute from "./routes/admin.routes.js";
import classroomRoute from "./routes/classRoom.routes.js";
import attendanceToggleRoutes from "./routes/attendanceToggle.routes.js";
import weaknessRoute from "./routes/weakness.routes.js";
import noteRoute from "./routes/note.routes.js";
import assignmentRoute from "./routes/assignment.routes.js";
import meetingRoute from "./routes/meeting.routes.js";
import chatRoute from "./routes/chat.routes.js";
import uploadRoute from "./routes/upload.routes.js";
import { saveMessage, addReaction, removeReaction } from "./controllers/chat.controller.js";

dotenv.config();
connectToMongo();

const app = express();
const port = process.env.PORT || 8000;

/* =========================
   RATE LIMITING CONFIGURATION
========================= */

// Global rate limiter - applies to all requests
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login/signup requests per windowMs (relaxed slightly for dev)
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Moderate rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    error: "Too many API requests, please slow down.",
    retryAfter: "1 minute",
  },
});

/* =========================
   API REQUEST LOGGING
========================= */
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;

    console.log(`[${method}] ${url} → ${status} (${duration}ms)`);
  });

  next();
});

/* =========================
   CORS CONFIGURATION
========================= */
const corsOptions = {
  origin: ["http://localhost:5173", "https://bppimt-quiz.vercel.app"],
  credentials: true,
};
app.use(cors(corsOptions));

/* =========================
   BASIC ROUTES & MIDDLEWARES
========================= */

// ✅ Auth0 JWT Check
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

// Conditionally apply JWT check (Skip for download route)
const jwtMiddleware = (req, res, next) => {
  if (req.path.includes('/download') && req.method === 'GET') {
    return next();
  }
  jwtCheck(req, res, next);
};

// Secured Test Route
app.get("/authorized", jwtMiddleware, (req, res) => {
  res.send("Secured Resource");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply global rate limiter to all routes
app.use(globalLimiter);

/* =========================
   API ROUTES WITH SPECIFIC RATE LIMITS
========================= */

// Public Test Route
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello from backend",
  });
});

// Apply Auth Middleware globally for API routes if desired, 
// OR apply it specifically to routes. 
// The original code applied it globally. Let's keep it global for API routes 
// but we need to be careful about not blocking Public routes if any.
// Since we have specific route files, we can wrap them.

// Note: The original code applied `jwtMiddleware` to EVERYTHING after line 50.
// We will apply it to the API routes.

app.use("/api/v1/user", authLimiter, jwtMiddleware, userrouter);
app.use("/api/v1/subject", apiLimiter, jwtMiddleware, SubjectRoute);
app.use("/api/v1/quize", apiLimiter, jwtMiddleware, quizeRoute);
app.use("/api/v1/reasult", apiLimiter, jwtMiddleware, reasultRoute);
app.use("/api/v1/dashbord", apiLimiter, jwtMiddleware, dashBordRoute);
app.use("/api/v1/admin", apiLimiter, jwtMiddleware, adminRoute);
app.use("/api/v1/attandance", apiLimiter, jwtMiddleware, classroomRoute);
app.use("/api/v1/attendance-toggle", apiLimiter, jwtMiddleware, attendanceToggleRoutes);
app.use("/api/v1/weakness", apiLimiter, jwtMiddleware, weaknessRoute);
app.use("/api/v1/note", apiLimiter, jwtMiddleware, noteRoute);
app.use("/api/v1/assignment", apiLimiter, jwtMiddleware, assignmentRoute);
app.use("/api/v1/meeting", apiLimiter, jwtMiddleware, meetingRoute);
app.use("/api/v1/chat", apiLimiter, jwtMiddleware, chatRoute);
app.use("/api/v1/upload", apiLimiter, jwtMiddleware, uploadRoute);

/* =========================
   ERROR HANDLING
========================= */
app.use(errorHandler);

/* =========================
   SERVER START
========================= */
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://bppimt-quiz.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", async (socket) => {
  const auth0Id = socket.handshake.query.userId;
  let userId = null;

  if (auth0Id) {
    try {
      const user = await User.findOneAndUpdate(
        { auth0Id },
        { isOnline: true },
        { new: true }
      );
      if (user) {
        userId = user._id;
        console.log(`User ${user.fullname} connected`);
        io.emit("updatePresence", { userId, isOnline: true });
      }
    } catch (err) {
      console.error("Error updating presence on connection:", err);
    }
  }

  socket.on("joinSubject", (subjectId) => {
    socket.join(subjectId);
    console.log(`Client ${socket.id} joined subject ${subjectId}`);
  });

  socket.on("sendMessage", async ({ subjectId, message, senderId, mentions, replyTo, attachments }) => {
    // Save to database
    const savedMessage = await saveMessage(subjectId, senderId, message, mentions, replyTo, attachments);

    if (savedMessage) {
      // Broadcast to room
      io.to(subjectId).emit("receiveMessage", savedMessage);
    }
  });

  socket.on("addReaction", async ({ messageId, userId, emoji, subjectId }) => {
    const updatedMessage = await addReaction(messageId, userId, emoji);
    if (updatedMessage) {
      io.to(subjectId).emit("messageUpdated", updatedMessage);
    }
  });

  socket.on("removeReaction", async ({ messageId, userId, emoji, subjectId }) => {
    const updatedMessage = await removeReaction(messageId, userId, emoji);
    if (updatedMessage) {
      io.to(subjectId).emit("messageUpdated", updatedMessage);
    }
  });

  socket.on("typing", ({ subjectId, user }) => {
    socket.to(subjectId).emit("userTyping", { user, subjectId });
  });

  socket.on("stopTyping", ({ subjectId, user }) => {
    socket.to(subjectId).emit("userStoppedTyping", { user, subjectId });
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected", socket.id);
    if (userId) {
      try {
        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen
        });
        io.emit("updatePresence", { userId, isOnline: false, lastSeen });
      } catch (err) {
        console.error("Error updating presence on disconnect:", err);
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`✅ HTTP Server running at http://localhost:${port}`);
});
