import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SessionsPage from "./pages/SessionsPage.jsx";
import HandsPage from "./pages/HandsPage.jsx";
import { useSession } from "./hooks/useSession.js";
import Navbar from "./components/Navbar.jsx";

function Protected({ children }) {
  const { session, loading } = useSession();
  if (loading) return <div className="container">Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const { session } = useSession();

  return (
    <div>
      {session ? <Navbar /> : null}

      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/sessions"
          element={
            <Protected>
              <SessionsPage />
            </Protected>
          }
        />

        <Route
          path="/hands"
          element={
            <Protected>
              <HandsPage />
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to={session ? "/" : "/auth"} replace />} />
      </Routes>
    </div>
  );
}

