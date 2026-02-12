import Quiz from "../models/Quiz.model.js";
import User from "../models/User.model.js";
import Result from "../models/Result.model.js";
import Subject from "../models/Subject.model.js";
import { sendProjectNotification } from "../utils/notification.util.js";

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
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
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

    // Notify Students
    try {
      const subjectDetails = await Subject.findById(subjectId);
      if (subjectDetails) {
        const students = await User.find({
          role: "student",
          department: subjectDetails.department,
          semester: subjectDetails.semester
        }).select("_id");

        const recipientIds = students.map(s => s._id);

        if (recipientIds.length > 0) {
          const io = req.app.get("io");
          await sendProjectNotification({
            recipientIds,
            senderId: user._id,
            message: `New Quiz: ${title} in ${subjectDetails.subjectName}`,
            type: "quiz",
            relatedId: newQuiz._id,
            onModel: "Quiz",
            url: `/quiz/${newQuiz._id}`, // Assuming a frontend route
            io
          });
        }
      }
    } catch (notifyError) {
      console.error("Error sending quiz creation notifications:", notifyError);
    }

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

    // Fetch all quizzes for the subject
    const quizzes = await Quiz.find({ subject: subjectId }).lean();

    if (!quizzes) {
      return res.status(400).json({
        message: "Something went wrong while fetching quizzes",
        success: false,
      });
    }

    // Fetch results for this user and these quizzes to check attempts
    const quizIds = quizzes.map(q => q._id);
    const results = await Result.find({
      student: user._id,
      quiz: { $in: quizIds }
    }).select('quiz');

    const attemptedQuizIds = new Set(results.map(r => r.quiz.toString()));

    // Add isAttempted flag to each quiz
    const quizzesWithStatus = quizzes.map(quiz => ({
      ...quiz,
      isAttempted: attemptedQuizIds.has(quiz._id.toString())
    }));

    return res.status(200).json({
      message: "Quizzes fetched successfully",
      quizes: quizzesWithStatus,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
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
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
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
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
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
    const total = await Quiz.find({});
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

export const getAllQuestionsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    if (!subjectId) {
      return res.status(400).json({
        message: "Subject ID is required",
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

    // Allow teachers (verified) to access this
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(403).json({
        message: "You are not verified",
        success: false,
      });
    }

    if (user.role === "student") {
      return res.status(403).json({
        message: "Access denied. Only teachers can view the question bank.",
        success: false,
      });
    }

    const quizzes = await Quiz.find({ subject: subjectId }).select("title questions");

    // Aggregate questions
    let allQuestions = [];
    quizzes.forEach(quiz => {
      if (quiz.questions && quiz.questions.length > 0) {
        const quizQuestions = quiz.questions.map(q => ({
          ...q.toObject(),
          quizTitle: quiz.title,
          quizId: quiz._id
        }));
        allQuestions = [...allQuestions, ...quizQuestions];
      }
    });

    return res.status(200).json({
      message: "Questions fetched successfully",
      count: allQuestions.length,
      questions: allQuestions,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching question bank:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { date, time } = req.body;

    if (!quizId) {
      return res.status(400).json({
        message: "Quiz ID is required",
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

    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(403).json({
        message: "You are not verified",
        success: false,
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
        success: false,
      });
    }

    // Check if the user is the creator of the quiz
    if (quiz.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this quiz",
        success: false,
      });
    }

    // Update fields
    if (date) quiz.date = date;
    if (time) quiz.time = time;

    // Delete all results associated with this quiz
    await Result.deleteMany({ quiz: quizId });

    await quiz.save();

    return res.status(200).json({
      message: "Quiz rescheduled successfully",
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return res.status(500).json({
      message: "Server error while updating quiz",
      success: false,
    });
  }
};
