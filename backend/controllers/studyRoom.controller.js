import StudyRoom from "../models/StudyRoom.model.js";
import User from "../models/User.model.js";

// Create a new Study Room
export const createRoom = async (req, res) => {
    try {
        const { name, description, isPrivate } = req.body;
        const userId = req.auth.payload.sub; // Auth0 ID from jwtCheck

        const user = await User.findOne({ auth0Id: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newRoom = new StudyRoom({
            name,
            description,
            isPrivate,
            createdBy: user._id,
            members: [user._id],
        });

        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: "Failed to create study room" });
    }
};

// Get all public Study Rooms
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await StudyRoom.find({ isPrivate: false })
            .populate("createdBy", "fullname picture")
            .populate("members", "fullname picture")
            .sort({ createdAt: -1 });
        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: "Failed to fetch study rooms" });
    }
};

// Get rooms the user has joined
export const getJoinedRooms = async (req, res) => {
    try {
        const auth0Id = req.auth.payload.sub;
        const user = await User.findOne({ auth0Id });
        if (!user) return res.status(404).json({ message: "User not found" });

        const rooms = await StudyRoom.find({ members: user._id })
            .populate("createdBy", "fullname picture")
            .populate("members", "fullname picture")
            .sort({ updatedAt: -1 });

        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching joined rooms:", error);
        res.status(500).json({ message: "Failed to fetch joined rooms" });
    }
};

// Join a Study Room
export const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const auth0Id = req.auth.payload.sub;

        const user = await User.findOne({ auth0Id: auth0Id });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const room = await StudyRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (!room.members.includes(user._id)) {
            room.members.push(user._id);
            await room.save();
        }

        res.status(200).json(room);
    } catch (error) {
        console.error("Error joining room:", error);
        res.status(500).json({ message: "Failed to join study room" });
    }
};

// Get single room details
export const getRoomDetails = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await StudyRoom.findById(roomId)
            .populate("createdBy", "fullname picture")
            .populate("members", "fullname picture role isOnline lastSeen");

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.status(200).json(room);
    } catch (error) {
        console.error("Error fetching room details:", error);
        res.status(500).json({ message: "Failed to fetch room details" });
    }
};

// Delete a room (Creator only)
export const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const auth0Id = req.auth.payload.sub;

        const user = await User.findOne({ auth0Id: auth0Id });
        const room = await StudyRoom.findById(roomId);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (room.createdBy.toString() !== user._id.toString() && user.role !== 'teacher') {
            return res.status(403).json({ message: "Unauthorized to delete this room" });
        }

        await StudyRoom.findByIdAndDelete(roomId);
        res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ message: "Failed to delete room" });
    }
};
