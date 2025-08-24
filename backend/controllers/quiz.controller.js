import Quiz from "../models/Quiz.model.js";
import User from "../models/User.model.js";

export const createQuestion = async (req, res) => {
  try {
    const { subject, questions, date, time, marks, totalQuestions } = req.body;

    if (
      !subject ||
      !time ||
      !marks ||
      !date ||
      !totalQuestions ||
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
      subject,
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
        message: "subject Id is required",
        success: false,
      });
    }
    const quizes = await Quiz.find({ subject: subjectId });
    if (!quizes) {
      return res.status(400).json({
        message: "somthing is wrong",
        success: false,
      });
    }
    return res.status(200).json({
      message: "quiz is get success fully",
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
        message: "unauthorize user",
        success: false,
      });
    }
    const user = await User.findOne({ auth0Id: userId });
    if (!user) {
      return res.status(400).json({
        message: "user is not define",
        success: false,
      });
    }
    if (user.role === "student") {
      return res.status(400).json({
        message: "you not teacher",
        success: false,
      });
    }
    const allQuize = await Quiz.find({ createdBy: user._id });
    return res.status(200).json({
      message: "quiz get success fully",
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
        message: "quize is required for delete",
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
        message: "you not able to delete any quize",
        success: false,
      });
    }
    const quizeDelet = await Quiz.deleteOne({ _id: quizId });
    return res.status(200).json({
      message: "quize dwlwt sccessfully",
      quizeDelet,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
