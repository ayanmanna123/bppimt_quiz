import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut, User, Menu, X, Home, BookOpen, BarChart3 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Howl } from "howler";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const dispatch = useDispatch();
  const { logout, loginWithRedirect, isAuthenticated} = useAuth0();
   

  const navigate = useNavigate();
  const location = useLocation();
  const { usere } = useSelector((store) => store.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem("loginShown")) {
      toast.success(`Welcome back ${usere.name || "back"} 🎉`);
      localStorage.setItem("loginShown", "true");
    }
  }, [isAuthenticated, usere]);

  const handleLogin = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loginShown");
    logout({
      logoutParams: { returnTo: window.location.origin },
    });
  };

  const studentNavItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "About Us", path: "/about", icon: User },
    { name: "Subject", path: "/quiz", icon: BookOpen },
    { name: "Result", path: "/reasult", icon: BarChart3 },
  ];

  const adminNavItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "About Us", path: "/about", icon: User },
    { name: "Subject", path: "/Admin/subject", icon: BookOpen },
    { name: "Result", path: "/admin/allquiz", icon: BarChart3 },
  ];
  const adminNavitem = [
    { name: "Home", path: "/", icon: Home },
    { name: "About Us", path: "/about", icon: User },
    { name: "Subject", path: "/admine/only/subject", icon: BookOpen },
    { name: "Un authorize", path: "/notvarifieduser", icon: BarChart3 },
  ];

  const navItems =
    usere?.role === "student"
      ? studentNavItems
      : usere?.role === "teacher"
      ? adminNavItems
      : adminNavitem;

  const isActivePath = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <motion.div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg border-b border-slate-200/60 shadow-lg"
          : "bg-white/80 backdrop-blur-sm"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-2 lg:px-10 py-2">
        {/* Logo Section */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="relative">
            <img src="/img-2.png" alt="Shield Logo" className="h-10 w-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="font-black text-2xl bg-gradient-to-r from-[#03045E] via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ExamEdge
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex items-center gap-1">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = isActivePath(item.path);

              return (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`relative group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>

                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}

                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                        layoutId="activeTab"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="group relative bg-gradient-to-r from-[#03045E] via-indigo-600 to-purple-600 hover:from-[#02034A] hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleLogin}
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#03045E] via-indigo-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </Button>
            </motion.div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <motion.div
                  className="cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative group">
                    <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                      <AvatarImage
                        className="object-cover"
                        src={
                          usere?.picture ||
                          `https://api.dicebear.com/6.x/initials/svg?seed=${usere.fullname}`
                        }
                      />
                    </Avatar>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>

                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full border-2 border-white shadow-lg">
                      <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </motion.div>
              </PopoverTrigger>

              <PopoverContent className="w-80 bg-white/90 backdrop-blur-lg border border-slate-200/60 shadow-2xl rounded-2xl p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        className="object-cover"
                        src={
                          usere?.picture ||
                          `https://api.dicebear.com/6.x/initials/svg?seed=${usere.fullname}`
                        }
                      />
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {usere?.fullname}
                      </h4>
                      <p className="text-sm text-slate-600">{usere?.email}</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2">
                    <motion.div
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 transition-colors duration-200 cursor-pointer group"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <Link
                        to="/profile"
                        className="font-medium text-slate-700 group-hover:text-slate-900"
                      >
                        View Profile
                      </Link>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 transition-colors duration-200 cursor-pointer group"
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <Link
                        to="/dashbord"
                        className="font-medium text-slate-700 group-hover:text-slate-900"
                      >
                        Dashbord
                      </Link>
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors duration-200 cursor-pointer group"
                      whileHover={{ x: 5 }}
                      onClick={handleLogout}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-slate-700 group-hover:text-red-600">
                        Logout
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </PopoverContent>
            </Popover>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-slate-700" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6 text-slate-700" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/60"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 py-4 space-y-2">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = isActivePath(item.path);

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 ${
                        isActive
                          ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    </motion.div>
  );
};

export default Navbar;
