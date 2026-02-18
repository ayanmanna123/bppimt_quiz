import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle() {
  const { isDark, setTheme } = useTheme();

  const handleThemeChange = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={handleThemeChange}
      className="relative w-14 h-7 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 hover:scale-105 shadow-md"
      aria-label="Toggle theme"
    >
      {/* Background - Sky/Night transition */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${isDark
          ? "bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-800"
          : "bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200"
          }`}
      />

      {/* Stars (dark mode only) with twinkling effect */}
      {isDark && (
        <>
          <div
            className="absolute top-1 left-3 w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{ animationDuration: "1.5s" }}
          />
          <div
            className="absolute top-1.5 left-5 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-pulse"
            style={{ animationDuration: "2s", animationDelay: "0.3s" }}
          />
          <div
            className="absolute top-1 right-4 w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{ animationDuration: "1.8s", animationDelay: "0.6s" }}
          />
        </>
      )}

      {/* Clouds (light mode only) */}
      {!isDark && (
        <>
          <div className="absolute top-1 left-4 w-4 h-1 bg-white/60 rounded-full blur-sm" />
          <div className="absolute top-0.5 right-5 w-3 h-1 bg-white/60 rounded-full blur-sm" />
        </>
      )}

      {/* Ground/Landscape */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-2.5 transition-all duration-700 ${isDark
          ? "bg-gradient-to-b from-green-900 via-green-950 to-slate-900"
          : "bg-gradient-to-b from-green-500 via-green-600 to-green-700"
          }`}
      >
        {/* Hills */}
        <div
          className={`absolute bottom-0 -left-1 w-5 h-2 rounded-t-full transition-colors duration-700 ${isDark ? "bg-green-800/80" : "bg-green-400/80"
            }`}
        />
        <div
          className={`absolute bottom-0 right-4 w-3 h-1 rounded-t-full transition-colors duration-700 ${isDark ? "bg-green-800/70" : "bg-green-400/70"
            }`}
        />
      </div>

      {/* Enhanced Tree */}
      <div className="absolute bottom-2.5 right-2">
        {/* Trunk */}
        <div
          className={`w-0.5 h-1 rounded-sm transition-colors duration-700 mx-auto ${isDark ? "bg-amber-900" : "bg-amber-800"
            }`}
        />
        {/* Leaves */}
        <div
          className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-colors duration-700 ${isDark ? "bg-green-800" : "bg-green-600"
            }`}
        />
      </div>

      {/* Sun (light mode) */}
      <div
        className={`absolute top-1.5 right-4 transition-all duration-700 ${!isDark ? "opacity-100 scale-100" : "opacity-0 scale-0"
          }`}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-sm shadow-yellow-300/60" />
      </div>

      {/* Moon (dark mode) */}
      <div
        className={`absolute top-1 left-3 w-2.5 h-2.5 rounded-full transition-all duration-700 ${isDark
          ? "bg-gradient-to-br from-slate-200 to-slate-300 opacity-100 scale-100 shadow-sm shadow-slate-400/50"
          : "bg-slate-300 opacity-0 scale-0"
          }`}
      />

      {/* Sliding Toggle Circle */}
      <div
        className={`absolute top-1 w-5 h-5 rounded-full shadow-lg transition-all duration-700 ease-in-out ${isDark
          ? "left-1 bg-gradient-to-br from-slate-100 to-slate-200"
          : "left-[calc(100%-1.25rem-4px)] bg-gradient-to-br from-white to-gray-50"
          }`}
      >
        {/* Icon on toggle */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isDark ? (
            <svg
              className="w-3 h-3 text-indigo-900"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              className="w-3 h-3 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
