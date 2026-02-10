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

    // 3️⃣ Detect DevTools
    const detectDevTools = (e) => {
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        alert("⚠️ DevTools is not allowed!");
        e.preventDefault();
      }
    };

    // 4️⃣ Prevent Right Click
    const preventRightClick = (e) => {
      e.preventDefault();
    };

    // 5️⃣ Prevent Copy/Cut/Paste
    const preventCopyPaste = (e) => {
      e.preventDefault();
      alert("⚠️ Copying and pasting is not allowed!");
    };

    // 6️⃣ Prevent Text Selection & Dragging
    const preventSelection = (e) => {
      e.preventDefault();
    };


    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keydown", detectDevTools);
    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("cut", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("dragstart", preventSelection);
    document.addEventListener("selectstart", preventSelection);

    // Disable text selection via CSS
    const originalUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", detectDevTools);
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("cut", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("dragstart", preventSelection);
      document.removeEventListener("selectstart", preventSelection);

      // Restore text selection
      document.body.style.userSelect = originalUserSelect;

      if (document.exitFullscreen) document.exitFullscreen();
    };
  }, []);

  return (
    <>

      <GiveQuiz tabSwitchCount={tabSwitchCount} />
    </>
  );
};

export default FullScreen;
