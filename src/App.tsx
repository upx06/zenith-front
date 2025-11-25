import { Router } from "./routes/Router";
import { Toaster } from "react-hot-toast";
import { useTheme } from "./hooks/useTheme";

function App() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <Router />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? "#1e293b" : "#ffffff",
            color: isDark ? "#f1f5f9" : "#1e293b",
            padding: "16px 20px",
            borderRadius: "12px",
            boxShadow: isDark
              ? "0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)"
              : "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "500px",
          },
          success: {
            duration: 3000,
            style: {
              background: isDark ? "#1e293b" : "#ffffff",
              color: isDark ? "#f1f5f9" : "#1e293b",
              border: isDark ? "1px solid #10b981" : "1px solid #10b981",
              boxShadow: "0 10px 15px -3px rgb(16 185 129 / 0.1), 0 4px 6px -4px rgb(16 185 129 / 0.1)",
            },
            iconTheme: {
              primary: "#10b981",
              secondary: isDark ? "#1e293b" : "#ffffff",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: isDark ? "#1e293b" : "#ffffff",
              color: isDark ? "#f1f5f9" : "#1e293b",
              border: isDark ? "1px solid #ef4444" : "1px solid #ef4444",
              boxShadow: "0 10px 15px -3px rgb(239 68 68 / 0.1), 0 4px 6px -4px rgb(239 68 68 / 0.1)",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: isDark ? "#1e293b" : "#ffffff",
            },
          },
          loading: {
            style: {
              background: isDark ? "#1e293b" : "#ffffff",
              color: isDark ? "#f1f5f9" : "#1e293b",
              border: isDark ? "1px solid #3b82f6" : "1px solid #3b82f6",
              boxShadow: "0 10px 15px -3px rgb(59 130 246 / 0.1), 0 4px 6px -4px rgb(59 130 246 / 0.1)",
            },
            iconTheme: {
              primary: "#3b82f6",
              secondary: isDark ? "#1e293b" : "#ffffff",
            },
          },
        }}
      />
    </>
  );
}

export default App;
