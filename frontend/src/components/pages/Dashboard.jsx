import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useAuth0 } from "@auth0/auth0-react";

export default function Dashboard() {
  // ✅ Auth0
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();

  // ✅ States
  const [progress, setProgress] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animated values
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Get Auth0 Access Token
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const headers = { Authorization: `Bearer ${token}` };

        // ✅ Fetch all data with token
        const [progressRes, subjectRes, badgeRes, streakRes] = await Promise.all([
          fetch("http://localhost:5000/api/v1/dashbord/dashbord/data/progress", { headers }).then((res) => res.json()),
          fetch("http://localhost:5000/api/v1/dashbord/data/subject", { headers }).then((res) => res.json()),
          fetch("http://localhost:5000/api/v1/dashbord/data/badge", { headers }).then((res) => res.json()),
          fetch("http://localhost:5000/api/v1/dashbord/data/streak", { headers }).then((res) => res.json()),
        ]);

        if (progressRes.success) setProgress(progressRes.data);
        if (subjectRes.success) setSubjects(subjectRes.data);
        if (badgeRes.success) setBadges(badgeRes.quizzes);
        if (streakRes.success) setStreak(streakRes.streak);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else {
      loginWithRedirect(); // Redirect if not logged in
    }
  }, [getAccessTokenSilently, isAuthenticated, loginWithRedirect]);

  // ✅ Animate numbers when progress data is available
  useEffect(() => {
    if (!progress) return;

    const a = animate(0, progress.quizzesAttempted, {
      duration: 1.5,
      onUpdate: (v) => setAttempted(Math.round(v)),
    });
    const c = animate(0, progress.correctAnswers, {
      duration: 1.5,
      onUpdate: (v) => setCorrect(Math.round(v)),
    });
    const w = animate(0, progress.wrongAnswers, {
      duration: 1.5,
      onUpdate: (v) => setWrong(Math.round(v)),
    });

    const totalAns = progress.correctAnswers + progress.wrongAnswers;
    const p = animate(0, totalAns ? (progress.correctAnswers / totalAns) * 100 : 0, {
      duration: 1.5,
      onUpdate: (v) => setPercentage(v),
    });

    return () => {
      a.stop();
      c.stop();
      w.stop();
      p.stop();
    };
  }, [progress]);

  if (loading) return <p className="text-center p-10">Loading Dashboard...</p>;

  return (
    <div className="flex min-w-screen justify-center items-center">
      <div className="p-6 space-y-6 bg-white max-w-5xl text-gray-900">
        {/* Top Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Circular Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gray-100 rounded-2xl p-6 flex flex-col items-center shadow-md"
          >
            <div className="w-28 h-28">
              <CircularProgressbar
                value={percentage}
                text={`${attempted}/${progress?.totalQuizzes}`}
                styles={buildStyles({
                  pathColor: "#3b82f6",
                  textColor: "#111",
                })}
              />
            </div>
            <p className="mt-3 font-semibold">Quizzes Attempted</p>
            <p className="text-sm text-green-600">
              {correct} Correct / {wrong} Wrong
            </p>
          </motion.div>

          {/* Subject-wise progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="bg-gray-100 rounded-2xl p-6 shadow-md"
          >
            <h2 className="font-bold text-lg mb-4">By Subject</h2>
            <div className="space-y-3">
              {subjects.map((s, i) => (
                <motion.div key={s.subjectId}>
                  <div className="flex justify-between text-sm">
                    <span>{s.subjectName}</span>
                    <span>
                      {s.completedQuizzes}/{s.totalQuizzes}
                    </span>
                  </div>
                  <motion.div
                    className="w-full bg-gray-300 h-2 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, delay: i * 0.2 }}
                    style={{ originX: 0 }}
                  >
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(s.completedQuizzes / s.totalQuizzes) * 100}%`,
                      }}
                    ></div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Badges (90% Quizzes) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="bg-gray-100 rounded-2xl p-6 shadow-md"
          >
            <h2 className="font-bold text-lg mb-4">Badges</h2>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((b, index) => (
                <motion.div
                  key={b._id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex flex-col items-center bg-gray-100 rounded-xl p-3 border"
                >
                  <span className="text-sm font-semibold text-center">{b.title}</span>
                  <p className="text-xs text-gray-600 mt-1">{b.subject?.subjectName}</p>
                  <p className="text-xs text-green-700">
                    High Score: {b.highestScore} ({b.highestPercentage.toFixed(0)}%)
                  </p>
                  {b.isUserTopper && <span className="text-yellow-500 text-sm mt-1">⭐ Topper</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="bg-gray-100 rounded-2xl p-6 shadow-md"
        >
          <h2 className="font-bold text-lg mb-4">Activity</h2>
          <CalendarHeatmap
            startDate={new Date("2025-01-01")}
            endDate={new Date("2025-12-31")}
            values={streak}
            classForValue={(val) =>
              !val
                ? "color-empty"
                : val.count > 3
                ? "color-scale-4"
                : "color-scale-2"
            }
            gutterSize={2}
          />
          <style>{`
            .react-calendar-heatmap .color-empty { fill: #e5e7eb; }
            .react-calendar-heatmap .color-scale-2 { fill: #60a5fa; }
            .react-calendar-heatmap .color-scale-4 { fill: #2563eb; }
            .react-calendar-heatmap rect { rx: 2; ry: 2; width: 10px; height: 10px; }
          `}</style>
        </motion.div>
      </div>
    </div>
  );
}
