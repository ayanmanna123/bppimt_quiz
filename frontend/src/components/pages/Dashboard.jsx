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
  const [error, setError] = useState(null);

  // Animated values
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Get Auth0 Access Token
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v2",
        });

        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // ✅ Fetch all data with proper error handling
        const [progressRes, subjectRes, badgeRes, streakRes] = await Promise.all([
          fetch("http://localhost:5000/api/v1/dashbord/dashbord/data/progress", { headers })
            .then(res => {
              if (!res.ok) throw new Error(`Progress API failed: ${res.status}`);
              return res.json();
            }),
          fetch("http://localhost:5000/api/v1/dashbord/data/subject", { headers })
            .then(res => {
              if (!res.ok) throw new Error(`Subject API failed: ${res.status}`);
              return res.json();
            }),
          fetch("http://localhost:5000/api/v1/dashbord/data/badge", { headers })
            .then(res => {
              if (!res.ok) throw new Error(`Badge API failed: ${res.status}`);
              return res.json();
            }),
          fetch("http://localhost:5000/api/v1/dashbord/data/streak", { headers })
            .then(res => {
              if (!res.ok) throw new Error(`Streak API failed: ${res.status}`);
              return res.json();
            }),
        ]);

        // Set data with proper validation
        if (progressRes?.success && progressRes?.data) {
          setProgress(progressRes.data);
        }
        
        if (subjectRes?.success && Array.isArray(subjectRes?.data)) {
          setSubjects(subjectRes.data);
        }
        
        if (badgeRes?.success && Array.isArray(badgeRes?.quizzes)) {
          setBadges(badgeRes.quizzes);
        }
        
        if (streakRes?.success && Array.isArray(streakRes?.streak)) {
          // Transform streak data for heatmap
          const heatmapData = streakRes.streak.map(item => ({
            date: item.date,
            count: item.count || 0
          }));
          setStreak(heatmapData);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else {
      loginWithRedirect();
    }
  }, [getAccessTokenSilently, isAuthenticated, loginWithRedirect]);

  // ✅ Animate numbers when progress data is available
  useEffect(() => {
    if (!progress) return;

    // Cleanup previous animations
    const animations = [];

    const attemptedAnim = animate(0, progress.quizzesAttempted || 0, {
      duration: 1.5,
      onUpdate: (v) => setAttempted(Math.round(v)),
    });
    animations.push(attemptedAnim);

    const correctAnim = animate(0, progress.correctAnswers || 0, {
      duration: 1.5,
      onUpdate: (v) => setCorrect(Math.round(v)),
    });
    animations.push(correctAnim);

    const wrongAnim = animate(0, progress.wrongAnswers || 0, {
      duration: 1.5,
      onUpdate: (v) => setWrong(Math.round(v)),
    });
    animations.push(wrongAnim);

    // Calculate percentage safely
    const totalAnswers = (progress.correctAnswers || 0) + (progress.wrongAnswers || 0);
    const calculatedPercentage = totalAnswers > 0 ? (progress.correctAnswers / totalAnswers) * 100 : 0;
    
    const percentageAnim = animate(0, calculatedPercentage, {
      duration: 1.5,
      onUpdate: (v) => setPercentage(v),
    });
    animations.push(percentageAnim);

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [progress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error loading dashboard</p>
          <p className="mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex min-w-screen justify-center items-center bg-gray-50 min-h-screen">
      <div className="p-6 space-y-6 w-full max-w-6xl">
        {/* Top Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Circular Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-lg border"
          >
            <div className="w-32 h-32">
              <CircularProgressbar
                value={percentage}
                text={`${percentage.toFixed(1)}%`}
                styles={buildStyles({
                  pathColor: percentage > 75 ? "#10b981" : percentage > 50 ? "#f59e0b" : "#3b82f6",
                  textColor: "#111827",
                  textSize: "12px",
                })}
              />
            </div>
            <p className="mt-4 font-bold text-lg text-gray-900">Quiz Progress</p>
            <div className="text-center mt-2">
              <p className="text-sm text-green-600 font-semibold">
                ✓ {correct} Correct
              </p>
              <p className="text-sm text-red-600 font-semibold">
                ✗ {wrong} Wrong
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {percentage.toFixed(1)}% Accuracy
              </p>
            </div>
          </motion.div>

          {/* Subject-wise progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border"
          >
            <h2 className="font-bold text-xl mb-6 text-gray-900">Subject Progress</h2>
            <div className="space-y-4">
              {subjects.length > 0 ? (
                subjects.map((subject, index) => (
                  <motion.div
                    key={subject.subjectId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{subject.subjectName}</span>
                      <span className="text-sm font-semibold text-gray-600">
                        {subject.completedQuizzes}/{subject.totalQuizzes}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                      <motion.div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: subject.totalQuizzes > 0 
                            ? `${(subject.completedQuizzes / subject.totalQuizzes) * 100}%` 
                            : '0%'
                        }}
                        transition={{ duration: 1.2, delay: 0.5 + index * 0.2 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Completed: {subject.completedQuizzes}</span>
                      <span>Pending: {subject.pendingQuizzes}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No subjects found</p>
              )}
            </div>
          </motion.div>

          {/* Badges (90% Quizzes) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border"
          >
            <h2 className="font-bold text-xl mb-6 text-gray-900">Achievement Badges</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {badges.length > 0 ? (
                badges.map((badge, index) => (
                  <motion.div
                    key={badge._id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex flex-col bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-800 truncate">{badge.title}</span>
                      {badge.isUserTopper && (
                        <span className="text-yellow-500 text-lg">👑</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{badge.subject?.subjectName || 'Unknown Subject'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-green-700">
                        Score: {badge.highestScore || 0}
                      </span>
                      <span className="text-xs font-medium text-blue-700">
                        {Math.round(badge.highestPercentage || 0)}%
                      </span>
                    </div>
                    {badge.isUserTopper && (
                      <span className="text-xs text-yellow-600 font-semibold mt-1">🏆 Top Scorer</span>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No badges yet</p>
                  <p className="text-xs text-gray-400">Score 90%+ on quizzes to earn badges!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border"
        >
          <h2 className="font-bold text-xl mb-6 text-gray-900">Activity Streak</h2>
          {streak.length > 0 ? (
            <div className="overflow-x-auto">
              <CalendarHeatmap
                startDate={new Date("2025-01-01")}
                endDate={new Date("2025-12-31")}
                values={streak}
                classForValue={(val) => {
                  if (!val || val.count === 0) return "color-empty";
                  if (val.count === 1) return "color-scale-1";
                  if (val.count === 2) return "color-scale-2";
                  if (val.count >= 3) return "color-scale-3";
                  return "color-empty";
                }}
                tooltipDataAttrs={(value) => ({
                  "data-tip": value?.date 
                    ? `${value.date}: ${value.count || 0} quiz${value.count !== 1 ? 'es' : ''}` 
                    : "No activity",
                })}
                gutterSize={2}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No activity data available</p>
          )}
          
          {/* Custom styles for heatmap */}
          <style>{`
            .react-calendar-heatmap .color-empty { fill: #f3f4f6; }
            .react-calendar-heatmap .color-scale-1 { fill: #dbeafe; }
            .react-calendar-heatmap .color-scale-2 { fill: #60a5fa; }
            .react-calendar-heatmap .color-scale-3 { fill: #2563eb; }
            .react-calendar-heatmap rect { rx: 2; ry: 2; }
            .react-calendar-heatmap .react-calendar-heatmap-tooltip {
              background-color: #1f2937;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
            }
          `}</style>
        </motion.div>
      </div>
    </div>
  );
}