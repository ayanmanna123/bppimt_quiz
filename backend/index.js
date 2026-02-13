import connectToMongo from "./utils/db.js";
import User from "./models/User.model.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { auth } from "express-oauth2-jwt-bearer";
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
import notificationRoute from "./routes/notification.routes.js";
import studyRoomRoute from "./routes/studyRoom.routes.js";
import chatbotRoute from "./routes/chatbot.route.js";
import { saveMessage, addReaction, removeReaction } from "./controllers/chat.controller.js";
import { initSupportBot } from "./controllers/chatbot.controller.js";

dotenv.config();
connectToMongo();

const app = express();
const port = process.env.PORT || 8000;

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
  if (req.originalUrl.includes('/download') && req.method === 'GET') {
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

/* =========================
   API ROUTES
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

app.use("/api/v1/user", jwtMiddleware, userrouter);
app.use("/api/v1/subject", jwtMiddleware, SubjectRoute);
app.use("/api/v1/quize", jwtMiddleware, quizeRoute);
app.use("/api/v1/reasult", jwtMiddleware, reasultRoute);
app.use("/api/v1/dashbord", jwtMiddleware, dashBordRoute);
app.use("/api/v1/admin", jwtMiddleware, adminRoute);
app.use("/api/v1/attandance", jwtMiddleware, classroomRoute);
app.use("/api/v1/attendance-toggle", jwtMiddleware, attendanceToggleRoutes);
app.use("/api/v1/weakness", jwtMiddleware, weaknessRoute);
app.use("/api/v1/note", noteRoute);
app.use("/api/v1/assignment", jwtMiddleware, assignmentRoute);
app.use("/api/v1/meeting", jwtMiddleware, meetingRoute);
app.use("/api/v1/chat", jwtMiddleware, chatRoute);
app.use("/api/v1/upload", jwtMiddleware, uploadRoute);
app.use("/api/v1/notifications", jwtMiddleware, notificationRoute);
app.use("/api/v1/study-room", jwtMiddleware, studyRoomRoute);
app.use("/api/v1/chatbot", jwtMiddleware, chatbotRoute);


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

// Track typing users per room: Map<subjectId, Set<username>>
const typingUsersPerRoom = new Map();

io.on("connection", async (socket) => {
  const auth0Id = socket.handshake.query.userId;
  let userId = null;
  let username = null;

  if (auth0Id) {
    try {
      const user = await User.findOneAndUpdate(
        { auth0Id },
        { isOnline: true },
        { new: true }
      );
      if (user) {
        userId = user._id;
        username = user.fullname;
        console.log(`User ${username} connected`);

        // JOIN THE USER ID ROOM for personal notifications
        socket.join(userId.toString());

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
    const savedMessage = await saveMessage(subjectId, senderId, message, mentions, replyTo, attachments, io);

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
    if (!typingUsersPerRoom.has(subjectId)) {
      typingUsersPerRoom.set(subjectId, new Set());
    }
    typingUsersPerRoom.get(subjectId).add(user);

    io.to(subjectId).emit("typingUpdate", {
      subjectId,
      typingUsers: Array.from(typingUsersPerRoom.get(subjectId))
    });
  });

  socket.on("stopTyping", ({ subjectId, user }) => {
    if (typingUsersPerRoom.has(subjectId)) {
      typingUsersPerRoom.get(subjectId).delete(user);
      io.to(subjectId).emit("typingUpdate", {
        subjectId,
        typingUsers: Array.from(typingUsersPerRoom.get(subjectId))
      });
    }
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected", socket.id);

    // Clean up typing status in all rooms
    typingUsersPerRoom.forEach((users, subjectId) => {
      if (username && users.has(username)) {
        users.delete(username);
        io.to(subjectId).emit("typingUpdate", {
          subjectId,
          typingUsers: Array.from(users)
        });
      }
    });

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

httpServer.listen(port, async () => {
  await initSupportBot();
  console.log(`✅ HTTP Server running at http://localhost:${port}`);
});
