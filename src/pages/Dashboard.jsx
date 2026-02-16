import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase"; // <-- adjust path if needed

function centsToDollars(cents) {
  return (Number(cents || 0) / 100).toFixed(2);
}

function fmtDate(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleString();
}

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [hands, setHands] = useState([]);
  const [err, setErr] = useState("");

  async function getUserOrThrow() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error("Not authenticated");
    return user;
  }

  async function loadDashboard() {
    const user = await getUserOrThrow();

    // Recent sessions
    const { data: sessionsData, error: sessionsErr } = await supabase
      .from("sessions")
      .select("id, title, location, started_at, ended_at, profit_cents")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10);

    if (sessionsErr) throw sessionsErr;
    setSessions(sessionsData || []);

    // Latest hands from the users
    const { data: handsData, error: handsErr } = await supabase
      .from("hands")
      .select("id, played_at, game, stakes, result, profit_cents")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false }); 

    if (handsErr) throw handsErr;
    setHands(handsData || []);
  }

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        await loadDashboard();
      } catch (e) {
        setErr(e?.message || "Failed to load dashboard");
      }
    })();
  }, []);

  
  const recentProfitCents = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.profit_cents || 0), 0);
  }, [sessions]);

  return (
    <div className="page">
      <h1 className="pageTitle">Dashboard</h1>

      {err ? <div className="errorBanner">{err}</div> : null}

      <div className="grid2">
        
        <div className="card">
          <div className="cardTitle">Recent Profit</div>
          <div className="bigNumber">${centsToDollars(recentProfitCents)}</div>
          <div className="muted">Last {sessions.length} sessions loaded</div>
        </div>

       
        <div className="card">
          <div className="cardTitle">Recent Sessions</div>
          <div className="muted">{sessions.length} loaded</div>

         
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {sessions.slice(0, 3).map((s) => (
              <div key={s.id} className="miniRow">
                <div style={{ fontWeight: 600 }}>{s.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {s.location} • {fmtDate(s.started_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="card" style={{ marginTop: 14 }}>
        <div className="cardTitle">Latest Hands</div>

        <div className="table">
          <div className="thead">
            <div className="th">Date</div>
            <div className="th">Game</div>
            <div className="th">Stakes</div>
            <div className="th">Result</div>
            <div className="th">Profit</div>
          </div>

          {hands.map((h) => {
            const profit = h.profit_cents || 0;
            const profitColor = profit >= 0 ? "#22c55e" : "#ef4444";

            return (
              <div className="trow" key={h.id}>
                <div className="td">{fmtDate(h.played_at)}</div>
                <div className="td">{h.game}</div>
                <div className="td">{h.stakes}</div>
                <div className="td">{h.result}</div>
                <div className="td" style={{ fontWeight: 700, color: profitColor }}>
                  ${centsToDollars(profit)}
                </div>
              </div>
            );
          })}

          {hands.length === 0 ? (
            <div className="empty">No hands yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
