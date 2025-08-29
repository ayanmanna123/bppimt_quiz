import React from "react";
import Navbar from "../shared/Navbar";
import { useSelector } from "react-redux";
import useGetSubject from "../../hook/useGetSubject";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Updated gradient styles to match the image design
const bgGradients = [
  "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400", // Light gray gradient
  "bg-gradient-to-br from-emerald-300 via-teal-400 to-green-500", // Teal/green gradient
  "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600", // Blue gradient
  "bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600", // Dark gray gradient
  "bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500", // Yellow/orange gradient
  "bg-gradient-to-br from-pink-300 via-rose-400 to-pink-500", // Pink gradient
];

const Quiz = () => {
  const { usere } = useSelector((store) => store.auth);
  useGetSubject(`${usere.department}`);
  const { subjectByquiry } = useSelector((store) => store.subject);
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All</option>
              </select>
              <input
                type="text"
                placeholder="Search"
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Sort by course name</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Card</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjectByquiry?.map((sub, i) => {
            const bgClass = bgGradients[i % bgGradients.length];

            return (
              <motion.div
                key={i}
                onClick={() => navigate(`/quizedetails/${sub?._id}`)}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white border-0 rounded-xl">
                  <div className={`h-40 ${bgClass} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%" className="w-full h-full">
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

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-bold drop-shadow-lg mb-1 leading-tight">
                        {sub?.subjectName}
                      </h3>
                      <p className="text-sm opacity-90 drop-shadow">
                        {sub?.description || "Course Description"}
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Department:</span>{" "}
                        {sub?.department}
                      </p>
                      <p>
                        <span className="font-medium">Teacher:</span>{" "}
                        {sub?.createdBy?.fullname}
                      </p>
                      <p>
                        <span className="font-medium">Semester:</span>{" "}
                        {sub?.semester}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="px-4 pb-4 pt-0">
                    <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      2025EESEM5
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Quiz;
