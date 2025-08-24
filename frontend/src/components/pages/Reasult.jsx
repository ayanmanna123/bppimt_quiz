import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../shared/Navbar";
import { useNavigate } from "react-router-dom";

const Reasult = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [reasults, setReasults] = useState([]);
    const navigate = useNavigate();
  useEffect(() => {
    const getReasult = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          "http://localhost:5000/api/v1/reasult/get/reasult/student",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res.data.getReasult);
        setReasults(res.data.getReasult);
      } catch (error) {
        console.log(error);
      }
    };
    getReasult();
  }, [getAccessTokenSilently]);
  const today = new Date();
  const expiredResults = reasults.filter((item) => {
    if (!item?.quiz?.date) return false;
    const quizDate = new Date(item.quiz.date);
    return quizDate < today; // only expired
  });
  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto mt-8 p-4">
        {expiredResults?.length === 0 ? (
          <p className="text-center text-gray-500">No results found</p>
        ) : (
          expiredResults.map((result, index) => (
            <div
              key={index}
              className="border rounded-xl shadow-md p-4 mb-4 bg-white"
              onClick={()=>navigate(`/reasult/details/${result?._id}`)}
            >
              <h2 className="text-xl font-bold mb-2">
                {result?.quiz?.title || "Untitled Quiz"}
              </h2>
              <p className="text-gray-600">
                <span className="font-semibold">Subject:</span>{" "}
                {result?.quiz?.subject?.subjectName}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Department:</span>{" "}
                {result?.quiz?.subject?.department} (
                {result?.quiz?.subject?.semester} sem)
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Date:</span>{" "}
                {new Date(result?.quiz?.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-green-600">Score:</span>{" "}
                {result?.score}/{result?.quiz?.marks}
              </p>
              <p className="text-gray-500 text-sm">
                Submitted at: {new Date(result?.submittedAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reasult;
