import Quiz from "../models/Quiz.model.js";
import User from "../models/User.model.js";

export const createQuestion = async (req, res) => {
  try {
    const { title, questions, date, time, marks, totalQuestions } = req.body;
    const { subjectId } = req.params;
    if (
      !time ||
      !marks ||
      !date ||
      !totalQuestions ||
      !title ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message:
          "All fields are required, and questions must be a non-empty array",
        success: false,
      });
    }

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
        message: "You are not allowed to create quizzes",
        success: false,
      });
    }

    const tempQuiz = {
      title,
      subject: subjectId,
      createdBy: user._id,
      questions,
      time,
      date,
      marks,
      totalQuestions,
    };

    const newQuiz = await Quiz.create(tempQuiz);

    return res.status(201).json({
      message: "Quiz created successfully",
      newQuiz,
      success: true,
    });
  } catch (error) {
    console.error("Create Quiz Error:", error);
    return res.status(500).json({
      message: "Server error while creating quiz",
      success: false,
    });
  }
};

export const getQuizeBySubJectId = async (req, res) => {
  try {
    const { subjectId } = req.params;
    if (!subjectId) {
      return res.status(400).json({
        message: "Subject ID is required",
        success: false,
      });
    }
    const quizes = await Quiz.find({ subject: subjectId });
    if (!quizes) {
      return res.status(400).json({
        message: "Something went wrong while fetching quizzes",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Quizzes fetched successfully",
      quizes,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getQuizeByTeacherId = async (req, res) => {
  try {
    const userId = req.auth.sub;
    if (!userId) {
      return res.status(400).json({
        message: "Unauthorized user",
        success: false,
      });
    }
    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.role === "student") {
      return res.status(400).json({
        message: "Only teachers can access this resource",
        success: false,
      });
    }
    const allQuize = await Quiz.find({ createdBy: user._id });
    return res.status(200).json({
      message: "Quizzes fetched successfully",
      allQuize,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deletQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;
    if (!quizId) {
      return res.status(400).json({
        message: "Quiz ID is required for deletion",
        success: false,
      });
    }
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.role === "student") {
      return res.status(400).json({
        message: "You are not allowed to delete quizzes",
        success: false,
      });
    }
    const quizeDelet = await Quiz.deleteOne({ _id: quizId });
    return res.status(200).json({
      message: "Quiz deleted successfully",
      quizeDelet,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getQuizeByQuizeId = async (req, res) => {
  try {
    const { quizId } = req.params;
    if (!quizId) {
      return res.status(400).json({
        message: "Quiz ID is required",
        success: false,
      });
    }
    const quize = await Quiz.findOne({ _id: quizId });
    if (!quize) {
      return res.status(400).json({
        message: "Quiz not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Quiz found successfully",
      quize,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getquizBysubjectId = async (req, res) => {
  try {
    const { subjectId } = req.params;
    if (!subjectId) {
      return res.status(400).json({
        message: "subject id is required",
        success: false,
      });
    }
    const allquiz = await Quiz.find({ subject: subjectId });
    if (!allquiz) {
      return res.status(400).json({
        message: "quize not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "quize get successfully",
      allquiz,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getquizlength = async (req, res) => {
  try {
    const total =await Quiz.find({});
    if (!total) {
      return res.status({
        message: "quiz not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "quize get successfully",

      length: total.length,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
