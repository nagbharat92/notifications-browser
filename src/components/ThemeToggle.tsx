import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/context/ThemeContext";

const CYCLE: Theme[] = ["system", "light", "dark"];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggle = () => {
    const idx = CYCLE.indexOf(theme);
    setTheme(CYCLE[(idx + 1) % CYCLE.length]);
  };

  const label =
    theme === "system"
      ? `System (${resolvedTheme})`
      : resolvedTheme === "dark"
        ? "Dark"
        : "Light";

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
          backgroundColor: resolvedTheme === "dark" ? "white" : "black",
          boxShadow:
            resolvedTheme === "dark"
              ? "0 0 6px 3px rgba(255, 214, 10, 0.6), 0 0 16px 6px rgba(255, 214, 10, 0.3), 0 0 30px 10px rgba(255, 214, 10, 0.15)"
              : "none",
        }}
      />
    </Button>
  );
}
