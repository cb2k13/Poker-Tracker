import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const nav = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/auth");
  };

  return (
    <div className="topbar">
      <div className="brand" onClick={() => nav("/")} role="button" tabIndex={0}>
        <div className="pulseIcon">♠</div>
        <div className="brandText">Poker Tracker</div>
      </div>

      <div className="nav">
        <NavLink to="/" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/sessions" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
          Sessions
        </NavLink>
        <NavLink to="/hands" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>
          Hands
        </NavLink>
      </div>

      <div className="right">
        <button className="btn btnDanger" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

