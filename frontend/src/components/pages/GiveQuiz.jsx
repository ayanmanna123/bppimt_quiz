import axios from "axios";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Howl } from "howler";

const GiveQuiz = ({ tabSwitchCount }) => {
  const { quizId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Add ref to track if quiz has been submitted
  const hasSubmitted = useRef(false);
  // Keep track of latest answers using ref
  const answersRef = useRef({});

  // Update answersRef whenever answers state changes
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

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

        const duration = parseInt(res.data.quize.time) * 60;
        setTimeLeft(duration);
      } catch (error) {
        console.log(error);
      }
    };

    fetchQuiz();
  }, [quizId, getAccessTokenSilently]);

  // ⏱ Timer effect
  useEffect(() => {
    if (timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft !== null]);

  // Separate effect to handle auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !hasSubmitted.current && !isSubmitting) {
      handleSubmit();
    }
  }, [timeLeft]);

  // ⚠️ Warning for last 30s
  useEffect(() => {
    if (timeLeft === 30) {
      toast.warning("⏳ Only 30 seconds left!");
    }
  }, [timeLeft]);

  // 🚨 Auto-submit when tab switch count > 5
  useEffect(() => {
    if (tabSwitchCount >= 5 && !hasSubmitted.current && !isSubmitting) {
      toast.error("🚫 Too many tab switches! Quiz will be auto-submitted.");
      handleSubmit();
    }
    console.log(tabSwitchCount);
  }, [tabSwitchCount]);

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

  const handleSubmit = useCallback(async () => {
    // Prevent multiple submissions
    if (hasSubmitted.current || isSubmitting) {
      return;
    }

    hasSubmitted.current = true;
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      // Use the ref to get the latest answers, even in async operations
      const latestAnswers = answersRef.current;

      // Create answer array directly from latest answers
      const answerArray = Object.entries(latestAnswers).map(
        ([questionId, option]) => ({
          questionId,
          selectedOption: option !== "" ? Number(option) : null,
        })
      );

      console.log("Submitting answers:", answerArray); // Debug log
      console.log("Total answers:", answerArray.length); // Debug log

      const res = await axios.post(
        "http://localhost:5000/api/v1/reasult/reasult/submite",
        {
          quizId,
          answers: answerArray,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);
      const sound = new Howl({
        src: ["/notification.wav"],
        volume: 0.7,
      });
      sound.play();
      navigate("/quiz");
    } catch (error) {
      console.error("Submit error:", error); // Debug log
      toast.error(error.response?.data?.message || "Error submitting quiz");
      navigate("/quiz");
    } finally {
      setIsSubmitting(false);
    }
  }, [getAccessTokenSilently, quizId, navigate, isSubmitting]);

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
              disabled={currentIndex === 0 || isSubmitting}
              className="w-28"
            >
              Previous
            </Button>

            {!isLast ? (
              <Button
                onClick={handleNext}
                disabled={currentSelected === "" || isSubmitting}
                className="ml-auto w-28"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className="ml-auto w-28"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GiveQuiz;
