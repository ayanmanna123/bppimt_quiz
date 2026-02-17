import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { motion, animate } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setuser } from "../Redux/auth.reducer";
import { useAuth0 } from "@auth0/auth0-react";
import UpdateProfilelog from "./UpdateProfilelog";
import Dashboard from "./pages/Dashboard";
import Calendar from "../components/pages/Calendar";
import {
  User,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  Mail,
  BookOpen,
  Edit3,
  Shield,
  GraduationCap,
  MapPin,
  Star,
  Trophy,
  Target,
  Activity,
  Settings,
  ChevronRight,
  Camera,
  Sparkles,
  Crown,
  Badge,
  Hash,
  Brain,
  Ban,
} from "lucide-react";


const Profile = () => {
  const navigate = useNavigate();
  const [open, setopen] = useState(false);
  const { usere } = useSelector((store) => store.auth);
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect, user } =
    useAuth0();

  // Dynamic stats states
  const [progress, setProgress] = useState(null);
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animated values
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [percentage, setPercentage] = useState(0);

  // Fetch dynamic data
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    if (usere && (!id || id === "undefined")) {
      setProfileUser(usere);
    }
  }, [usere, id]);

  // Fetch dynamic data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // --- PUBLIC PROFILE VIEW (when ID is present) ---
        if (id && id !== "undefined") {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/user/profile/${id}`
          );
          if (!res.ok) throw new Error("Failed to fetch public profile");
          const data = await res.json();

          if (data.success) {
            console.log("Profile Data:", data);
            setProfileUser(data.user);
            setProgress(data.progress);
            setSubjects(data.subjects);
            setBadges(data.badges);

            if (data.streak) {
              const heatmapData = data.streak.map((item) => ({
                date: item.date,
                count: item.count || 0,
              }));
              setStreak(heatmapData);
            }
          }
          return; // Exit, no need to fetch auth-based data
        }

        // --- PRIVATE PROFILE VIEW (Authenticated User) ---
        if (!isAuthenticated) {
          loginWithRedirect();
          return;
        }

        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        console.log(token)
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [progressRes, subjectRes, badgeRes, streakRes] =
          await Promise.all([
            fetch(
              `${import.meta.env.VITE_BACKEND_URL}/dashbord/dashbord/data/progress`,
              { headers }
            ).then((res) => {
              if (!res.ok)
                throw new Error(`Progress API failed: ${res.status}`);
              return res.json();
            }),
            fetch(
              `${import.meta.env.VITE_BACKEND_URL}/dashbord/data/subject`,
              { headers }
            ).then((res) => {
              if (!res.ok) throw new Error(`Subject API failed: ${res.status}`);
              return res.json();
            }),
            fetch(
              `${import.meta.env.VITE_BACKEND_URL}/dashbord/data/badge`,
              { headers }
            ).then((res) => {
              if (!res.ok) throw new Error(`Badge API failed: ${res.status}`);
              return res.json();
            }),
            fetch(
              `${import.meta.env.VITE_BACKEND_URL}/dashbord/data/streak`,
              { headers }
            ).then((res) => {
              if (!res.ok) throw new Error(`Streak API failed: ${res.status}`);
              return res.json();
            }),
          ]);

        if (progressRes?.success && progressRes?.data) {
          setProgress(progressRes.data);
        }

        if (subjectRes?.success && Array.isArray(subjectRes?.data)) {
          setSubjects(subjectRes.data);
        }

        if (badgeRes?.success && Array.isArray(badgeRes?.quizzes)) {
          setBadges(badgeRes.quizzes);
        }

        if (streakRes?.success && Array.isArray(streakRes?.streak)) {
          const heatmapData = streakRes.streak.map((item) => ({
            date: item.date,
            count: item.count || 0,
          }));
          setStreak(heatmapData);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessTokenSilently, isAuthenticated, loginWithRedirect, id]);

  // --- Friend System Logic ---
  const [friendStatus, setFriendStatus] = useState('none');
  const [conversationId, setConversationId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]); // [NEW]

  // Fetch Friend Requests (for own profile)
  useEffect(() => {

    const fetchRequests = async () => {
      if ((id && id !== "undefined") || !isAuthenticated) return; // Only for own profile
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/friend/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        // console.log("i am from data ", data);
        console.log("Friend Requests:", data);
        if (data.success) {
          setFriendRequests(data.requests || []);
        }
      } catch (error) {
        console.error("Failed to fetch friend requests", error);
      }
    };
    fetchRequests();
  }, [id, getAccessTokenSilently, isAuthenticated]);

  // Check Status
  useEffect(() => {
    const checkStatus = async () => {
      if (!id || !isAuthenticated || !profileUser || !usere) return;
      // If viewing own profile (by ID matching or if ID param is my univ no)
      if (profileUser._id === usere._id) return;

      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/friend/status/${profileUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("Friend Status:", data);
        if (res.ok) {
          setFriendStatus(data.status);
          if (data.conversationId) setConversationId(data.conversationId);
        }
      } catch (error) {
        console.error("Failed to check friend status", error);
      }
    };

    checkStatus();
  }, [profileUser, usere, id, getAccessTokenSilently, isAuthenticated]);

  const handleFriendAction = async (action, targetId = null) => {
    // If targetId is passed, use it (for list actions), else use profileUser._id
    const targetUserId = targetId || profileUser?._id;
    if (!targetUserId || actionLoading) return;

    setActionLoading(true);
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let url = '';
      let body = {};

      if (action === 'send') {
        url = `${import.meta.env.VITE_BACKEND_URL}/friend/request`;
        body = { targetUserId };
      } else if (action === 'accept') {
        url = `${import.meta.env.VITE_BACKEND_URL}/friend/accept`;
        body = { requesterId: targetUserId };
      } else if (action === 'reject') {
        url = `${import.meta.env.VITE_BACKEND_URL}/friend/reject`;
        body = { requesterId: targetUserId };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await res.json();
      console.log("Friend Action Response:", data);
      if (data.success) {
        // Update local state for Profile View
        if (!targetId) { // If acting on main profile view
          if (action === 'send') setFriendStatus('sent');
          if (action === 'accept') {
            setFriendStatus('friends');
            setConversationId(data.conversationId);
          }
          if (action === 'reject') setFriendStatus('none');
        } else {
          // Acting on list
          setFriendRequests(prev => prev.filter(r => r.from._id !== targetUserId));
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} request`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/chats?dm=${conversationId}`);
  };

  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (usere && profileUser) {
      setIsBlocked(usere.blockedUsers?.includes(profileUser._id));
    }
  }, [usere, profileUser]);

  const dispatch = useDispatch();

  const handleBlockUser = async () => {
    if (!profileUser || actionLoading) return;
    const confirmMessage = isBlocked ? `Unblock ${profileUser.fullname}?` : `Block ${profileUser.fullname}?`;
    if (!window.confirm(confirmMessage)) return;

    setActionLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetUserId: profileUser._id })
      });
      const data = await res.json();
      if (res.ok) {
        setIsBlocked(data.isBlocked);
        // [FIX] Update Redux state
        const updatedUser = { ...usere };
        if (data.isBlocked) {
          updatedUser.blockedUsers = [...(updatedUser.blockedUsers || []), profileUser._id];
        } else {
          updatedUser.blockedUsers = (updatedUser.blockedUsers || []).filter(id => id !== profileUser._id);
        }
        dispatch(setuser(updatedUser));
      }
    } catch (error) {
      console.error("Failed to toggle block", error);
    } finally {
      setActionLoading(false);
    }
  };


  // Animate numbers when progress data is available
  useEffect(() => {
    if (!progress) return;

    const animations = [];

    const attemptedAnim = animate(0, progress.quizzesAttempted || 0, {
      duration: 2,
      onUpdate: (v) => setAttempted(Math.round(v)),
    });
    animations.push(attemptedAnim);

    const correctAnim = animate(0, progress.correctAnswers || 0, {
      duration: 2,
      onUpdate: (v) => setCorrect(Math.round(v)),
    });
    animations.push(correctAnim);

    const wrongAnim = animate(0, progress.wrongAnswers || 0, {
      duration: 2,
      onUpdate: (v) => setWrong(Math.round(v)),
    });
    animations.push(wrongAnim);

    const totalAnswers =
      (progress.correctAnswers || 0) + (progress.wrongAnswers || 0);
    const calculatedPercentage =
      totalAnswers > 0 ? (progress.correctAnswers / totalAnswers) * 100 : 0;

    const percentageAnim = animate(0, calculatedPercentage, {
      duration: 2,
      onUpdate: (v) => setPercentage(v),
    });
    animations.push(percentageAnim);

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [progress]);

  // Calculate dynamic stats
  const currentStreak =
    streak.length > 0 ? Math.max(...streak.map((s) => s.count)) : 0;
  const totalBadges = badges.length;
  const topperBadges = badges.filter((b) => b.isUserTopper).length;
  const completedQuizzes = subjects.reduce(
    (total, subject) => total + (subject.completedQuizzes || 0),
    0
  );

  const profileStats = [
    {
      icon: Trophy,
      label: "Achievements",
      value: totalBadges.toString(),
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      icon: Target,
      label: "Quizzes Completed",
      value: attempted.toString(),
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Star,
      label: "Average Score",
      value: `${percentage.toFixed(1)}%`,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      icon: Activity,
      label: "Streak Days",
      value: currentStreak.toString(),
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const profileSections = [
    {
      icon: User,
      label: "Full Name",
      value: profileUser?.fullname,
      color: "text-blue-600",
    },
    {
      icon: Mail,
      label: "Email Address",
      value: profileUser?.email,
      color: "text-green-600",
    },
    {
      icon: Hash,
      label: "University Number",
      value: profileUser?.universityNo,
      color: "text-green-600",
    },
    {
      icon: Shield,
      label: "Role",
      value: profileUser?.role,
      color: "text-purple-600",
    },
    {
      icon: BookOpen,
      label: "Department",
      value: profileUser?.department,
      color: "text-orange-600",
    },
    {
      icon: GraduationCap,
      label: "Semester",
      value: profileUser?.semester,
      color: "text-pink-600",
    },
  ].filter(section => {
    if (profileUser?.role === "teacher") {
      return section.label !== "University Number" && section.label !== "Semester";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex justify-center items-center transition-colors duration-500">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full mx-auto mb-6"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl font-semibold text-gray-700 dark:text-gray-300"
          >
            Loading Your Profile...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 50, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            rotate: { duration: 40, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-cyan-200/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                  Profile Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Manage your account and track your progress
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Profile Card - Left Side */}
            <motion.div
              className="xl:col-span-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-800/20 relative overflow-hidden transition-colors">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 dark:opacity-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl"
                  />
                </div>

                <div className="relative z-10">
                  {/* Avatar Section */}
                  <div className="text-center mb-6">
                    <motion.div
                      className="relative inline-block mb-4"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-800 shadow-2xl">
                        {!isBlocked && (
                          <AvatarImage
                            className="object-cover"
                            src={
                              profileUser?.picture ||
                              `https://api.dicebear.com/6.x/initials/svg?seed=${profileUser?.fullname}`
                            }
                          />
                        )}
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {profileUser?.fullname?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>

                      {/* Status indicator */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center transition-colors"
                      >
                        <Crown className="w-4 h-4 text-white" />
                      </motion.div>

                      {/* Camera overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        {profileUser?.fullname}
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-5 h-5 text-purple-500" />
                        </motion.div>
                      </h2>
                      <p className="text-gray-600 dark:text-slate-400 flex items-center justify-center gap-1">
                        <Badge className="w-4 h-4" />
                        {profileUser?.role}
                      </p>
                      <p className="text-gray-600 dark:text-slate-400 flex items-center justify-center gap-1">
                        <Hash className="w-4 h-4" />
                        {profileUser?.universityNo}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Quick Stats */}

                  {/* Dynamic Quick Stats - Only for Students */}
                  {profileUser?.role !== "teacher" && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {profileStats.map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: 0.1 * index,
                            duration: 0.6,
                            type: "spring",
                          }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className={`${stat.bg} dark:bg-slate-800/50 rounded-2xl p-4 text-center border-2 border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all duration-300`}
                        >
                          <stat.icon
                            className={`w-6 h-6 ${stat.color} mx-auto mb-2`}
                          />
                          <div className="text-xl font-bold text-gray-800 dark:text-white">
                            {stat.value}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Edit Button */}
                  {/* Edit Button - Only show if not viewing a public profile */}
                  {!id && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => setopen(true)}
                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 shadow-lg hover:shadow-2xl"
                      >
                        <Edit3 className="w-5 h-5" />
                        Edit Profile
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Friend Actions (If viewing other public profile) */}
                  {id && usere && profileUser && usere._id !== profileUser._id && (
                    <div className="mt-6 flex flex-col gap-3">
                      {friendStatus === 'none' && (
                        <Button
                          onClick={() => handleFriendAction('send')}
                          disabled={actionLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-5 h-5" />
                          Add Friend
                        </Button>
                      )}

                      {friendStatus === 'sent' && (
                        <Button
                          disabled
                          className="w-full bg-gray-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                          <UserCheck className="w-5 h-5" />
                          Request Sent
                        </Button>
                      )}

                      {friendStatus === 'received' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleFriendAction('accept')}
                            disabled={actionLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                          >
                            <UserCheck className="w-5 h-5" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleFriendAction('reject')}
                            disabled={actionLoading}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                          >
                            <UserX className="w-5 h-5" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {friendStatus === 'friends' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleMessage}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-5 h-5" />
                            Message
                          </Button>
                          <Button
                            onClick={handleBlockUser}
                            disabled={actionLoading}
                            variant="outline"
                            className={`flex-1 font-bold py-3 rounded-xl flex items-center justify-center gap-2 ${isBlocked ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-red-500 border-red-200 hover:bg-red-50'}`}
                          >
                            <Ban className="w-5 h-5" />
                            {isBlocked ? 'Unblock' : 'Block'}
                          </Button>
                        </div>
                      )}

                      {/* Always show Block option for any non-self profile */}
                      {friendStatus !== 'friends' && (
                        <Button
                          onClick={handleBlockUser}
                          disabled={actionLoading}
                          variant="ghost"
                          className={`w-full mt-2 font-bold py-2 rounded-xl flex items-center justify-center gap-2 text-xs opacity-70 hover:opacity-100 ${isBlocked ? 'text-green-600' : 'text-red-500'}`}
                        >
                          <Ban className="w-4 h-4" />
                          {isBlocked ? 'Unblock User' : 'Block User'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Dashboard Section - Right Side */}
            <motion.div
              className="xl:col-span-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="space-y-6">

                {/* Friend Requests Section (Only for Own Profile) */}
                {!id && friendRequests.length > 0 && (
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-800/20 transition-colors">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
                      <UserPlus className="w-7 h-7 text-blue-600" />
                      Friend Requests
                      <Badge className="bg-red-500 text-white px-2 py-0.5 rounded-full text-sm">
                        {friendRequests.length}
                      </Badge>
                    </h3>
                    <div className="space-y-4">
                      {friendRequests.map((req) => (
                        <div key={req._id} className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-slate-800/50 rounded-2xl border border-blue-100 dark:border-slate-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm">
                              <AvatarImage src={req.from.picture} />
                              <AvatarFallback>{req.from.fullname[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-white">{req.from.fullname}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">{req.from.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleFriendAction('accept', req.from._id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFriendAction('reject', req.from._id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Profile Information Card */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-800/20 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <Settings className="w-7 h-7 text-gray-600 dark:text-white/80" />
                      Account Information
                    </h3>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="text-2xl"
                    >
                      ⚙️
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    {profileSections.map((section, index) => (
                      <motion.div
                        key={section.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.6 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="group cursor-pointer"
                      >
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border-2 border-gray-200 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}
                            >
                              <section.icon
                                className={`w-6 h-6 ${section.color} dark:text-white`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">
                                {section.label}
                              </p>
                              <p className="text-lg font-bold text-gray-800 dark:text-white">
                                {section.value || "Not specified"}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors duration-300" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div >

      <Calendar />
      <UpdateProfilelog open={open} setopen={setopen} />

      {/* Enhanced Custom Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5, #7c3aed);
        }

        /* Glassmorphism enhancements */
        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
        }
        
        /* Custom animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Hover effects */
        .group:hover .group-hover\\:animate-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
      `}</style>
    </div >
  );
};

export default Profile;
