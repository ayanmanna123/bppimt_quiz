import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const GiveQuiz = () => {
  const { quizId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null); // ⏳ Timer in seconds
  const navigate = useNavigate();

  // 📌 Fetch quiz + start timer
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `http://localhost:5000/api/v1/quize/getquizId/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setQuiz(res.data.quize);

        // start timer (convert minutes to seconds if needed)
        const duration = parseInt(res.data.quize.time) * 60;
        setTimeLeft(duration);
      } catch (error) {
        console.log(error);
      }
    };

    fetchQuiz();
  }, [quizId, getAccessTokenSilently]);

  // ⏱ Countdown logic
  useEffect(() => {
    if (timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(); // auto submit when timer ends
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft !== null]);

  // ⚠️ Show warning toast at 30s
  useEffect(() => {
    if (timeLeft === 30) {
      toast.warning("⏳ Only 30 seconds left!");
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleAnswerChange = (questionId, optionIndexString) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndexString,
    }));
  };

  const handleNext = () => {
    if (quiz && currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const answerArray = quiz.questions.map((q) =>
        answers[q._id] !== undefined ? Number(answers[q._id]) : null
      );

      const res = await axios.post(
        "http://localhost:5000/api/v1/reasult/reasult/submite",
        {
          quizId,
          answers, // directly send { [questionId]: selectedOption }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message)
      navigate("/quiz");
    } catch (error) {
      toast.error(error.message);
      navigate("/quiz");
    }
  };

  if (!quiz) return <p className="text-center">Loading...</p>;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentSelected = answers[currentQuestion._id] ?? "";
  const isLast = currentIndex === questions.length - 1;
  const allAnswered = questions.every((q) => answers[q._id] !== undefined);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            {/* Timer Display */}
            <p className="text-red-500 font-semibold">
              Time Left: {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-3">
            <p className="font-medium">{currentQuestion.questionText}</p>

            <RadioGroup
              value={currentSelected}
              onValueChange={(value) =>
                handleAnswerChange(currentQuestion._id, value)
              }
            >
              {currentQuestion.options.map((option, idx) => {
                const id = `${currentQuestion._id}-${idx}`;
                return (
                  <div key={id} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(idx)} id={id} />
                    <Label htmlFor={id}>{option}</Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="w-28"
            >
              Previous
            </Button>

            {!isLast ? (
              <Button
                onClick={handleNext}
                disabled={currentSelected === ""}
                className="ml-auto w-28"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="ml-auto w-28"
              >
                Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GiveQuiz;
