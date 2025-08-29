import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "../shared/Navbar";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import jsPDF from "jspdf";
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

  const generateCertificate = () => {
    if (!result) return;

    const doc = new jsPDF("landscape", "pt", "a4");  

    
    const img = new Image();
    img.src = "/certificate4.jpg"; 

    img.onload = () => {
       
      doc.addImage(
        img,
        "JPG",
        0,
        0,
        doc.internal.pageSize.getWidth(),
        doc.internal.pageSize.getHeight()
      );

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `Result ID: ${resultId}`,
        pageWidth - 80,
        60,
        {
          align: "right",
        }
      );
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(40, 40, 40);
      doc.text(result.student.fullname, pageWidth / 2, 280, {
        align: "center",
      });

       
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);

      const certificationLines = [
        "appeared in the Mock Test Examination conducted by",
        "B. P. Poddar Institute of Management & Technology.",
        "",
        `The candidate has demonstrated commendable performance in`,
        ` ${result.quizTitle},`, // subject line (we’ll bold this one)
        `securing an overall score of ${result.score}/${result.totalSoure}.`,
        "",
        "This achievement reflects the student's dedication, knowledge,",
      ];

      let yPosition = 350;
      const lineHeight = 22;

      certificationLines.forEach((line) => {
        if (line === "") {
          yPosition += lineHeight / 2;
        } else {
          if (
            line.includes("B. P. Poddar Institute of Management & Technology")
          ) {
            doc.setFont("helvetica", "bold");
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
            doc.setFont("helvetica", "normal");
          } else if (line.includes(result.quizTitle)) {
            // Bold subject name
            doc.setFont("helvetica", "bold");
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
            doc.setFont("helvetica", "normal");
          } else {
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
          }
          yPosition += lineHeight;
        }
      });

     
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text(
        `Date: ${new Date().toLocaleDateString()}`,
        200,
        pageHeight - 80
      );

       
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text(
        `Date: ${new Date().toLocaleDateString()}`,
        200,
        pageHeight - 80
      );

      const percentage = (result.score / result.totalSoure) * 100;
      let grade = "F";
      let gradeColor = [255, 0, 0];

      if (percentage >= 90) {
        grade = "A+";
        gradeColor = [0, 128, 0];
      } else if (percentage >= 80) {
        grade = "A";
        gradeColor = [0, 128, 0];
      } else if (percentage >= 70) {
        grade = "B";
        gradeColor = [255, 165, 0];
      } else if (percentage >= 60) {
        grade = "C";
        gradeColor = [255, 165, 0];
      } else if (percentage >= 50) {
        grade = "D";
        gradeColor = [255, 0, 0];
      }

      doc.setTextColor(...gradeColor);
      doc.text(`Grade: ${grade}`, pageWidth / 2, yPosition + 30, {
        align: "center",
      });

      doc.save(`${result.student.fullname}_Certificate.pdf`);
    };

    img.onerror = () => {
     
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setDrawColor(200, 0, 0);
      doc.setLineWidth(3);
      doc.rect(50, 50, pageWidth - 100, pageHeight - 100);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.setTextColor(200, 0, 0);
      doc.text("CERTIFICATE", pageWidth / 2, 130, { align: "center" });

      doc.setFontSize(24);
      doc.text("OF ACHIEVEMENT", pageWidth / 2, 160, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(40, 40, 40);
      doc.text(result.student.fullname, pageWidth / 2, 280, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);

      const certificationLines = [
        "This is to certify that the above-named student has successfully",
        "appeared in the Mock Test Examination conducted by",
        "B. P. Poddar Institute of Management & Technology.",
        "",
        `The candidate has demonstrated commendable performance in ${result.quizTitle},`,
        `securing an overall score of ${result.score}/${result.totalScore}.`,
        "",
        "This achievement reflects the student's dedication, knowledge,",
        "and readiness for upcoming academic evaluations.",
      ];

      let yPosition = 350;
      const lineHeight = 22;

      certificationLines.forEach((line) => {
        if (line === "") {
          yPosition += lineHeight / 2;
        } else {
          if (
            line.includes(
              "B. P. Poddar Institute of Management & Technology"
            ) ||
            line.includes(result.quizTitle)
          ) {
            doc.setFont("helvetica", "bold");
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
            doc.setFont("helvetica", "normal");
          } else {
            doc.text(line, pageWidth / 2, yPosition, { align: "center" });
          }
          yPosition += lineHeight;
        }
      });

      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text(
        `Date: ${new Date().toLocaleDateString()}`,
        200,
        pageHeight - 80
      );

     
      const percentage = (result.score / result.totalScore) * 100;
      let grade = "F";
      let gradeColor = [255, 0, 0];

      if (percentage >= 90) {
        grade = "A+";
        gradeColor = [0, 128, 0];
      } else if (percentage >= 80) {
        grade = "A";
        gradeColor = [0, 128, 0];
      } else if (percentage >= 70) {
        grade = "B";
        gradeColor = [255, 165, 0];
      } else if (percentage >= 60) {
        grade = "C";
        gradeColor = [255, 165, 0];
      } else if (percentage >= 50) {
        grade = "D";
        gradeColor = [255, 0, 0];
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...gradeColor);
      doc.text(`Grade: ${grade}`, pageWidth / 2, yPosition + 30, {
        align: "center",
      });

      doc.save(`${result.student.fullname}_Certificate.pdf`);
    };
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-6">
         
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">
                {result.quizTitle}
              </CardTitle>
              <Button
                className="bg-green-500 hover:bg-green-600 cursor-pointer"
                onClick={generateCertificate}
              >
                Get Certificate
              </Button>
            </div>
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

      
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {result.details.map((q, index) => {
            const studentAnsIndex = q.studentAnswerIndex?.selectedOption;  
            const isCorrect = q.studentAnswerIndex?.isCorrect;

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
