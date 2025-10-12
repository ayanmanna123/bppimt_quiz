import { useDispatch, useSelector } from "react-redux";
import { setdarktheme } from "@/Redux/auth.reducer";

export function ThemeToggle() {
  const dispatch = useDispatch();
  const { darktheme } = useSelector((store) => store.auth);

  const handleThemeChange = () => {
    dispatch(setdarktheme(!darktheme));
  };

  return (
    <button
      onClick={handleThemeChange}
      className="relative w-20 h-10 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all duration-300 hover:scale-105"
      aria-label="Toggle theme"
    >
      {/* Background - Sky/Night transition */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          darktheme
            ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700"
            : "bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100"
        }`}
      />

      {/* Stars (dark mode only) */}
      {darktheme && (
        <>
          <div className="absolute top-1.5 left-5 w-0.5 h-0.5 bg-white rounded-full animate-pulse" />
          <div className="absolute top-2.5 left-8 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-100" />
          <div className="absolute top-2 right-7 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-200" />
        </>
      )}

      {/* Ground/Landscape */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-4 transition-all duration-700 ${
          darktheme
            ? "bg-gradient-to-b from-green-900 to-green-950"
            : "bg-gradient-to-b from-green-400 to-green-500"
        }`}
      >
        {/* Hills */}
        <div
          className={`absolute bottom-0 -left-2 w-8 h-3 rounded-t-full transition-colors duration-700 ${
            darktheme ? "bg-green-800" : "bg-green-300"
          }`}
        />
        <div
          className={`absolute bottom-0 left-5 w-6 h-2 rounded-t-full transition-colors duration-700 ${
            darktheme ? "bg-green-800" : "bg-green-300"
          }`}
        />
      </div>

      {/* Tree */}
      <div className="absolute bottom-4 right-3">
        {/* Trunk */}
        <div
          className={`w-1 h-2.5 rounded-sm transition-colors duration-700 mx-auto ${
            darktheme ? "bg-amber-900" : "bg-amber-800"
          }`}
        />
        {/* Leaves */}
        <div
          className={`w-4 h-4 rounded-full -mt-3 transition-colors duration-700 ${
            darktheme ? "bg-green-800" : "bg-green-600"
          }`}
        />
      </div>

      {/* Sun (light mode) */}
      <div
        className={`absolute top-3 right-7 w-5 h-5 rounded-full transition-all duration-700 ${
          !darktheme
            ? "bg-yellow-300 opacity-100 scale-100 shadow-lg shadow-yellow-200"
            : "bg-yellow-200 opacity-0 scale-0"
        }`}
      />

      {/* Moon (dark mode) */}
      <div
        className={`absolute top-2 left-5 w-4 h-4 rounded-full transition-all duration-700 ${
          darktheme
            ? "bg-slate-200 opacity-100 scale-100 shadow-lg shadow-slate-400/50"
            : "bg-slate-300 opacity-0 scale-0"
        }`}
      >
        {/* Moon craters */}
        <div className="absolute top-1 left-1 w-1 h-1 bg-slate-300 rounded-full opacity-50" />
        <div className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-slate-300 rounded-full opacity-40" />
      </div>

      {/* Sliding Toggle Circle */}
      <div
        className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-2xl transition-all duration-700 ease-in-out ${
          darktheme ? "left-1" : "left-[calc(100%-2.25rem)]"
        }`}
      />
    </button>
  );
}
