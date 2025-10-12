import ClassRoom from "../models/classRoom.model.js";
import Subject from "../models/Subject.model.js";
import User from "../models/User.model.js";

export const giveAttandance = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const { latitude, longitude, subjectid } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Location (latitude, longitude) is required",
      });
    }

    // Find user
    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find subject based on user's subject + semester

    const subject = await Subject.findOne({ _id: subjectid });
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // Find classroom
    const classRoom = await ClassRoom.findOne({ subject: subject._id });
    if (!classRoom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found for this subject",
      });
    }

    // ✅ Check location proximity (≤10 meters)
    const [classLng, classLat] = classRoom.location.coordinates;
    const distance = getDistanceFromLatLonInMeters(
      latitude,
      longitude,
      classLat,
      classLng
    );

    if (distance > 10) {
      return res.status(403).json({
        success: false,
        message: `You are too far from the classroom (${Math.round(
          distance
        )}m away).`,
      });
    }

    // ✅ Check current time inside time slot
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const isWithinSlot = classRoom.timeSlots.some((slot) => {
      return isTimeBetween(currentTime, slot.startTime, slot.endTime);
    });

    if (!isWithinSlot) {
      return res.status(403).json({
        success: false,
        message: "Attendance time is over or not started yet.",
      });
    }

    const today = new Date().toDateString();

    // Find today's attendance record (using Mongoose subdoc reference)
    let attendanceForToday = classRoom.attendance.find(
      (a) => new Date(a.date).toDateString() === today
    );

    // If no record for today, create one
    if (!attendanceForToday) {
      classRoom.attendance.push({
        date: new Date(),
        records: [],
      });

      // Get the reference to the newly added subdocument
      attendanceForToday =
        classRoom.attendance[classRoom.attendance.length - 1];
    }

    // Check if already marked
    const alreadyMarked = attendanceForToday.records.some(
      (r) => r.student.toString() === user._id.toString()
    );

    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for today",
      });
    }

    // Add attendance record
    attendanceForToday.records.push({
      student: user._id,
      markedAt: new Date(),
    });

    // ✅ Explicitly mark attendance array as modified
    classRoom.markModified("attendance");

    // Save classroom
    await classRoom.save();

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking attendance",
      error: error.message,
    });
  }
};

/**
 * Calculate distance between two coordinates (meters)
 */
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
 * Check if currentTime (HH:mm) lies between start and end time
 */
function isTimeBetween(current, start, end) {
  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const cur = toMinutes(current);
  const s = toMinutes(start);
  const e = toMinutes(end);
  return cur >= s && cur <= e;
}

export const getAttandance = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await ClassRoom.findOne({ subject: subjectId })
      .populate({
        path: "attendance.records.student",
        select: "fullname universityNo department semester", // student details
      })
      .populate({
        path: "subject", // populate subject details
        select: "subjectName subjectCode department semester createdBy", // include fields you want
        populate: {
          path: "createdBy", // optional: populate teacher details
          select: "fullname email",
        },
      });
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
        success: false,
      });
    }
    const totalStudent = await User.find({
      semester: subject.subject.semester,
      department: subject.subject.department,
    });
    return res.json({
      message: "Attendance fetched successfully",
      subject,
      totalStudent,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error while fetching attendance",
      success: false,
      error: error.message,
    });
  }
};
