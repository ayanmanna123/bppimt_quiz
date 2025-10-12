import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";

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

        // Create 12 months with all dates
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

        // Convert attendance data into a map for fast lookup
        const attendanceMap = {};
        subject.attendance.forEach(day => {
          const dateStr = new Date(day.date).toLocaleDateString();
          attendanceMap[dateStr] = day.records.map(r => r.student._id);
        });

        // Prepare student rows
        const studentArr = totalStudent.map(stu => {
          const attendanceObj = {};
          monthsData.forEach(month => {
            month.days.forEach(day => {
              if (attendanceMap[day.date]) {
                // If student exists in attendance record -> Present
                attendanceObj[day.date] = attendanceMap[day.date].includes(stu._id)
                  ? "P"
                  : "A"; // Otherwise Absent
              } else {
                attendanceObj[day.date] = ""; // No record -> empty
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
  }, [subjectId]);

  return (
    <div className="overflow-auto p-4">
      <h2 className="text-xl font-bold mb-4">Attendance Sheet</h2>

      {months.map(month => (
        <div key={month.month} className="mb-8">
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
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default AttendanceSheet;
