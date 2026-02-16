import { Facebook, Instagram, Twitter } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Footerreal = () => {
  const footerSections = [
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Jobs", href: "#" },
        { name: "For the Record", href: "#" },
      ],
      icon: "🏢",
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Communities",
      links: [
        { name: "For Students", href: "#" },
        { name: "For Teachers", href: "#" },
        { name: "Developers", href: "#" },
        { name: "Investors", href: "#" },
      ],
      icon: "👥",
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Useful Links",
      links: [
        { name: "Support", href: "#" },
        { name: "Free Mobile App", href: "#" },
        { name: "Popular Quizzes", href: "#" },
        { name: "Certificates", href: "#" },
      ],
      icon: "🔗",
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Plans",
      links: [
        { name: "Free Plan", href: "#" },
        { name: "Student Premium", href: "#" },
        { name: "Family Pack", href: "#" },
        { name: "Institutional", href: "#" },
      ],
      icon: "💎",
      color: "from-orange-500 to-red-600",
    },
  ];
  const navigate = useNavigate()

  const socialLinks = [
    {
      icon: Instagram,
      href: "#",
      color: "from-pink-500 to-rose-600",
      hoverColor: "hover:bg-pink-600",
    },
    {
      icon: Twitter,
      href: "#",
      color: "from-blue-400 to-blue-600",
      hoverColor: "hover:bg-blue-600",
    },
    {
      icon: Facebook,
      href: "#",
      color: "from-blue-600 to-blue-800",
      hoverColor: "hover:bg-blue-700",
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#030014] dark:via-[#05001c] dark:to-[#030014] text-gray-800 dark:text-indigo-200 border-t border-gray-200/60 dark:border-indigo-500/20 transition-colors duration-700 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-indigo-500/5 dark:to-purple-500/5"></div>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), 
                         radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 40% 40%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)`,
        }}
      ></div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-10 right-1/4 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-xl"
        animate={{
          y: [0, 25, 0],
          x: [0, -15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Top Section */}
      <div className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-indigo-600/10 dark:to-purple-600/10 border border-blue-200/50 dark:border-indigo-500/30 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              CONNECT WITH US
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent mb-3">
            Stay Connected
          </h2>
          <p className="text-slate-600 dark:text-indigo-100/70 text-lg max-w-2xl mx-auto">
            Join our community and explore all the resources we have to offer
          </p>
        </motion.div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-white/60 dark:bg-indigo-950/20 backdrop-blur-md rounded-2xl p-6 border border-slate-200/60 dark:border-indigo-500/20 hover:border-slate-300/60 dark:hover:border-indigo-400/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl dark:shadow-[0_0_30px_rgba(99,102,241,0.05)]"
            >
              {/* Glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${section.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}
              ></div>

              {/* Icon */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-slate-100 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">{section.icon}</span>
                </div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
                  {section.title}
                </h3>
              </div>

              {/* Links */}
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <a
                      href={link.href}
                      className="group/link text-slate-600 dark:text-indigo-200/70 hover:text-slate-800 dark:hover:text-white transition-colors duration-300 flex items-center space-x-2"
                    >
                      <div
                        className={`w-1 h-1 rounded-full bg-gradient-to-r ${section.color} opacity-0 group-hover/link:opacity-100 transition-opacity duration-300`}
                      ></div>
                      <span className="group-hover/link:font-medium transition-all duration-300">
                        {link.name}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>

              {/* Bottom accent line */}
              <div className="mt-6 h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${section.color} rounded-full origin-left`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative border-t border-gray-200/60 dark:border-indigo-500/20 bg-white/40 dark:bg-indigo-950/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Legal links */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-indigo-100/60"
            >
              {["Legal", "Privacy Policy", "Cookies", "Accessibility"].map((item, index) => (
                <motion.a
                  key={item}
                  onClick={() => { navigate("/veryfi") }}
                  className="relative hover:text-slate-800 dark:hover:text-white transition-colors duration-300 group"
                  whileHover={{ y: -2 }}
                >
                  {item}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                </motion.a>
              ))}
            </motion.div>

            {/* Social Media Icons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex gap-4"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className={`relative group p-3 rounded-2xl bg-slate-100 dark:bg-indigo-900/20 ${social.hoverColor} hover:text-white transition-all duration-300 hover:shadow-lg dark:hover:shadow-indigo-500/20`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-5 h-5 relative z-10" />

                  {/* Glow effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${social.color} opacity-0 group-hover:opacity-20 rounded-2xl blur transition-opacity duration-300`}
                  ></div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative max-w-6xl mx-auto px-6 pb-8 text-center"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-indigo-950/20 backdrop-blur-sm rounded-full border border-slate-200/60 dark:border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500 dark:text-indigo-200/60 font-medium">
            © {new Date().getFullYear()} QuizApp — All rights reserved.
          </span>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footerreal;