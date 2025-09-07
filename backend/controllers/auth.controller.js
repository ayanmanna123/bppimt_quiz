import User from "../models/User.model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); 
function isCollegeEmail(email) {
  return email.toLowerCase().endsWith("@bppimt.ac.in");
}

export const creatuser = async (req, res) => {
  try {
    const {
      fullname,
      email,
      picture,
      role,
      department,
      semester,
      universityNo,
    } = req.body;

    if (
      !fullname ||
      !email ||
      !picture ||
      !role ||
      !department ||
      !semester ||
      !universityNo
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const exiestuser = await User.findOne({ email });
    if (exiestuser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    const userId = req.auth.sub;
    const newuser = {
      auth0Id: userId,
      fullname,
      universityNo,
      email,
      picture,
      role,
      department,
      semester,
      verified: isCollegeEmail(email) ? "accept" : "pending",
    };

    const createdUser = await User.create(newuser);

    if (!createdUser) {
      return res.status(400).json({
        message: "Something went wrong while creating user",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User created successfully",
      createdUser,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const updatesem = async (req, res) => {
  try {
    const { sem, name } = req.body;
    const userId = req.auth.sub;
    let user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    
    if (sem) {
      user.semester = sem;
    }

    if (name) {
      user.fullname = name;
    }
    const neeuser = await user.save();

    user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User updated successfully",
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error while fetching user",
      success: false,
    });
  }
};
export const getallteacher = async (req, res) => {
  try {
    const teacher = await User.find({ role: "teacher" });

    if (!teacher || teacher.length === 0) {
      return res.status(404).json({
        message: "No teacher found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Teachers fetched successfully",
      length: teacher.length,

      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const getallstudent = async (req, res) => {
  try {
    const teacher = await User.find({ role: "student" });

    if (!teacher || teacher.length === 0) {
      return res.status(404).json({
        message: "No student found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "student fetched successfully",
      length: teacher.length,

      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
const codes = {};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const verifycode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Email and code required" });
    }

    if (codes[email] && codes[email] === code) {
      delete codes[email]; // remove once verified
      return res.json({
        success: true,
        message: "Code verified successfully!",
      });
    }

    return res.json({ success: false, message: "Invalid or expired code" });
  } catch (error) {
    console.error("Verify Code Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Verification failed" });
  }
};

export const sendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    codes[email] = code;

    await transporter.sendMail({
      from: `"Quiz App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`,
    });

    return res.json({ success: true, message: "Code sent successfully!" });
  } catch (error) {
    console.error("Send Code Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send code" });
  }
};
