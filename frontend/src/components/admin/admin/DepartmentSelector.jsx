import React from "react";
import {
  Zap,
  Cpu,
  Monitor,
  Code,
  ChevronRight,
  Sparkles,
  Star,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Department data with icons and descriptions
const departments = [
  {
    id: "EE",
    name: "Electrical Engineering",
    code: "EE",
    description: "Power systems, electronics & circuits",
    icon: Zap,
    gradient: "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600",
    pattern:
      "radial-gradient(circle at 25% 75%, rgba(245, 158, 11, 0.4) 0%, transparent 60%), linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, transparent 70%)",
    accentColor: "yellow",
  },
  {
    id: "ECE",
    name: "Electronics & Communication",
    code: "ECE",
    description: "Communication systems & embedded tech",
    icon: Cpu,
    gradient: "bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-600",
    pattern:
      "radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.4) 0%, transparent 70%), linear-gradient(45deg, rgba(167, 139, 250, 0.3) 0%, transparent 100%)",
    accentColor: "purple",
  },
  {
    id: "IT",
    name: "Information Technology",
    code: "IT",
    description: "Software development & system admin",
    icon: Monitor,
    gradient: "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600",
    pattern:
      "radial-gradient(circle at 25% 75%, rgba(59, 130, 246, 0.4) 0%, transparent 60%), linear-gradient(135deg, rgba(147, 197, 253, 0.3) 0%, transparent 70%)",
    accentColor: "blue",
  },
  {
    id: "CSE",
    name: "Computer Science & Engineering",
    code: "CSE",
    description: "Algorithms, AI & software engineering",
    icon: Code,
    gradient: "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600",
    pattern:
      "conic-gradient(from 90deg at 70% 30%, rgba(16, 185, 129, 0.4) 0deg, transparent 120deg, rgba(52, 211, 153, 0.3) 240deg)",
    accentColor: "green",
  },
];

const DepartmentSelector = () => {
  const navigate = useNavigate();
  const handleDepartmentClick = (departmentCode) => {
    navigate(`/subject/${departmentCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/20 rounded-2xl rotate-45 animate-pulse"></div>
        </div>

        <div className="relative z-10 text-center py-16 px-6">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-white mb-2">
                Choose Your Department 🎓
              </h1>
              <p className="text-white/90 text-lg">
                Select your engineering field to get started!
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-white/80 text-sm">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">🚀</div>
              <div className="text-white/80 text-sm">Modern Learning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">⚡</div>
              <div className="text-white/80 text-sm">Quick Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="px-6 -mt-8 relative z-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {departments.map((dept, index) => {
            const IconComponent = dept.icon;

            return (
              <div
                key={dept.id}
                onClick={() => handleDepartmentClick(dept.code)}
                className="group cursor-pointer"
              >
                <div className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white border-0 rounded-3xl transform hover:scale-105 relative group-hover:-translate-y-3">
                  {/* Enhanced gradient header */}
                  <div
                    className={`h-48 ${dept.gradient} relative overflow-hidden`}
                    style={{ background: dept.pattern }}
                  >
                    {/* Animated background elements */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-4 right-4 w-24 h-24 border-2 border-white/40 rounded-full animate-pulse group-hover:animate-spin"></div>
                      <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/30 rounded-full animate-bounce"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/30 rounded-2xl rotate-45 animate-pulse group-hover:rotate-90 transition-transform duration-1000"></div>
                      <div className="absolute top-6 left-6 w-8 h-8 bg-white/40 rounded-full group-hover:animate-ping"></div>
                      <div className="absolute bottom-8 right-8 w-6 h-6 bg-white/50 rounded-full"></div>
                    </div>

                    {/* Department badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-gray-800" />
                        <span className="text-xs font-semibold text-gray-800">
                          {dept.code}
                        </span>
                      </div>
                    </div>

                    {/* Main icon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    {/* Department info */}
                    <div className="absolute bottom-4 left-4 right-4 text-gray-800">
                      <h3 className="text-2xl font-bold drop-shadow-lg mb-2 leading-tight">
                        {dept.name}
                      </h3>
                      <p className="text-sm opacity-90 drop-shadow mb-3">
                        {dept.description}
                      </p>
                      <div className="w-16 h-1 bg-white/60 rounded-full group-hover:w-24 transition-all duration-500"></div>
                    </div>
                  </div>

                  {/* Enhanced content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Quick info */}
                      <div
                        className={`flex items-center gap-3 p-4 bg-${dept.accentColor}-50 rounded-xl`}
                      >
                        <div
                          className={`w-10 h-10 bg-${dept.accentColor}-100 rounded-full flex items-center justify-center`}
                        >
                          <IconComponent
                            className={`w-5 h-5 text-${dept.accentColor}-600`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">
                            DEPARTMENT
                          </p>
                          <p className="text-lg font-bold text-gray-700">
                            {dept.code}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <div className="text-xl font-bold text-gray-700">
                            📚
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Subjects
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <div className="text-xl font-bold text-gray-700">
                            🎯
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Quizzes
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <div className="text-xl font-bold text-gray-700">
                            🏆
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Progress
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDepartmentClick(dept.code);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-105"
                      >
                        <IconComponent className="w-5 h-5" />
                        Enter {dept.code}
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎓 Choose Your Engineering Path
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Each department offers specialized courses, quizzes, and learning
              materials tailored to your field of study. Click on your
              department to access subject-specific content and start your
              learning journey!
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {departments.map((dept, index) => (
                <div
                  key={dept.id}
                  className="text-center p-3 bg-gray-50 rounded-xl"
                >
                  <div className="text-2xl font-bold text-gray-700">
                    {dept.code}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {dept.name.split(" ")[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelector;
