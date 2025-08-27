import Quize from "../models/Quiz.model.js";
import Reasult from "../models/Result.model.js";
import User from "../models/User.model.js";
export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const userId = req.auth.sub;
    const student = await User.findOne({ auth0Id: userId });
    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found", success: false });
    }

    const quiz = await Quize.findById(quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ message: "Quiz not found", success: false });
    }

    const alreadyGiven = await Reasult.findOne({
      student: student._id,
      quiz: quiz._id,
    });
    if (alreadyGiven) {
      return res.status(400).json({
        message: "You have already attempted this quiz",
        success: false,
      });
    }

    let score = 0;
    const processedAnswers = quiz.questions.map((q) => {
      const found = answers.find((a) => String(a.questionId) === String(q._id));
      const selectedOption = found ? found.selectedOption : null;
      const isCorrect =
        selectedOption !== null && selectedOption === q.correctAnswer;

      if (isCorrect) score += quiz.marks;

      return {
        questionId: q._id,
        selectedOption,
        isCorrect,
      };
    });

    const result = await Reasult.create({
      quiz: quizId,
      student: student._id,
      score,
      answers: processedAnswers,
    });

    return res.status(201).json({
      message: " submitted successfully",
      result,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error while submitting result",
      success: false,
    });
  }
};

export const getReasultByQUizeId = async (req, res) => {
  try {
    const { quizeId } = req.params;
    if (!quizeId) {
      return res.status(404).json({
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
    if (user.role === "student") {
      return res.status(400).json({
        message: "Students are not allowed to view results",
        success: false,
      });
    }

    const allReasult = await Reasult.find({ quiz: quizeId })
      .sort({ createdAt: -1 })
      .populate(["student", "quiz"]);
    if (!allReasult) {
      return res.status(400).json({
        message: "No results found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Results fetched successfully",
      allReasult,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getInduvisualREasult = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const getReasult = await Reasult.find({ student: user._id }).populate({
      path: "quiz",
      populate: {
        path: "subject",
      },
    });

    if (!getReasult) {
      return res.status(400).json({
        message: "Result not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Result fetched successfully",
      getReasult,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const conpareCurrectAnsWrongAns = async (req, res) => {
  try {
    const { resultId } = req.params;

    // find result and populate quiz
    const result = await Reasult.findById(resultId).populate([
      "quiz",
      "student",
    ]);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const quiz = result.quiz;
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // map each question with student's answer & correctness
    const details = quiz.questions.map((q, index) => {
      const studentAnswer = result.answers[index]; // stored answer index
      const correctAnswer = q.correctAnswer; // correct option index

      return {
        questionText: q.questionText,
        options: q.options,
        studentAnswerIndex: studentAnswer,
        studentAnswer:
          studentAnswer !== null && studentAnswer !== undefined
            ? q.options[studentAnswer]
            : null,
        correctAnswerIndex: correctAnswer,
        correctAnswer: q.options[correctAnswer],
        isCorrect: studentAnswer === correctAnswer,
      };
    });
    const totalSoure = quiz.marks * quiz.totalQuestions;
    res.status(200).json({
      quizTitle: quiz.title,
      score: result.score,
      submittedAt: result.submittedAt,
      student: result.student,
      details,
      totalSoure,
    });
  } catch (error) {
    console.error("Error fetching result details:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching result details" });
  }
};

export const getAllQuizByUserId = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    const allQuiz = await Reasult.find({student: user._id });
    if (!allQuiz) {
      return res.status(400).json({
        message: "not get any quiz",
        success: false,
      });
    }
    return res.status(200).json({
      message: "quiz get successfully",
      allQuiz,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
