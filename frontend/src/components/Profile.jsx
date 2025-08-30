import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import Navbar from "./shared/Navbar";
import UpdateProfilelog from "./UpdateProfilelog";
import Dashboard from "./pages/Dashboard";
import {
  User,
  Mail,
  BookOpen,
  Calendar,
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
  Zap,
  Clock,
  Heart,
  Globe,
} from "lucide-react";

const Profile = () => {
  let [open, setopen] = useState(false);
  const { usere } = useSelector((store) => store.auth);

  const profileStats = [
    {
      icon: Trophy,
      label: "Achievements",
      value: "12",
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      icon: Target,
      label: "Quizzes Completed",
      value: "47",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Star,
      label: "Average Score",
      value: "87%",
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      icon: Activity,
      label: "Streak Days",
      value: "15",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const profileSections = [
    {
      icon: User,
      label: "Full Name",
      value: usere?.fullname,
      color: "text-blue-600",
    },
    {
      icon: Mail,
      label: "Email Address",
      value: usere?.email,
      color: "text-green-600",
    },
    {
      icon: Shield,
      label: "Role",
      value: usere?.role,
      color: "text-purple-600",
    },
    {
      icon: BookOpen,
      label: "Department",
      value: usere?.department,
      color: "text-orange-600",
    },
    {
      icon: GraduationCap,
      label: "Semester",
      value: usere?.semester,
      color: "text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <Navbar />

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
                <h1 className="text-4xl font-bold text-gray-800">
                  Profile Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
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
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
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
                      <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                        <AvatarImage
                          className="object-cover"
                          src={
                            usere?.picture ||
                            `https://api.dicebear.com/6.x/initials/svg?seed=${usere?.fullname}`
                          }
                        />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {usere?.fullname?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>

                      {/* Status indicator */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center"
                      >
                        <Crown className="w-4 h-4 text-white" />
                      </motion.div>

                      {/* Camera overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                        {usere?.fullname}
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-5 h-5 text-purple-500" />
                        </motion.div>
                      </h2>
                      <p className="text-gray-600 flex items-center justify-center gap-1">
                        <Badge className="w-4 h-4" />
                        {usere?.role}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
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
                        className={`${stat.bg} rounded-2xl p-4 text-center border-2 border-transparent hover:border-gray-200 transition-all duration-300`}
                      >
                        <stat.icon
                          className={`w-6 h-6 ${stat.color} mx-auto mb-2`}
                        />
                        <div className="text-xl font-bold text-gray-800">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Edit Button */}
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
                {/* Profile Information Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <Settings className="w-7 h-7 text-gray-600" />
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
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 group-hover:border-blue-300 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}
                            >
                              <section.icon
                                className={`w-6 h-6 ${section.color}`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                {section.label}
                              </p>
                              <p className="text-lg font-bold text-gray-800">
                                {section.value || "Not specified"}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Dashboard Embed */}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default Profile;
