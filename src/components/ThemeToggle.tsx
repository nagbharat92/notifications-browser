import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={`Theme: ${resolvedTheme === "dark" ? "Dark" : "Light"}`}
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
