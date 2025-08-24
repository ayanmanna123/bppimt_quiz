import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const GiveQuiz = () => {
  const { quizId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // { [questionId]: "0" | "1" | ... }
  const [currentIndex, setCurrentIndex] = useState(0);

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
      } catch (error) {
        console.log(error);
      }
    };

    fetchQuiz();
  }, [quizId, getAccessTokenSilently]);

  const handleAnswerChange = (questionId, optionIndexString) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndexString, // store as string for shadcn RadioGroup
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

      // transform answers: map questions in order
      const answerArray = quiz.questions.map((q) =>
        answers[q._id] !== undefined ? Number(answers[q._id]) : null
      );

      const res = await axios.post(
        "http://localhost:5000/api/v1/reasult/reasult/submite",
        {
          quizId,
          answers: answerArray,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Submit response:", res.data);
      alert(res.data.message || "Submitted successfully!");
    } catch (error) {
      console.error("Submit error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit quiz. Please try again."
      );
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
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-3">
            <p className="font-medium">{currentQuestion.questionText}</p>

            <RadioGroup
              // shadcn wants string value
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

          {/* Controls */}
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
