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
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    // Dating Specific Fields
    datingPhotos: [
      {
        type: String,
      }
    ],
    bio: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    interests: [
      {
        type: String,
      }
    ],
    age: {
      type: Number,
      min: 18,
    },
    job: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0], // [longitude, latitude]
      }
    },
    datingPreferences: {
      gender: {
        type: String,
        enum: ["male", "female", "other", "all"],
        default: "all",
      },
      ageRange: {
        min: { type: Number, default: 18 },
        max: { type: Number, default: 100 },
      },
      maxDistance: {
        type: Number,
        default: 50, // in kilometers
      }
    }
  },
  { timestamps: true }
);

// Add 2dsphere index for location-based search
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
