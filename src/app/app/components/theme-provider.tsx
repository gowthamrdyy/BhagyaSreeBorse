"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/hooks/zustand";

export const ThemeProvider = (props: React.PropsWithChildren) => {
    const { reduceMotion } = useSettingsStore();

    useEffect(() => {
        const root = document.documentElement;
        // Force dark mode
        root.classList.add("dark");
        // Remove any previously injected inline color overrides from old ThemeProvider
        root.style.removeProperty("--primary");
        root.style.removeProperty("--ring");
        root.style.removeProperty("--accent");
        // Clear old accent-color localStorage key to avoid stale red theme
        try { localStorage.removeItem("app-settings"); } catch {}

        if (reduceMotion) {
            document.body.classList.add("reduce-motion");
        } else {
            document.body.classList.remove("reduce-motion");
        }
    }, [reduceMotion]);

    return <>{props.children}</>;
};
