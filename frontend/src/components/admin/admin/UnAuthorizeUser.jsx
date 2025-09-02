import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  UserCheck,
  UserX,
  Users,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  UserPlus,
  Settings,
  Sparkles,
  Target,
  Award,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "../../shared/Navbar";

const UnAuthorizeUser = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [unAuthorize, setUnAuthorize] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [processingIds, setProcessingIds] = useState(new Set());
  const [actionFeedback, setActionFeedback] = useState(null);

  // Fetch unauthorized users
  useEffect(() => {
    const fetchUnUsers = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          "https://bppimt-quiz-kml1.vercel.app/api/v1/admin/all/unauthorize/user",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnAuthorize(res.data.allUnuser || []);
      } catch (error) {
        console.error(error);
        toast.error("no one can pending");
      } finally {
        setLoading(false);
      }
    };
    fetchUnUsers();
  }, [getAccessTokenSilently]);

  // Update user status (accept or reject)
  const updateUserStatus = async (id, userName, status) => {
    try {
      setProcessingIds((prev) => new Set([...prev, id]));
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      await axios.put(
        "https://bppimt-quiz-kml1.vercel.app/api/v1/admin/veryfy/newUser",
        {
          unveryfyuser: id,
          status: status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from UI with success feedback
      setUnAuthorize((prev) => prev.filter((u) => u._id !== id));

      const statusMessage =
        status === "accept"
          ? `${userName} has been successfully verified!`
          : `${userName} has been rejected`;

      setActionFeedback({
        type: status === "accept" ? "success" : "warning",
        message: statusMessage,
      });

      // Clear feedback after 3 seconds
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (error) {
      console.error(error);
      setActionFeedback({
        type: "error",
        message: `Failed to ${status} ${userName}`,
      });
      setTimeout(() => setActionFeedback(null), 3000);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Accept user
  const handleVerify = async (id, userName) => {
    await updateUserStatus(id, userName, "accept");
  };

  // Reject user
  const handleReject = async (id, userName) => {
    await updateUserStatus(id, userName, "reject");
  };

  // Filter and search logic
  const lowerSearch = searchTerm?.toLowerCase() || "";
  const filteredUsers = unAuthorize.filter((user) => {
    const matchesSearch =
      user.fullname?.toLowerCase()?.includes(lowerSearch) ||
      user.email?.toLowerCase()?.includes(lowerSearch) ||
      user.department?.toLowerCase()?.includes(lowerSearch);

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "student" && user.role === "student") ||
      (selectedFilter === "teacher" && user.role === "teacher");

    return matchesSearch && matchesFilter;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.fullname?.localeCompare(b.fullname) || 0;
      case "recent":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case "department":
        return a.department?.localeCompare(b.department) || 0;
      case "role":
        return a.role?.localeCompare(b.role) || 0;
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
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="w-10 h-10 text-white animate-spin" />
          </div>
          <p className="text-xl font-semibold text-gray-700">
            Loading pending users...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we fetch the data
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
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
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold text-white mb-2">
                  User Authorization Center 🔐
                </h1>
                <p className="text-white/90 text-lg">
                  Review and approve pending user registrations
                </p>
              </div>
            </div>

            {/* Admin Stats */}
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filteredUsers.length}
                </div>
                <div className="text-white/80 text-sm">Pending Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">⏳</div>
                <div className="text-white/80 text-sm">Awaiting Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">🛡️</div>
                <div className="text-white/80 text-sm">Security Check</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Feedback */}
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 -mt-4 relative z-30"
          >
            <div
              className={`p-4 rounded-2xl shadow-lg border-l-4 ${
                actionFeedback.type === "success"
                  ? "bg-green-50 border-green-500 text-green-800"
                  : actionFeedback.type === "error"
                  ? "bg-red-50 border-red-500 text-red-800"
                  : "bg-yellow-50 border-yellow-500 text-yellow-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {actionFeedback.type === "success" && (
                  <CheckCircle className="w-5 h-5" />
                )}
                {actionFeedback.type === "error" && (
                  <XCircle className="w-5 h-5" />
                )}
                {actionFeedback.type === "warning" && (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-semibold">{actionFeedback.message}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Filter Section */}
        <div className="px-6 -mt-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
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
                  <option value="all">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="teacher">Teachers Only</option>
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
                  <option value="recent">Recently Added</option>
                  <option value="name">Sort by Name</option>
                  <option value="department">By Department</option>
                  <option value="role">By Role</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-12">
          {sortedUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="w-28 h-28 bg-gradient-to-br from-green-200 to-blue-300 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <UserCheck className="w-14 h-14 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                All caught up! 🎉
              </h3>
              <p className="text-gray-500 text-lg mb-6">
                {searchTerm
                  ? "No users match your search criteria"
                  : "No pending user registrations"}
              </p>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all duration-300">
                <RefreshCw className="w-4 h-4" />
                Refresh List
              </Button>
            </motion.div>
          ) : (
            // Enhanced Table View
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            >
              {/* Table Header */}
              <div className="bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-slate-600" />
                    <h2 className="text-xl font-bold text-gray-800">
                      Pending Approvals
                    </h2>
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                      {sortedUsers.length} waiting
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        User Profile
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-700">
                        Contact Info
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-700">
                        Role & Department
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-700">
                        Academic Info
                      </th>
                      <th className="px-6 py-4 text-center font-bold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100 group"
                      >
                        {/* User Profile */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={user.picture}
                                alt="profile"
                                className="w-12 h-12 rounded-full object-cover shadow-md ring-2 ring-white"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Clock className="w-2 h-2 text-yellow-800" />
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-base">
                                {user.fullname}
                              </p>
                              <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">
                                ID: {user._id?.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-700 font-medium">
                                {user.email}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Email verification pending
                            </div>
                          </div>
                        </td>

                        {/* Role & Department */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  user.role === "student"
                                    ? "bg-blue-400"
                                    : "bg-purple-400"
                                }`}
                              ></div>
                              <span
                                className={`text-sm font-bold px-3 py-1 rounded-full ${
                                  user.role === "student"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {user.role?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700 font-medium">
                                {user.department}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Academic Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {user.semester && (
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-green-600" />
                                <span className="text-sm bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full">
                                  Semester {user.semester}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                Applied:{" "}
                                {new Date(
                                  user.createdAt || Date.now()
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              onClick={() =>
                                handleVerify(user._id, user.fullname)
                              }
                              disabled={processingIds.has(user._id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                            >
                              {processingIds.has(user._id) ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                              {processingIds.has(user._id)
                                ? "Processing..."
                                : "Approve"}
                            </Button>
                            <Button
                              onClick={() =>
                                handleReject(user._id, user.fullname)
                              }
                              disabled={processingIds.has(user._id)}
                              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                            >
                              <UserX className="w-4 h-4" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-100 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>Showing {sortedUsers.length} pending users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default UnAuthorizeUser;
