import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
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
  Settings,
  Users,
  Code,
  GraduationCap,
  Building,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Admin-focused gradient combinations
const adminGradients = [
  "bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600",
  "bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600",
  "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600",
  "bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-600",
  "bg-gradient-to-br from-red-400 via-pink-500 to-rose-600",
  "bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600",
];

// Admin-focused creative patterns
const adminPatterns = [
  "radial-gradient(circle at 25% 75%, rgba(71, 85, 105, 0.4) 0%, transparent 60%), linear-gradient(135deg, rgba(148, 163, 184, 0.3) 0%, transparent 70%)",
  "conic-gradient(from 90deg at 70% 30%, rgba(59, 130, 246, 0.4) 0deg, transparent 120deg, rgba(99, 102, 241, 0.3) 240deg)",
  "radial-gradient(ellipse at top right, rgba(16, 185, 129, 0.4) 0%, transparent 70%), linear-gradient(45deg, rgba(34, 197, 94, 0.3) 0%, transparent 100%)",
  "linear-gradient(60deg, rgba(245, 158, 11, 0.3) 25%, transparent 25%), radial-gradient(circle at 75% 25%, rgba(251, 191, 36, 0.4) 0%, transparent 50%)",
  "conic-gradient(from 0deg at 40% 60%, rgba(239, 68, 68, 0.4) 0deg, transparent 90deg, rgba(248, 113, 113, 0.3) 180deg, transparent 270deg)",
  "radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.4) 0%, transparent 60%), linear-gradient(120deg, rgba(167, 139, 250, 0.3) 0%, transparent 100%)",
];

const AdminSubject = () => {
  const { depName } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("card");
    const navigate = useNavigate();
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `https://bppimt-quiz-kml1.vercel.app/api/v1/admin/subject/${depName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSubjects(res.data.subjectByQuiry || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch subjects");
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [depName, getAccessTokenSilently]);

  // Filter and search logic
  const lowerSearch = searchTerm?.toLowerCase() || "";
  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.subjectName?.toLowerCase()?.includes(lowerSearch) ||
      subject.subjectCode?.toLowerCase()?.includes(lowerSearch)
  );

  // Sort subjects
  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.subjectName?.localeCompare(b.subjectName) || 0;
      case "recent":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "semester":
        return a.semester - b.semester;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Settings className="w-10 h-10 text-white animate-spin" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading subjects...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 font-medium">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 opacity-90"></div>
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
                <Building className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Settings className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white mb-2">
                Department Management 🎓
              </h1>
              <p className="text-white/90 text-lg">
                Managing subjects for <span className="font-bold text-yellow-300">{depName.toUpperCase()}</span> department
              </p>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {filteredSubjects.length}
              </div>
              <div className="text-white/80 text-sm">Total Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">📋</div>
              <div className="text-white/80 text-sm">Admin Panel</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">⚡</div>
              <div className="text-white/80 text-sm">Quick Actions</div>
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
                <option value="recent">Recently Added</option>
                <option value="active">Active</option>
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
                <option value="semester">By Semester</option>
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
                <option value="table">Table View</option>
                <option value="compact">Compact</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4" />
              Add New Subject
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={()=>navigate("/notvarifieduser")}
            >
              <Users className="w-4 h-4" />
              Manage Students
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-12">
        {sortedSubjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-slate-200 to-blue-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <BookOpen className="w-14 h-14 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No subjects found
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              {searchTerm ? "Try adjusting your search criteria" : "This department doesn't have any subjects yet"}
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4" />
              Add First Subject
            </Button>
          </motion.div>
        ) : viewMode === "table" ? (
          // Table View
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-blue-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Subject Name</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Code</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Semester</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Created</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubjects.map((subj, index) => (
                    <motion.tr
                      key={subj._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="hover:bg-blue-50/50 transition-colors duration-200 border-b border-gray-100"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{subj.subjectName}</p>
                            <p className="text-xs text-gray-500">{subj.description || "No description"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-800 font-mono text-sm px-3 py-1 rounded-full">
                          {subj.subjectCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 font-semibold text-sm px-3 py-1 rounded-full">
                          Sem {subj.semester}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(subj.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          // Card View
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {sortedSubjects.map((subj, index) => {
              const gradientClass = adminGradients[index % adminGradients.length];
              const patternStyle = adminPatterns[index % adminPatterns.length];

              return (
                <motion.div
                  key={subj._id}
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
                  <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 rounded-3xl transform hover:scale-105 relative group-hover:-translate-y-2">
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

                      {/* Admin badge */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-white" />
                          <span className="text-xs font-semibold text-white">
                            ADMIN
                          </span>
                        </div>
                      </div>

                      {/* Subject info */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold drop-shadow-2xl mb-2 leading-tight">
                          {subj.subjectName}
                        </h3>
                        <p className="text-sm opacity-90 drop-shadow mb-3">
                          {subj.description || "Administrative management view"}
                        </p>
                        <div className="w-12 h-1 bg-white/60 rounded-full"></div>
                      </div>
                    </div>

                    {/* Enhanced content */}
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <Code className="w-5 h-5 text-slate-600" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">
                              SUBJECT CODE
                            </p>
                            <p className="text-sm font-bold text-gray-700 font-mono">
                              {subj.subjectCode}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">
                                SEMESTER
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {subj.semester}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">
                                CREATED
                              </p>
                              <p className="text-sm font-bold text-gray-700">
                                {new Date(subj.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border-l-4 border-slate-400">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 font-semibold mb-1">
                                DEPARTMENT
                              </p>
                              <p className="text-sm font-bold text-gray-800">
                                {subj.department || depName.toUpperCase()}
                              </p>
                            </div>
                            <Building className="w-8 h-8 text-slate-500" />
                          </div>
                        </div>

                        {/* Admin Stats */}
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          <div className="text-center p-2 bg-yellow-50 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
                            <p className="text-xs font-bold text-yellow-700">Active</p>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <Star className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                            <p className="text-xs font-bold text-purple-700">Featured</p>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <Users className="w-4 h-4 text-green-600 mx-auto mb-1" />
                            <p className="text-xs font-bold text-green-700">Students</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    
                     
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminSubject;