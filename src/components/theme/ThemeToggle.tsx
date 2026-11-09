"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const next = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    setIsDark(next === "dark");
    setTheme(next);
  }

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm border border-line bg-paper-elevated text-ink transition-colors hover:border-ink",
        className,
      )}
      aria-label={
        !mounted
          ? "Toggle color theme"
          : isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
      }
      onClick={toggle}
    >
      {!mounted ? (
        <span className="h-3.5 w-3.5 rounded-full border border-line-strong" />
      ) : (
        <>
          <Sun
            size={16}
            className={cn(
              "absolute transition-all duration-300",
              isDark ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100",
            )}
            aria-hidden
          />
          <Moon
            size={16}
            className={cn(
              "absolute transition-all duration-300",
              isDark ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
            )}
            aria-hidden
          />
        </>
      )}
    </button>
  );
}
