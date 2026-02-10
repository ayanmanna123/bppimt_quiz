import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

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
  const [selectedAttendance, setSelectedAttendance] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { getAccessTokenSilently } = useAuth0();
  const { subjectId } = useParams();

  // ✅ Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL
          }/attandance/get-subject/${subjectId}`,
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
              return { date: dateStr };
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
    };
    fetchAttendance();
  }, [subjectId, getAccessTokenSilently]);

  // ✅ Popup open handler
  const handleDateClick = (date) => {
    setSelectedDate(date);
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

  // ✅ Generate OTP
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);

  const generateOtpAuth = async (date) => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/attandance/generate-otp`,
        { subjectId, targetDate: date }, // ✅ Pass selected date
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setGeneratedOtp(res.data.otp);
        setOtpExpiresAt(new Date(res.data.expiresAt));
        toast.success(`OTP Generated for ${date}! Valid for 5 minutes.`);
      }
    } catch (error) {
      console.error("Error generating OTP:", error);
      toast.error("Failed to generate OTP");
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

      <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-b-[40px] shadow-2xl z-0"></div>
        <div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute top-40 left-10 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl z-0"></div>

        {/* Main Content Container */}
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-white text-indigo-600 p-4 rounded-2xl shadow-lg">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">Attendance Dashboard</h1>
                <p className="text-indigo-100 mt-1 font-medium text-lg">Manage & track student attendance seamlessly</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className={`w-3 h-3 rounded-full shadow-inner ${isAttendanceEnabled ? "bg-green-400 animate-pulse box-shadow-green" : "bg-red-400"}`} />
                <span className="font-semibold text-sm uppercase tracking-wider">{isAttendanceEnabled ? "Live" : "Offline"}</span>
                <label className="relative inline-flex items-center cursor-pointer ml-2">
                  <input type="checkbox" checked={isAttendanceEnabled} onChange={handleToggleAttendance} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-5 h-5" />
                <span>Export Data</span>
              </button>
            </div>
          </div>

          {/* OTP Banner - Floating Card */}
          {generatedOtp && (
            <div className="mb-8 transform transition-all duration-500 ease-out translate-y-0 opacity-100">
              <div className="bg-white rounded-2xl shadow-xl border-l-8 border-indigo-500 p-6 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-50 to-transparent opacity-50 z-0 group-hover:w-full transition-all duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 text-indigo-700 mb-1">
                    <ShieldCheck className="w-6 h-6" />
                    <h3 className="text-lg font-bold uppercase tracking-wider">Active Session Code</h3>
                  </div>
                  <p className="text-gray-500 flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4" /> Expires at {otpExpiresAt?.toLocaleTimeString()}
                  </p>
                </div>
                <div className="relative z-10 bg-indigo-50 px-8 py-3 rounded-xl border border-indigo-100 shadow-inner">
                  <span className="text-5xl font-mono font-black text-indigo-600 tracking-[0.2em]">{generatedOtp}</span>
                </div>
              </div>
            </div>
          )}

          {/* Data Tables Section */}
          <div className="space-y-12">
            {months.map((month) => (
              <div key={month.month} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Month Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {monthNames[month.month - 1]} <span className="text-gray-400 font-medium text-xl">{new Date().getFullYear()}</span>
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      handleDateClick(
                        new Date(
                          new Date().getFullYear(),
                          month.month - 1,
                          new Date().getDate()
                        ).toLocaleDateString()
                      )
                    }
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                  >
                    <span>+ Mark Attendance</span>
                  </button>
                </div>

                {/* The Table */}
                <div className="overflow-x-auto custom-scrollbar">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="sticky left-0 z-20 bg-gray-50 px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] border-r border-gray-200 min-w-[200px]">
                            Student Name
                          </th>
                          <th scope="col" className="sticky left-[200px] z-20 bg-gray-50 px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] border-r border-gray-200 min-w-[140px]">
                            University ID
                          </th>
                          {month.days.map((day) => (
                            <th
                              key={day.date}
                              onClick={() => handleDateClick(day.date)}
                              className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors min-w-[40px] border-r border-gray-100 last:border-r-0 group"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span>{new Date(day.date).getDate()}</span>
                                <span className="text-[10px] text-gray-400 font-normal group-hover:text-indigo-400">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span>
                              </div>
                            </th>
                          ))}
                          <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-green-600 uppercase tracking-wider bg-green-50/30 border-l border-gray-200">
                            Present
                          </th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50/30 border-l border-gray-200">
                            Absent
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {students.map((student, idx) => {
                          let monthPresent = 0;
                          let monthAbsent = 0;

                          month.days.forEach((day) => {
                            if (student[day.date] === "P") monthPresent++;
                            else if (student[day.date] === "A") monthAbsent++;
                          });

                          return (
                            <tr key={idx} className="hover:bg-indigo-50/30 transition-colors even:bg-slate-50/30">
                              <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] group-hover:bg-indigo-50/30">
                                {student.fullname}
                              </td>
                              <td className="sticky left-[200px] z-10 bg-white px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] font-mono group-hover:bg-indigo-50/30">
                                {student.universityNo}
                              </td>

                              {month.days.map((day) => (
                                <td
                                  key={day.date}
                                  className="px-2 py-3 whitespace-nowrap text-center text-sm font-medium border-r border-gray-50 last:border-r-0"
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
                                    <span className="w-2 h-2 rounded-full bg-gray-200 inline-block"></span>
                                  )}
                                </td>
                              ))}

                              <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-green-600 bg-green-50/20 border-l border-gray-100">
                                {monthPresent}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold text-red-600 bg-red-50/20 border-l border-gray-100">
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
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPopup(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Mark Attendance
                </h2>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {selectedDate}
                </p>
              </div>
              <button
                onClick={() => generateOtpAuth(selectedDate)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all text-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Generate OTP</span>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="space-y-3">
                {students.map((stu) => (
                  <div
                    key={stu._id}
                    className="flex justify-between items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {stu.fullname.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{stu.fullname}</p>
                        <p className="text-xs text-gray-400 font-mono">{stu.universityNo}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 bg-gray-100/50 p-1 rounded-lg">
                      <button
                        onClick={() => toggleAttendance(stu._id, "P")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${selectedAttendance[stu._id] === "P"
                            ? "bg-white text-green-600 shadow-sm border border-green-200"
                            : "text-gray-500 hover:bg-gray-200/50"
                          }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${selectedAttendance[stu._id] === "P" ? "fill-green-100" : ""}`} />
                        Present
                      </button>
                      <button
                        onClick={() => toggleAttendance(stu._id, "A")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all ${selectedAttendance[stu._id] === "A"
                            ? "bg-white text-red-600 shadow-sm border border-red-200"
                            : "text-gray-500 hover:bg-gray-200/50"
                          }`}
                      >
                        <XCircle className={`w-4 h-4 ${selectedAttendance[stu._id] === "A" ? "fill-red-100" : ""}`} />
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end items-center gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-200/50 transition-colors"
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
    </>
  );
};

export default AttendanceSheet;
