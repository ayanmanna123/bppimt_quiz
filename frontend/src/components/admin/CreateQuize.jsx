import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../shared/Navbar";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Howl } from "howler";
import { generateQuizQuestions } from "../services/geminiService";

const ValidatedInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`border-2 p-2 w-full mb-2 ${
      value && value.toString().trim() ? "border-green-500" : "border-gray-300"
    } ${className}`}
  />
);

const CreateQuize = () => {
  const { subjectId } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [marks, setMarks] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === "questionText") {
      updated[index].questionText = value;
    } else if (field.startsWith("option")) {
      const optionIndex = parseInt(field.split("-")[1]);
      updated[index].options[optionIndex] = value;
    } else if (field === "correctAnswer") {
      updated[index].correctAnswer = parseInt(value);
    }
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.post(
        `http://localhost:5000/api/v1/quize/creatquiz/${subjectId}`,
        {
          title,
          questions,
          date,
          time,
          marks,
          totalQuestions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data.message);
      const sound = new Howl({ src: ["/notification.wav"], volume: 0.7 });
      sound.play();

      navigate("/Admin/subject");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Transform AI Questions into your structure
  const transformQuestions = (rawQuestions) =>
    rawQuestions.map((q) => {
      const correctIndex = q.options.findIndex(
        (opt) => opt.toLowerCase().trim() === q.answer?.toLowerCase().trim()
      );
      return {
        questionText: q.question || q.questionText,
        options: q.options,
        correctAnswer: correctIndex >= 0 ? correctIndex : 0,
      };
    });

  const autoGenerateQuestions = async () => {
    setLoadingAI(true);
    try {
      const aiQuestions = await generateQuizQuestions(
        title || "General Knowledge",
        totalQuestions || 5
      );

      const formatted = transformQuestions(aiQuestions);
      if (formatted.length > 0) {
        setQuestions(formatted);
        toast.success("AI generated questions added!");
      } else {
        toast.error("No questions generated.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate questions.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <>
      <Navbar />
      {/* Back Button */}
      <div
        className="mx-4.5 max-w-fit hover:cursor-pointer"
        onClick={() => navigate("/")}
      >
        <ArrowLeft />
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Create Quiz</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Quiz Details */}
          <ValidatedInput
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <ValidatedInput
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <ValidatedInput
            type="number"
            placeholder="Time (minutes)"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <ValidatedInput
            type="number"
            placeholder="Marks"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
          />
          <ValidatedInput
            type="number"
            placeholder="Total Questions"
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(e.target.value)}
          />

          {/* 🔹 AI Generate Button */}
          <button
            type="button"
            onClick={autoGenerateQuestions}
            disabled={loadingAI}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            {loadingAI ? "Generating..." : "Generate with AI"}
          </button>

          {/* Questions Section */}
          <div>
            <h3 className="font-semibold mb-2">Questions</h3>
            {questions.map((q, i) => (
              <div
                key={i}
                className="border border-gray-400 p-3 mb-4 rounded relative"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Question {i + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(i)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <ValidatedInput
                  placeholder="Question"
                  value={q.questionText}
                  onChange={(e) =>
                    handleQuestionChange(i, "questionText", e.target.value)
                  }
                />

                {/* Options */}
                {q.options.map((opt, j) => (
                  <ValidatedInput
                    key={j}
                    placeholder={`Option ${j + 1}`}
                    value={opt}
                    onChange={(e) =>
                      handleQuestionChange(i, `option-${j}`, e.target.value)
                    }
                  />
                ))}

                {/* Correct Answer */}
                <label className="block mt-2">
                  Correct Answer (1–4):
                  <ValidatedInput
                    type="number"
                    min="1"
                    max="4"
                    value={q.correctAnswer + 1}
                    onChange={(e) =>
                      handleQuestionChange(
                        i,
                        "correctAnswer",
                        parseInt(e.target.value, 10) - 1
                      )
                    }
                  />
                </label>
              </div>
            ))}

            {/* Add Question Button */}
            <button
              type="button"
              onClick={addQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Add Question
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded font-semibold"
          >
            Create Quiz
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateQuize;
