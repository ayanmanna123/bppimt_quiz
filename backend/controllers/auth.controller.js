import User from "../models/User.model.js";

export const creatuser = async (req, res) => {
  try {
    const { fullname, email, picture, role, department, semester } = req.body;
    if (!fullname || !email || !picture || !role || !department || !semester) {
      return res.status(400).json({
        message: "all field are requried",
        success: false,
      });
    }
    const exiestuser = await User.findOne({ email: email });
    if (exiestuser) {
      return res.status(400).json({
        message: "user alresdy exiest",
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
        message: "sumthing is wrong",
        success: false,
      });
    }
    return res.status(200).json({
      message: "user creat succesfully",
      createrduser,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updatesem = async (req, res) => {
  try {
    const { sem } = req.body;
    const userId = req.auth.sub;
    let user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }
    const newuser = await User.updateOne({ semester: sem });
    if (!newuser) {
      return res.status(400).json({
        message: "somthing is wrong",
        success: false,
      });
    }

    user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "user update success fully",
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
      return res.status(404).json({ message: "User not found", success: false });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", success: false });
  }
};
