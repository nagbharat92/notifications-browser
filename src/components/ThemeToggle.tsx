import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/context/ThemeContext";

const CYCLE: Theme[] = ["system", "light", "dark"];

const GLOW_SHADOW =
  "0 0 6px 3px rgba(255, 214, 10, 0.6), 0 0 16px 6px rgba(255, 214, 10, 0.3), 0 0 30px 10px rgba(255, 214, 10, 0.15)";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [glowVisible, setGlowVisible] = useState(false);

  // Fade in the dot immediately, then the glow after 1 s
  useEffect(() => {
    // Trigger on next frame so the initial opacity: 0 is painted first
    const rafId = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => setGlowVisible(true), 1000);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, []);

  const toggle = () => {
    // Interrupt any pending animations — snap to fully visible
    setVisible(true);
    setGlowVisible(true);

    // Skip themes that resolve to the same appearance as the current one
    const currentResolved = resolvedTheme;
    let idx = CYCLE.indexOf(theme);
    let next: Theme;
    do {
      idx = (idx + 1) % CYCLE.length;
      next = CYCLE[idx];
    } while (
      next !== theme &&
      (next === "system"
        ? (typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light")
        : next) === currentResolved
    );

    setTheme(next);
  };

  const label =
    theme === "system"
      ? `System (${resolvedTheme})`
      : resolvedTheme === "dark"
        ? "Dark"
        : "Light";

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={`Theme: ${label}`}
      title={`Theme: ${label}`}
      className="cursor-pointer"
    >
      <div
        className="rounded-full"
        style={{
          width: 14,
          height: 14,
          backgroundColor: isDark ? "white" : "black",
          opacity: visible ? 1 : 0,
          boxShadow: isDark && glowVisible ? GLOW_SHADOW : "none",
          transition: "opacity 0.8s ease-in-out, box-shadow 0.8s ease-in-out",
          pointerEvents: "none",
        }}
      />
    </Button>
  );
}
