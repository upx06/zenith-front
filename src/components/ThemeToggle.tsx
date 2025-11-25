import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-lg transition-all duration-200 bg-transparent hover:bg-gray-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-slate-950/30"
      aria-label="Toggle theme"
      title={theme === "light" ? "Modo escuro" : "Modo claro"}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-gray-700 hover:text-gray-900 transition-colors" />
      ) : (
        <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-colors" />
      )}
    </button>
  );
}
