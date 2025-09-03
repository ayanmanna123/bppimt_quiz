import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Clock, User, BookOpen, CalendarDays } from 'lucide-react';

const Calendar = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { usere } = useSelector((store) => store.auth);
  const [quiz, setQuiz] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });
        const res = await axios.get(
          `https://bppimt-quiz-kml1.vercel.app/api/v1/dashbord/calender/details?department=${usere.department}&semester=${usere.semester}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setQuiz(res.data.quizzes);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (usere?.department && usere?.semester) {
      fetch();
    }
  }, [getAccessTokenSilently, usere]); // Fixed: Added dependency array

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getQuizzesForDate = (date) => {
    const dateStr = formatDate(date);
    return quiz.filter(q => q.date === dateStr);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayQuizzes = getQuizzesForDate(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div key={day} className={`h-32 p-1 border border-gray-200 bg-white overflow-hidden ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayQuizzes.map((q, index) => (
              <div
                key={q._id}
                onClick={() => setSelectedQuiz(q)}
                className="text-xs p-1 rounded cursor-pointer hover:bg-blue-100 transition-colors bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                <div className="font-medium truncate">{q.title}</div>
                <div className="opacity-90">{q.time} min</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const QuizModal = ({ quiz, onClose }) => {
    if (!quiz) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
                <p className="text-gray-600 mt-1">{quiz.subject.subjectName} ({quiz.subject.subjectCode})</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Date: {quiz.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Duration: {quiz.time} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">Created by: {quiz.createdBy.fullname}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600">Questions: {quiz.totalQuestions} | Marks: {quiz.marks} each</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Quiz Questions</h3>
              <div className="space-y-4">
                {quiz.questions.map((question, index) => (
                  <div key={question._id} className="border rounded-lg p-4 bg-gray-50">
                    <p className="font-medium text-gray-800 mb-3">
                      {index + 1}. {question.questionText}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded text-sm ${
                            optIndex === question.correctAnswer
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-white text-gray-700 border border-gray-200'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === question.correctAnswer && (
                            <span className="ml-2 text-xs font-medium">(Correct Answer)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Calendar</h1>
            <p className="text-gray-600">
              {usere?.department} Department - {usere?.semester} Semester
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 min-w-[200px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Days of the week header */}
          <div className="grid grid-cols-7 gap-0 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center font-medium text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-0 border border-gray-200">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="border-t p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total Quizzes: <span className="font-medium">{quiz.length}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
                <span className="text-gray-600">Quiz Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
    </div>
  );
};

export default Calendar;