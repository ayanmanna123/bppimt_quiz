import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "./shared/Navbar";
import { toast } from "sonner";

const AllQuiz = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { subjectId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navegate = useNavigate();
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

        setQuizzes(res.data.quizes || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [subjectId, getAccessTokenSilently]);

  const getRemainingTime = (targetDate) => {
    if (!targetDate) return "N/A";

    const now = new Date();
    const endDate = new Date(targetDate);

    const diffMs = endDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs > 0) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`;
    } else {
      return `${Math.abs(diffDays)} day${
        Math.abs(diffDays) !== 1 ? "s" : ""
      } ago`;
    }
  };

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
              <div
                key={quiz?._id || i}
                onClick={() => navegate(`/quiz/page/${quiz._id}`)}
              >
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className={"font-bold text-2xl"}>
                      {quiz?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Total Questions: {quiz?.questions?.length || 0}</p>
                    <p>submit Date: {quiz?.date} </p>
                    <p>total time: {quiz?.time}</p>
                  </CardContent>
                  <CardFooter>
                    <div>
                      <div>
                        <p>
                          Created:{" "}
                          {quiz?.createdAt
                            ? new Date(quiz?.createdAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>

                      <div>
                        <Badge
                          className={
                            new Date(quiz.date) > new Date()
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          }
                        >
                          {getRemainingTime(quiz?.date)}
                        </Badge>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AllQuiz;
