import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { QRCodeSVG } from "qrcode.react";

import { Howl } from "howler";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  QrCode,
  Scan,
  Maximize2,
  Minimize2,
  StopCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSocket } from "../../context/SocketContext";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const AttendanceSheet = () => {
  const [students, setStudents] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedIsoDate, setSelectedIsoDate] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { getAccessTokenSilently } = useAuth0();
  const { subjectId } = useParams();
  const location = useLocation();
  const qrStartedRef = useRef(false);

  // Auto-start QR functionality if steered from the dashboard Quick Action
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("startQr") === "true" && !qrStartedRef.current) {
      qrStartedRef.current = true;
      // Small timeout to allow auth0 token to be ready if needed
      setTimeout(() => {
        generateQrAuth(new Date().toLocaleDateString(), new Date().toISOString());
      }, 500);
    }
  }, [location.search]);
  const socket = useSocket(); // ✅ Access socket instance

  // ✅ Fetch attendance data
  const fetchAttendance = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/attandance/get-subject/${subjectId}?_t=${new Date().getTime()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { totalStudent, subject } = res.data;

      const currentYear = new Date().getFullYear(); // ✅ Get current year dynamically

      const monthsData = Array.from({ length: 12 }, (_, i) => {
        const daysInMonth = new Date(currentYear, i + 1, 0).getDate();
        return {
          month: i + 1,
          days: Array.from({ length: daysInMonth }, (_, d) => {
            const dateObj = new Date(currentYear, i, d + 1);
            const dateStr = dateObj.toLocaleDateString();
            return { date: dateStr, iso: dateObj.toISOString() };
          }),
        };
      });

      const attendanceMap = {};
      subject.attendance.forEach((day) => {
        const dateStr = new Date(day.date).toLocaleDateString();
        attendanceMap[dateStr] = day.records.map((r) => r.student._id);
      });

      const studentArr = totalStudent.map((stu) => {
        const attendanceObj = {};
        monthsData.forEach((month) => {
          month.days.forEach((day) => {
            if (attendanceMap[day.date]) {
              const isPresent = attendanceMap[day.date].includes(stu._id);
              attendanceObj[day.date] = isPresent ? "P" : "A";
            } else {
              attendanceObj[day.date] = "";
            }
          });
        });
        return {
          _id: stu._id,
          fullname: stu.fullname,
          universityNo: stu.universityNo,
          ...attendanceObj,
        };
      });

      setMonths(monthsData);
      setStudents(
        studentArr.sort((a, b) =>
          a.universityNo.localeCompare(b.universityNo)
        )
      );
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  }, [subjectId, getAccessTokenSilently]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // ✅ Socket integration for real-time updates
  useEffect(() => {
    if (socket && subjectId) {
      // Join the subject-specific room
      socket.emit("joinSubject", { subjectId, type: "subject" });

      // Listen for updates
      const handleUpdate = (data) => {
        console.log("[Socket] Received attendanceUpdate:", data);
        if (data.subjectId === subjectId) {
          fetchAttendance(); // Refresh data
          toast.info("Attendance data updated in real-time");
        }
      };

      socket.on("attendanceUpdate", handleUpdate);

      return () => {
        socket.off("attendanceUpdate", handleUpdate);
      };
    }
  }, [socket, subjectId, fetchAttendance]);

  // ✅ Popup open handler
  const handleDateClick = (date, isoDate) => {
    setSelectedDate(date);
    if (isoDate) setSelectedIsoDate(isoDate);
    const initial = {};
    students.forEach((stu) => {
      initial[stu._id] = stu[date] || "";
    });
    setSelectedAttendance(initial);
    setShowPopup(true);
  };

  // ✅ Toggle attendance for a student
  const toggleAttendance = (id, status) => {
    setSelectedAttendance((prev) => ({ ...prev, [id]: status }));
  };

  // ✅ Submit manual attendance
  const handleSubmitAttendance = async () => {
    try {
      setIsUpdating(true);
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const attendanceList = Object.entries(selectedAttendance).map(
        ([studentId, status]) => ({
          studentId,
          status: status === "P" ? "present" : "absent",
        })
      );

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/attandance/give-attandance-manuly`,
        {
          subjectId,
          date: selectedDate,
          attendanceList,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowPopup(false);
      setIsUpdating(false);
      toast.success(res.data.message);
      const sound = new Howl({
        src: ["/notification.wav"],
        volume: 0.7,
      });
      sound.play();
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      toast.error(msg);
      console.error("Error submitting manual attendance:", error);
      setIsUpdating(false);
    }
  };
  // ✅ QR Code Logic
  const [generatedQrToken, setGeneratedQrToken] = useState(null);
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [isQrFullScreen, setIsQrFullScreen] = useState(false);
  const [qrCountdown, setQrCountdown] = useState("");
  const qrRefreshInterval = useRef(null);

  useEffect(() => {
    let timer;
    if (generatedQrToken && qrExpiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = qrExpiresAt.getTime() - now;

        if (distance <= 0) {
          setQrCountdown("EXPIRED");
          if (timer) clearInterval(timer);

          // Clear states immediately for instant UI response
          setGeneratedQrToken(null);
          setQrExpiresAt(null);
          setIsQrFullScreen(false);

          handleStopQrAttendance(true); // Call stop API in background
          return;
        }

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setQrCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      };

      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [generatedQrToken, qrExpiresAt]);

  // QR Token Rotation Interval
  useEffect(() => {
    return () => {
      if (qrRefreshInterval.current) clearInterval(qrRefreshInterval.current);
    };
  }, []);

  const generateQrAuth = async (dateStr, isoDateStr) => {
    try {
      // Clear existing interval if any
      if (qrRefreshInterval.current) clearInterval(qrRefreshInterval.current);

      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const fetchNewToken = async () => {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/attandance/generate-qr`,
            { subjectId, targetDate: isoDateStr || new Date().toISOString() },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.data.success) {
            setGeneratedQrToken(res.data.token);
            setQrExpiresAt(new Date(res.data.expiresAt));
          }
        } catch (error) {
          console.error("Error refreshing QR token:", error);
        }
      };

      // Initial fetch
      await fetchNewToken();
      setSelectedDate(dateStr || new Date().toLocaleDateString()); // Ensure date is set for student counter strictly 
      setIsQrFullScreen(true);
      toast.success(`QR Attendance Started! Refreshing every 10s.`);

      // Setup interval for rotation (every 5 seconds)
      qrRefreshInterval.current = setInterval(fetchNewToken, 10000);

    } catch (error) {
      console.error("Error starting QR attendance:", error);
      toast.error("Failed to start QR attendance");
    }
  };

  const handleStopQrAttendance = async (isAuto = false) => {
    try {
      // 1. Clear intervals immediately
      if (qrRefreshInterval.current) {
        clearInterval(qrRefreshInterval.current);
        qrRefreshInterval.current = null;
      }

      // 2. Optimistic UI reset if requested or manually stopped
      setGeneratedQrToken(null);
      setQrExpiresAt(null);
      setIsQrFullScreen(false);

      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/attandance/stop-qr/${subjectId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && !isAuto) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error stopping QR attendance:", error);
      if (!isAuto) toast.error("Failed to stop QR attendance on server");
    }
  };

  // ✅ Attendance Toggle Logic
  const [isAttendanceEnabled, setIsAttendanceEnabled] = useState(false);

  useEffect(() => {
    const fetchToggleStatus = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/attendance-toggle/status/${subjectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setIsAttendanceEnabled(res.data.isAttendanceEnabled);
        }
      } catch (error) {
        console.error("Error fetching attendance toggle status:", error);
      }
    };
    fetchToggleStatus();
  }, [subjectId, getAccessTokenSilently]);

  const handleToggleAttendance = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      const newStatus = !isAttendanceEnabled;

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/attendance-toggle/toggle`,
        { subjectId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setIsAttendanceEnabled(newStatus);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error toggling attendance:", error);
      toast.error("Failed to toggle attendance");
    }
  };

  // ✅ Excel Export
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    months.forEach((month) => {
      const sheetData = [];
      const header = ["Name", "University No"];
      month.days.forEach((day) => header.push(new Date(day.date).getDate()));
      header.push("Total Present", "Total Absent");
      sheetData.push(header);

      students.forEach((student) => {
        let monthPresent = 0;
        let monthAbsent = 0;
        const row = [student.fullname, student.universityNo];
        month.days.forEach((day) => {
          const status = student[day.date];
          row.push(status);
          if (status === "P") monthPresent++;
          else if (status === "A") monthAbsent++;
        });
        row.push(monthPresent, monthAbsent);
        sheetData.push(row);
      });

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, monthNames[month.month - 1]);
    });

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `Attendance_Sheet_${new Date().getFullYear()}.xlsx`);
  };

  return (
    <>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-sans transition-colors duration-700">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-[#030014] dark:via-[#05001c] dark:to-[#030014]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-indigo-500/5 dark:to-purple-500/5 pointer-events-none"></div>
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), 
                        radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
          }}
        ></div>

        {/* Main Content Container */}
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header Card */}
          <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-700 rounded-3xl p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white p-4 rounded-2xl shadow-lg">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Attendance Dashboard</h1>
                <p className="text-indigo-600 dark:text-gray-300 mt-1 font-medium text-lg">Manage & track student attendance seamlessly</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-4 items-center">

              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-5 h-5" />
                <span>Export Data</span>
              </button>
            </div>
          </div>

          {/* QR Code Banner - Floating Card */}
          {generatedQrToken && (
            <div className="mb-8 transform transition-all duration-500 ease-out translate-y-0 opacity-100">
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl shadow-xl border-l-8 border-green-500 p-6 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-green-50 to-transparent dark:from-green-900/10 opacity-50 z-0 group-hover:w-full transition-all duration-700"></div>
                <div className="relative z-10 flex gap-6 items-center">
                  <div className="bg-white p-3 rounded-xl shadow-inner border border-green-100">
                    <QRCodeSVG value={generatedQrToken} size={120} level="H" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 text-green-700 dark:text-green-400 mb-1">
                      <QrCode className="w-6 h-6" />
                      <h3 className="text-lg font-bold uppercase tracking-wider">Active QR Attendance</h3>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold tracking-wider">{qrCountdown}</span>
                      <span className="opacity-50">/ Expires at {qrExpiresAt?.toLocaleTimeString()}</span>
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-2 font-mono break-all max-w-xs transition-all opacity-40 hover:opacity-100 italic">
                      Token: {generatedQrToken}
                    </p>
                  </div>
                </div>
                <div className="relative z-10 hidden sm:block">
                  <div className="text-center px-4 flex flex-col gap-2">
                    <button
                      onClick={() => setIsQrFullScreen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shadow-lg transition-all flex items-center gap-2 font-bold"
                    >
                      <Maximize2 className="w-5 h-5" />
                      FULLSCREEN
                    </button>
                    <p className="text-xs text-gray-500 uppercase tracking-tighter">Click to show students</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Tables Section */}
          <div className="space-y-12">
            {months.map((month) => (
              <div key={month.month} className="bg-white dark:bg-slate-900/40 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden backdrop-blur-sm">
                {/* Month Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {monthNames[month.month - 1]} <span className="text-gray-400 dark:text-gray-500 font-medium text-xl">{new Date().getFullYear()}</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      const d = new Date(
                        new Date().getFullYear(),
                        month.month - 1,
                        new Date().getDate()
                      );
                      handleDateClick(d.toLocaleDateString(), d.toISOString());
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/50"
                  >
                    <span>+ Mark Attendance</span>
                  </button>
                </div>

                {/* The Table */}
                <div className="overflow-x-auto custom-scrollbar">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-indigo-500/20">
                      <thead className="bg-gray-50 dark:bg-slate-900/50">
                        <tr>
                          <th scope="col" className="sticky left-0 z-20 bg-gray-50 dark:bg-slate-900 px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] border-r border-gray-200 dark:border-slate-800 min-w-[200px]">
                            Student Name
                          </th>
                          <th scope="col" className="sticky left-[200px] z-20 bg-gray-50 dark:bg-slate-900 px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] border-r border-gray-200 dark:border-slate-800 min-w-[140px]">
                            University ID
                          </th>
                          {month.days.map((day) => (
                            <th
                              key={day.date}
                              onClick={() => handleDateClick(day.date, day.iso)}
                              className="px-2 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors min-w-[40px] border-r border-gray-100 dark:border-slate-800 last:border-r-0 group"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span>{new Date(day.date).getDate()}</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal group-hover:text-indigo-400">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span>
                              </div>
                            </th>
                          ))}
                          <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider bg-green-50/30 dark:bg-green-900/20 border-l border-gray-200 dark:border-slate-800">
                            Present
                          </th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-50/30 dark:bg-red-900/20 border-l border-gray-200 dark:border-slate-800">
                            Absent
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-transparent divide-y divide-gray-100 dark:divide-slate-800">
                        {students.map((student, idx) => {
                          let monthPresent = 0;
                          let monthAbsent = 0;

                          month.days.forEach((day) => {
                            if (student[day.date] === "P") monthPresent++;
                            else if (student[day.date] === "A") monthAbsent++;
                          });

                          return (
                            <tr key={idx} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors even:bg-slate-50/30 dark:even:bg-slate-900/30">
                              <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-200 border-r border-gray-200 dark:border-slate-800 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10">
                                {student.fullname}
                              </td>
                              <td className="sticky left-[200px] z-10 bg-white dark:bg-slate-900 px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-slate-800 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] font-mono group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10">
                                {student.universityNo}
                              </td>

                              {month.days.map((day) => (
                                <td
                                  key={day.date}
                                  className="px-2 py-3 whitespace-nowrap text-center text-sm font-medium border-r border-gray-50 dark:border-slate-800/50 last:border-r-0"
                                >
                                  {student[day.date] === "P" ? (
                                    <div className="flex justify-center">
                                      <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50" />
                                    </div>
                                  ) : student[day.date] === "A" ? (
                                    <div className="flex justify-center">
                                      <XCircle className="w-5 h-5 text-red-500 fill-red-50" />
                                    </div>
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 inline-block"></span>
                                  )}
                                </td>
                              ))}



                              <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-green-600 dark:text-green-400 bg-green-50/20 dark:bg-green-900/10 border-l border-gray-100 dark:border-slate-800">
                                {monthPresent}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-red-600 dark:text-red-400 bg-red-50/20 dark:bg-red-900/10 border-l border-gray-100 dark:border-slate-800">
                                {monthAbsent}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Manual Attendance Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPopup(false)}
          ></div>

          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden transform transition-all scale-100 border dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Mark Attendance
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {selectedDate}
                </p>
              </div>
              <button
                onClick={() => generateQrAuth(selectedDate, selectedIsoDate)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md shadow-green-200 transition-all text-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>Generate QR</span>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900">
              <div className="space-y-3">
                {students.map((stu) => (
                  <div
                    key={stu._id}
                    className="flex justify-between items-center p-4 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                        {stu.fullname.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{stu.fullname}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{stu.universityNo}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 bg-gray-100/50 dark:bg-slate-800 p-1 rounded-lg">
                      <button
                        onClick={() => toggleAttendance(stu._id, "P")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${selectedAttendance[stu._id] === "P"
                          ? "bg-white dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-sm border border-green-200 dark:border-green-800"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-slate-700"
                          }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${selectedAttendance[stu._id] === "P" ? "fill-green-100 dark:fill-green-900/50" : ""}`} />
                        Present
                      </button>
                      <button
                        onClick={() => toggleAttendance(stu._id, "A")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${selectedAttendance[stu._id] === "A"
                          ? "bg-white dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-sm border border-red-200 dark:border-red-800"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-slate-700"
                          }`}
                      >
                        <XCircle className={`w-4 h-4 ${selectedAttendance[stu._id] === "A" ? "fill-red-100 dark:fill-red-900/50" : ""}`} />
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-end items-center gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-200/50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAttendance}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Full Screen QR Display Modal */}
      {isQrFullScreen && generatedQrToken && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col items-center justify-between overflow-hidden animate-in fade-in zoom-in duration-300 h-screen">
          {/* Sticky Stats Header */}
          <div className="w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 z-[110] px-6 sm:px-12 py-3 flex flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="flex flex-col items-start leading-none">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tighter">
                    {qrCountdown || "00:00"}
                  </span>
                </div>
                <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Remaining</p>
              </div>

              <div className="h-8 w-px bg-gray-200 dark:bg-slate-800"></div>

              <div className="flex flex-col items-start leading-none">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <span className="text-2xl sm:text-3xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">
                    {students.filter(s => s[selectedDate] === "P").length}
                  </span>
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Present</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsQrFullScreen(false)}
                className="bg-gray-100 dark:bg-slate-800 p-2 sm:p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all font-bold text-xs flex items-center gap-2 border border-gray-200 dark:border-slate-700"
              >
                <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden md:inline">MINIMIZE</span>
              </button>
              <button
                onClick={handleStopQrAttendance}
                className="bg-red-600 hover:bg-red-700 text-white p-2 sm:p-3 px-4 sm:px-6 rounded-xl transition-all font-bold text-xs shadow-lg shadow-red-200 dark:shadow-none flex items-center gap-2"
              >
                <StopCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>STOP</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center w-full px-6 gap-8 overflow-hidden min-h-0">
            {/* Left Side: Rotated Message */}


            {/* Center: Massive QR Code */}
            <div className="flex-1 flex items-center justify-center min-h-0 w-full relative">


              <div className="bg-white p-[3px] rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl border-[6px] sm:border-[12px] border-indigo-600 dark:border-indigo-400 flex items-center justify-center h-fit max-h-[85vh] aspect-square transform transition-transform duration-500 hover:scale-[1.01] relative z-10">
                <QRCodeSVG
                  value={generatedQrToken}
                  className="w-full h-full"
                  size={1000}
                  level="H"
                  includeMargin={false}
                />
              </div>


            </div>
          </div>

          <div className="w-full py-4 px-8 border-t border-gray-100 dark:border-slate-900 flex justify-center gap-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 px-3 py-1 rounded-lg">
              <Calendar className="w-3 h-3 text-indigo-500" />
              <span>{selectedDate}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 px-3 py-1 rounded-lg italic">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>Closes at {qrExpiresAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttendanceSheet;
