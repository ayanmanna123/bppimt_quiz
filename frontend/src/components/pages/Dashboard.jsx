import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

// ✅ Mock Data
const mockData = {
  progress: {
    attempted: 15,
    total: 30,
    correct: 120,
    wrong: 80,
  },
  subjects: [
    { name: "Math", attempted: 5, total: 10 },
    { name: "Physics", attempted: 3, total: 8 },
    { name: "Computer Science", attempted: 7, total: 12 },
    { name: "Computer Science", attempted: 7, total: 12 },
    { name: "Computer Science", attempted: 7, total: 12 },
    { name: "Computer Science", attempted: 7, total: 12 },
    { name: "Computer Science", attempted: 7, total: 12 },
  ],
  badges: [
    { id: 1, name: "First Quiz", icon: "🥇" },
    { id: 2, name: "Consistency 7 Days", icon: "🔥" },
    { id: 3, name: "90% Score", icon: "🏆" },
  ],
  streak: [
    { date: "2025-06-10", count: 2 },
    { date: "2025-06-11", count: 1 },
    { date: "2025-06-12", count: 3 },
    { date: "2025-07-01", count: 2 },
    { date: "2025-08-10", count: 4 },
  ],
};

export default function Dashboard() {
  // States bound to animated motion values
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const a = animate(0, mockData.progress.attempted, {
      duration: 1.5,
      onUpdate: (v) => setAttempted(Math.round(v)),
    });
    const c = animate(0, mockData.progress.correct, {
      duration: 1.5,
      onUpdate: (v) => setCorrect(Math.round(v)),
    });
    const w = animate(0, mockData.progress.wrong, {
      duration: 1.5,
      onUpdate: (v) => setWrong(Math.round(v)),
    });

    const totalAns = mockData.progress.correct + mockData.progress.wrong;
    const p = animate(0, (mockData.progress.correct / totalAns) * 100, {
      duration: 1.5,
      onUpdate: (v) => setPercentage(v),
    });

    return () => {
      a.stop();
      c.stop();
      w.stop();
      p.stop();
    };
  }, []);

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
                text={`${attempted}/${mockData.progress.total}`}
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
              {mockData.subjects.map((s, i) => (
                <motion.div key={i}>
                  <div className="flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span>
                      {s.attempted}/{s.total}
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
                        width: `${(s.attempted / s.total) * 100}%`,
                      }}
                    ></div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="bg-gray-100 rounded-2xl p-6 shadow-md"
          >
            <h2 className="font-bold text-lg mb-4">Badges</h2>
            <div className="flex gap-4">
              {mockData.badges.map((b, index) => (
                <motion.div
                  key={b.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex flex-col items-center bg-gray-100 rounded-xl p-3"
                >
                  <span className="text-3xl">{b.icon}</span>
                  <p className="text-xs mt-2">{b.name}</p>
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
            values={mockData.streak}
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
