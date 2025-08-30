"use client";
import { motion } from "framer-motion";
import { Shield, Brain, Award, CheckCircle } from "lucide-react";

const features = [
  {
    title: "Safe & Secure",
    description:
      "Your privacy and data are protected with top-notch security measures on our website.",
    points: ["Data encryption", "Secure login", "Trusted platform"],
    image: "/img4.png",
    icon: Shield,
    color: "from-emerald-500 to-teal-600",
    bgColor: "from-emerald-50 to-teal-50",
    glowColor: "shadow-emerald-500/25",
    accentColor: "emerald",
  },
  {
    title: "AI-Powered Features",
    description:
      "Experience smarter quizzes with AI that adapts to your learning needs and provides personalized recommendations.",
    points: ["Smart suggestions", "Adaptive learning", "AI insights"],
    image: "/img5.jpg",
    icon: Brain,
    color: "from-blue-500 to-indigo-600",
    bgColor: "from-blue-50 to-indigo-50",
    glowColor: "shadow-blue-500/25",
    accentColor: "blue",
  },
  {
    title: "Certificate on Completion",
    description:
      "Get rewarded for your efforts! Receive a certificate after completing quizzes successfully.",
    points: ["Verified certificate", "Shareable achievement", "Boost your resume"],
    image: "/img7.png",
    icon: Award,
    color: "from-purple-500 to-pink-600",
    bgColor: "from-purple-50 to-pink-50",
    glowColor: "shadow-purple-500/25",
    accentColor: "purple",
  },
];

const Features = () => {
  return (
    <section className="relative py-32 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30"></div>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), 
                         radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 20% 70%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)`,
        }}
      ></div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-32 right-1/4 w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-xl"
        animate={{
          y: [0, 25, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-10 w-20 h-20 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Header Section */}
      <div className="relative max-w-6xl mx-auto px-6 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 mb-6">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              POWERFUL FEATURES
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-6">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover the advanced features that make our quiz platform the perfect choice for your learning journey
          </p>
        </motion.div>
      </div>

      {/* Features List */}
      <div className="relative max-w-7xl mx-auto px-6 space-y-32">
        {features.map((feature, index) => {
          const isEven = index % 2 === 0;
          const IconComponent = feature.icon;
          
          return (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-16 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text content with enhanced styling */}
              <motion.div 
                className="flex-1 relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeOut",
                  delay: 0.1
                }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {/* Background card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} rounded-3xl opacity-50 blur-3xl transform scale-110`}></div>
                
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-slate-200/60 shadow-xl">
                  {/* Icon and Title */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg ${feature.glowColor}`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xl text-slate-700 mb-8 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Feature Points */}
                  <div className="space-y-4">
                    {feature.points.map((point, i) => (
                      <motion.div 
                        key={i} 
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-slate-200/60 hover:border-slate-300/60 transition-all duration-300 hover:shadow-lg"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 0.4 + (i * 0.1),
                          ease: "easeOut"
                        }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                          {point}
                        </span>
                        
                        {/* Animated accent line */}
                        <div className="ml-auto w-0 h-0.5 bg-gradient-to-r from-transparent via-slate-400 to-transparent group-hover:w-8 transition-all duration-300"></div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom accent */}
                  <motion.div
                    className="mt-8 h-1 bg-slate-100 rounded-full overflow-hidden"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.8 }}
                  >
                    <div className={`h-full bg-gradient-to-r ${feature.color} rounded-full`}></div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Enhanced image section */}
              <div className="flex-1 flex justify-center relative">
                <motion.div
                  className="relative group"
                  initial={{ 
                    opacity: 0, 
                    x: isEven ? 80 : -80,
                    scale: 0.8
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    x: 0,
                    scale: 1
                  }}
                  transition={{ 
                    duration: 1, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.3
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  style={{ willChange: "transform, opacity" }}
                   
                >
                  {/* Image container with enhanced effects */}
                  <div className="relative">
                    {/* Glow effect behind image */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-30 blur-2xl rounded-3xl transition-opacity duration-500 scale-110`}></div>
                    
                    {/* Main image */}
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/60 shadow-2xl">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-auto max-w-md rounded-2xl drop-shadow-xl"
                        loading="lazy"
                        style={{
                          aspectRatio: "1/1",
                          objectFit: "contain"
                        }}
                      />
                    </div>

                    {/* Floating particles around image */}
                    <motion.div
                      className={`absolute -top-4 -right-4 w-6 h-6 bg-gradient-to-r ${feature.color} rounded-full opacity-60`}
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 3 + index,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.div
                      className={`absolute -bottom-6 -left-6 w-4 h-4 bg-gradient-to-r ${feature.color} rounded-full opacity-50`}
                      animate={{
                        x: [0, 15, 0],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 4 + index,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.div
                      className="absolute top-1/2 -left-8 w-3 h-3 bg-gradient-to-r from-white to-slate-200 rounded-full opacity-70"
                      animate={{
                        y: [0, -10, 0],
                        x: [0, -5, 0],
                      }}
                      transition={{
                        duration: 5 + index,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Section */}
      <motion.div
        className="relative max-w-4xl mx-auto px-6 text-center mt-32"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-slate-200/60 shadow-xl">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-slate-600 mb-8">
            Experience all these amazing features and more. Join thousands of learners today!
          </p>
          <motion.button
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Start Learning Now</span>
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
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

export default Features;