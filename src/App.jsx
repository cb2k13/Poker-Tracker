import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import GraphsPage from "./pages/GraphsPage";
import SessionsPage from "./pages/SessionsPage";
import HandsPage from "./pages/HandsPage";
import Navbar from "./components/Navbar";

function AppShell() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/auth" ||
    location.pathname === "/auth/callback";

  return (
    <>
      {!hideNavbar ? <Navbar /> : null}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stats" element={<GraphsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/hands" element={<HandsPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <AppShell />;
}
