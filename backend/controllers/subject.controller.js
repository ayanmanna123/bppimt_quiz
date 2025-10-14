import ClassRoom from "../models/classRoom.model.js";
import Subject from "../models/Subject.model.js";
import User from "../models/User.model.js";
import redisClient from "../utils/redis.js";

export const createSubject = async (req, res) => {
  try {
    const {
      department,
      semester,
      subjectName,
      subjectCode,
      location, // { latitude, longitude }
      timeSlots, // [{ dayOfWeek, startTime, endTime }]
    } = req.body;

    if (
      !department ||
      !semester ||
      !subjectName ||
      !subjectCode ||
      !location ||
      !location.latitude ||
      !location.longitude ||
      !timeSlots ||
      !Array.isArray(timeSlots) ||
      timeSlots.length === 0
    ) {
      return res.status(400).json({
        message:
          "All fields (department, semester, subjectName, subjectCode, location, timeSlots) are required",
        success: false,
      });
    }

    // Validate each timeSlot has dayOfWeek, startTime, and endTime
    for (const slot of timeSlots) {
      if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
        return res.status(400).json({
          message:
            "Each time slot must include dayOfWeek, startTime, and endTime",
          success: false,
        });
      }
    }

    const userId = req.auth?.sub;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: No user ID found",
        success: false,
      });
    }

    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(403).json({
        message: "You are not verified",
        success: false,
      });
    }

    if (user.role !== "teacher") {
      return res.status(403).json({
        message: "Forbidden: Only teachers can create subjects",
        success: false,
      });
    }

    // Check if subject already exists
    let subject = await Subject.findOne({
      department,
      semester,
      subjectName,
      subjectCode,
    });

    if (subject) {
      const alreadyAdded =
        subject.createdBy.toString() === user._id.toString() ||
        subject.otherTeachers.some(
          (t) => t.teacher.toString() === user._id.toString()
        );

      if (alreadyAdded) {
        return res.status(400).json({
          message: "You are already assigned to this subject",
          success: false,
        });
      }

      subject.otherTeachers.push({
        teacher: user._id,
        status: "pending",
        picture: user.picture,
      });

      await subject.save();

      return res.status(200).json({
        message:
          "Subject already exists. You have been added as a pending teacher.",
        subject,
        success: true,
      });
    }

    // ✅ Create new subject
    const subjectDetails = {
      department,
      semester,
      subjectName,
      subjectCode,
      createdBy: user._id,
      otherTeachers: [],
    };

    const createdSub = await Subject.create(subjectDetails);

    // ✅ Automatically create a Classroom for this subject
    const newClassRoom = await ClassRoom.create({
      name: subjectName,
      subject: createdSub._id,
      teacher: user._id,
      location: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
      timeSlots: timeSlots.map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });

    return res.status(201).json({
      message: "Subject and classroom created successfully",
      subject: createdSub,
      classroom: newClassRoom,
      success: true,
    });
  } catch (error) {
    console.error("Create Subject Error:", error);
    return res.status(500).json({
      message: "Server error while creating subject and classroom",
      success: false,
      error: error.message,
    });
  }
};


export const updateSubject = async (req, res) => {
  try {
    const { _id, department, semester, subjectName } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: "Please provide a subject ID to update",
        success: false,
      });
    }

    const userId = req.auth?.sub;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: No user ID found",
        success: false,
      });
    }

    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
        success: false,
      });
    }

    const subject = await Subject.findById(_id);
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
        success: false,
      });
    }

    if (subject.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "Forbidden: You are not allowed to update this subject",
        success: false,
      });
    }

    const duplicate = await Subject.findOne({
      department,
      semester,
      subjectName,
    });
    if (duplicate) {
      return res.status(409).json({
        message: "Another subject with the same details already exists",
        success: false,
      });
    }

    if (department) subject.department = department;
    if (semester) subject.semester = semester;
    if (subjectName) subject.subjectName = subjectName;

    const updatedSubject = await subject.save();

    return res.status(200).json({
      message: "Subject updated successfully",
      subject: updatedSubject,
      success: true,
    });
  } catch (error) {
    console.error("Update Subject Error:", error);
    return res.status(500).json({
      message: "Server error while updating subject",
      success: false,
    });
  }
};

export const teacherCreatedSubject = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
        success: false,
      });
    }

    if (user.role !== "teacher") {
      return res.status(403).json({
        message: "Forbidden: Only teachers can view their subjects",
        success: false,
      });
    }
    const cacheKey = `subject:${user._id}`;
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      return res.status(200).json({
        source: "cache",
        subjects: JSON.parse(cachedUser),
      });
    }

    const subjects = await Subject.find({
      $or: [
        { createdBy: user._id },
        {
          $and: [
            { "otherTeachers.teacher": user._id },
            { "otherTeachers.status": "accept" },
          ],
        },
      ],
    }).populate("otherTeachers.teacher", "fullname email");

    await redisClient.set(cacheKey, JSON.stringify(subjects), { EX: 60 });

    return res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
      success: true,
    });
  } catch (error) {
    console.error("Get My Subjects Error:", error);
    return res.status(500).json({
      message: "Server error while fetching subjects",
      success: false,
    });
  }
};

export const subjectById = async (req, res) => {
  try {
    const subjectId = req.params.id;
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
        success: false,
      });
    }
    if (!subjectId) {
      return res.status(400).json({
        message: "Subject ID is required",
        success: false,
      });
    }
    const subject = await Subject.findOne({ _id: subjectId }).populate({
      path: "createdBy",
    });
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Subject fetched successfully",
      subject,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error while fetching subject",
      success: false,
    });
  }
};

export const departmentQuiry = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
        success: false,
      });
    }
    const departmentName = req.query.department;
    const semester = req.query.semester;
    if (!departmentName) {
      return res.status(400).json({
        message: "Department name is required",
        success: false,
      });
    }

    const subjects = await Subject.find({
      department: departmentName,
      semester: semester,
    }).populate({
      path: "createdBy",
    });

    if (!subjects || subjects.length === 0) {
      return res.status(404).json({
        message: "No subjects found for this department",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
      success: true,
    });
  } catch (error) {
    console.error("Department Query Error:", error);
    return res.status(500).json({
      message: "Server error while fetching subjects",
      success: false,
    });
  }
};

export const getMySubjects = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
        success: false,
      });
    }

    if (user.role !== "teacher") {
      return res.status(403).json({
        message: "Forbidden: Only teachers can view their subjects",
        success: false,
      });
    }

    const subjects = await Subject.find({
      $or: [{ createdBy: user._id }],
    }).populate("otherTeachers.teacher", "fullname email");

    return res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
      success: true,
    });
  } catch (error) {
    console.error("Get My Subjects Error:", error);
    return res.status(500).json({
      message: "Server error while fetching subjects",
      success: false,
    });
  }
};

export const getpendingTeacher = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
        success: false,
      });
    }

    if (user.role !== "teacher") {
      return res.status(403).json({
        message: "Forbidden: Only teachers can view their subjects",
        success: false,
      });
    }

    const subjects = await Subject.find({
      createdBy: user._id,
      otherTeachers: { $exists: true, $not: { $size: 0 } },
    }).populate("otherTeachers.teacher", "fullname email");

    return res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
      success: true,
    });
  } catch (error) {
    console.error("Get My Subjects Error:", error);
    return res.status(500).json({
      message: "Server error while fetching subjects",
      success: false,
    });
  }
};

export const updateTeacherStatus = async (req, res) => {
  try {
    const { teacherId, status } = req.body;
    const subjectId = req.params.id;

    if (!teacherId || !status) {
      return res.status(400).json({
        message: "teacherId and status are required",
        success: false,
      });
    }

    if (!["pending", "accept", "reject"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
        success: false,
      });
    }

    const userId = req.auth?.sub;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: No user ID found",
        success: false,
      });
    }

    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // find subject
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
        success: false,
      });
    }

    // only creator can update
    if (subject.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "Forbidden: Only subject creator can update teacher status",
        success: false,
      });
    }

    // find teacher in otherTeachers
    const teacherObj = subject.otherTeachers.find(
      (t) => t.teacher.toString() === teacherId
    );

    if (!teacherObj) {
      return res.status(404).json({
        message: "Teacher not found in this subject",
        success: false,
      });
    }

    // update status
    teacherObj.status = status;
    await subject.save();

    return res.status(200).json({
      message: "Teacher status updated successfully",
      subject,
      success: true,
    });
  } catch (error) {
    console.error("Update Teacher Status Error:", error);
    return res.status(500).json({
      message: "Server error while updating teacher status",
      success: false,
    });
  }
};
