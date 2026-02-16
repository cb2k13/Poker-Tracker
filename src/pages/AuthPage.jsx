import React, { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const redirectTo = useMemo(() => {
    // IMPORTANT: update the production URL to your real Vercel domain if it changes
    return import.meta.env.PROD
      ? "https://poker-tracker-jade.vercel.app/auth/callback"
      : "http://localhost:5173/auth/callback";
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setShowResend(false);
    setLoading(true);

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: redirectTo,
          },
        });
        if (error) throw error;

        // With email confirmations enabled, they won't be logged in yet.
        setMsg("Account created. Check your email to confirm your account, then come back to login.");
        setMode("login");
        setPassword("");
        return;
      }

      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const message = error.message || "Login failed";
        // Common Supabase message when confirmations are enabled
        if (message.toLowerCase().includes("email not confirmed")) {
          setErr("Email not confirmed. Please confirm your email (or resend the confirmation).");
          setShowResend(true);
          return;
        }
        throw error;
      }

      nav("/");
    } catch (e2) {
      setErr(e2?.message || "Auth error");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setMsg("Confirmation email sent. Check your inbox/spam.");
    } catch (e2) {
      setErr(e2?.message || "Could not resend email");
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </label>

          {err ? <div className="error">{err}</div> : null}
          {msg ? <div className="success">{msg}</div> : null}

          {showResend && mode === "login" ? (
            <button
              type="button"
              className="btn"
              disabled={loading || !email}
              onClick={resend}
              style={{ marginBottom: 10 }}
            >
              {loading ? "..." : "Resend confirmation email"}
            </button>
          ) : null}

          <button className="btn" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <div className="switchRow">
          {mode === "login" ? (
            <button className="linkBtn" onClick={() => setMode("register")} type="button">
              New here? Register
            </button>
          ) : (
            <button className="linkBtn" onClick={() => setMode("login")} type="button">
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
