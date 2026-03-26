import ClassRoom from "../models/classRoom.model.js";
import Subject from "../models/Subject.model.js";
import User from "../models/User.model.js";


/**
 * Helper: Emit socket update for attendance
 */
const emitAttendanceUpdate = (req, subjectId, date) => {
  const io = req.app.get("io");
  if (io) {
    console.log(`[Socket] Emitting attendanceUpdate for subject: ${subjectId}`);
    io.to(subjectId.toString()).emit("attendanceUpdate", {
      subjectId: subjectId,
      date: new Date(date).toLocaleDateString(),
    });
  }
};

/**
 * Helper: Mark attendance for a student on a specific date
 */
const markAttendanceHelper = async (classroom, studentId, targetDate) => {
  const dateString = new Date(targetDate).toDateString();

  let attendanceForDay = classroom.attendance.find(
    (a) => new Date(a.date).toDateString() === dateString
  );

  if (!attendanceForDay) {
    classroom.attendance.push({
      date: targetDate,
      records: [],
    });
    attendanceForDay = classroom.attendance[classroom.attendance.length - 1];
  }

  const alreadyMarked = attendanceForDay.records.some(
    (r) => r.student.toString() === studentId.toString()
  );

  if (alreadyMarked) {
    return { success: false, message: `Attendance already marked for ${dateString}` };
  }

  attendanceForDay.records.push({
    student: studentId,
    markedAt: new Date(),
  });

  classroom.markModified("attendance");
  await classroom.save();
  return { success: true, date: targetDate };
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
    if (!t) return NaN;
    const timeStr = t.trim().toLowerCase();

    // Check for am/pm
    const isPM = timeStr.includes('pm');
    const isAM = timeStr.includes('am');

    // Remove am/pm and trim
    let cleanTime = timeStr.replace('am', '').replace('pm', '').trim();

    let [h, m] = cleanTime.split(':').map(Number);

    if (isNaN(h) || isNaN(m)) return NaN;

    // Handle 12-hour format if AM/PM was present
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;

    return h * 60 + m;
  };

  const cur = toMinutes(current);
  const s = toMinutes(start);
  const e = toMinutes(end);

  if (isNaN(cur) || isNaN(s) || isNaN(e)) {
    console.error(`Invalid time format detected: Current=${current}, Start=${start}, End=${end}`);
    return false;
  }

  if (s <= e) {
    return cur >= s && cur <= e;
  } else {
    // Cross-midnight range (e.g. 23:00 to 01:00)
    // Current time must be >= start OR <= end
    return cur >= s || cur <= e;
  }
}

export const getAttandance = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await ClassRoom.findOne({ subject: subjectId })
      .populate({
        path: "attendance.records.student",
        select: "fullname universityNo department semester auth0Id", // student details
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
export const getAttandanceforStudent = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 1️⃣ Get all subjects for this student's department & semester
    const subjects = await Subject.find({
      department: user.department,
      semester: user.semester,
    });

    const result = [];

    // 2️⃣ For each subject, find all classrooms
    for (const subject of subjects) {
      const classrooms = await ClassRoom.find({ subject: subject._id });

      let totalPresent = 0;
      let totalAbsent = 0;
      let totalDays = 0;

      // 3️⃣ Loop through each classroom and attendance
      classrooms.forEach((classroom) => {
        classroom.attendance.forEach((att) => {
          totalDays++;

          const isPresent = att.records.some(
            (rec) => rec.student.toString() === user._id.toString()
          );

          if (isPresent) totalPresent++;
          else totalAbsent++;
        });
      });

      // 4️⃣ Calculate attendance percentage
      const attendancePercentage =
        totalDays > 0 ? ((totalPresent / totalDays) * 100).toFixed(2) : "0.00";

      // 5️⃣ Calculate how many more classes needed to reach 75%
      let classesNeededFor75 = 0;
      const target = 0.75;

      if (totalDays > 0 && totalPresent / totalDays < target) {
        // Solve for n where (totalPresent + n) / (totalDays + n) >= 0.75
        // => n >= (0.75 * totalDays - totalPresent) / (1 - 0.75)
        const required = (target * totalDays - totalPresent) / (1 - target);
        classesNeededFor75 = Math.ceil(required > 0 ? required : 0);
      } else {
        classesNeededFor75 = 0; // Already above 75%
      }

      // 6️⃣ Push result for each subject
      result.push({
        subjectId: subject._id,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        totalDays,
        totalPresent,
        totalAbsent,
        attendancePercentage,
        classesNeededFor75,
      });
    }

    return res.status(200).json({
      success: true,
      student: {
        id: user._id,
        fullname: user.fullname,
        universityNo: user.universityNo,
        department: user.department,
        semester: user.semester,
      },
      attendanceSummary: result,
    });
  } catch (error) {
    console.error("Error in getAttandanceforStudent:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const markManualAttendance = async (req, res) => {
  try {
    const teacherAuthId = req.auth?.sub; // Auth0 teacher ID
    const { subjectId, date, attendanceList } = req.body;

    if (!subjectId || !attendanceList?.length) {
      return res.status(400).json({
        success: false,
        message: "Subject ID and attendance list are required",
      });
    }

    const teacher = await User.findOne({ auth0Id: teacherAuthId });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    // 🔍 Find classroom for this teacher and subject
    let classroom = await ClassRoom.findOne({
      subject: subjectId,
      teacher: teacher._id,
    });

    if (!classroom) {
      classroom = new ClassRoom({
        name: `${subject.subjectName} Class`,
        subject: subjectId,
        teacher: teacher._id,
      });
    }

    // 🛠 Fix: Remove incomplete timeSlots that cause validation errors
    if (classroom.timeSlots && classroom.timeSlots.length > 0) {
      classroom.timeSlots = classroom.timeSlots.filter(
        (slot) => slot.dayOfWeek && slot.startTime && slot.endTime
      );
    }

    // ✅ Build attendance record for present students
    const presentRecords = attendanceList
      .filter((a) => a.status === "present")
      .map((a) => ({
        student: a.studentId,
        markedAt: new Date(),
      }));

    // Check if date already exists (avoid duplicates)
    const existingDay = classroom.attendance.find(
      (att) => att.date.toDateString() === new Date(date).toDateString()
    );

    if (existingDay) {
      // Update existing attendance
      existingDay.records = presentRecords;
    } else {
      // Add new attendance record
      classroom.attendance.push({
        date: new Date(date),
        records: presentRecords,
      });
    }

    await classroom.save();

    // ✅ Emit Socket Event for real-time update
    const io = req.app.get("io");
    if (io) {
      console.log(`[Socket] Emitting attendanceUpdate for subject: ${subjectId}`);
      io.to(subjectId.toString()).emit("attendanceUpdate", {
        subjectId: subjectId,
        date: new Date(date).toLocaleDateString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Manual attendance marked successfully",
      classroomId: classroom._id,
      totalPresent: presentRecords.length,
      totalAbsent:
        attendanceList.length > presentRecords.length
          ? attendanceList.length - presentRecords.length
          : 0,
    });
  } catch (error) {
    console.error("Error marking manual attendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking attendance",
      error: error.message,
    });
  }
};

// ------------------------------------------------------------------
// ✅ QR Code Based Attendance System
// ------------------------------------------------------------------

/**
 * Generate a unique token for QR code attendance
 */
export const generateQrCodeToken = async (req, res) => {
  try {
    const teacherId = req.auth?.sub;
    const { subjectId, targetDate } = req.body;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: "Subject ID is required" });
    }

    const teacher = await User.findOne({ auth0Id: teacherId });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const classroom = await ClassRoom.findOne({ subject: subjectId, teacher: teacher._id });
    if (!classroom) return res.status(404).json({ success: false, message: "Classroom not found" });

    // Generate a unique token (random string + timestamp)
    const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    // Set global session expiry only if not already set or expired
    const now = new Date();
    let expiresAt = classroom.qrCodeExpiresAt;

    if (!expiresAt || now > new Date(expiresAt)) {
      expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from start
    }

    // Safely parse an ISO standard string if explicitly requested by frontend
    const attDate = targetDate ? new Date(targetDate) : new Date();

    // Rotate active tokens: Add new, keep last 2 (current + 1 previous for lag)
    if (!classroom.activeQrTokens) classroom.activeQrTokens = [];
    classroom.activeQrTokens.push({ token, createdAt: now });

    if (classroom.activeQrTokens.length > 2) {
      classroom.activeQrTokens = classroom.activeQrTokens.slice(-2);
    }

    classroom.qrCodeExpiresAt = expiresAt;
    classroom.qrCodeTargetDate = attDate;
    await classroom.save();

    return res.status(200).json({
      success: true,
      message: "QR Token generated successfully",
      token,
      expiresAt,
      targetDate: attDate
    });
  } catch (error) {
    console.error("Error generating QR token:", error);
    return res.status(500).json({ success: false, message: "Server error generating QR token" });
  }
};

/**
 * Student marks attendance by scanning QR code and providing location
 */
export const giveQrAttendance = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const { subjectid, token } = req.body;

    if (!subjectid || !token) {
      return res.status(400).json({
        success: false,
        message: "Subject ID and Token are required",
      });
    }

    const user = await User.findOne({ auth0Id: userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const classroom = await ClassRoom.findOne({ subject: subjectid });
    if (!classroom) return res.status(404).json({ success: false, message: "Classroom not found" });

    // ✅ Validate QR Token against active tokens list
    const validToken = classroom.activeQrTokens.find(t => t.token === token);

    if (!validToken) {
      return res.status(400).json({ success: false, message: "Invalid or expired QR code. Please scan the current code on teacher's screen." });
    }

    // ✅ Strict Validation: Token should be very fresh (within 15s)
    const tokenAge = (Date.now() - new Date(validToken.createdAt).getTime()) / 1000;
    if (tokenAge > 15) {
      return res.status(400).json({ success: false, message: "This QR code has already regenerated. Please scan the newest one." });
    }

    // ✅ Validate Global Session Expiration
    if (new Date() > new Date(classroom.qrCodeExpiresAt)) {
      return res.status(400).json({ success: false, message: "QR code has expired. Ask teacher to regenerate." });
    }

    // ✅ Mark Attendance
    const targetDate = classroom.qrCodeTargetDate || new Date();
    const result = await markAttendanceHelper(classroom, user._id, targetDate);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // ✅ Emit Socket Event
    emitAttendanceUpdate(req, subjectid, targetDate);

    return res.status(200).json({
      success: true,
      message: `Attendance marked via QR successfully!`,
    });
  } catch (error) {
    console.error("Error giving QR attendance:", error);
    return res.status(500).json({ success: false, message: "Server error marking attendance" });
  }
};

/**
 * Check if there is an active QR session
 */
export const checkQrStatus = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const classroom = await ClassRoom.findOne({ subject: subjectId });

    if (!classroom) return res.status(200).json({ success: true, hasActiveQr: false });

    const hasActiveQr = classroom.activeQrTokens?.length > 0 && new Date() < new Date(classroom.qrCodeExpiresAt);

    return res.status(200).json({
      success: true,
      hasActiveQr: !!hasActiveQr,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error checking QR status" });
  }
};

/**
 * Invalidate the active QR session
 */
export const stopQrAttendance = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const teacherId = req.auth?.sub;

    const teacher = await User.findOne({ auth0Id: teacherId });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const classroom = await ClassRoom.findOne({ subject: subjectId, teacher: teacher._id });
    if (!classroom) return res.status(404).json({ success: false, message: "Classroom not found" });

    classroom.activeQrTokens = [];
    classroom.qrCodeExpiresAt = null;
    classroom.qrCodeTargetDate = null;
    await classroom.save();

    return res.status(200).json({
      success: true,
      message: "QR Attendance stopped successfully",
    });
  } catch (error) {
    console.error("Error stopping QR attendance:", error);
    return res.status(500).json({ success: false, message: "Error stopping QR attendance" });
  }
};

/**
 * Update Time Slots for a Subject's Classroom
 * Only accessible by Teacher of that subject
 */
export const updateTimeSlots = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const { subjectId } = req.params;
    const { timeSlots } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: "Subject ID is required",
      });
    }

    if (!timeSlots || !Array.isArray(timeSlots)) {
      return res.status(400).json({
        success: false,
        message: "Time slots must be an array",
      });
    }

    // Validate time slots structure
    for (const slot of timeSlots) {
      if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
        return res.status(400).json({
          success: false,
          message: "Each time slot must have dayOfWeek, startTime, and endTime",
        });
      }
    }

    // Find User
    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Find Classroom for this subject
    const classroom = await ClassRoom.findOne({ subject: subjectId });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found for this subject",
      });
    }

    // Check authorization: Creator or Accepted Teacher
    const subject = await Subject.findById(subjectId);

    // Fallback if subject missing but classroom exists (rare data inconsistency)
    if (!subject) {
      // Check if current user is the classroom teacher
      if (classroom.teacher.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this subject's schedule",
        });
      }
    } else {
      const isCreator = subject.createdBy.toString() === user._id.toString();
      const isAcceptedTeacher = subject.otherTeachers?.some(
        (t) => t.teacher.toString() === user._id.toString() && t.status === 'accept'
      );

      if (!isCreator && !isAcceptedTeacher) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this subject's schedule",
        });
      }
    }

    // Update time slots
    classroom.timeSlots = timeSlots;
    await classroom.save();

    return res.status(200).json({
      success: true,
      message: "Time slots updated successfully",
      timeSlots: classroom.timeSlots,
    });

  } catch (error) {
    console.error("Error updating time slots:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating time slots",
      error: error.message,
    });
  }
};
