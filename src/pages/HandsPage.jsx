import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase"; // adjust path if needed

function fmtDateTime(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleString();
}

function fmtDollarsFromCents(cents) {
  const n = Number(cents || 0);
  const dollars = Math.round(n / 100);
  return dollars.toString();
}

export default function HandsPage() {
  const [err, setErr] = useState("");
  const [hands, setHands] = useState([]);
  const [sessions, setSessions] = useState([]);

  // form state
  const [sessionId, setSessionId] = useState("");
  const [game, setGame] = useState("NLH");
  const [stakes, setStakes] = useState("1/2");
  const [position, setPosition] = useState("BTN");
  const [result, setResult] = useState("win");
  const [holeCards, setHoleCards] = useState("");

  // user inputs
  const [profitDollars, setProfitDollars] = useState("0");
  const [notes, setNotes] = useState("");

  async function getUserOrThrow() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error("Not authenticated");
    return user;
  }

  async function loadPage() {
    const user = await getUserOrThrow();

    const { data: sess, error: sessErr } = await supabase
      .from("sessions")
      .select("id, title, started_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    if (sessErr) throw sessErr;
    setSessions(sess || []);

    const { data: hs, error: handsErr } = await supabase
      .from("hands")
      .select("id, played_at, game, stakes, position, result, profit_cents, notes, session_id, hole_cards")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false });

    if (handsErr) throw handsErr;
    setHands(hs || []);
  }

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        await loadPage();
      } catch (e) {
        setErr(e?.message || "Failed to load hands");
      }
    })();
  }, []);

  async function saveHand(e) {
    e.preventDefault();
    try {
      setErr("");
      const user = await getUserOrThrow();

      const profitNum = Number(profitDollars);
      if (!Number.isFinite(profitNum)) {
        throw new Error("Profit must be a valid dollar amount (e.g. -25, 0, 150).");
      }

      const cleanedHoleCards = holeCards.trim();

      if (
        cleanedHoleCards &&
        !/^[2-9TJQKA][shdc][2-9TJQKA][shdc]$/i.test(cleanedHoleCards)
      ) {
        throw new Error("Hole Cards must look like AsJh, AhKh, 7c7d, etc.");
      }

      const profitCents = Math.round(profitNum * 100);

      const payload = {
        user_id: user.id,
        session_id: sessionId ? Number(sessionId) : null,
        played_at: new Date().toISOString(),
        game,
        stakes,
        position,
        result,
        hole_cards: cleanedHoleCards ? cleanedHoleCards.toUpperCase() : null,
        profit_cents: profitCents,
        notes: notes.trim() || null,
      };

      const { error } = await supabase.from("hands").insert([payload]);
      if (error) throw error;

      setHoleCards("");
      setNotes("");
      setProfitDollars("0");

      await loadPage();
    } catch (e) {
      setErr(e?.message || "Failed to save hand");
    }
  }

  async function deleteHand(id) {
    try {
      setErr("");
      const { error } = await supabase.from("hands").delete().eq("id", id);
      if (error) throw error;
      await loadPage();
    } catch (e) {
      setErr(e?.message || "Failed to delete hand");
    }
  }

  const totalProfitCents = useMemo(
    () => hands.reduce((acc, h) => acc + Number(h.profit_cents || 0), 0),
    [hands]
  );

  return (
    <div className="page">
      <h1 className="pageTitle">Hands</h1>

      {err ? <div className="errorBanner">{err}</div> : null}

      <div className="card">
        <div className="cardTitle">Add Hand</div>

        <form onSubmit={saveHand}>
          <div className="field">
            <div className="label">Session (optional)</div>
            <select
              className="input"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            >
              <option value="">No session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title || "Session"} ({fmtDateTime(s.started_at)})
                </option>
              ))}
            </select>
          </div>

          <div className="row" style={{ gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <div className="label">Game</div>
              <input className="input" value={game} onChange={(e) => setGame(e.target.value)} />
            </div>

            <div className="field" style={{ flex: 1 }}>
              <div className="label">Stakes</div>
              <input
                className="input"
                value={stakes}
                onChange={(e) => setStakes(e.target.value)}
              />
            </div>

            <div className="field" style={{ flex: 1 }}>
              <div className="label">Position</div>
              <input
                className="input"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
          </div>

          <div className="row" style={{ gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <div className="label">Result</div>
              <select className="input" value={result} onChange={(e) => setResult(e.target.value)}>
                <option value="win">win</option>
                <option value="loss">loss</option>
                <option value="chop">chop</option>
              </select>
            </div>

            <div className="field" style={{ flex: 1 }}>
              <div className="label">Hole Cards</div>
              <input
                className="input"
                type="text"
                placeholder="AsJh"
                value={holeCards}
                onChange={(e) => setHoleCards(e.target.value)}
              />
              <div className="muted" style={{ marginTop: 6 }}>
                Example: AsJh, AhKh, 7c7d
              </div>
            </div>

            <div className="field" style={{ flex: 1 }}>
              <div className="label">Profit ($)</div>
              <input
                className="input"
                type="number"
                step="1"
                value={profitDollars}
                onChange={(e) => setProfitDollars(e.target.value)}
              />
              <div className="muted" style={{ marginTop: 6 }}>
                Stored as cents internally.
              </div>
            </div>
          </div>

          <div className="field">
            <div className="label">Notes</div>
            <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <button className="btn" type="submit">
            Save Hand
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="cardTitleRow">
          <div className="cardTitle">All Hands</div>
          <div className="muted">Total Profit: ${fmtDollarsFromCents(totalProfitCents)}</div>
        </div>

        <div className="table">
          <div className="thead">
            <div className="th">Date</div>
            <div className="th">Hand</div>
            <div className="th">Game</div>
            <div className="th">Stakes</div>
            <div className="th">Position</div>
            <div className="th">Result</div>
            <div className="th">Profit</div>
            <div className="th" style={{ textAlign: "right" }}>
              Actions
            </div>
          </div>

          {hands.map((h) => {
            const cents = Number(h.profit_cents || 0);
            const dollars = Math.round(cents / 100);
            const profitColor = dollars >= 0 ? "#22c55e" : "#ef4444";

            return (
              <div className="trow" key={h.id}>
                <div className="td">{fmtDateTime(h.played_at)}</div>
                <div className="td">{h.hole_cards || "-"}</div>
                <div className="td">{h.game}</div>
                <div className="td">{h.stakes}</div>
                <div className="td">{h.position}</div>
                <div className="td">{h.result}</div>
                <div className="td" style={{ fontWeight: 700, color: profitColor }}>
                  ${dollars}
                </div>
                <div className="td" style={{ textAlign: "right" }}>
                  <button className="btn btnDanger" onClick={() => deleteHand(h.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {hands.length === 0 ? <div className="empty">No hands yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
