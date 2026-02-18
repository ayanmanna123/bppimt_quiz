import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../Redux/auth.reducer";

export function useTheme() {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.auth.theme);
    const legacyDarkTheme = useSelector((state) => state.auth.darktheme);

    // Migration effect for existing users
    useEffect(() => {
        if (!theme && typeof legacyDarkTheme === "boolean") {
            dispatch(setTheme(legacyDarkTheme ? "dark" : "light"));
        }
    }, [theme, legacyDarkTheme, dispatch]);

    const currentTheme = theme || "system";

    const [isSystemDark, setIsSystemDark] = useState(
        window.matchMedia("(prefers-color-scheme: dark)").matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => setIsSystemDark(e.matches);

        // Modern browsers use addEventListener, legacy might use addListener (deprecated but widely supported)
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleChange);
        } else {
            mediaQuery.addListener(handleChange);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener("change", handleChange);
            } else {
                mediaQuery.removeListener(handleChange);
            }
        };
    }, []);

    const isDark =
        currentTheme === "dark" ||
        (currentTheme === "system" && isSystemDark);

    return { theme: currentTheme, isDark, setTheme: (t) => dispatch(setTheme(t)) };
}
