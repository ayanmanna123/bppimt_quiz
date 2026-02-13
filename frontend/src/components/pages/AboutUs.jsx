import React, { Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home, Users, Info, Book, Shield, UserCheck, Eye, Target, GraduationCap } from 'lucide-react';

const AboutUs = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    { name: "Welcome Messages", path: "/about/welcome-messages", icon: Info },
    { name: "Our Founder", path: "/about/our-founder", icon: Users },
    { name: "About BPPIMT", path: "/about/about-bppimt", icon: Book },
    { name: "Board of Governors", path: "/about/board-of-governors", icon: Shield },
    { name: "Administration", path: "/about/administration", icon: UserCheck },
    { name: "Vision", path: "/about/vision", icon: Eye },
    { name: "Mission", path: "/about/mission", icon: Target },
    { name: "B. P. Poddar Foundation", path: "/about/foundation", icon: GraduationCap },
  ];

  const getBreadcrumbs = () => {
    const paths = currentPath.split('/').filter(p => p !== "");
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      const name = path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      return { name, url };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Breadcrumbs Header */}
      <div className="bg-white border-b border-slate-200/60 py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <nav className="flex items-center space-x-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            {breadcrumbs.map((bc, index) => (
              <React.Fragment key={bc.url}>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <Link
                  to={bc.url}
                  className={`hover:text-blue-600 transition-colors ${index === breadcrumbs.length - 1 ? "text-slate-900 font-medium pointer-events-none" : ""}`}
                >
                  {bc.name}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <Outlet />
          </Suspense>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-slate-100/50 rounded-2xl border border-slate-200/40 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Related Pages</h3>
                  <div className="h-px flex-1 bg-rose-500/30"></div>
                  <div className="h-0.5 w-8 bg-rose-500"></div>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <div className="bg-[#1A1A4E] text-white px-4 py-3 rounded-lg mb-2 font-bold flex items-center gap-3 shadow-lg">
                  <Info className="w-5 h-5 shrink-0" />
                  <span className="text-lg">About Us</span>
                </div>

                <nav className="space-y-0.5">
                  {sidebarItems.map((item) => {
                    const isActive = currentPath === item.path || (currentPath === "/about" && item.path === "/about/welcome-messages");
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`group flex items-center gap-3 px-4 py-2.5 transition-all duration-200 border-l-2 ${isActive
                          ? "text-[#5E17EB] bg-white border-[#5E17EB] font-bold shadow-sm"
                          : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-white/50"
                          }`}
                      >
                        <span className="text-[15px]">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-24 h-24" />
              </div>
              <h4 className="text-lg font-bold mb-2">Need Help?</h4>
              <p className="text-blue-100 text-sm mb-4">Feel free to contact our administrative office for any queries.</p>
              <button className="bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all w-full">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;