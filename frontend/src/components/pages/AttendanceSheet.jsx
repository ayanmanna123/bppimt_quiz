import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Navbar from "../shared/Navbar";
import { Howl } from "howler";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
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
          `${
            import.meta.env.VITE_BACKEND_URL
          }/attandance/get-subject/${subjectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { totalStudent, subject } = res.data;

        const monthsData = Array.from({ length: 12 }, (_, i) => {
          const daysInMonth = new Date(2025, i + 1, 0).getDate();
          return {
            month: i + 1,
            days: Array.from({ length: daysInMonth }, (_, d) => {
              const dateObj = new Date(2025, i, d + 1);
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
    saveAs(blob, "Attendance_Sheet_2025.xlsx");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 opacity-90"></div>
          <div className="relative z-10 py-16 px-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-2xl">
                  <FileSpreadsheet className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white">
                    Attendance Sheet
                  </h1>
                  <p className="text-white/90 text-lg">
                    Manage & update student attendance manually
                  </p>
                </div>
              </div>
              <button
                onClick={exportToExcel}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/90 shadow-2xl flex items-center gap-3"
              >
                <Download className="w-5 h-5" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="px-6 -mt-8 pb-12">
          <div className="max-w-fit mx-auto">
            {months.map((month) => (
              <div key={month.month} className="mb-10">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 p-6 text-white flex justify-between">
                    <h3 className="text-3xl font-bold">
                      {monthNames[month.month - 1]} 2025
                    </h3>
                    <button
                      onClick={() =>
                        handleDateClick(
                          new Date(
                            2025,
                            month.month - 1,
                            new Date().getDate()
                          ).toLocaleDateString()
                        )
                      }
                      className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-white/90"
                    >
                      + Give Attendance
                    </button>
                  </div>

                  {/* Table */}
                  <div className="overflow-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 border">Name</th>
                          <th className="px-4 py-3 border">University No</th>
                          {month.days.map((day) => (
                            <th
                              key={day.date}
                              onClick={() => handleDateClick(day.date)}
                              className="border px-2 py-2 text-center text-sm cursor-pointer hover:bg-purple-100"
                            >
                              {new Date(day.date).getDate()}
                            </th>
                          ))}
                          <th className="border border-gray-200 px-4 py-3 text-center text-sm font-bold bg-green-50 text-green-700">
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              T.P
                            </div>
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-center text-sm font-bold bg-red-50 text-red-700">
                            <div className="flex items-center justify-center gap-2">
                              <XCircle className="w-4 h-4" />
                              T.A
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {students.map((student, idx) => {
                          let monthPresent = 0;
                          let monthAbsent = 0;

                          month.days.forEach((day) => {
                            if (student[day.date] === "P") monthPresent++;
                            else if (student[day.date] === "A") monthAbsent++;
                          });

                          return (
                            <tr key={idx} className="hover:bg-purple-50/50">
                              <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800">
                                {student.fullname}
                              </td>
                              <td className="border border-gray-200 px-4 py-3 text-gray-700">
                                {student.universityNo}
                              </td>

                              {month.days.map((day) => (
                                <td
                                  key={day.date}
                                  className={`border border-gray-200 px-2 py-2 text-center font-bold ${
                                    student[day.date] === "P"
                                      ? "text-green-600 bg-green-50/50"
                                      : student[day.date] === "A"
                                      ? "text-red-600 bg-red-50/50"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {student[day.date]}
                                </td>
                              ))}

                              <td className="border border-gray-200 px-4 py-3 text-center font-bold text-green-700 bg-green-50">
                                {monthPresent}
                              </td>
                              <td className="border border-gray-200 px-4 py-3 text-center font-bold text-red-700 bg-red-50">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[600px] shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-purple-700">
              Mark Attendance for {selectedDate}
            </h2>
            <div className="max-h-[400px] overflow-y-auto border rounded-lg">
              {students.map((stu) => (
                <div
                  key={stu._id}
                  className="flex justify-between items-center px-4 py-2 border-b hover:bg-purple-50"
                >
                  <div>
                    <p className="font-semibold">{stu.fullname}</p>
                    <p className="text-sm text-gray-500">{stu.universityNo}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleAttendance(stu._id, "P")}
                      className={`px-4 py-1 rounded-lg font-semibold ${
                        selectedAttendance[stu._id] === "P"
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => toggleAttendance(stu._id, "A")}
                      className={`px-4 py-1 rounded-lg font-semibold ${
                        selectedAttendance[stu._id] === "A"
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6 gap-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAttendance}
                disabled={isUpdating}
                className="px-8 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700"
              >
                {isUpdating ? "Updating..." : "Update Attendance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttendanceSheet;
