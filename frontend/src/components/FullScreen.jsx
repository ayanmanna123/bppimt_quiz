import React, { useEffect, useState } from "react";
import GiveQuiz from "./pages/GiveQuiz";

const FullScreen = () => {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  useEffect(() => {
    const elem = document.documentElement;

    const enterFullscreen = async () => {
      try {
        if (elem.requestFullscreen) await elem.requestFullscreen();
      } catch (error) {
        console.error("Fullscreen failed:", error);
      }
    };

    enterFullscreen();

    // 1️⃣ Detect tab switch
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        alert("⚠️ You switched tabs! Quiz may be invalidated.");
      }
    };

    // 2️⃣ Detect window switch
    const handleBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
      alert("⚠️ You switched windows! Stay on quiz page.");
    };

    // 3️⃣ Detect DevTools (F12 / Ctrl+Shift+I)
    const detectDevTools = (e) => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        alert("⚠️ DevTools is not allowed!");
        e.preventDefault();
      }
    };

    // 4️⃣ Disable right-click
    const disableRightClick = (e) => {
      e.preventDefault();
      alert("⚠️ Right-click is disabled!");
    };

    // 5️⃣ Disable copy/cut
    const disableCopy = (e) => {
      e.preventDefault();
      alert("⚠️ Copying is disabled!");
    };

    // 6️⃣ Block shortcuts (Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+U)
    const blockKeys = (e) => {
      if (
        (e.ctrlKey && e.key.toLowerCase() === "c") ||
        (e.ctrlKey && e.key.toLowerCase() === "x") ||
        (e.ctrlKey && e.key.toLowerCase() === "a") ||
        (e.ctrlKey && e.key.toLowerCase() === "s") ||
        (e.ctrlKey && e.key.toLowerCase() === "u")
      ) {
        e.preventDefault();
        alert("⚠️ Keyboard shortcuts are blocked!");
      }
    };

    // Attach listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keydown", detectDevTools);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("copy", disableCopy);
    document.addEventListener("cut", disableCopy);

    // Disable text selection globally
    document.onselectstart = () => false;

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", detectDevTools);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("copy", disableCopy);
      document.removeEventListener("cut", disableCopy);
      document.onselectstart = null;

      if (document.exitFullscreen) document.exitFullscreen();
    };
  }, []);

  return (
    <>
      {/* Apply inline CSS protection */}
      <style>{`
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;

          -webkit-user-drag: none;
          user-drag: none;
        }
      `}</style>

      <GiveQuiz tabSwitchCount={tabSwitchCount} />
    </>
  );
};

export default FullScreen;
