import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Navbar from "../shared/Navbar";

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
          `http://localhost:5000/api/v1/attandance/get-subject/${subjectId}`,
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
    <div className="overflow-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Attendance Sheet</h2>
        <button
          onClick={exportToExcel}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Export to Excel
        </button>
      </div>

      {months.map(month => (
        <div key={month.month} className="mb-10">
          <h3 className="text-lg font-semibold mb-2">
            Month: {monthNames[month.month - 1]}
          </h3>

          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">University No</th>
                {month.days.map(day => (
                  <th
                    key={day.date}
                    className="border px-2 py-1 text-center text-xs"
                  >
                    {new Date(day.date).getDate()}
                  </th>
                ))}
                <th className="border px-4 py-2 text-center text-xs bg-green-100">
                  Total Present
                </th>
                <th className="border px-4 py-2 text-center text-xs bg-red-100">
                  Total Absent
                </th>
              </tr>
            </thead>

            <tbody>
              {students.map((student, idx) => {
                let monthPresent = 0;
                let monthAbsent = 0;

                month.days.forEach(day => {
                  if (student[day.date] === "P") monthPresent++;
                  else if (student[day.date] === "A") monthAbsent++;
                });

                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{student.fullname}</td>
                    <td className="border px-4 py-2">{student.universityNo}</td>

                    {month.days.map(day => (
                      <td
                        key={day.date}
                        className={`border px-2 py-1 text-center font-semibold ${
                          student[day.date] === "P"
                            ? "text-green-600"
                            : student[day.date] === "A"
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {student[day.date]}
                      </td>
                    ))}

                    <td className="border px-4 py-2 text-center font-bold text-green-700">
                      {monthPresent}
                    </td>
                    <td className="border px-4 py-2 text-center font-bold text-red-700">
                      {monthAbsent}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
    </>
   
  );
};

export default AttendanceSheet;
