import { useSelector, useDispatch } from "react-redux";
import { store } from "../Redux/store";
import { Input } from "./ui/input";
import axios from "axios";
import * as React from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setuser } from "../Redux/auth.reducer";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { 
  UserCircle, 
  Building2, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Users,
  BookOpen,
  Calendar,
  Hash
} from "lucide-react";

const Complete = () => {
  const { usere } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  // Separate states for each dropdown
  const [role, setRole] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [semester, setSemester] = React.useState("");
  const [universityNo, setuniversityNo] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();
  const {
    logout,
    loginWithRedirect,
    isAuthenticated,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const handelsubmite = async () => {
    if (!role || !department || !semester || !universityNo) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const res = await axios.post(
        "https://bppimt-quiz-kml1.vercel.app/api/v1/user/createuser",
        {
          fullname: user?.name,
          email: user?.email,
          picture: user?.picture,
          role,
          department,
          semester,
          universityNo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(setuser(res.data.createrduser));
      toast.success("Profile completed successfully! Welcome aboard! 🎉");
      console.log("User created:", res.data.createrduser);
      navigate("/");
    } catch (error) {
      toast.error("Failed to complete registration. Please try again.");
      console.log(
        "Error creating user:",
        error.response?.data || error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    const checkUser = async () => {
      if (isAuthenticated && user?.email) {
        try {
          const token = await getAccessTokenSilently({
            audience: "http://localhost:5000/api/v2",
          });

          const res = await axios.get(
            `https://bppimt-quiz-kml1.vercel.app/api/v1/user/${user.email}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.data?.success) {
            dispatch(setuser(res.data.user));
            navigate("/");
          }
        } catch (error) {
          console.log("User not found, needs to complete profile");
          console.log(error);
        }
      }
    };

    checkUser();
  }, [isAuthenticated, user, getAccessTokenSilently, dispatch, navigate]);

  const isFormComplete = role && department && semester && universityNo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 flex items-center justify-center p-6">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-15 blur-2xl"></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-10 blur-lg"></div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl"
      >
        {/* Welcome Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-24 h-24 border-2 border-white/40 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/30 rounded-full animate-bounce"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/30 rounded-2xl rotate-45 animate-pulse"></div>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="relative z-10"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                <UserCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome! 👋</h1>
              <p className="text-white/90 text-lg">
                Let's complete your profile to get started
              </p>
              <div className="w-16 h-1 bg-white/60 rounded-full mx-auto mt-4"></div>
            </motion.div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* User Info Display */}
            {user && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Select Your Role
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-14 text-left justify-between bg-white/50 hover:bg-white/80 border-2 border-gray-200 hover:border-indigo-300 rounded-xl shadow-sm transition-all duration-300"
                    >
                      <span className={role ? "text-gray-900" : "text-gray-500"}>
                        {role ? (role === "student" ? "🎓 Student" : "👨‍🏫 Teacher") : "Select your role..."}
                      </span>
                      <UserCircle className="w-5 h-5 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full rounded-xl border-0 shadow-xl bg-white/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="text-indigo-600 font-semibold">Choose Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
                      <DropdownMenuRadioItem value="student" className="cursor-pointer py-3">
                        🎓 Student
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="teacher" className="cursor-pointer py-3">
                        👨‍🏫 Teacher
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  Select Department
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-14 text-left justify-between bg-white/50 hover:bg-white/80 border-2 border-gray-200 hover:border-purple-300 rounded-xl shadow-sm transition-all duration-300"
                    >
                      <span className={department ? "text-gray-900" : "text-gray-500"}>
                        {department ? `🏛️ ${department}` : "Choose your department..."}
                      </span>
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full rounded-xl border-0 shadow-xl bg-white/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="text-purple-600 font-semibold">Department</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={department} onValueChange={setDepartment}>
                      <DropdownMenuRadioItem value="EE" className="cursor-pointer py-3">
                        ⚡ Electrical Engineering (EE)
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="ECE" className="cursor-pointer py-3">
                        📡 Electronics & Communication (ECE)
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="CSE" className="cursor-pointer py-3">
                        💻 Computer Science (CSE)
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="IT" className="cursor-pointer py-3">
                        🌐 Information Technology (IT)
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-600" />
                  Select Semester
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-14 text-left justify-between bg-white/50 hover:bg-white/80 border-2 border-gray-200 hover:border-pink-300 rounded-xl shadow-sm transition-all duration-300"
                    >
                      <span className={semester ? "text-gray-900" : "text-gray-500"}>
                        {semester ? `📚 ${semester.charAt(0).toUpperCase() + semester.slice(1)} Semester` : "Pick your semester..."}
                      </span>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full rounded-xl border-0 shadow-xl bg-white/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="text-pink-600 font-semibold">Semester</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={semester} onValueChange={setSemester}>
                      {[
                        { value: "first", label: "1️⃣ First Semester" },
                        { value: "second", label: "2️⃣ Second Semester" },
                        { value: "third", label: "3️⃣ Third Semester" },
                        { value: "fourth", label: "4️⃣ Fourth Semester" },
                        { value: "fifth", label: "5️⃣ Fifth Semester" },
                        { value: "sixth", label: "6️⃣ Sixth Semester" },
                        { value: "seventh", label: "7️⃣ Seventh Semester" },
                        { value: "eighth", label: "8️⃣ Eighth Semester" }
                      ].map((sem) => (
                        <DropdownMenuRadioItem 
                          key={sem.value} 
                          value={sem.value} 
                          className="cursor-pointer py-3"
                        >
                          {sem.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              {/* University Number Input Field */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                  <Hash className="w-4 h-4 text-emerald-600" />
                  University Number
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter your university number..."
                    value={universityNo}
                    onChange={(e) => setuniversityNo(e.target.value)}
                    className="w-full h-14 bg-white/50 hover:bg-white/80 border-2 border-gray-200 focus:border-emerald-300 rounded-xl shadow-sm transition-all duration-300 text-lg pl-12"
                  />
                  <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="mt-8 pt-6 border-t border-gray-100"
            >
              <Button
                onClick={handelsubmite}
                disabled={!isFormComplete || isSubmitting}
                className={`w-full h-16 text-lg font-bold rounded-2xl transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 ${
                  isFormComplete
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating your profile...
                  </div>
                ) : isFormComplete ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6" />
                    Complete Registration
                    <ArrowRight className="w-5 h-5" />
                    <Sparkles className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-6 h-6" />
                    Please fill all fields
                  </div>
                )}
              </Button>

              {/* Progress indicator */}
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-2">
                  {[role, department, semester, universityNo].map((field, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        field
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                {Object.values({ role, department, semester, universityNo }).filter(Boolean).length}/4 fields completed
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Complete;