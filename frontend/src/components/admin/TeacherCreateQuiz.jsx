import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react"; // for delete icon
import Navbar from "../shared/Navbar";
import { useNavigate } from "react-router-dom";

const TeacherCreateQuiz = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [quizzes, setQuizzes] = useState([]);
    const navigate= useNavigate()
  // Fetch all quizzes
  const getAllQuizzes = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.get(
        "http://localhost:5000/api/v1/quize/quiz/teacher",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuizzes(res.data.allQuize);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  useEffect(() => {
    getAllQuizzes();
  }, [getAccessTokenSilently]);

  // Delete Quiz
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

      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (error) {
      console.error("Error deleting quiz:", error.response?.data || error);
    }
  };

  return (
    <>
    <Navbar/>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">📚 My Quizzes</h2>

        {quizzes.length === 0 ? (
          <p className="text-gray-500">No quizzes created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Button onClick={()=>navigate(`/admin/reasult/${quiz._id}`)}>view Reasult</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherCreateQuiz;
