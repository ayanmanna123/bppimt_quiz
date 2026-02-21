import User from "../models/User.model.js";
import Swipe from "../models/Swipe.model.js";
import Match from "../models/Match.model.js";
import Conversation from "../models/Conversation.model.js";
import mongoose from "mongoose";
import { sendNotification } from "../utils/notification.util.js";

// Helper to calculate distance (in case it's needed elsewhere besides query)
const deg2rad = (deg) => deg * (Math.PI / 180);
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

export const updateDatingProfile = async (req, res) => {
    try {
        const auth0Id = req.auth.sub;
        const { datingPhotos, bio, interests, age, job, gender, location, datingPreferences } = req.body;

        const updateData = {};
        if (datingPhotos) updateData.datingPhotos = datingPhotos;
        if (bio) updateData.bio = bio;
        if (interests) updateData.interests = interests;
        if (age) updateData.age = age;
        if (job) updateData.job = job;
        if (gender) updateData.gender = gender;
        if (location) updateData.location = location;
        if (datingPreferences) updateData.datingPreferences = { ...datingPreferences };

        const user = await User.findOneAndUpdate(
            { auth0Id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        return res.status(200).json({
            message: "Dating profile updated successfully",
            success: true,
            user
        });
    } catch (error) {
        console.error("Update Dating Profile Error:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getDiscoveryUsers = async (req, res) => {
    try {
        const auth0Id = req.auth.sub;
        const currentUser = await User.findOne({ auth0Id });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const { gender, ageRange, maxDistance } = currentUser.datingPreferences || {};
        const [longitude, latitude] = currentUser.location?.coordinates || [0, 0];

        // 1. Get IDs of users already swiped
        const swipedUsers = await Swipe.find({ swiper: currentUser._id }).distinct("swipedUser");

        // 2. Build Query
        const query = {
            _id: { $nin: [...swipedUsers, currentUser._id] }, // Exclude swiped and self
            role: "student", // Assuming dating is for students
        };

        // Filter by gender preference
        if (gender && gender !== "all") {
            query.gender = gender;
        }

        // Filter by age range
        if (ageRange) {
            query.age = { $gte: ageRange.min || 18, $lte: ageRange.max || 100 };
        }

        // Filter by distance
        if (maxDistance && longitude !== 0 && latitude !== 0) {
            query.location = {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: maxDistance * 1000 // Convert km to meters
                }
            };
        }

        const potentialMatches = await User.find(query)
            .select("fullname picture department semester datingPhotos bio interests age job gender location")
            .limit(20);

        return res.status(200).json({
            success: true,
            users: potentialMatches
        });
    } catch (error) {
        console.error("Discovery Error:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const handleSwipe = async (req, res) => {
    try {
        const auth0Id = req.auth.sub;
        const { swipedUserId, type } = req.body; // type: 'like' or 'pass'
        const io = req.app.get('io');

        if (!['like', 'pass'].includes(type)) {
            return res.status(400).json({ message: "Invalid swipe type", success: false });
        }

        const currentUser = await User.findOne({ auth0Id });
        if (!currentUser) return res.status(404).json({ message: "User not found", success: false });

        // Record the swipe
        const swipe = await Swipe.create({
            swiper: currentUser._id,
            swipedUser: swipedUserId,
            type
        });

        let match = null;

        // Check for mutual like
        if (type === 'like') {
            const mutualLike = await Swipe.findOne({
                swiper: swipedUserId,
                swipedUser: currentUser._id,
                type: 'like'
            });

            if (mutualLike) {
                // It's a match!
                // 1. Create a new conversation
                const conversation = await Conversation.create({
                    participants: [currentUser._id, swipedUserId]
                });

                // 2. Create the match record
                match = await Match.create({
                    users: [currentUser._id, swipedUserId],
                    conversationId: conversation._id
                });

                // 3. Send Real-time Notifications using the system
                await sendNotification({
                    recipientId: swipedUserId,
                    senderId: currentUser._id,
                    message: `You have a new match with ${currentUser.fullname}!`,
                    type: "match",
                    relatedId: match._id,
                    onModel: "User", // Or create a Match model entry in onModel enum if needed
                    url: "/dating/matches",
                    io
                });

                await sendNotification({
                    recipientId: currentUser._id,
                    senderId: swipedUserId,
                    message: `It's a match! You are now connected with someone new.`,
                    type: "match",
                    relatedId: match._id,
                    onModel: "User",
                    url: "/dating/matches",
                    io
                });
            }
        }

        return res.status(200).json({
            message: type === 'like' ? (match ? "It's a match!" : "Liked successfully") : "Passed successfully",
            success: true,
            isMatch: !!match,
            match
        });

    } catch (error) {
        console.error("Swipe Error:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getMyMatches = async (req, res) => {
    try {
        const auth0Id = req.auth.sub;
        const currentUser = await User.findOne({ auth0Id });
        if (!currentUser) return res.status(404).json({ message: "User not found", success: false });

        const matches = await Match.find({ users: currentUser._id })
            .populate({
                path: "users",
                select: "fullname picture bio age department semester"
            })
            .populate("conversationId");

        // Format to exclude current user from the 'users' array in response?
        // Or keep it as is. Usually frontend prefers getting the 'other' user.
        const formattedMatches = matches.map(m => {
            const otherUser = m.users.find(u => u._id.toString() !== currentUser._id.toString());
            return {
                ...m.toObject(),
                otherUser
            };
        });

        return res.status(200).json({
            success: true,
            matches: formattedMatches
        });
    } catch (error) {
        console.error("Get Matches Error:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getLikesSentToMe = async (req, res) => {
    try {
        const auth0Id = req.auth.sub;
        const currentUser = await User.findOne({ auth0Id });
        if (!currentUser) return res.status(404).json({ message: "User not found", success: false });

        // 1. Get IDs of users who I have already swiped (liked or passed)
        const mySwipes = await Swipe.find({ swiper: currentUser._id }).distinct("swipedUser");

        // 2. Find users who liked me AND I haven't swiped on them yet
        const likes = await Swipe.find({
            swipedUser: currentUser._id,
            type: 'like',
            swiper: { $nin: mySwipes }
        }).populate({
            path: 'swiper',
            select: 'fullname picture bio age department semester datingPhotos interests job gender'
        });

        const usersWhoLikedMe = likes.map(l => l.swiper).filter(u => u !== null);

        return res.status(200).json({
            success: true,
            users: usersWhoLikedMe
        });
    } catch (error) {
        console.error("Get Likes Error:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};
