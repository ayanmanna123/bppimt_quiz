import Quize from "../models/Quiz.model.js";
import Reasult from "../models/Result.model.js";
import User from "../models/User.model.js";

export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const userId = req.auth.sub;
    const student = await User.findOne({ auth0Id: userId });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        success: false,
      });
    }

    const quiz = await Quize.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
        success: false,
      });
    }
    const alreadyGiven = await Reasult.findOne({
      student: student._id,
      quiz: quiz._id,
    });

    if (alreadyGiven) {
      return res.status(400).json({
        message: "You already attempted this quiz",
        success: false,
      });
    }

    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score += quiz.marks;
      }
    });

    const newResult = {
      quiz: quizId,
      student: student._id,
      score,
    };

    const reasult = await Reasult.create(newResult);

    return res.status(201).json({
      message: "Result submitted successfully",
      reasult,

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

export const getReasultByQUizeId = async (req, res) => {
  try {
    const { quizeId } = req.body;
    if (!quizeId) {
      return res.status(404).json({
        message: "quize id is requried",
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
        message: "you not able to see reasult",
        success: false,
      });
    }

    const allReasult = await Reasult.find({ quiz: quizeId })
      .sort({ createdAt: -1 })
      .populate({ path: "student" });
    if (!allReasult) {
      return res.status(400).json({
        message: "no reasult found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "reasult get successfully",
      allReasult,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getInduvisualREasult = async (req, res) => {
  try {
    const {quizeId} = req.body;
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
        message: "you not able to see reasult",
        success: false,
      });
    }
    const getReasult = await Reasult.findOne({student: user._id , quiz: quizeId})
    if(!getReasult){
        return res.status(400).json({
            message:"reasult not found",
            success:false
        })
    }
    return res.status(200).json({
        message:"reasult get successFully",
        getReasult,
        success:true
    })
  } catch (error) {
    console.log(error);
  }
};
