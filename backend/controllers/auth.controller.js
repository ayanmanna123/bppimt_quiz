import User from "../models/User.model.js";

export const creatuser = async (req, res) => {
  try {
    const { fullname, email, picture, role, department, semester } = req.body;
    if (!fullname || !email || !picture || !role || !department || !semester) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    const exiestuser = await User.findOne({ email: email });
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
      email,
      picture,
      role,
      department,
      semester,
    };
    const createrduser = await User.create(newuser);
    if (!createrduser) {
      return res.status(400).json({
        message: "Something went wrong while creating user",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User created successfully",
      createrduser,
      success: true,
    });
  } catch (error) {
    console.log(error);
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
