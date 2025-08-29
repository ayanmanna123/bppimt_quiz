"use client";
import { motion } from "framer-motion";

const features = [
  {
    title: "Safe & Secure",
    description:
      "Your privacy and data are protected with top-notch security measures on our website.",
    points: ["Data encryption", "Secure login", "Trusted platform"],
    image: "/img4.png",
  },
  {
    title: "AI-Powered Features",
    description:
      "Experience smarter quizzes with AI that adapts to your learning needs and provides personalized recommendations.",
    points: ["Smart suggestions", "Adaptive learning", "AI insights"],
    image: "/img5.jpg",
  },
  {
    title: "Certificate on Completion",
    description:
      "Get rewarded for your efforts! Receive a certificate after completing quizzes successfully.",
    points: ["Verified certificate", "Shareable achievement", "Boost your resume"],
    image: "/img7.png",
  },
];

const Features = () => {
  return (
    <section className="py-27 bg-white">
      <div className="max-w-6xl mx-auto px-6 space-y-28">
        {features.map((feature, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center gap-12 ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Text content with stagger animation */}
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  ease: "easeOut",
                  delay: 0.1
                }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
                  {feature.title}
                </h2>
                <p className="text-lg text-gray-700 mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.points.map((point, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.3 + (i * 0.1),
                        ease: "easeOut"
                      }}
                      viewport={{ once: true }}
                    >
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-lg text-gray-800">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Optimized image animation */}
              <div className="flex-1 flex justify-center">
                <motion.div
                  className="w-80 h-80 flex items-center justify-center"
                  initial={{ 
                    opacity: 0, 
                    x: isEven ? 60 : -60,
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    x: 0,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smoother motion
                    delay: 0.2
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  // Performance optimization
                  style={{ willChange: "transform, opacity" }}
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-auto max-w-80 drop-shadow-lg"
                    loading="lazy" // Lazy load images
                    style={{
                      // Prevent layout shifts
                      aspectRatio: "1/1",
                      objectFit: "contain"
                    }}
                  />
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;