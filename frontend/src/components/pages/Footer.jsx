import { useEffect, useState } from "react";
import Counter from "./Counter";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const Footer = () => {
  const { getAccessTokenSilently } = useAuth0();

  // State for counts
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);

  // Fetch student count
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          "http://localhost:5000/api/v1/user/student/count",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStudentCount(res.data.length ?? res.data.count ?? 0);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudents();
  }, [getAccessTokenSilently]);

  // Fetch teacher count
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          "http://localhost:5000/api/v1/user/teacher/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTeacherCount(res.data.length ?? res.data.count ?? 0);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTeachers();
  }, [getAccessTokenSilently]);

  // Fetch quiz count
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          "http://localhost:5000/api/v1/quize/quiz/count",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuizCount(res.data.length ?? res.data.count ?? 0);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuizzes();
  }, [getAccessTokenSilently]);

  return (
    <footer className="bg-white py-10 mt-10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {/* Students */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold text-green-600">
            <Counter from={0} to={studentCount} duration={4} />+
          </span>
          <p className="text-gray-600 mt-2">Active Students</p>
        </div>

        {/* Teachers */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold text-blue-600">
            <Counter from={0} to={teacherCount} duration={4} />+
          </span>
          <p className="text-gray-600 mt-2">Active Teachers</p>
        </div>

        {/* Quizzes */}
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold text-purple-600">
            <Counter from={0} to={quizCount} duration={4} />+
          </span>
          <p className="text-gray-600 mt-2">Quizzes Created</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
