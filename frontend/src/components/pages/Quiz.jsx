import React, { useEffect, useState } from "react";
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
import {
  Search,
  Filter,
  Grid3X3,
  BookOpen,
  User,
  Calendar,
  Star,
  Trophy,
  Target,
  Clock,
  Sparkles,
  ChevronDown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { setsubjectByquiry } from "../../Redux/subject.reducer";
import axios from "axios";
// Student-focused gradient combinations
const studentGradients = [
  "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600",
  "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600",
  "bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-600",
  "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600",
  "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600",
  "bg-gradient-to-br from-pink-400 via-rose-500 to-red-600",
];

// Student-focused creative patterns
const studentPatterns = [
  "radial-gradient(circle at 25% 75%, rgba(59, 130, 246, 0.4) 0%, transparent 60%), linear-gradient(135deg, rgba(147, 197, 253, 0.3) 0%, transparent 70%)",
  "conic-gradient(from 90deg at 70% 30%, rgba(16, 185, 129, 0.4) 0deg, transparent 120deg, rgba(52, 211, 153, 0.3) 240deg)",
  "radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.4) 0%, transparent 70%), linear-gradient(45deg, rgba(167, 139, 250, 0.3) 0%, transparent 100%)",
  "linear-gradient(60deg, rgba(239, 68, 68, 0.3) 25%, transparent 25%), radial-gradient(circle at 75% 25%, rgba(251, 113, 133, 0.4) 0%, transparent 50%)",
  "conic-gradient(from 0deg at 40% 60%, rgba(245, 158, 11, 0.4) 0deg, transparent 90deg, rgba(251, 191, 36, 0.3) 180deg, transparent 270deg)",
  "radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.4) 0%, transparent 60%), linear-gradient(120deg, rgba(244, 114, 182, 0.3) 0%, transparent 100%)",
];

const Quiz = () => {
  const { usere } = useSelector((store) => store.auth);
  useGetSubject(usere.department, usere.semester);

  const { subjectByquiry } = useSelector((store) => store.subject);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("card");

  // Filter and search logic
  const lowerSearch = searchTerm?.toLowerCase() || "";

  const filteredSubjects =
    subjectByquiry?.filter(
      (subject) =>
        subject.subjectName?.toLowerCase()?.includes(lowerSearch) ||
        subject.subjectCode?.toLowerCase()?.includes(lowerSearch)
    ) || [];
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `https://bppimt-quiz-kml1.vercel.app/api/v1/subject/subjectByQuery?department=${usere.department}&semester=${usere.semester}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        dispatch(setsubjectByquiry(res.data.subjects));
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects()
  }, [getAccessTokenSilently]);
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/20 rounded-2xl rotate-45 animate-pulse"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center py-16 px-6"
          >
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, {usere?.fullname?.split(" ")[0]}! 👋
                </h1>
                <p className="text-white/90 text-lg">
                  Ready to ace your quizzes? Let's explore your subjects!
                </p>
              </div>
            </div>

            {/* Student Stats */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filteredSubjects.length}
                </div>
                <div className="text-white/80 text-sm">Available Subjects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">📚</div>
                <div className="text-white/80 text-sm">{usere?.department}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">🎯</div>
                <div className="text-white/80 text-sm">
                  {usere?.semester} Semester
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Filter Section */}
        <div className="px-6 -mt-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white/70 hover:bg-white focus:bg-white focus:border-blue-400 transition-all duration-300 font-medium"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl bg-white/70 hover:bg-white focus:bg-white focus:border-purple-400 transition-all duration-300 font-medium appearance-none"
                >
                  <option value="all">All Subjects</option>
                  <option value="recent">Recent</option>
                  <option value="favorite">Favorites</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl bg-white/70 hover:bg-white focus:bg-white focus:border-indigo-400 transition-all duration-300 font-medium appearance-none"
                >
                  <option value="name">Sort by Name</option>
                  <option value="recent">Recently Added</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode */}
              <div className="relative">
                <Grid3X3 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl bg-white/70 hover:bg-white focus:bg-white focus:border-green-400 transition-all duration-300 font-medium appearance-none"
                >
                  <option value="card">Card View</option>
                  <option value="list">List View</option>
                  <option value="compact">Compact</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subject Cards Grid */}
        <div className="px-6 pb-12">
          {filteredSubjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="w-28 h-28 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <BookOpen className="w-14 h-14 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No subjects found
              </h3>
              <p className="text-gray-500 text-lg">
                Try adjusting your search or filters
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {filteredSubjects.map((sub, index) => {
                const gradientClass =
                  studentGradients[index % studentGradients.length];
                const patternStyle =
                  studentPatterns[index % studentPatterns.length];

                return (
                  <motion.div
                    key={sub._id}
                    onClick={() => navigate(`/quizedetails/${sub?._id}`)}
                    initial={{ opacity: 0, y: 60, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.7,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="group cursor-pointer"
                  >
                    <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 rounded-3xl transform hover:scale-110 relative group-hover:-translate-y-2">
                      {/* Enhanced gradient header */}
                      <div
                        className={`h-44 ${gradientClass} relative overflow-hidden`}
                        style={{ background: patternStyle }}
                      >
                        {/* Animated background elements */}
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white/40 rounded-full animate-pulse group-hover:animate-spin"></div>
                          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/30 rounded-full animate-bounce"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-white/30 rounded-2xl rotate-45 animate-pulse group-hover:rotate-90 transition-transform duration-1000"></div>
                          <div className="absolute top-6 left-6 w-6 h-6 bg-white/40 rounded-full group-hover:animate-ping"></div>
                          <div className="absolute bottom-8 right-8 w-4 h-4 bg-white/50 rounded-full"></div>
                        </div>

                        {/* Subject badge */}
                        <div className="absolute top-4 left-4">
                          <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-gray-600" />
                            <span className="text-xs font-semibold text-gray-800">
                              ACTIVE
                            </span>
                          </div>
                        </div>

                        {/* Subject info */}
                        <div className="absolute bottom-4 left-4 right-4 text-gray-900">
                          <h3 className="text-xl font-bold drop-shadow-2xl mb-2 leading-tight">
                            {sub?.subjectName}
                          </h3>
                          <p className="text-sm opacity-90 drop-shadow mb-3">
                            {sub?.description ||
                              "Explore and master this subject"}
                          </p>
                          <div className="w-12 h-1 bg-white/60 rounded-full"></div>
                        </div>
                      </div>

                      {/* Enhanced content */}
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <User className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 font-medium">
                                INSTRUCTOR
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {sub?.createdBy?.fullname}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                              <BookOpen className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  DEPT
                                </p>
                                <p className="text-sm font-bold text-gray-700">
                                  {sub?.department}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                              <Calendar className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  SEM
                                </p>
                                <p className="text-sm font-bold text-gray-700">
                                  {sub?.semester}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 font-semibold mb-1">
                                  SUBJECT CODE
                                </p>
                                <p className="text-sm font-mono font-bold text-gray-800 bg-transparent px-2 py-1 rounded">
                                  {sub?.subjectCode}
                                </p>
                              </div>
                              <Trophy className="w-8 h-8 text-yellow-500" />
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      {/* Action button */}
                      <CardFooter className="p-6 pt-0">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/quizedetails/${sub?._id}`);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105"
                        >
                          <Target className="w-5 h-5" />
                          Start Quiz Journey
                          <Sparkles className="w-4 h-4" />
                        </Button>
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

export default Quiz;
