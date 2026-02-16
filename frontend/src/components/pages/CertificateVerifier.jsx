import axios from "axios";
import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Loader,
  Award,
  User,
  Mail,
  GraduationCap,
  Calendar,
  Star,
  Sparkles,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const CertificateVerifier = () => {
  const [resultId, setResultId] = useState("");
  const [status, setStatus] = useState(null); // "loading" | "verified" | "not_verified"
  const [resultData, setResultData] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  const handleVerify = async () => {
    if (!resultId) return;

    setStatus("loading");
    setResultData(null);

    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/reasult/veryfi`,
        {
          resultId: resultId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (data.success) {
        setStatus("verified");
        setResultData(data.result);
      } else {
        setStatus("not_verified");
      }
    } catch (error) {
      console.error(error);
      setStatus("not_verified");
    }
  };

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-900 p-6 transition-colors duration-500">
        {/* Header Section */}
        <div className="relative mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Award className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                  Certificate Verifier
                </h1>
                <p className="text-gray-600 text-lg mt-1">
                  Verify the authenticity of quiz certificates
                </p>
              </div>
            </div>
          </motion.div>

          {/* Floating decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full opacity-15 blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full opacity-10 blur-lg"></div>
        </div>

        {/* Main Verification Card */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          >
            <Card className="overflow-hidden shadow-xl bg-white dark:bg-slate-900 border-0 rounded-3xl transition-colors duration-500">
              {/* Header with gradient */}
              <div className="h-32 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-3 right-3 w-16 h-16 border-2 border-white/40 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/30 rounded-full animate-bounce"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/30 rounded-2xl rotate-45 animate-pulse"></div>
                </div>

                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold drop-shadow-lg">
                        Verification Portal
                      </h2>
                      <p className="text-sm opacity-90">
                        Enter Result ID to verify
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                {/* Search Input Section */}
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={resultId}
                      onChange={(e) => setResultId(e.target.value)}
                      placeholder="Enter Result ID (e.g., QUIZ_12345)"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 text-lg font-medium"
                      onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleVerify}
                      disabled={!resultId || status === "loading"}
                      className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg disabled:opacity-50"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Verifying Certificate...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          Verify Certificate
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>

                {/* Status Messages */}
                {status === "loading" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                      Checking certificate authenticity...
                    </p>
                  </motion.div>
                )}

                {status === "verified" && resultData && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mt-8"
                  >
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800/80 rounded-3xl overflow-hidden shadow-lg transition-colors duration-500">
                      <CardHeader className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold">
                              ✅ Certificate Verified
                            </CardTitle>
                            <p className="text-green-100 text-sm">
                              This certificate is authentic and valid
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 space-y-4">
                        {/* Student Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700/50 rounded-xl shadow-sm transition-colors duration-500">
                            <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                STUDENT NAME
                              </p>
                              <p className="text-sm font-bold text-gray-700 dark:text-white">
                                {resultData.student.fullname}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700/50 rounded-xl shadow-sm transition-colors duration-500">
                            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                EMAIL
                              </p>
                              <p className="text-sm font-bold text-gray-700 dark:text-white">
                                {resultData.student.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700/50 rounded-xl shadow-sm transition-colors duration-500">
                            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                UNIVERSITY NO
                              </p>
                              <p className="text-sm font-bold text-gray-700 dark:text-white">
                                {resultData.student.universityNo}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700/50 rounded-xl shadow-sm transition-colors duration-500">
                            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                DEPARTMENT
                              </p>
                              <p className="text-sm font-bold text-gray-700 dark:text-white">
                                {resultData.student.department}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-700/50 rounded-xl shadow-sm transition-colors duration-500">
                            <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                SEMESTER
                              </p>
                              <p className="text-sm font-bold text-gray-700 dark:text-white">
                                {resultData.student.semester}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 rounded-xl shadow-sm border-2 border-yellow-200 dark:border-yellow-900/50">
                            <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                SCORE ACHIEVED
                              </p>
                              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                                {resultData.score}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Submission Date */}
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-xl shadow-sm border-2 border-purple-200 dark:border-purple-900/50">
                          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="text-xs text-purple-600 dark:text-purple-300 font-medium">
                              SUBMITTED ON
                            </p>
                            <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                              {new Date(
                                resultData.submittedAt
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {status === "not_verified" && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mt-8"
                  >
                    <Card className="border-0 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-3xl overflow-hidden shadow-lg transition-colors duration-500">
                      <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-200 to-pink-300 dark:from-red-800 dark:to-pink-900 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <XCircle className="w-10 h-10 text-red-600 dark:text-red-300" />
                        </div>
                        <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                          ❌ Certificate Not Verified
                        </h3>
                        <p className="text-red-600 dark:text-red-300">
                          The provided Result ID is invalid or the certificate
                          could not be found in our system.
                        </p>
                        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                            Please check the Result ID and try again, or contact
                            support if you believe this is an error.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CertificateVerifier;
