import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut, User, Menu, X, Home, BookOpen, BarChart3, GraduationCap, MessageCircle, ChevronDown, Info, Users, Book, Shield, UserCheck, Eye, Target, FileText, ShoppingBag, Settings, ChevronLeft } from "lucide-react";
import PushNotificationManager from "../PushNotificationManager";
import { useSocket } from "../../context/SocketContext";
import axios from "axios";
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
import NotificationDropdown from "./NotificationDropdown";
import { ThemeToggle } from "./theme-toggle";


const Navbar = () => {
  const dispatch = useDispatch();
  const { logout, loginWithRedirect, isAuthenticated, user } = useAuth0();

  const navigate = useNavigate();
  const location = useLocation();
  const { usere } = useSelector((store) => store.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [popoverView, setPopoverView] = useState("menu"); // 'menu' or 'settings'

  // Unseen Message Count
  const [unseenCount, setUnseenCount] = useState(0);
  const socket = useSocket();
  const { getAccessTokenSilently } = useAuth0();

  // Handle scroll effect with throttling
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem("loginShown")) {
      toast.success(`Welcome back ${user.name || "back"} 🎉`);
      localStorage.setItem("loginShown", "true");
    }
  }, [isAuthenticated, usere]);

  // Fetch initial unseen count
  useEffect(() => {
    const fetchUnseenCount = async () => {
      try {
        if (!usere) {
          return;
        }
        const token = await getAccessTokenSilently();
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/chat/unseen/${usere._id}?subjectId=global`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnseenCount(res.data.count);
      } catch (error) {
        console.error("Failed to fetch unseen count", error);
      }
    };
    if (usere) {
      fetchUnseenCount();
    }
  }, [usere, getAccessTokenSilently]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      // Check if message is for global chat and not from me
      if (
        (message.isGlobal || message.subjectId === "global") &&
        message.sender?._id !== usere?._id
      ) {
        // If not on chat page, increment
        if (location.pathname !== "/chats") {
          setUnseenCount((prev) => prev + 1);
          toast.info(`New message from ${message.sender?.fullname || 'someone'}`);
          const sound = new Howl({
            src: ["/notification.mp3"]
          });
          sound.play();
        }
      }
    };

    const handleStoreMessage = (data) => {
      const { message } = data;
      if (message.sender?._id !== usere?._id) {
        if (location.pathname !== "/chats" && location.pathname !== "/store/chat") {
          setUnseenCount((prev) => prev + 1);
        }
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("newStoreMessage", handleStoreMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("newStoreMessage", handleStoreMessage);
    };
  }, [socket, usere, location.pathname]);

  // Clear count when entering chat
  useEffect(() => {
    if (location.pathname === "/chats") {
      setUnseenCount(0);
      // Actual API call to mark as read happens in GlobalChat.jsx
    }
  }, [location.pathname]);

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
    { name: "Attendance", path: "/StudentAttendanceSummary", icon: BookOpen },
    { name: "PYQ", path: "/pyq", icon: FileText },
    { name: "Study Rooms", path: "/study-rooms", icon: Users },
    { name: "Store", path: "/store", icon: ShoppingBag },
    { name: "Chats", path: "/chats", icon: MessageCircle },
  ];

  const adminNavItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "About Us", path: "/about", icon: User },
    { name: "Subject", path: "/Admin/subject", icon: BookOpen },
    { name: "Result", path: "/admin/allquiz", icon: BarChart3 },
    { name: "PYQ", path: "/pyq", icon: FileText },
    { name: "Contributed Teacher", path: "/admin/othersubject", icon: GraduationCap },
    { name: "Study Rooms", path: "/study-rooms", icon: Users },
    { name: "Store", path: "/store", icon: ShoppingBag },
    { name: "Chats", path: "/chats", icon: MessageCircle },
  ];
  const adminNavitem = [
    { name: "Home", path: "/", icon: Home },
    { name: "About Us", path: "/about", icon: User },
    { name: "Subject", path: "/admine/only/subject", icon: BookOpen },
    { name: "Un authorize", path: "/notvarifieduser", icon: BarChart3 },
    { name: "Study Rooms", path: "/study-rooms", icon: Users },
    { name: "Store", path: "/store", icon: ShoppingBag },
    { name: "Chats", path: "/chats", icon: MessageCircle },
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
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-white/90 dark:bg-[#030014]/90 backdrop-blur-lg border-b border-slate-200/60 dark:border-indigo-500/20 shadow-lg dark:shadow-[0_0_20px_rgba(0,0,0,0.4)]"
        : "bg-white/80 dark:bg-[#030014]/80 backdrop-blur-sm"
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="relative max-w-screen-2xl mx-auto flex items-center justify-between px-4 lg:px-8 py-2">
        {/* Logo Section */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="relative">
            <img src="/bppimt.svg" alt="Shield Logo" className="h-10 w-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="font-black text-2xl bg-gradient-to-r from-[#03045E] via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Bppimt Quiz
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <ul className="flex items-center gap-1">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = isActivePath(item.path);

              if (item.name === "About Us") {
                return (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={`relative group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer ${isActive
                            ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                            : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                        >
                          <div className="relative">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span>{item.name}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-300 group-hover:rotate-180`} />
                          {!isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 bg-white/95 dark:bg-[#05001c]/95 backdrop-blur-lg border border-slate-200/60 dark:border-indigo-500/20 shadow-2xl dark:shadow-[0_0_30px_rgba(99,102,241,0.1)] rounded-2xl p-2 z-[60]">
                        <div className="grid gap-1">
                          {[
                            { name: "Welcome Messages", path: "/about/welcome-messages", icon: Info },
                            { name: "Our Founder", path: "/about/our-founder", icon: Users },
                            { name: "About BPPIMT", path: "/about/about-bppimt", icon: Book },
                            { name: "Board of Governors", path: "/about/board-of-governors", icon: Shield },
                            { name: "Administration", path: "/about/administration", icon: UserCheck },
                            { name: "Vision", path: "/about/vision", icon: Eye },
                            { name: "Mission", path: "/about/mission", icon: Target },
                            { name: "B. P. Poddar Foundation", path: "/about/foundation", icon: GraduationCap },
                          ].map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-indigo-500/10 transition-colors group"
                            >
                              <subItem.icon className="w-4 h-4 text-slate-400 dark:text-indigo-400 group-hover:text-blue-600 dark:group-hover:text-indigo-300 transition-colors" />
                              <span className="text-sm font-medium text-slate-700 dark:text-indigo-100">{subItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </motion.li>
                );
              }

              return (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`relative group flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition-all duration-300 ${isActive
                      ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                  >

                    <div className="relative">
                      <IconComponent className="w-4 h-4" />
                      {item.path === "/chats" && unseenCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                          {unseenCount > 9 ? "9+" : unseenCount}
                        </span>
                      )}
                    </div>
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

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Dropdown */}
          {isAuthenticated && <NotificationDropdown />}

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
                          `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`
                        }
                      />
                    </Avatar>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>

                    {/* Online indicator */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-lg 
                     ${usere?.verified === "accept"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : usere?.verified === "pending"
                            ? "bg-gray-400"
                            : "bg-red-500"
                        }`}
                    >
                      <div
                        className={`w-full h-full rounded-full ${usere?.verified === "accept"
                          ? "bg-emerald-400 animate-pulse"
                          : usere?.verified === "pending"
                            ? "bg-gray-300"
                            : "bg-red-400"
                          }`}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              </PopoverTrigger>

              <PopoverContent className="w-80 bg-white/90 dark:bg-[#05001c]/95 backdrop-blur-lg border border-slate-200/60 dark:border-indigo-500/20 shadow-2xl rounded-2xl p-6 dark:shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatePresence mode="wait">
                    {popoverView === "menu" ? (
                      <motion.div
                        key="menu"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* User Info */}
                        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              className="object-cover"
                              src={
                                usere?.picture ||
                                `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`
                              }
                            />
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                              {usere?.fullname}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-2">
                          <motion.div
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer group"
                            whileHover={{ x: 5 }}
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <Link
                              to={`/profile/${usere?.universityNo || usere?._id}`}
                              className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                            >
                              View Profile
                            </Link>
                          </motion.div>
                          {usere?.role !== "teacher" && (
                            <motion.div
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer group"
                              whileHover={{ x: 5 }}
                            >
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <Link
                                to="/dashbord"
                                className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                              >
                                Dashbord
                              </Link>
                            </motion.div>
                          )}

                          <motion.div
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer group"
                            whileHover={{ x: 5 }}
                            onClick={() => setPopoverView("settings")}
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-700 rounded-xl flex items-center justify-center">
                              <Settings className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                              Settings
                            </span>
                          </motion.div>

                          <motion.div
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 cursor-pointer group"
                            whileHover={{ x: 5 }}
                            onClick={handleLogout}
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                              <LogOut className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                              Logout
                            </span>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPopoverView("menu")}
                            className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                          >
                            <ChevronLeft className="w-5 h-5 dark:text-slate-300" />
                          </Button>
                          <h4 className="font-bold text-slate-800 dark:text-white text-lg">Settings</h4>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                              Notifications
                            </p>
                            <PushNotificationManager inline={true} />
                          </div>
                          {/* Add more settings here in future */}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </PopoverContent>
            </Popover>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-indigo-500/10 hover:bg-slate-200 dark:hover:bg-indigo-500/20 transition-colors duration-200"
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
                  <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Mobile Theme Toggle */}
          <div className="lg:hidden ml-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-white/95 dark:bg-[#030014]/95 backdrop-blur-lg border-t border-slate-200/60 dark:border-indigo-500/20"
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
                      className={`flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 ${isActive
                        ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                        : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >

                      <div className="relative">
                        <IconComponent className="w-5 h-5" />
                        {item.path === "/chats" && unseenCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                            {unseenCount > 9 ? "9+" : unseenCount}
                          </span>
                        )}
                      </div>
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
