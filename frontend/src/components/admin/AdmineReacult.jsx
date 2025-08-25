import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { ArrowLeft } from "lucide-react";

const AdmineReacult = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { quizeId } = useParams();
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `http://localhost:5000/api/v1/reasult/get/allReasult/${quizeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResults(res.data.allReasult || []);
      } catch (error) {
        console.log("Error fetching results:", error);
      }
    };
    fetchResults();
  }, [getAccessTokenSilently, quizeId]);

  // ✅ Helper to check if submission is on time
  const checkSubmissionStatus = (quiz, submittedAt) => {
    const quizEnd = new Date(quiz.date);
    quizEnd.setMinutes(quizEnd.getMinutes() + parseInt(quiz.time)); // add quiz duration

    const submittedDate = new Date(submittedAt);

    return submittedDate <= quizEnd ? "onTime" : "late";
  };

  return (
    <>
      <Navbar />
      <div
        className="mx-4.5 max-w-fit hover:cursor-pointer"
        onClick={() => navigate("/admin/allquiz")}
      >
        <ArrowLeft />
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>

        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">#</th>
                <th className="border border-gray-300 px-4 py-2">Student Name</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Role</th>
                <th className="border border-gray-300 px-4 py-2">Score</th>
                <th className="border border-gray-300 px-4 py-2">Answers</th>
                <th className="border border-gray-300 px-4 py-2">Submitted At</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((res, index) => {
                  const status = checkSubmissionStatus(res.quiz, res.submittedAt);

                  return (
                    
                    <tr
                      key={res._id}
                      className={`hover:bg-gray-50 ${
                        status === "onTime"
                          ? "border-green-500"
                          : "border-red-500"
                      } border-2`}
                        onClick={()=>navigate(`/reasult/details/${res?._id}`)}
                    >
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {res.student?.fullname || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {res.student?.email || "N/A"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {res.student?.role || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {res.score}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {res.answers && res.answers.length > 0
                          ? res.answers.join(", ")
                          : "—"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(res.submittedAt).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {status === "onTime" ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                            On Time
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                            Late
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-4 text-gray-500 border"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdmineReacult;
