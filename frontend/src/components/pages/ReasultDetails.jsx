import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "../shared/Navbar";
import { motion } from "framer-motion";

const ReasultDetails = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { resultId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `http://localhost:5000/api/v1/reasult/result/details/${resultId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResult(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    getUserDetails();
  }, [getAccessTokenSilently, resultId]);

  if (!result) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-6">
        {/* Quiz Header */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              {result.quizTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <span>Name: {result.student.fullname}</span>
            <p className="text-lg font-semibold">
              Score:{" "}
              <span className="text-blue-600">
                {result.score}/{result.totalSoure}
              </span>
            </p>
            <Badge variant="secondary">
              Submitted: {new Date(result.submittedAt).toLocaleString()}
            </Badge>
          </CardContent>
        </Card>

        {/* Question Details */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {result.details.map((q, index) => {
            const studentAnsIndex = q.studentAnswerIndex?.selectedOption; // ✅ updated
            const isCorrect = q.isCorrect;

            return (
              <Card
                key={index}
                className={`border-2 ${
                  isCorrect ? "border-green-500" : "border-red-500"
                } shadow-md`}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Q{index + 1}. {q.questionText}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {q.options.map((opt, i) => {
                      const isStudentAns = i === studentAnsIndex;
                      const isCorrectAns = i === q.correctAnswerIndex;

                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-md border ${
                            isCorrectAns
                              ? "border-green-500 bg-green-100"
                              : isStudentAns && !isCorrect
                              ? "border-red-500 bg-red-100"
                              : "border-gray-300"
                          }`}
                        >
                          {opt}
                          {isCorrectAns && (
                            <Badge className="ml-2 bg-green-500 text-white">
                              Correct
                            </Badge>
                          )}
                          {isStudentAns && !isCorrect && (
                            <Badge className="ml-2 bg-red-500 text-white">
                              Your Answer
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      </div>
    </>
  );
};

export default ReasultDetails;
