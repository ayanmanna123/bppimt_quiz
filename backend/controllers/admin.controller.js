import Subject from "../models/Subject.model.js";
import User from "../models/User.model.js";

export const subjectByQuiry = async (req, res) => {
  try {
    const { depName } = req.params;
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found sd",
        success: false,
      });
    }
    if (user.role !== "admin") {
      return res.status(400).json({
        message: "you are not admin",
        success: false,
      });
    }
    const subjectByQuiry = await Subject.find({ department: depName });
    if (!subjectByQuiry) {
      return res.status(400).json({
        message: "subject not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "subject get success fully",
      subjectByQuiry,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const unAuthorize = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found sd",
        success: false,
      });
    }
    if (user.role !== "admin") {
      return res.status(400).json({
        message: "you are not admin",
        success: false,
      });
    }
    const allUnuser = await User.find({ verified: "pending" });
    if (allUnuser.length === 0 || !allUnuser) {
      return res.status(404).json({
        message: "no one can un authorize",
        success: false,
      });
    }
    return res.status(200).json({
      message: "those user are un authorized",
      allUnuser,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const verifyed = async (req, res) => {
  try {
    const { unveryfyuser ,status } = req.body;

    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found sd",
        success: false,
      });
    }
    if (user.role !== "admin") {
      return res.status(400).json({
        message: "you are not admin",
        success: false,
      });
    }
    const unauth = await User.findOne({ _id: unveryfyuser });
    if (!unauth) {
      return res.status(400).json({
        message: "user not found",
        success: false,
      });
    }
    unauth.verified = status;
    const newUser = await unauth.save();
    return res.status(200).json({
      message: "success fully",
      newUser,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

