import User from "../models/User.model.js";
import Conversation from "../models/Conversation.model.js";

// Helper to get User ID from Request
const getUserId = async (req) => {
    if (!req.auth || !req.auth.sub) return null;
    const user = await User.findOne({ auth0Id: req.auth.sub });
    return user ? user._id : null;
};

// Send Friend Request
export const sendFriendRequest = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const requesterId = await getUserId(req);

        if (!requesterId) return res.status(401).json({ success: false, message: "Unauthorized" });

        if (requesterId.toString() === targetUserId) {
            return res.status(400).json({ success: false, message: "Cannot send request to yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const requester = await User.findById(requesterId);

        if (!targetUser || !requester) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if already friends
        const isFriend = requester.friends.some(f => f.user.toString() === targetUserId);
        if (isFriend) {
            return res.status(400).json({ success: false, message: "Already friends" });
        }

        // Check if request already sent
        const existingRequest = targetUser.friendRequests.find(r => r.from.toString() === requesterId.toString() && r.status === 'pending');
        if (existingRequest) {
            return res.status(400).json({ success: false, message: "Request already sent" });
        }

        // Check if they sent us a request
        const incomingRequest = requester.friendRequests.find(r => r.from.toString() === targetUserId && r.status === 'pending');
        if (incomingRequest) {
            return res.status(400).json({ success: false, message: "They already sent you a request. Please accept it." });
        }

        // Add request
        targetUser.friendRequests.push({ from: requesterId });
        await targetUser.save();

        res.status(200).json({ success: true, message: "Friend request sent" });

    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Accept Friend Request
export const acceptFriendRequest = async (req, res) => {
    try {
        const { requesterId } = req.body;
        const userId = await getUserId(req);

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const user = await User.findById(userId);
        const requester = await User.findById(requesterId);

        if (!user || !requester) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Find request
        const requestIndex = user.friendRequests.findIndex(r => r.from.toString() === requesterId && r.status === 'pending');
        if (requestIndex === -1) {
            return res.status(404).json({ success: false, message: "Friend request not found" });
        }

        // Create Conversation
        const conversation = new Conversation({
            participants: [userId, requesterId],
            unreadCounts: {
                [userId.toString()]: 0,
                [requesterId.toString()]: 0
            }
        });
        await conversation.save();

        // Add to friends list
        user.friends.push({ user: requesterId, conversationId: conversation._id });
        requester.friends.push({ user: userId, conversationId: conversation._id });

        // Remove request
        user.friendRequests.splice(requestIndex, 1);

        await user.save();
        await requester.save();

        res.status(200).json({ success: true, message: "Friend request accepted", conversationId: conversation._id });

    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Reject Friend Request
export const rejectFriendRequest = async (req, res) => {
    try {
        const { requesterId } = req.body;
        const userId = await getUserId(req);

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.friendRequests = user.friendRequests.filter(r => r.from.toString() !== requesterId);
        await user.save();

        res.status(200).json({ success: true, message: "Friend request rejected" });

    } catch (error) {
        console.error("Error rejecting friend request:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get Friend Requests
export const getFriendRequests = async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const user = await User.findById(userId).populate('friendRequests.from', 'fullname picture email _id');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const pendingRequests = user.friendRequests.filter(r => r.status === 'pending');
        res.status(200).json({ success: true, requests: pendingRequests });

    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get Friends
export const getFriends = async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const user = await User.findById(userId).populate('friends.user', 'fullname picture email _id isOnline');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, friends: user.friends });

    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Check Status
export const checkFriendStatus = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const userId = await getUserId(req);

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Check if friends
        const friend = user.friends.find(f => f.user.toString() === targetUserId);
        if (friend) {
            return res.status(200).json({ status: 'friends', conversationId: friend.conversationId });
        }

        // Check if I sent request
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ success: false, message: "Target user not found" });

        const sentRequest = targetUser.friendRequests.find(r => r.from.toString() === userId.toString() && r.status === 'pending');
        if (sentRequest) {
            return res.status(200).json({ status: 'sent' });
        }

        // Check if they sent request
        const receivedRequest = user.friendRequests.find(r => r.from.toString() === targetUserId && r.status === 'pending');
        if (receivedRequest) {
            return res.status(200).json({ status: 'received' });
        }

        res.status(200).json({ status: 'none' });

    } catch (error) {
        console.error("Error checking status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
