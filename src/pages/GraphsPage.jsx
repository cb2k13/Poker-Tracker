import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function centsToDollars(cents) {
  return Number(cents || 0) / 100;
}

function fmtMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function fmtDateShort(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleDateString();
}

function parseBigBlind(stakes) {
  if (!stakes) return null;

  const match = String(stakes).trim().match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const bb = Number(match[2]);
  return Number.isFinite(bb) && bb > 0 ? bb : null;
}

function getHoursPlayed(startedAt, endedAt) {
  if (!startedAt || !endedAt) return 0;

  const ms = new Date(endedAt) - new Date(startedAt);
  const hours = ms / 1000 / 60 / 60;

  return Number.isFinite(hours) && hours > 0 ? hours : 0;
}

export default function GraphsPage() {
  const [sessions, setSessions] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function getUserOrThrow() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error("Not authenticated");
    return user;
  }

  async function loadStats() {
    const user = await getUserOrThrow();

    // SESSIONS ONLY
    const { data, error } = await supabase
      .from("sessions")
      .select("id, title, location, stakes, started_at, ended_at, profit_cents")
      .eq("user_id", user.id)
      .order("started_at", { ascending: true });

    if (error) throw error;
    setSessions(data || []);
  }

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        await loadStats();
      } catch (e) {
        setErr(e?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const chartData = useMemo(() => {
    let runningProfit = 0;

    return sessions.map((s) => {
      const sessionProfit = centsToDollars(s.profit_cents);
      runningProfit += sessionProfit;

      return {
        id: s.id,
        date: fmtDateShort(s.started_at),
        title: s.title || "Session",
        location: s.location || "-",
        sessionProfit: Number(sessionProfit.toFixed(2)),
        cumulativeProfit: Number(runningProfit.toFixed(2)),
      };
    });
  }, [sessions]);

  const stats = useMemo(() => {
    if (!sessions.length) {
      return {
        bbPerHour: 0,
        winRatePercent: 0,
        dollarsPerHour: 0,
        mostProfitableCasino: "-",
      };
    }

    let totalProfit = 0;
    let totalHours = 0;
    let totalBigBlindsWon = 0;
    let winningSessions = 0;
    const casinoTotals = new Map();

    for (const s of sessions) {
      const profit = centsToDollars(s.profit_cents);
      totalProfit += profit;

      if (profit > 0) {
        winningSessions += 1;
      }

      const hours = getHoursPlayed(s.started_at, s.ended_at);
      totalHours += hours;

      const bb = parseBigBlind(s.stakes);
      if (bb) {
        totalBigBlindsWon += profit / bb;
      }

      const casino = (s.location || "Unknown").trim();
      casinoTotals.set(casino, (casinoTotals.get(casino) || 0) + profit);
    }

    let mostProfitableCasino = "-";
    let bestCasinoProfit = -Infinity;

    for (const [casino, profit] of casinoTotals.entries()) {
      if (profit > bestCasinoProfit) {
        bestCasinoProfit = profit;
        mostProfitableCasino = casino;
      }
    }

    const dollarsPerHour = totalHours > 0 ? totalProfit / totalHours : 0;
    const bbPerHour = totalHours > 0 ? totalBigBlindsWon / totalHours : 0;
    const winRatePercent = sessions.length > 0 ? (winningSessions / sessions.length) * 100 : 0;

    return {
      bbPerHour,
      winRatePercent,
      dollarsPerHour,
      mostProfitableCasino,
    };
  }, [sessions]);

  return (
    <div className="page">
      <h1 className="pageTitle">Stats</h1>

      {err ? <div className="errorBanner">{err}</div> : null}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cardTitle">Profit Over Time</div>

        {loading ? (
          <div className="empty">Loading chart...</div>
        ) : chartData.length === 0 ? (
          <div className="empty">No sessions yet.</div>
        ) : (
          <div style={{ width: "100%", height: 360 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#dbeafe" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "cumulativeProfit") return [fmtMoney(value), "Cumulative Profit"];
                    if (name === "sessionProfit") return [fmtMoney(value), "Session Profit"];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const row = payload?.[0]?.payload;
                    return row ? `${label} • ${row.title} • ${row.location}` : label;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeProfit"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardTitle">BB/hr</div>
          <div className="bigNumber">{stats.bbPerHour.toFixed(2)}</div>
          <div className="muted">Based only on session stakes, profit, and time played</div>
        </div>

        <div className="card">
          <div className="cardTitle">Win Rate %</div>
          <div className="bigNumber">{stats.winRatePercent.toFixed(1)}%</div>
          <div className="muted">Winning sessions divided by total sessions</div>
        </div>

        <div className="card">
          <div className="cardTitle">$ per Hour</div>
          <div className="bigNumber">{fmtMoney(stats.dollarsPerHour)}</div>
          <div className="muted">Based only on session profit and session duration</div>
        </div>

        <div className="card">
          <div className="cardTitle">Most Profitable Casino</div>
          <div className="bigNumber" style={{ fontSize: "1.8rem" }}>
            {stats.mostProfitableCasino}
          </div>
          <div className="muted">Highest total profit by session location</div>
        </div>
      </div>
    </div>
  );
}
