import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { ArrowLeft, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge";
import QuizCardSkeleton from "./QuizCardSkeleton";
import { Howl } from "howler";
import { toast } from "sonner";
const SubjectRelatedQuiz = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [quizzes, setQuizzes] = useState([]);
  const { subjectId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `http://localhost:5000/api/v1/quize/getSubjectId/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuizzes(res.data.allquiz || []);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, [getAccessTokenSilently, subjectId]);

  const handleDelete = async (quizId) => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
  
        const res = await axios.delete(
          "http://localhost:5000/api/v1/quize/delet/quiz",
          {
            data: { quizId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const sound = new Howl({
                src: ["/notification.wav"],
                volume: 0.7,
              });
              sound.play();
        toast.success(res.data.message);
        setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
      } catch (error) {
        toast.error(error.message);
      }
    };

  return (
    <>
      <Navbar />
      <div
        className="mx-4.5 max-w-fit hover:cursor-pointer"
        onClick={() => navigate("/Admin/subject")}
      >
        <ArrowLeft />
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">📚 My Quizzes</h2>

        {quizzes.length === 0 ? (
          <>
            <QuizCardSkeleton />
            <p className="text-gray-500">No quizzes created yet.</p>
          </>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {quizzes.map((quiz) => (
              <Card key={quiz._id} className="shadow-md rounded-2xl border">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">
                    {quiz.title}
                  </CardTitle>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(quiz._id)}
                    className="h-7 w-7"
                  >
                    <Trash2 className="w-0.5 h-0.5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">📅 {quiz.date}</Badge>
                    <Badge variant="outline">⏱ {quiz.time} mins</Badge>
                    <Badge variant="outline">⭐ {quiz.marks} Marks</Badge>
                    <Badge variant="outline">
                      ❓ {quiz.totalQuestions} Questions
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Created on: {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    onClick={() => navigate(`/admin/reasult/${quiz._id}`)}
                  >
                    view Reasult
                  </Button>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default SubjectRelatedQuiz;
