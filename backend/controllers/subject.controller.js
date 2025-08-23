import Subject from "../models/Subject.model.js";
import User from "../models/User.model.js";

// ✅ Create Subject
export const createSubject = async (req, res) => {
  try {
    const { department, semester, subjectName } = req.body;

    if (!department || !semester || !subjectName) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const userId = req.auth?.sub;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: no user ID found",
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
        message: "Forbidden: only teachers can create subjects",
        success: false,
      });
    }

    const alreadyExists = await Subject.findOne({
      department,
      semester,
      subjectName
    });
    if (alreadyExists) {
      return res.status(409).json({
        message: "Subject already exists for this department & semester",
        success: false,
      });
    }

    const subjectDetails = {
      department,
      semester,
      subjectName,
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
        message: "Please provide subject ID to update",
        success: false,
      });
    }

    const userId = req.auth?.sub;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: no user ID found",
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
        message: "Forbidden: you are not allowed to update this subject",
        success: false,
      });
    }

    
    const duplicate = await Subject.findOne({
      department,
      semester,
      subjectName
    });
    if (duplicate) {
      return res.status(409).json({
        message: "Another subject with the same name already exists",
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


