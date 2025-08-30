import React from "react";
import { motion } from "framer-motion";
import Navbar from "../shared/Navbar";
import { 
  Target, 
  Users, 
  Award, 
  BookOpen, 
  Lightbulb, 
  Heart, 
  Shield, 
  Zap,
  Globe,
  Star,
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=400&h=400&fit=crop&crop=face",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      name: "Michael Chen",
      role: "Head of Technology",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      gradient: "from-purple-500 to-violet-600"
    },
    {
      name: "Emily Rodriguez",
      role: "Education Director",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      name: "David Kim",
      role: "UX Design Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for the highest quality in educational technology and user experience.",
      color: "blue"
    },
    {
      icon: Heart,
      title: "Student-Centered",
      description: "Every decision we make puts student success and learning outcomes first.",
      color: "pink"
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "We maintain the highest standards of academic honesty and data security.",
      color: "green"
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge educational technology.",
      color: "purple"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Students", icon: Users },
    { number: "1,200+", label: "Educators", icon: BookOpen },
    { number: "500K+", label: "Quizzes Completed", icon: Award },
    { number: "99.9%", label: "Uptime", icon: Zap }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-40 h-40 border-2 border-white/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-32 right-32 w-32 h-32 bg-white/10 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-3xl rotate-45 animate-pulse"></div>
            <div className="absolute top-40 right-40 w-20 h-20 bg-white/20 rounded-2xl rotate-12 animate-pulse"></div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 text-center py-24 px-6"
          >
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-4 mb-8">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-5xl font-bold text-white mb-3">
                    About ExamEdge
                  </h1>
                  <p className="text-white/90 text-xl">
                    Revolutionizing education through interactive learning
                  </p>
                </div>
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-lg text-white/90 max-w-3xl mx-auto leading-relaxed"
              >
                We believe that learning should be engaging, accessible, and effective. Our platform combines 
                cutting-edge technology with proven educational methodologies to create an unparalleled 
                quiz experience for students and educators worldwide.
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="px-6 -mt-16 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/90 backdrop-blur-xl border-0 shadow-xl rounded-2xl text-center p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mission Section */}
        <div className="px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                To democratize quality education by providing innovative, interactive assessment tools 
                that help educators create engaging content and students achieve their full potential.
              </p>
            </motion.div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                >
                  <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl p-6 h-full hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1">
                    <CardContent className="p-0 text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br from-${value.color}-500 to-${value.color}-600 rounded-2xl mx-auto mb-6 flex items-center justify-center`}>
                        <value.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Team Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-12">
                Passionate educators, technologists, and innovators working together to transform learning.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + index * 0.1, duration: 0.6 }}
                    className="group"
                  >
                    <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:rotate-2">
                      <CardContent className="p-0">
                        <div className={`h-32 bg-gradient-to-br ${member.gradient} relative`}>
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-2 right-2 w-12 h-12 border border-white/40 rounded-full animate-pulse"></div>
                            <div className="absolute bottom-2 left-2 w-8 h-8 bg-white/30 rounded-full"></div>
                          </div>
                        </div>
                        
                        <div className="relative -mt-12 text-center pb-6">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-xl object-cover"
                          />
                          <h3 className="text-lg font-bold text-gray-800 mt-4">{member.name}</h3>
                          <p className="text-gray-600 font-medium">{member.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Get In Touch
              </h2>
              <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
                Have questions about our platform? Want to partner with us? We'd love to hear from you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm text-gray-500 font-medium">EMAIL</p>
                    <p className="text-blue-600 font-semibold">hello@quizmaster.edu</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl">
                  <Phone className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm text-gray-500 font-medium">PHONE</p>
                    <p className="text-green-600 font-semibold">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl">
                  <MapPin className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <p className="text-sm text-gray-500 font-medium">LOCATION</p>
                    <p className="text-purple-600 font-semibold">San Francisco, CA</p>
                  </div>
                </div>
              </div>

              <Button className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Contact Us Today
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="fixed top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 blur-xl animate-pulse"></div>
        <div className="fixed bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10 blur-2xl animate-pulse"></div>
        <div className="fixed top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-10 blur-lg animate-pulse"></div>
      </div>
    </>
  );
};

export default AboutUs;