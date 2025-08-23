import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import type { RootState } from "./store";
import { setAuth } from "@/store/authSlice";
import Authentication from "./screens/Authentication";
import Dashboard from "./screens/Dashboard";
import { Toaster } from "sonner";

function App() {
  const dispatch = useDispatch();
  const { user, sessionId } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = user && sessionId;

  useEffect(() => {
    // Check for existing session in localStorage
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.user && authData.sessionId) {
          dispatch(setAuth(authData));
        }
      } catch (error) {
        console.error("Error parsing stored auth:", error);
        localStorage.removeItem("auth");
      }
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-between">
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route
          path="/auth"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Authentication />
          }
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />}
        />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
