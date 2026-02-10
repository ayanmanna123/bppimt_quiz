import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  ClipboardCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { setsubjectByquiry } from "../../Redux/subject.reducer";
import axios from "axios";
import { toast } from "sonner";
// Redesigned constants removed or replaced inside component logic if needed
// Or kept empty if they were unused in the new design. 
// I will keep them but empty or remove them if not used. 
// Ah, the new design logic (above) doesn't use 'studentGradients' anymore, it uses inline hardcoded gradients or logic.
// Let's remove them to avoid "unused variable" warnings if I don't use them.
// Wait, my replacement logic for the return block REMOVED the usage of `studentGradients` and `studentPatterns`.
// So I should remove these lines.
const studentGradients = [];
const studentPatterns = [];

const Quiz = () => {
  const { usere } = useSelector((store) => store.auth);

  const [subjectByquiry, setsetsubjectByquiry] = useState([]);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("card");
  const dispatch = useDispatch();
  // Filter and search logic
  const { getAccessTokenSilently } = useAuth0();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [targetSubjectId, setTargetSubjectId] = useState(null);
  const [otpInput, setOtpInput] = useState("");

  // Favorites Logic (LocalStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("quizFavorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("quizFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e, subjectId) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Advanced Filtering & Sorting Logic
  const processedSubjects = React.useMemo(() => {
    let result = [...subjectByquiry];

    // 1. Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (sub) =>
          sub.subjectName?.toLowerCase().includes(lowerSearch) ||
          sub.subjectCode?.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Filter
    if (selectedFilter === "favorite") {
      result = result.filter((sub) => favorites.includes(sub._id));
    } else if (selectedFilter === "recent") {
      result = result.slice(-5);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.subjectName.localeCompare(b.subjectName);
      } else if (sortBy === "recent") {
        const dateA = a.createdAt ? new Date(a.createdAt) : 0;
        const dateB = b.createdAt ? new Date(b.createdAt) : 0;
        return dateB - dateA || b._id.localeCompare(a._id);
      } else if (sortBy === "popular") {
        return (b.subjectName.length) - (a.subjectName.length);
      }
      return 0;
    });

    return result;
  }, [subjectByquiry, searchTerm, selectedFilter, sortBy, favorites]);

  // View Mode Classes
  const getGridClass = () => {
    switch (viewMode) {
      case "list":
        return "grid-cols-1";
      case "compact":
        return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case "card":
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  const initiateAttendance = (subId) => {
    setTargetSubjectId(subId);
    setShowOtpModal(true);
    setOtpInput("");
  };

  const submitOtpAttendance = async () => {
    try {
      if (!otpInput) {
        toast.error("Please enter the OTP");
        return;
      }

      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/attandance/give-attandance-otp`,
        {
          otp: otpInput,
          subjectid: targetSubjectId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);
      toast.success(res.data.message);
      const { Howl } = await import("howler");
      const sound = new Howl({
        src: ["/notification.wav"],
        volume: 0.7,
      });
      sound.play();
      setShowOtpModal(false);
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      toast.error(msg);
      console.error("Error marking attendance:", error);
    }
  };
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL
          }/subject/subjectByQuery?department=${usere.department}&semester=${usere.semester
          }`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setsetsubjectByquiry(res.data.subjects || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [getAccessTokenSilently]);

  // Combined Attendance Handler
  const handleAttendanceClick = async (subId) => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      // 1. Check if there is an active OTP
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/attandance/check-otp-status/${subId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success && res.data.hasActiveOtp) {
        // 2a. If OTP is active -> Show OTP Modal
        initiateAttendance(subId);
      } else {
        // 2b. If NO OTP -> Normal Location-based Attendance
        handleNormalAttendance(subId);
      }
    } catch (error) {
      console.error("Error checking attendance mode:", error);
      toast.error("Failed to check attendance mode");
    }
  };

  const handleNormalAttendance = (subId) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Fetching your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const token = await getAccessTokenSilently({
            audience: "http://localhost:5000/api/v2",
          });

          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/attandance/give-attandance`,
            {
              subjectid: subId,
              latitude,
              longitude,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.data.success) {
            toast.success(res.data.message);
            const { Howl } = await import("howler");
            const sound = new Howl({
              src: ["/notification.wav"],
              volume: 0.7,
            });
            sound.play();
          }
        } catch (error) {
          const msg = error?.response?.data?.message || "Attendance failed";
          toast.error(msg);
        }
      },
      (error) => {
        console.error("Location error:", error);
        toast.error("Unable to retrieve your location. Please enable location access.");
      }
    );
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
        {/* Abstract Background Shapes (Similar to AttendanceSheet) */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-b-[40px] shadow-2xl z-0"></div>
        <div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute top-40 left-10 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl z-0"></div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-32 left-32 w-24 h-24 border-4 border-white/10 rounded-full animate-spin-slow z-0"></div>
        <div className="absolute top-10 right-40 w-16 h-16 bg-white/10 rotate-45 rounded-xl animate-pulse z-0"></div>

        {/* Main Content Container */}
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Hero Section */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-white text-indigo-600 p-4 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">
                  Welcome back, {usere?.fullname?.split(" ")[0]}!
                </h1>
                <p className="text-indigo-100 mt-1 font-medium text-lg">
                  Ready to ace your quizzes? Explore your subjects!
                </p>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                <BookOpen className="w-5 h-5 text-indigo-200" />
                <div className="text-left">
                  <p className="text-xs text-indigo-200 uppercase tracking-widest font-semibold">Subjects</p>
                  <p className="font-bold text-xl leading-none">{processedSubjects.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                <Target className="w-5 h-5 text-indigo-200" />
                <div className="text-left">
                  <p className="text-xs text-indigo-200 uppercase tracking-widest font-semibold">Dept</p>
                  <p className="font-bold text-xl leading-none">{usere?.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                <Calendar className="w-5 h-5 text-indigo-200" />
                <div className="text-left">
                  <p className="text-xs text-indigo-200 uppercase tracking-widest font-semibold">Sem</p>
                  <p className="font-bold text-xl leading-none">{usere?.semester}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Control Bar (Search & Filter) */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
            >
              {/* Search */}
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all duration-300 font-medium text-gray-700 placeholder:text-gray-400"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                {/* Filter */}
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-indigo-100 font-medium text-gray-700 cursor-pointer appearance-none transition-colors"
                  >
                    <option value="all">All Subjects</option>
                    <option value="recent">Recent</option>
                    <option value="favorite">Favorites</option>
                  </select>
                  <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-indigo-100 font-medium text-gray-700 cursor-pointer appearance-none transition-colors"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="recent">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                  <Target className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode */}
                <div className="bg-gray-50 p-1 rounded-xl flex items-center">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <ClipboardCheck className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Subject Cards Grid */}
          <div className="pb-12">
            {processedSubjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center"
              >
                <div className="w-24 h-24 bg-indigo-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No subjects found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or clear filters.</p>
              </motion.div>
            ) : (
              <motion.div
                className={`grid ${getGridClass()} gap-6`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {processedSubjects.map((sub, index) => {
                  return (
                    <motion.div
                      key={sub._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/quizedetails/${sub?._id}`)}
                      className={`group relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 border border-gray-100 cursor-pointer ${viewMode === 'list' ? 'flex flex-row items-stretch min-h-[160px]' : 'flex flex-col h-full hover:-translate-y-2'}`}
                    >
                      {/* Card Header / Gradient Bg */}
                      <div className={`${viewMode === 'list' ? 'w-1/4' : 'h-32'} relative overflow-hidden bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 p-6`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl group-hover:bg-white/20 transition-colors"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                        {/* ACTIVE Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div> ACTIVE
                          </span>
                        </div>

                        {/* Favorite Star */}
                        <button
                          onClick={(e) => toggleFavorite(e, sub._id)}
                          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white"
                        >
                          <Star className={`w-4 h-4 ${favorites.includes(sub._id) ? "fill-yellow-400 text-yellow-400" : ""}`} />
                        </button>

                        {/* Quick Icon */}
                        <div className="absolute bottom-4 right-4 text-white/20 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
                          <BookOpen className="w-12 h-12" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className={`p-6 flex flex-col ${viewMode === 'list' ? 'flex-1 justify-center' : 'flex-grow'}`}>
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {sub?.subjectName}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-indigo-100">
                              {sub?.subjectCode}
                            </span>
                            <span className="text-gray-400 text-sm truncate">{sub?.description}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-auto">
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 group-hover:border-indigo-50 transition-colors">
                            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Instructor</p>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                {sub?.createdBy?.fullname?.charAt(0)}
                              </div>
                              <p className="text-xs font-bold text-gray-700 truncate">{sub?.createdBy?.fullname}</p>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 group-hover:border-indigo-50 transition-colors">
                            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Details</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700">{sub?.department}</span>
                              <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Sem {sub?.semester}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className={`p-4 pt-0 flex gap-3 ${viewMode === 'list' ? 'w-64 flex-col justify-center border-l border-gray-100 bg-gray-50/50' : 'bg-white'}`}>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/quizedetails/${sub?._id}`);
                          }}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                        >
                          Start
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAttendanceClick(sub?._id);
                          }}
                          className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 border border-gray-200 hover:border-emerald-200 shadow-sm rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                        >
                          Attendance
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal (Redesigned) */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowOtpModal(false)}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full transform transition-all scale-100 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldCheck className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Attendance Check</h2>
              <p className="text-gray-500 text-sm">Enter the 6-digit OTP provided by your instructor to mark attendance.</p>
            </div>

            <input
              type="text"
              maxLength="6"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="000000"
              className="w-full text-center text-4xl font-mono font-bold tracking-[0.5em] text-gray-800 border-b-2 border-indigo-100 focus:border-indigo-600 focus:outline-none bg-transparent pb-4 mb-8 placeholder:text-gray-200 transition-colors"
            />

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowOtpModal(false)}
                className="py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitOtpAttendance}
                className="py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Quiz;
