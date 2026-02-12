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

    // Find subject
    const subject = await Subject.findById(subjectid);
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

    if (distance > 100) {
      return res.status(403).json({
        success: false,
        message: `You are too far from the classroom (${Math.round(
          distance
        )}m away). Allowed range: 100m.`,
      });
    }

    // ✅ Get current weekday (e.g., "Monday") in IST
    const currentWeekDay = new Date().toLocaleString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });

    // ✅ Get current time in HH:mm format in IST
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: "Asia/Kolkata"
    };
    const formatter = new Intl.DateTimeFormat('en-US', timeOptions);
    const parts = formatter.formatToParts(new Date());
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const currentTime = `${hour}:${minute}`;

    // ✅ Check if there’s a time slot that matches both weekday and time
    const isWithinSlot = classRoom.timeSlots.some((slot) => {
      return (
        slot.dayOfWeek === currentWeekDay &&
        isTimeBetween(currentTime, slot.startTime, slot.endTime)
      );
    });

    if (!isWithinSlot) {
      console.log(`[Attendance Failed] User: ${userId}, Subject: ${subjectid}`);
      console.log(`[Attendance Failed] Server Time: ${currentWeekDay} ${currentTime}`);
      console.log(`[Attendance Failed] Available Slots:`, JSON.stringify(classRoom.timeSlots));
      return res.status(403).json({
        success: false,
        message: "Attendance time is not active right now (wrong day or time).",
      });
    }

    // ✅ Mark attendance if not already marked
    const today = new Date().toDateString();

    let attendanceForToday = classRoom.attendance.find(
      (a) => new Date(a.date).toDateString() === today
    );

    if (!attendanceForToday) {
      classRoom.attendance.push({
        date: new Date(),
        records: [],
      });

      attendanceForToday =
        classRoom.attendance[classRoom.attendance.length - 1];
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

    classRoom.markModified("attendance");
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
// ✅ OTP Based Attendance System
// ------------------------------------------------------------------

/**
 * Generate a 6-digit OTP for a specific classroom
 * Only accessible by Teacher
 */
export const generateOtp = async (req, res) => {
  try {
    const teacherId = req.auth?.sub; // Auth0 ID
    const { subjectId, targetDate } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: "Subject ID is required",
      });
    }

    // specific teacher check
    const teacher = await User.findOne({ auth0Id: teacherId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const classroom = await ClassRoom.findOne({
      subject: subjectId,
      teacher: teacher._id,
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found for this subject/teacher",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ Use provided target date or default to now
    const attDate = targetDate ? new Date(targetDate) : new Date();

    classroom.currentOtp = otp;
    classroom.otpExpiresAt = expiresAt;
    classroom.otpTargetDate = attDate;
    await classroom.save();

    return res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      otp,
      expiresAt,
      targetDate: attDate
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error generating OTP",
      error: error.message,
    });
  }
};

/**
 * Student gives attendance using OTP
 * No Location Check | No Weekday Check | No Time Slot Check
 */
export const giveOtpAttendance = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const { subjectid, otp } = req.body;

    if (!subjectid || !otp) {
      return res.status(400).json({
        success: false,
        message: "Subject ID and OTP are required",
      });
    }

    // Find User
    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Find Classroom
    const classroom = await ClassRoom.findOne({ subject: subjectid });
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found for this subject",
      });
    }

    // ✅ Validate OTP
    if (!classroom.currentOtp || classroom.currentOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please ask your teacher for the correct code.",
      });
    }

    // ✅ Validate Expiration
    if (new Date() > new Date(classroom.otpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please ask for a new one.",
      });
    }

    // ✅ Use the Teacher's Target Date for this OTP
    const targetDate = classroom.otpTargetDate || new Date();
    const dateString = new Date(targetDate).toDateString();

    let attendanceForToday = classroom.attendance.find(
      (a) => new Date(a.date).toDateString() === dateString
    );

    if (!attendanceForToday) {
      classroom.attendance.push({
        date: targetDate, // Use the stored target date
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
        message: `Attendance already marked for ${dateString}`,
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
      message: `Attendance marked successfully for ${dateString}!`,
    });
  } catch (error) {
    console.error("Error giving OTP attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Server error marking attendance",
      error: error.message,
    });
  }
};

/**
 * Check if there is an active OTP for the given subject
 */
export const checkActiveOtp = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const classroom = await ClassRoom.findOne({ subject: subjectId });

    if (!classroom) {
      return res.status(200).json({
        success: true,
        hasActiveOtp: false,
        message: "No classroom found",
      });
    }

    // Check if OTP exists and is not expired
    const hasActiveOtp =
      classroom.currentOtp && new Date() < new Date(classroom.otpExpiresAt);

    return res.status(200).json({
      success: true,
      hasActiveOtp: !!hasActiveOtp,
    });
  } catch (error) {
    console.error("Error checking OTP status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error checking OTP status",
      error: error.message,
    });
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
