import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    universityNo: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
      default: "student",
    },
    department: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },
    semester: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },
    verified: {
      type: String,
      enum: ["pending", "accept", "reject"],
      default: "pending",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    friends: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        conversationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Conversation", // We will create this model next
        },
        createdAt: {
          type: Date,
          default: Date.now,
        }
      }
    ],
    friendRequests: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        }
      }
    ],
    mutedChats: [
      {
        chatId: { type: String, required: true },
        until: { type: Date, required: true }
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
