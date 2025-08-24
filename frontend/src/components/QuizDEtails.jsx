import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "./shared/Navbar";

const QuizDetails = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { subjectId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `http://localhost:5000/api/v1/quize/quiz/subject/${subjectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // backend response has `quizes`, not `allQuize`
        setQuizzes(res.data.quizes || []);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [subjectId, getAccessTokenSilently]);

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Quizzes</h2>

        {loading ? (
          <p>Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <p>No quizzes found for this subject.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {quizzes.map((quiz, i) => (
              <Card key={quiz._id || i} className="w-full">
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Total Questions: {quiz.questions?.length || 0}</p>
                </CardContent>
                <CardFooter>
                  <p>
                    Created At:{" "}
                    {quiz.createdAt
                      ? new Date(quiz.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default QuizDetails;
