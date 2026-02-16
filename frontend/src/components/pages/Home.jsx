import { useState, lazy, Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
const SplitText = lazy(() => import("./SplitText"));
const TextType = lazy(() => import("./TextType"));

const Features = lazy(() => import("./Features"));
const Footer = lazy(() => import("./Footer"));
const Footerreal = lazy(() => import("./Footerreal"));
const Calendar = lazy(() => import("./Calendar"));

const Home = () => {
  const { darktheme } = useSelector((store) => store.auth);
  const { getAccessTokenSilently } = useAuth0();

  const updateProfile = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      console.log(token);
      playSound();
    } catch (error) {
      console.error(error);
    }
  };

  const playSound = async () => {
    const { Howl } = await import("howler");
    const sound = new Howl({
      src: ["/notification.wav"],
      volume: 0.7,
    });
    sound.play();
  };

  const handleAnimationComplete = () => {

  };

  return (
    <>
      {/* Hero Section with Enhanced Background */}
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-700 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10"></div>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
          }}
        ></div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
          style={{ willChange: "transform" }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-xl"
          style={{ willChange: "transform" }}
          animate={{
            y: [0, 30, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-xl"
          style={{ willChange: "transform" }}
          animate={{
            y: [0, -25, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear",
          }}
        />



        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-10 py-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="px-4 md:px-20 z-10"
          >
            {/* Enhanced Title with Gradient */}
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/5 dark:to-purple-400/5 border border-blue-200/50 dark:border-blue-800/30 mb-6">
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  SMART LEARNING PLATFORM
                </span>
              </div>

              <h1 className="relative min-h-[120px]">
                <Suspense fallback={<div className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 text-center leading-tight">Smart Quiz App<br />for College Mock Tests</div>}>
                  <SplitText
                    text=" Smart Quiz App"
                    className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent text-center leading-tight"
                    delay={100}
                    duration={0.6}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 40 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="center"
                    onLetterAnimationComplete={handleAnimationComplete}
                  />
                  <br />
                  <SplitText
                    text="for College Mock Tests"
                    className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-center leading-tight"
                    delay={100}
                    duration={0.6}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 40 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="center"
                    onLetterAnimationComplete={handleAnimationComplete}
                  />
                </Suspense>

                {/* Glow effect behind text */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl -z-10 opacity-30 dark:opacity-20"></div>
              </h1>
            </div>

            {/* Enhanced Description */}
            <div className="mb-8 p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg">
              <Suspense fallback={<p className="font-mono text-xl md:text-2xl text-slate-700 dark:text-slate-300">A modern platform designed for students...</p>}>
                <TextType
                  text={[
                    "A modern platform designed for students to practice mock tests,",
                    "improve skills, track progress, identify weaknesses, and build confidence,",
                    "helping them prepare effectively and achieve success in exams.",
                  ]}
                  typingSpeed={75}
                  as="span"
                  pauseDuration={1500}
                  deletingSpeed={40}
                  loop={true}
                  className="font-mono text-xl md:text-2xl text-slate-700 dark:text-slate-300"
                  textColors={[darktheme ? "#cbd5e1" : "#334155"]}
                  cursorCharacter="|"
                  cursorClassName="text-blue-600 dark:text-blue-400"
                />
              </Suspense>
            </div>

            {/* Enhanced Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-0"
                onClick={updateProfile}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>View Pricing</span>
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </motion.svg>
                </span>

                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex justify-center z-10"
          >
            {/* Image container with glow */}
            <div className="relative group">
              <motion.img
                src="/img-1.webp"
                alt="Hero Illustration"
                width="500"
                height="500"
                fetchPriority="high"
                className="w-[350px] md:w-[500px] relative z-10 drop-shadow-2xl"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              />

              {/* Image glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-3xl"></div>

              {/* Floating particles around image */}
              <motion.div
                className="absolute -top-4 -right-4 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-6 -left-6 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                animate={{
                  x: [0, 10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute top-1/2 -left-8 w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                animate={{
                  y: [0, -15, 0],
                  x: [0, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Rest of the components */}
      <Suspense fallback={<div className="h-20" />}>
        <Features />
        <Footer />
        <Footerreal />
      </Suspense>

    </>
  );
};

export default Home;