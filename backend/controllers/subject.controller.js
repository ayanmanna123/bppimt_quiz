import Subject from "../models/Subject.model.js";
import User from "../models/User.model.js";

export const createSubject = async (req, res) => {
  try {
    const { department, semester, subjectName ,subjectCode} = req.body;

    if (!department || !semester || !subjectName || !subjectCode) {
      return res.status(400).json({
        message: "All fields are required",
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

    if (user.role !== "teacher") {
      return res.status(403).json({
        message: "Forbidden: Only teachers can create subjects",
        success: false,
      });
    }

    const alreadyExists = await Subject.findOne({
      department,
      semester,
      subjectName,
      subjectCode
    });
    if (alreadyExists) {
      return res.status(409).json({
        message: "Subject already exists for this department and semester",
        success: false,
      });
    }

    const subjectDetails = {
      department,
      semester,
      subjectName,
      subjectCode,
      createdBy: user._id,
    };

    const createdSub = await Subject.create(subjectDetails);
    return res.status(201).json({
      message: "Subject created successfully",
      subject: createdSub,
      success: true,
    });
  } catch (error) {
    console.error("Create Subject Error:", error);
    return res.status(500).json({
      message: "Server error while creating subject",
      success: false,
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
    if (user.role === "student") {
      return res.status(403).json({
        message: "You are not authorized: Only teachers can access this",
        success: false,
      });
    }
    const allSubject = await Subject.find({ createdBy: user._id });
    if (!allSubject || allSubject.length === 0) {
      return res.status(404).json({
        message: "No subjects found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Subjects fetched successfully",
      allSubject,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error while fetching teacher's subjects",
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
    const departmentName = req.query.department;

    if (!departmentName) {
      return res.status(400).json({
        message: "Department name is required",
        success: false,
      });
    }

    const subjects = await Subject.find({ department: departmentName }).populate({
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
