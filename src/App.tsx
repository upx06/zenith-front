import { Router } from "./routes/Router";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Router />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#1e293b",
            padding: "16px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            border: "1px solid #e2e8f0",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "500px",
          },
          success: {
            duration: 3000,
            style: {
              background: "#ffffff",
              color: "#1e293b",
              border: "1px solid #10b981",
              boxShadow: "0 10px 15px -3px rgb(16 185 129 / 0.1), 0 4px 6px -4px rgb(16 185 129 / 0.1)",
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#1e293b",
              border: "1px solid #ef4444",
              boxShadow: "0 10px 15px -3px rgb(239 68 68 / 0.1), 0 4px 6px -4px rgb(239 68 68 / 0.1)",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
          loading: {
            style: {
              background: "#ffffff",
              color: "#1e293b",
              border: "1px solid #3b82f6",
              boxShadow: "0 10px 15px -3px rgb(59 130 246 / 0.1), 0 4px 6px -4px rgb(59 130 246 / 0.1)",
            },
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </>
  );
}

export default App;
