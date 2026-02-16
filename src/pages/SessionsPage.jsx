import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase"; // adjust path if needed

// helper functions 
function toDatetimeLocalValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
// convert dollars string to cents integer
function dollarsToCents(str) {
  const n = Number(str);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}
// converts cents int to dollars to a fixed decimal 
function centsToDollars(cents) {
  const n = Number(cents || 0) / 100;
  return n.toFixed(2);
}

function fmtDateTime(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleString();
}

function timePlayedLabel(started_at, ended_at) {
  if (!started_at) return "";
  if (!ended_at) return "In progress";
  const ms = new Date(ended_at) - new Date(started_at);
  const mins = Math.max(0, Math.round(ms / 60_000));
  return `${mins}m`;
}

// initial states for new 
export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [err, setErr] = useState("");

  // form use states
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [stakes, setStakes] = useState("");
  const [startedAtLocal, setStartedAtLocal] = useState(toDatetimeLocalValue());
  const [timePlayedMin, setTimePlayedMin] = useState("");
  const [profitDollars, setProfitDollars] = useState("");

  async function getUserOrThrow() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error("Not authenticated");
    return user;
  }

  async function loadSessions() {
    const user = await getUserOrThrow();

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    if (error) throw error;
    setSessions(data || []);
  }
// error handling for when it fails to load sessions on page reload 
  useEffect(() => {
    (async () => {
      try {
        setErr("");
        await loadSessions();
      } catch (e) {
        setErr(e?.message || "Failed to load sessions");
      }
    })();
  }, []);

  const totalProfitCents = useMemo(
    () => sessions.reduce((acc, s) => acc + (s.profit_cents || 0), 0),
    [sessions]
  );

  async function addSession(e) {
    e.preventDefault();
    try {
      setErr("");

      const user = await getUserOrThrow();

      if (!title.trim()) throw new Error("Title is required");
      if (!location.trim()) throw new Error("Location is required");
      if (!startedAtLocal) throw new Error("Started At is required");

      const startedAtISO = new Date(startedAtLocal).toISOString();

      // time played 
      let endedAtISO = null;
      if (timePlayedMin !== "") {
        const mins = Number.parseInt(timePlayedMin, 10);
        if (!Number.isFinite(mins) || mins < 0) {
          throw new Error("Time Played must be a non-negative integer (minutes).");
        }
        endedAtISO = new Date(new Date(startedAtLocal).getTime() + mins * 60_000).toISOString();
      }

      // profit to cents with validation 
      const profitCents = profitDollars === "" ? 0 : dollarsToCents(profitDollars);
      if (profitDollars !== "" && profitCents === null) {
        throw new Error("Profit must be a valid number (e.g. -25.50, 0, 10.00).");
      }

      const payload = {
        user_id: user.id,
        title: title.trim(),
        location: location.trim(),
        stakes: stakes.trim() || null,
        started_at: startedAtISO,
        ended_at: endedAtISO,
        profit_cents: profitCents ?? 0,
      };

      const { error } = await supabase.from("sessions").insert([payload]);
      if (error) throw error;

      // reset form
      setTitle("");
      setLocation("");
      setStakes(""); 
      setStartedAtLocal(toDatetimeLocalValue());
      setTimePlayedMin("");
      setProfitDollars("");

      await loadSessions();
    } catch (e) {
      setErr(e?.message || "Failed to add session");
    }
  }
// delete session fucntion that deletes session by id from sessions table in supabase 
  async function deleteSession(id) {
    try {
      setErr("");
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
      await loadSessions();
    } catch (e) {
      setErr(e?.message || "Failed to delete session");
    }
  }

  return (
    <div className="page">
      <h1 className="pageTitle">Sessions</h1>

      {err ? <div className="errorBanner">{err}</div> : null}

     
      <div className="card">
        <div className="cardTitle">New Session</div>

        <form onSubmit={addSession} className="row" style={{ gap: 12 }}>
          <input
            className="input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="input"
            placeholder="Location (Wynn, Bellagio, etc.)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="input"
            placeholder="Stakes (e.g., 1/3, 2/5)"
            value={stakes}
            onChange={(e) => setStakes(e.target.value)}
          />

          <input
            className="input"
            type="datetime-local"
            value={startedAtLocal}
            onChange={(e) => setStartedAtLocal(e.target.value)}
            title="Started At"
          />

          <input
            className="input"
            type="number"
            min="0"
            step="1"
            placeholder="Time Played (min)"
            value={timePlayedMin}
            onChange={(e) => setTimePlayedMin(e.target.value)}
          />

          <input
            className="input"
            inputMode="decimal"
            placeholder="Profit ($)"
            value={profitDollars}
            onChange={(e) => setProfitDollars(e.target.value)}
          />

          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </div>

     
      <div className="card" style={{ marginTop: 14 }}>
        <div className="cardTitleRow">
          <div className="cardTitle">All Sessions</div>
          <div className="muted">Total Profit: ${centsToDollars(totalProfitCents)}</div>
        </div>

        <div className="table">
          <div className="thead">
            <div className="th">Started</div>
            <div className="th">Title</div>
            <div className="th">Location</div>
            <div className="th">Stakes</div> 
            <div className="th">Time Played</div>
            <div className="th">Profit</div>
            <div className="th" style={{ textAlign: "right" }}>Actions</div>
          </div>

          {sessions.map((s) => {
            const profit = s.profit_cents || 0;
            const profitColor = profit >= 0 ? "#22c55e" : "#ef4444";

            return (
              <div className="trow" key={s.id}>
                <div className="td">{fmtDateTime(s.started_at)}</div>
                <div className="td">{s.title}</div>
                <div className="td">{s.location}</div>
                <div className="td">{s.stakes || "-"}</div> {/* ✅ NEW */}
                <div className="td">{timePlayedLabel(s.started_at, s.ended_at)}</div>
                <div className="td" style={{ fontWeight: 700, color: profitColor }}>
                  ${centsToDollars(profit)}
                </div>
                <div className="td" style={{ textAlign: "right" }}>
                  <button className="btn btnDanger" type="button" onClick={() => deleteSession(s.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {sessions.length === 0 ? <div className="empty">No sessions yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
