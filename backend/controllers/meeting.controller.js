import Meeting from "../models/Meeting.model.js";
import Subject from "../models/Subject.model.js";
import User from "../models/User.model.js";

export const createMeeting = async (req, res) => {
    try {
        const { title, subjectId, date, startTime, duration, meetingLink, description } = req.body;
        const auth0Id = req.auth.payload.sub;

        if (!title || !subjectId || !date || !startTime || !duration || !meetingLink) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const user = await User.findOne({ auth0Id });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        // Check if user is the creator of the subject (Teacher)
        // subject.createdBy is an ObjectId. user._id is an ObjectId.
        if (subject.createdBy.toString() !== user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to schedule meetings for this subject" });
        }

        const newMeeting = new Meeting({
            title,
            subject: subjectId,
            date,
            startTime,
            duration,
            meetingLink,
            description,
            createdBy: user._id,
        });

        await newMeeting.save();

        // Socket.io emission will be handled in the route or here if we have access to io instance.
        // Ideally, we pass io instance to controller or use app.get('io')
        const io = req.app.get('io');
        if (io) {
            io.to(subjectId).emit("newMeeting", newMeeting);
        }

        return res.status(201).json({
            success: true,
            message: "Meeting scheduled successfully",
            meeting: newMeeting,
        });
    } catch (error) {
        console.error("Error creating meeting:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getMeetingsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;

        const meetings = await Meeting.find({ subject: subjectId }).sort({ date: 1, startTime: 1 });

        return res.status(200).json({
            success: true,
            meetings,
        });
    } catch (error) {
        console.error("Error fetching meetings:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getUpcomingMeetings = async (req, res) => {
    try {
        const { department, semester } = req.query;

        if (!department || !semester) {
            return res.status(400).json({ success: false, message: "Department and semester are required" });
        }

        // Find subjects matching criteria
        const subjects = await Subject.find({ department, semester }).select("_id");
        const subjectIds = subjects.map(s => s._id);

        // Find meetings for these subjects that are in the future or ongoing (recent past)
        // Let's say meetings from 1 hour ago (ongoing) to future
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const meetings = await Meeting.find({
            subject: { $in: subjectIds },
            date: { $gte: new Date().setHours(0, 0, 0, 0) } // Filter by date roughly, can be more specific
        })
            .populate("subject", "subjectName subjectCode")
            .populate("createdBy", "fullname")
            .sort({ date: 1, startTime: 1 });

        // Further filter in memory or refine query if needed to combine date + time string usage
        // Since startTime is string "HH:mm", strictly comparing "future" is hard in Mongo without full Date objects
        // We will return all meetings for today onwards and let frontend filter or just show them.
        // Ideally we store a ISO StartDateTime in DB. But code used separated fields.

        return res.status(200).json({
            success: true,
            meetings,
        });

    } catch (error) {
        console.error("Error fetching upcoming meetings:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const auth0Id = req.auth.payload.sub;

        const user = await User.findOne({ auth0Id });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const meeting = await Meeting.findById(meetingId);

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        // Authorization check (only creator can delete)
        if (meeting.createdBy.toString() !== user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this meeting" });
        }

        await Meeting.findByIdAndDelete(meetingId);

        return res.status(200).json({
            success: true,
            message: "Meeting deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting meeting:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
