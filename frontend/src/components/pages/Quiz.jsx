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
  FileText,
  Video,
  MoreVertical,
  ArrowRight
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { setsubjectByquiry } from "../../Redux/subject.reducer";
import axios from "axios";
import { toast } from "sonner";
import { useSocket } from "../../context/SocketContext";
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

const cardThemes = [
  {
    bg: "bg-gradient-to-br from-indigo-50 to-white",
    headerBg: "bg-[#F5F3FF]",
    badgeBg: "bg-[#4F46E5]",
    btnBg: "bg-[#3B82F6]",
    btnHover: "hover:bg-blue-700"
  },
  {
    bg: "bg-gradient-to-br from-emerald-50 to-white",
    headerBg: "bg-[#F0FDF4]",
    badgeBg: "bg-[#10B981]",
    btnBg: "bg-[#10B981]",
    btnHover: "hover:bg-emerald-700"
  },
  {
    bg: "bg-gradient-to-br from-amber-50 to-white",
    headerBg: "bg-[#FFFBEB]",
    badgeBg: "bg-[#F59E0B]",
    btnBg: "bg-[#F59E0B]",
    btnHover: "hover:bg-amber-700"
  },
  {
    bg: "bg-gradient-to-br from-rose-50 to-white",
    headerBg: "bg-[#FFF1F2]",
    badgeBg: "bg-[#F43F5E]",
    btnBg: "bg-[#F43F5E]",
    btnHover: "hover:bg-rose-700"
  }
];

import ChatWindow from "../chat/ChatWindow";

const Quiz = () => {
  const { usere } = useSelector((store) => store.auth);
  const socket = useSocket();
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

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
  const [activeChatSubject, setActiveChatSubject] = useState(null);

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
      // Assuming 'createdAt' exists, otherwise show last 5
      // If createdAt is missing, we might use default order which is usually insertion order for MongoDB
      result = result.slice(-5);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.subjectName.localeCompare(b.subjectName);
      } else if (sortBy === "recent") {
        // Sort by createdAt desc if available, else compare IDs (roughly time based)
        const dateA = a.createdAt ? new Date(a.createdAt) : 0;
        const dateB = b.createdAt ? new Date(b.createdAt) : 0;
        return dateB - dateA || b._id.localeCompare(a._id);
      } else if (sortBy === "popular") {
        // Mock popularity - random or based on name length just for shuffle effect if no real metric
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

  const isMeetingLive = (meeting) => {
    // Basic check: is today and time is within range?
    // Parsing "YYYY-MM-DD" and "HH:mm"
    try {
      const meetingDate = new Date(meeting.date);
      const today = new Date();

      if (meetingDate.toDateString() !== today.toDateString()) return false;

      const [hours, minutes] = meeting.meetingLink ? meeting.startTime.split(':') : ["00", "00"];
      const start = new Date();
      start.setHours(parseInt(hours), parseInt(minutes), 0);

      const end = new Date(start.getTime() + (meeting.duration || 60) * 60000);

      return today >= start && today <= end;
    } catch (e) { return false; }
  };

  const isMeetingFuture = (meeting) => {
    try {
      const meetingDate = new Date(meeting.date);
      const today = new Date();
      if (meetingDate > today) return true;
      if (meetingDate.toDateString() === today.toDateString()) {
        const [hours, minutes] = meeting.startTime.split(':');
        const start = new Date();
        start.setHours(parseInt(hours), parseInt(minutes), 0);
        return today < start;
      }
      return false;
    } catch (e) { return false; }
  }

  const joinMeeting = (link) => {
    window.open(link, '_blank');
  };

  const fetchMeetings = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/meeting/upcoming?department=${usere?.department}&semester=${usere?.semester}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setUpcomingMeetings(res.data.meetings);
      }
    } catch (error) {
      console.error("Error fetching meetings", error);
    }
  };

  useEffect(() => {
    if (usere?.department && usere?.semester) {
      fetchMeetings();
    }
  }, [usere, getAccessTokenSilently]);

  useEffect(() => {
    if (socket) {
      socket.on("newMeeting", (newMeeting) => {
        // Optimistically add if it matches user's dept/sem (checked via backend anyway usually, but here we just append)
        // Or just refetch
        fetchMeetings();
        toast.info(`New meeting scheduled for ${newMeeting.subject?.subjectName || 'a subject'}`);
      });

      return () => {
        socket.off("newMeeting");
      }
    }
  }, [socket]);

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
                  {processedSubjects.length}
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

        {/* Upcoming Meetings Section */}
        {
          upcomingMeetings.length > 0 && (
            <div className="px-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Video className="w-6 h-6 text-purple-600" />
                Upcoming Live Classes
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {upcomingMeetings.map((meeting) => (
                  <Card key={meeting._id} className="min-w-[300px] bg-white border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold truncate">{meeting.title}</CardTitle>
                      <CardDescription>{meeting.subject?.subjectName}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{new Date(meeting.date).toDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{meeting.startTime} ({meeting.duration} min)</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {isMeetingLive(meeting) ? (
                        <Button onClick={() => joinMeeting(meeting.meetingLink)} className="w-full bg-red-600 hover:bg-red-700 animate-pulse text-white">
                          Join Live Now
                        </Button>
                      ) : (
                        <Button disabled className="w-full bg-gray-200 text-gray-500">
                          {isMeetingFuture(meeting) ? "Scheduled" : "Ended"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )
        }

        {/* Subject Cards Grid */}
        <div className="px-6 pb-12">
          {processedSubjects.length === 0 ? (
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
              className={`grid ${getGridClass()} gap-6`} // Reduced gap for tighter layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {processedSubjects.map((sub, index) => {
                const theme = cardThemes[index % cardThemes.length];

                return (
                  <motion.div
                    key={sub._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                    }}
                    className="group"
                  >
                    <Card className="overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 rounded-[2.5rem]">
                      {/* Header Section */}
                      <div className={`h-40 ${theme.headerBg} p-8 relative flex flex-col justify-between`}>
                        <div className="flex justify-between items-start">
                          <span className={`${theme.badgeBg} text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider`}>
                            {sub?.subjectCode || "CORE"}
                          </span>
                          <Star
                            onClick={(e) => toggleFavorite(e, sub._id)}
                            className={`w-5 h-5 cursor-pointer transition-all duration-300 ${favorites.includes(sub._id) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"}`}
                          />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                          {sub?.subjectName}
                        </h3>
                      </div>

                      {/* Content Section */}
                      <CardContent className="px-8 py-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${theme.headerBg} flex items-center justify-center`}>
                              <User className={`w-5 h-5 ${theme.badgeBg.replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 tracking-wider">INSTRUCTOR</p>
                              <p className="text-sm font-semibold text-gray-700">{sub?.createdBy?.fullname || "Instructor"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Semester</p>
                            <p className="text-sm font-semibold text-gray-700">{sub?.semester || "N/A"}</p>
                          </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full mb-6"></div>

                        {/* Actions Area */}
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => navigate(`/quizedetails/${sub?._id}`)}
                            className={`flex-1 ${theme.btnBg} ${theme.btnHover} text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]`}
                          >
                            Take Quiz
                            <ArrowRight className="w-5 h-5" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-14 h-14 rounded-2xl border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                              <DropdownMenuItem
                                onClick={() => handleAttendanceClick(sub?._id)}
                                className="flex items-center gap-3 p-3 cursor-pointer rounded-xl"
                              >
                                <ClipboardCheck className="w-5 h-5 text-green-500" />
                                <span className="font-semibold text-gray-700">Give Attendance</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/subject/notes/${sub?._id}`)}
                                className="flex items-center gap-3 p-3 cursor-pointer rounded-xl"
                              >
                                <FileText className="w-5 h-5 text-orange-500" />
                                <span className="font-semibold text-gray-700">View Notes</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/subject/assignments/${sub?._id}`)}
                                className="flex items-center gap-3 p-3 cursor-pointer rounded-xl"
                              >
                                <ClipboardCheck className="w-5 h-5 text-pink-500" />
                                <span className="font-semibold text-gray-700">Assignments</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setActiveChatSubject(sub)}
                                className="flex items-center gap-3 p-3 cursor-pointer rounded-xl"
                              >
                                <Video className="w-5 h-5 text-indigo-500" />
                                <span className="font-semibold text-gray-700">Chat</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div >

      {/* OTP Modal */}
      {
        showOtpModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl w-[400px] shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Enter Class OTP</h2>
              <p className="text-center text-gray-500 mb-6">Enter the 6-digit code shared by your teacher</p>

              <input
                type="text"
                maxLength="6"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full text-center text-3xl tracking-[1em] font-mono font-bold py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none mb-6"
                placeholder="000000"
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitOtpAttendance}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )
      }
      {
        activeChatSubject && (
          <ChatWindow
            subjectId={activeChatSubject._id}
            subjectName={activeChatSubject.subjectName}
            onClose={() => setActiveChatSubject(null)}
          />
        )
      }
    </>
  );
};

export default Quiz;
