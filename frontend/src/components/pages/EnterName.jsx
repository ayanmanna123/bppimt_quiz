import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setuser } from "../../Redux/auth.reducer";
import { Howl } from "howler";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  ShieldCheck,
  KeyRound,
  CheckCircle,
  Send,
  Sparkles,
  UserCheck,
  Lock,
  Zap,
  Award,
  Star,
  BookOpen,
} from "lucide-react";

const EnterName = () => {
  const [semester, setSemester] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter name, 2: Send code, 3: Verify code, 4: Complete

  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const { usere } = useSelector((store) => store.auth);

  // Send verification code
  const sendCodeHandler = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name first!");
      return;
    }
    
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      await axios.post(
        "https://bppimt-quiz-kml1.vercel.app/api/v1/user/send-code",
        {
          email: usere?.email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Verification code sent to your email!");
      setStep(3);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  // Verify code
  const verifyCodeHandler = async () => {
    if (!code.trim()) {
      toast.error("Please enter the verification code!");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const res = await axios.post(
        "https://bppimt-quiz-kml1.vercel.app/api/v1/user/verify-code",
        {
          email: usere?.email,
          code,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Code verified successfully!");
        setIsVerified(true);
        setStep(4);
      } else {
        toast.error("Invalid verification code!");
        setIsVerified(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Verification failed!");
    }
  };

  // Submit handler
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error("Please verify your code first!");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.put(
        "https://bppimt-quiz-kml1.vercel.app/api/v1/user/updateuser",
        { sem: semester, name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch(setuser(res.data.user));

      const sound = new Howl({ src: ["/notification.wav"], volume: 0.7 });
      sound.play();

      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Update failed!");
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { duration: 0.6, type: "spring", stiffness: 100 }
    },
    exit: { 
      opacity: 0, 
      x: -50, 
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-28 h-28 border-2 border-white/20 rounded-2xl animate-pulse rotate-45"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-white/30 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-white/10 rounded-2xl rotate-12 animate-pulse"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center py-16 px-6"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-2xl">
                <UserCheck className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
                Complete Your Profile ✨
              </h1>
              <p className="text-white/90 text-xl font-medium">
                Let's verify your identity and set up your account
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-4 mt-8">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${step >= 1 ? 'bg-white text-purple-600 shadow-lg' : 'bg-white/30 text-white/70'}`}>
              <User className="w-6 h-6" />
            </div>
            <div className={`w-16 h-1 bg-white/30 rounded-full mt-6 transition-all duration-500 ${step >= 2 ? 'bg-white' : ''}`}></div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${step >= 3 ? 'bg-white text-purple-600 shadow-lg' : 'bg-white/30 text-white/70'}`}>
              <Mail className="w-6 h-6" />
            </div>
            <div className={`w-16 h-1 bg-white/30 rounded-full mt-6 transition-all duration-500 ${step >= 4 ? 'bg-white' : ''}`}></div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${step >= 4 ? 'bg-white text-purple-600 shadow-lg' : 'bg-white/30 text-white/70'}`}>
              <Award className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Form Section */}
      <div className="px-6 -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            <form onSubmit={submitHandler}>
              {/* Form Header */}
              <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Account Verification</h2>
                    <p className="text-white/90">Secure your account with email verification</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Step 1: Name Input */}
                <motion.div
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-l-4 border-blue-400">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                    </div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="pl-12 h-14 text-lg border-2 border-gray-200 rounded-xl bg-white/80 hover:bg-white focus:bg-white focus:border-blue-400 transition-all duration-300 font-medium shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Step 2: Email Verification */}
                <motion.div
                  variants={stepVariants}
                  initial="hidden"
                  animate={step >= 1 && name.trim() ? "visible" : "hidden"}
                  className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border-l-4 border-purple-400"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-800">Email Verification</h3>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 mb-4 border border-purple-200">
                    <p className="text-gray-700 mb-2">
                      We'll send a verification code to:
                    </p>
                    <p className="font-bold text-purple-700 text-lg flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      {usere?.email}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={sendCodeHandler}
                    disabled={loading || !name.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Sending Code...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Verification Code
                        <Zap className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Step 3: Code Verification */}
                {step >= 3 && (
                  <motion.div
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border-l-4 border-orange-400"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <KeyRound className="w-6 h-6 text-orange-600" />
                      <h3 className="text-xl font-bold text-gray-800">Enter Verification Code</h3>
                    </div>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="code"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="pl-12 h-14 text-lg border-2 border-gray-200 rounded-xl bg-white/80 hover:bg-white focus:bg-white focus:border-orange-400 transition-all duration-300 font-mono shadow-sm"
                          maxLength={6}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={verifyCodeHandler}
                        disabled={!code.trim()}
                        className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 transition-all duration-500 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        Verify
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Success & Submit */}
                {isVerified && (
                  <motion.div
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-400"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h3 className="text-xl font-bold text-gray-800">Verification Successful!</h3>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 mb-6">
                      <p className="text-green-700 font-semibold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Your email has been verified successfully!
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105"
                    >
                      <Award className="w-5 h-5" />
                      Complete Setup
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </form>
          </div>

          {/* Additional Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/40 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-800">Secure & Safe</h3>
            </div>
            <p className="text-gray-600">
              Your information is encrypted and protected. We only use your email for verification purposes.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnterName;