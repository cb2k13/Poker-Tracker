import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        setMsg("Account created. If email confirmation is enabled, check your inbox.");

        nav("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav("/");
      }
    } catch (e2) {
      setErr(e2?.message || "Auth error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>{mode === "login" ? "Login" : "Create account"}</h1>

        <form onSubmit={submit} className="form">
          {mode === "register" && (
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            </label>
          )}

          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder=" Password" />
          </label>

          {err ? <div className="error">{err}</div> : null}
          {msg ? <div className="success">{msg}</div> : null}

          <button className="btn" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <div className="switchRow">
          {mode === "login" ? (
            <button className="linkBtn" onClick={() => setMode("register")}>
              New here? Register
            </button>
          ) : (
            <button className="linkBtn" onClick={() => setMode("login")}>
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

