import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { ArrowLeft, Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SchlitonSubject from "./SchlitonSubject";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Matching gradient styles from Quiz component
const bgGradients = [
  "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400", // Light gray gradient
  "bg-gradient-to-br from-emerald-300 via-teal-400 to-green-500", // Teal/green gradient
  "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600", // Blue gradient
  "bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600", // Dark gray gradient
  "bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500", // Yellow/orange gradient
  "bg-gradient-to-br from-pink-300 via-rose-400 to-pink-500", // Pink gradient
];

const Subject = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          "http://localhost:5000/api/v1/subject/teacher/subject",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSubjects(res.data.allSubject);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSubjects();
  }, [getAccessTokenSilently]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="p-2">
          <div className="flex justify-between items-center mb-8">
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </div>

            <Button
              onClick={() => navigate("/admin/create/subject")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Create New Subject
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Subjects</h1>
          <p className="text-gray-600 mb-8">
            Manage your course subjects and quizzes
          </p>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6">
          {subjects.length === 0 ? (
            <SchlitonSubject />
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {subjects.map((subj, i) => {
                const bgClass = bgGradients[i % bgGradients.length];

                return (
                  <motion.div
                    key={subj._id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="cursor-pointer transform hover:scale-105 transition-all duration-300"
                  >
                    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white border-0 rounded-xl h-full">
                      {/* Gradient header section */}
                      <div
                        className={`h-40 ${bgClass} relative overflow-hidden`}
                      >
                        {/* Geometric pattern overlay */}
                        <div className="absolute inset-0 opacity-20">
                          <svg
                            width="100%"
                            height="100%"
                            className="w-full h-full"
                          >
                            <defs>
                              <pattern
                                id={`pattern-${i}`}
                                x="0"
                                y="0"
                                width="40"
                                height="40"
                                patternUnits="userSpaceOnUse"
                              >
                                <rect
                                  width="20"
                                  height="20"
                                  fill="rgba(255,255,255,0.1)"
                                />
                                <rect
                                  x="20"
                                  y="20"
                                  width="20"
                                  height="20"
                                  fill="rgba(255,255,255,0.1)"
                                />
                              </pattern>
                            </defs>
                            <rect
                              width="100%"
                              height="100%"
                              fill={`url(#pattern-${i})`}
                            />
                          </svg>
                        </div>

                        {/* Subject info overlay */}
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <CardTitle className="text-xl font-bold drop-shadow-lg mb-1 leading-tight">
                            {subj?.subjectName}
                          </CardTitle>
                          <p className="text-sm opacity-90 drop-shadow">
                            {subj?.description || "Course Management"}
                          </p>
                        </div>
                      </div>

                      {/* Course details section */}
                      <CardContent className="p-4 flex-grow">
                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                          <p>
                            <span className="font-medium">Department:</span>{" "}
                            {subj?.department}
                          </p>
                          <p>
                            <span className="font-medium">Semester:</span>{" "}
                            {subj?.semester}
                          </p>
                        </div>
                      </CardContent>

                      {/* Action buttons section */}
                      <CardFooter className="p-4 pt-0 space-y-3">
                        <div className="w-full">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/createQuize/${subj._id}`);
                            }}
                            className="w-full my-2.5 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2 transition-all duration-200"
                          >
                            <Plus className="w-4 h-4" />
                            Create Quiz
                          </Button>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/Admin/subject/quiz/${subj._id}`);
                            }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            View Quizzes
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Subject;
