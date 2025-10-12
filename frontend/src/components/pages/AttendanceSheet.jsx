import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Navbar from "../shared/Navbar";
import { FileSpreadsheet, Download, Calendar, Users, CheckCircle, XCircle } from "lucide-react";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AttendanceSheet = () => {
  const [students, setStudents] = useState([]);
  const [months, setMonths] = useState([]);
  const { getAccessTokenSilently } = useAuth0();
  const { subjectId } = useParams();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/attandance/get-subject/${subjectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { totalStudent, subject } = res.data;

        // ✅ Create 12 months with all dates
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

        // ✅ Convert attendance data into a map
        const attendanceMap = {};
        subject.attendance.forEach(day => {
          const dateStr = new Date(day.date).toLocaleDateString();
          attendanceMap[dateStr] = day.records.map(r => r.student._id);
        });

        // ✅ Prepare all students with daily data
        const studentArr = totalStudent.map(stu => {
          const attendanceObj = {};

          monthsData.forEach(month => {
            month.days.forEach(day => {
              if (attendanceMap[day.date]) {
                const isPresent = attendanceMap[day.date].includes(stu._id);
                attendanceObj[day.date] = isPresent ? "P" : "A";
              } else {
                attendanceObj[day.date] = "";
              }
            });
          });

          return {
            fullname: stu.fullname,
            universityNo: stu.universityNo,
            ...attendanceObj,
          };
        });

        setMonths(monthsData);
        setStudents(studentArr);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, [subjectId, getAccessTokenSilently]);

  // ✅ Export to Excel function
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    months.forEach(month => {
      const sheetData = [];

      // Header row
      const header = ["Name", "University No"];
      month.days.forEach(day => header.push(new Date(day.date).getDate()));
      header.push("Total Present", "Total Absent");
      sheetData.push(header);

      // Data rows
      students.forEach(student => {
        let monthPresent = 0;
        let monthAbsent = 0;

        const row = [student.fullname, student.universityNo];

        month.days.forEach(day => {
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
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-28 h-28 border-2 border-white/20 rounded-2xl rotate-45"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-white/30 rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-white/10 rounded-2xl rotate-12"></div>
        </div>

        <div className="relative z-10 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-2xl">
                  <FileSpreadsheet className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    Attendance Sheet
                  </h1>
                  <p className="text-white/90 text-xl font-medium">
                    View and manage student attendance records
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
      </div>

      {/* Main Content Section */}
      <div className="px-6 -mt-8 relative z-20 pb-12">
        <div className=" max-w-fit mx-auto">
          {months.map(month => (
            <div key={month.month} className="mb-10">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                {/* Month Header */}
                <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-1">
                        {monthNames[month.month - 1]} 2025
                      </h3>
                      <p className="text-white/90 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {students.length} Students
                      </p>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 sticky top-0">
                      <tr>
                        <th className="border border-gray-200 px-4 py-3 text-left font-bold text-gray-700">Name</th>
                        <th className="border border-gray-200 px-4 py-3 text-left font-bold text-gray-700">University No</th>
                        {month.days.map(day => (
                          <th
                            key={day.date}
                            className="border border-gray-200 px-2 py-2 text-center text-sm font-bold text-gray-700"
                          >
                            {new Date(day.date).getDate()}
                          </th>
                        ))}
                        <th className="border border-gray-200 px-4 py-3 text-center text-sm font-bold bg-green-50 text-green-700">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Total Present
                          </div>
                        </th>
                        <th className="border border-gray-200 px-4 py-3 text-center text-sm font-bold bg-red-50 text-red-700">
                          <div className="flex items-center justify-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Total Absent
                          </div>
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      {students.map((student, idx) => {
                        let monthPresent = 0;
                        let monthAbsent = 0;

                        month.days.forEach(day => {
                          if (student[day.date] === "P") monthPresent++;
                          else if (student[day.date] === "A") monthAbsent++;
                        });

                        return (
                          <tr key={idx} className="hover:bg-purple-50/50">
                            <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800">{student.fullname}</td>
                            <td className="border border-gray-200 px-4 py-3 text-gray-700">{student.universityNo}</td>

                            {month.days.map(day => (
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
    </>
  );
};

export default AttendanceSheet;