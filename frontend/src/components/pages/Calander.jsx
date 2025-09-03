import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment"; // ✅ import moment instead of require
import { parseISO } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

const Calander = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { usere } = useSelector((store) => store.auth);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const res = await axios.get(
          "http://localhost:5000/api/v1/dashbord/calender/details",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              department: usere.department,
              semester: usere.semester,
            },
          }
        );

        const quizzes = res.data.quizzes || [];

        // Convert quizzes to react-big-calendar events
        const formattedEvents = quizzes.map((quiz) => ({
          id: quiz._id,
          title: `${quiz.title} (${quiz.subject.subjectName})`,
          start: parseISO(quiz.date), // start date
          end: parseISO(quiz.date),   // same day
          allDay: true,
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      }
    };

    if (usere?.department && usere?.semester) {
      fetchQuizzes();
    }
  }, [getAccessTokenSilently, usere]);

  return (
    <div style={{ height: "600px" }}>
      <Calendar
        localizer={momentLocalizer(moment)} 
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        popup
      />
    </div>
  );
};

export default Calander;
