import ClassRoom from "../models/classRoom.model.js";
import User from "../models/User.model.js";
import Subject from "../models/Subject.model.js";

// Helper function to calculate distance
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius (m)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Toggle Attendance Status (On/Off)
 * Only accessible by Teacher
 */
export const toggleAttendanceRequests = async (req, res) => {
    try {
        const teacherId = req.auth?.sub;
        const { subjectId, status } = req.body; // status: true (on) or false (off)

        if (!subjectId) {
            return res.status(400).json({
                success: false,
                message: "Subject ID is required",
            });
        }

        const teacher = await User.findOne({ auth0Id: teacherId });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Find classroom for this subject and teacher
        // Also allow if teacher is authorized for the subject (e.g. Creator or Accepted)
        // For simplicity, we check if the user is linked to the classroom or subject creator

        // First try to find by teacher directly linked to classroom
        let classroom = await ClassRoom.findOne({
            subject: subjectId,
            teacher: teacher._id
        });

        if (!classroom) {
            // Fallback: check if the user is the creator of the subject or an authorized teacher
            const subject = await Subject.findById(subjectId);
            if (!subject) {
                return res.status(404).json({ message: "Subject not found" });
            }

            const isCreator = subject.createdBy.toString() === teacher._id.toString();
            const isAcceptedTeacher = subject.otherTeachers?.some(
                (t) => t.teacher.toString() === teacher._id.toString() && t.status === 'accept'
            );

            if (!isCreator && !isAcceptedTeacher) {
                return res.status(403).json({ message: "Not authorized to toggle attendance for this subject" });
            }

            // If authorized but no specific classroom doc yet (unlikely if they are toggling), try to find ANY classroom for this subject?
            // Actually, usually a classroom doc exists if they are managing it. 
            // Let's assume we find the classroom by subjectId only if we verified auth.
            classroom = await ClassRoom.findOne({ subject: subjectId });
        }

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: "Classroom not found for this subject",
            });
        }

        classroom.isAttendanceEnabled = status;
        await classroom.save();

        return res.status(200).json({
            success: true,
            message: `Attendance ${status ? "Enabled" : "Disabled"} successfully`,
            isAttendanceEnabled: classroom.isAttendanceEnabled,
        });
    } catch (error) {
        console.error("Error toggling attendance:", error);
        return res.status(500).json({
            success: false,
            message: "Server error toggling attendance",
            error: error.message,
        });
    }
};

/**
 * Student gives attendance when Toggle is ON
 * Checks: Toggle is ON && Student is Nearby
 */
export const giveAttendanceByToggle = async (req, res) => {
    try {
        const userId = req.auth?.sub;
        const { subjectid, latitude, longitude } = req.body;

        if (!subjectid || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Subject ID and Location (lat, long) are required",
            });
        }

        const user = await User.findOne({ auth0Id: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const classroom = await ClassRoom.findOne({ subject: subjectid });
        if (!classroom) {
            return res.status(404).json({ success: false, message: "Classroom not found" });
        }

        // 1. Check if Attendance is Enabled
        if (!classroom.isAttendanceEnabled) {
            return res.status(403).json({
                success: false,
                message: "Attendance is currently disabled by the teacher.",
            });
        }

        // 2. Check Proximity
        const [classLng, classLat] = classroom.location.coordinates;
        const distance = getDistanceFromLatLonInMeters(
            latitude,
            longitude,
            classLat,
            classLng
        );

        // Allow 100 meters radius (same as normal attendance)
        if (distance > 100) {
            return res.status(403).json({
                success: false,
                message: `You are too far (${Math.round(distance)}m). Move closer to the teacher/classroom (100m range).`,
            });
        }

        // 3. Mark Attendance
        const today = new Date().toDateString();
        let attendanceForToday = classroom.attendance.find(
            (a) => new Date(a.date).toDateString() === today
        );

        if (!attendanceForToday) {
            classroom.attendance.push({
                date: new Date(),
                records: [],
            });
            attendanceForToday = classroom.attendance[classroom.attendance.length - 1];
        }

        const alreadyMarked = attendanceForToday.records.some(
            (r) => r.student.toString() === user._id.toString()
        );

        if (alreadyMarked) {
            return res.status(400).json({
                success: false,
                message: "Attendance already marked for today",
            });
        }

        attendanceForToday.records.push({
            student: user._id,
            markedAt: new Date(),
        });

        classroom.markModified("attendance");
        await classroom.save();

        return res.status(200).json({
            success: true,
            message: "Attendance marked successfully!",
        });

    } catch (error) {
        console.error("Error marking toggle attendance:", error);
        return res.status(500).json({
            success: false,
            message: "Server error marking attendance",
            error: error.message,
        });
    }
};

/**
 * Get Toggle Status
 * Useful for student frontend to know if they can mark attendance
 */
export const getAttendanceStatus = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const classroom = await ClassRoom.findOne({ subject: subjectId });

        if (!classroom) {
            return res.status(200).json({
                success: true,
                isAttendanceEnabled: false,
                message: "No classroom found"
            });
        }

        return res.status(200).json({
            success: true,
            isAttendanceEnabled: !!classroom.isAttendanceEnabled
        });

    } catch (error) {
        console.error("Error fetching attendance status:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}
