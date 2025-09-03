import User from "../models/User.model.js";

 

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
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
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
