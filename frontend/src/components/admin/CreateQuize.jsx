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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);
      const sound = new Howl({
        src: ["/notification.wav"],
        volume: 0.7,
      });
      sound.play();

      navigate("/Admin/subject");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const [loadingAI, setLoadingAI] = useState(false);
  const autoGenerateQuestions = async () => {
    setLoadingAI(true);
    try {
      const aiQuestions = await generateQuizQuestions(
        title || "General Knowledge",
        totalQuestions || 5
      );

      console.log("Raw AI Questions:", aiQuestions);

      const formatted = transformQuestions(aiQuestions);
      console.log(formatted)
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

  // ✅ Add this function above your component
  const transformQuestions = (rawQuestions) => {
    return rawQuestions.map((q) => {
      // find index of correct answer
      const correctIndex = q.options.findIndex(
        (opt) => opt.toLowerCase().trim() === q.answer?.toLowerCase().trim()
      );

      return {
        questionText: q.question || q.questionText, // normalize field name
        options: q.options,
        correctAnswer: correctIndex >= 0 ? correctIndex : 0, // default to 0 if not found
      };
    });
  };

  return (
    <>
      <Navbar />
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

          {/* 🔹 Generate Button */}
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
              <div key={i} className="border border-gray-400 p-3 mb-4 rounded">
                <span className="font-semibold">Question {i + 1}</span>
                <ValidatedInput
                  placeholder="Question"
                  value={q.questionText}
                  onChange={(e) =>
                    handleQuestionChange(i, "questionText", e.target.value)
                  }
                />
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
          </div>

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
