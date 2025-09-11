import Quize from "../models/Quiz.model.js";
import Result from "../models/Result.model.js";
import Subject from "../models/Subject.model.js";
import User from "../models/User.model.js";
import redisClient from "../utils/redis.js";

export const progressroute = async (req, res) => {
  try {
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
    const cacheKey = `dashbordProgress:${user._id}`;
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      return res.status(200).json({
        source: "cache",
        data: JSON.parse(cachedUser),
      });
    }
    const results = await Result.find({ student: user._id });

    let totalAttempted = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    results.forEach((result) => {
      result.answers.forEach((ans) => {
        if (ans.selectedOption !== null) {
          totalAttempted++;
          if (ans.isCorrect) {
            correctAnswers++;
          } else {
            wrongAnswers++;
          }
        }
      });
    });

    const totalQuizzes = await Quize.countDocuments();

    const alldetails = {
      quizzesAttempted: results.length,
      totalQuizzes,
      totalAttempted,
      correctAnswers,
      wrongAnswers,
    };
    await redisClient.set(cacheKey, JSON.stringify(alldetails), { EX: 60 });

    return res.status(200).json({
      success: true,
      data: {
        quizzesAttempted: results.length,
        totalQuizzes,
        totalAttempted,
        correctAnswers,
        wrongAnswers,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const dashbordSubject = async (req, res) => {
  try {
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

    const { department, semester } = user;

    const allSubjects = await Subject.find({
      department,
      semester,
    });

    const subjectStats = await Promise.all(
      allSubjects.map(async (subject) => {
        const quizzes = await Quize.find({ subject: subject._id });
        const totalQuizzes = quizzes.length;

        const completed = await Result.countDocuments({
          student: user._id,
          quiz: { $in: quizzes.map((q) => q._id) },
        });

        return {
          subjectId: subject._id,
          subjectName: subject.subjectName,
          subjectCode: subject.subjectCode,
          totalQuizzes,
          completedQuizzes: completed,
          pendingQuizzes: totalQuizzes - completed,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: subjectStats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

export const userHighScoreQuizzes = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
        success: false,
      });
    }

    const results = await Result.find({ student: user._id }).populate("quiz");

    const quizMap = new Map();

    results.forEach((res) => {
      if (!res.quiz) return;

      const quizId = res.quiz._id.toString();

      if (!quizMap.has(quizId)) {
        quizMap.set(quizId, {
          quiz: res.quiz,
          scores: [],
        });
      }

      quizMap.get(quizId).scores.push(res.score);
    });

    const qualifiedQuizzes = [];

    for (let [quizId, data] of quizMap.entries()) {
      const { quiz, scores } = data;

      if (quiz.marks > 0 && quiz.totalQuestions > 0) {
        const totalMarks = quiz.marks * quiz.totalQuestions;
        const percentages = scores.map((s) => (s / totalMarks) * 100);
        const hasNinety = percentages.some((p) => p >= 90);

        if (hasNinety) {
          const userHighestScore = Math.max(...scores);
          const userHighestPercentage = Math.max(...percentages);

          const globalResult = await Result.find({ quiz: quiz._id });
          const globalHighestScore = Math.max(
            ...globalResult.map((r) => r.score)
          );

          qualifiedQuizzes.push({
            ...quiz.toObject(),
            highestScore: userHighestScore,
            highestPercentage: userHighestPercentage,
            isUserTopper: userHighestScore === globalHighestScore,
          });
        }
      }
    }

    const populatedQuizzes = await Quize.find({
      _id: { $in: qualifiedQuizzes.map((q) => q._id) },
    }).populate("subject");

    const response = populatedQuizzes.map((quiz) => {
      const found = qualifiedQuizzes.find(
        (q) => q._id.toString() === quiz._id.toString()
      );
      return {
        ...quiz.toObject(),
        highestScore: found?.highestScore || 0,
        highestPercentage: found?.highestPercentage || 0,
        isUserTopper: found?.isUserTopper || false,
      };
    });

    return res.status(200).json({
      success: true,
      count: response.length,
      quizzes: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const userStreakRoute = async (req, res) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(404).json({
        message: "You Not Verified",
        success: false,
      });
    }

    // ✅ Get all results for this user
    const results = await Result.find({ student: user._id });

    // ✅ Group by date (YYYY-MM-DD)
    const streakMap = new Map();

    results.forEach((res) => {
      const date = res.submittedAt.toISOString().split("T")[0]; // keep only YYYY-MM-DD
      if (!streakMap.has(date)) {
        streakMap.set(date, 0);
      }
      streakMap.set(date, streakMap.get(date) + 1);
    });

    // ✅ Convert to array
    const streak = Array.from(streakMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return res.status(200).json({
      success: true,
      streak,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
export const calender = async (req, res) => {
  try {
    const { department, semester } = req.query; // ✅ use query instead of body

    const userId = req.auth.sub;
    const user = await User.findOne({ auth0Id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verified === "pending" || user.verified === "reject") {
      return res.status(403).json({
        success: false,
        message: "You are not verified",
      });
    }

    const subjects = await Subject.find({ department, semester }).select("_id");

    if (!subjects || subjects.length === 0) {
      return res.status(404).json({ message: "No subjects found" });
    }

    const subjectIds = subjects.map((sub) => sub._id);

    const quizzes = await Quize.find({ subject: { $in: subjectIds } })
      .populate("subject", "subjectName subjectCode department semester")
      .populate("createdBy", "fullname email");

    res.status(200).json({ total: quizzes.length, quizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
