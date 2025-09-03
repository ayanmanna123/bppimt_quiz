import React from "react";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  // Animation variants for different elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const handleGoHome = () => {
    // Navigate to home page - you can replace this with your navigation logic
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          variants={pulseVariants}
          animate="animate"
          className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full opacity-20 blur-2xl"
        />
        <motion.div
          variants={pulseVariants}
          animate="animate"
          style={{ animationDelay: "1s" }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-15 blur-3xl"
        />
        <motion.div
          variants={pulseVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-br from-pink-400 to-violet-500 rounded-full opacity-10 blur-xl"
        />
      </div>

      {/* Floating decorative elements */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl opacity-30 blur-sm"
        style={{ animationDelay: "0.5s" }}
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-32 right-20 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-40 blur-sm"
        style={{ animationDelay: "1.5s" }}
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl opacity-25 blur-sm"
        style={{ animationDelay: "2.5s" }}
      />

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10"
      >
        {/* 404 Number with creative styling */}
        <motion.div
          variants={itemVariants}
          className="relative mb-8"
        >
          <motion.h1
            className="text-9xl md:text-[12rem] lg:text-[15rem] font-black bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent select-none"
            animate={{
              textShadow: [
                "0 0 20px rgba(139, 69, 237, 0.5)",
                "0 0 40px rgba(139, 69, 237, 0.3)",
                "0 0 20px rgba(139, 69, 237, 0.5)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            404
          </motion.h1>
          
          {/* Glitch effect overlay */}
          <motion.div
            className="absolute inset-0 text-9xl md:text-[12rem] lg:text-[15rem] font-black text-pink-500 opacity-30 select-none"
            animate={{
              x: [0, -2, 2, 0],
              y: [0, 1, -1, 0]
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            404
          </motion.div>
        </motion.div>

        {/* Icon with animation */}
        <motion.div
          variants={itemVariants}
          className="relative mb-8"
        >
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl"
            animate={{
              rotateY: [0, 180, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Search className="w-16 h-16 text-white" />
          </motion.div>
          
          {/* Floating sparkles around icon */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full"
              style={{
                top: `${Math.sin(i * 60 * Math.PI / 180) * 60 + 50}%`,
                left: `${Math.cos(i * 60 * Math.PI / 180) * 60 + 50}%`
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Error message */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12"
        >
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4"
            animate={{
              y: [0, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Oops! Page Not Found
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            The page you're looking for seems to have vanished into the digital void. 
            Don't worry, even the best explorers sometimes take a wrong turn!
          </motion.p>
        </motion.div>

        {/* Animated cards with suggestions */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl"
        >
          {[
            { icon: BookOpen, title: "Browse Subjects", desc: "Explore our course catalog" },
            { icon: Search, title: "Search Again", desc: "Try a different search term" },
            { icon: Home, title: "Go Home", desc: "Return to safety" }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                shadow: "0 20px 40px rgba(139, 69, 237, 0.2)"
              }}
              animate={{
                y: [0, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut"
              }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">{item.title}</h3>
              <p className="text-gray-600 text-sm text-center">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Home button */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white px-12 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 font-semibold text-lg relative overflow-hidden group"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            
            <ArrowLeft className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Take Me Home</span>
            <Sparkles className="w-5 h-5 relative z-10" />
            
            {/* Floating particles */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`
                  }}
                  animate={{
                    y: [-10, -20],
                    opacity: [1, 0],
                    scale: [1, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </motion.div>
          </Button>
        </motion.div>

        {/* Subtle footer message */}
        <motion.p
          variants={itemVariants}
          className="text-gray-500 text-sm mt-8 animate-pulse"
        >
          Lost? That's okay, we all need a little help sometimes 💜
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFound;