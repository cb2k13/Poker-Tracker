import React from "react";
import { useNavigate } from "react-router-dom";
import dashboardImg from "../assets/dashboard.png";
import statsImg from "../assets/stats.png";

export default function LandingPage() {
  const nav = useNavigate();

  const imageBoxStyle = {
    height: "560px",
    borderRadius: "36px",
    background: "linear-gradient(135deg, #5b5af7 0%, #1f2937 100%)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
  };

 const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  borderRadius: "24px",
  display: "block",
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        color: "#111827",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "32px", fontWeight: 800 }}>Poker Tracker</div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button
            onClick={() => nav("/auth")}
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "12px 18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign up
          </button>

          <button
            onClick={() => nav("/auth")}
            style={{
              background: "transparent",
              color: "#111827",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Log in
          </button>
        </div>
      </header>

      <main style={{ padding: "40px 24px" }}>
        <section
          style={{
            maxWidth: "1400px",
            margin: "0 auto 28px",
            background: "#f8f8fc",
            border: "1px solid #e5e7eb",
            borderRadius: "28px",
            padding: "80px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1px solid #c7d2fe",
              color: "#4f46e5",
              fontWeight: 700,
              marginBottom: "28px",
            }}
          >
            What’s new
          </div>

          <h1
            style={{
              fontSize: "88px",
              lineHeight: 1,
              margin: "0 0 24px",
              fontWeight: 900,
              letterSpacing: "-0.05em",
            }}
          >
            Track Sessions.{" "}
            <span style={{ color: "#4f46e5" }}>Become a Crusher.</span>
          </h1>

          <p
            style={{
              maxWidth: "900px",
              margin: "0 auto 32px",
              fontSize: "28px",
              color: "#4b5563",
              lineHeight: 1.5,
            }}
          >
            The performance tracking tool built for live players who want to
            track their sessions and take their game to the next level.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <button
              onClick={() => nav("/auth")}
              style={{
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "16px 24px",
                fontWeight: 800,
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Get started
            </button>

            <button
              onClick={() => nav("/auth")}
              style={{
                background: "white",
                color: "#111827",
                border: "1px solid #d1d5db",
                borderRadius: "12px",
                padding: "16px 24px",
                fontWeight: 800,
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Log in
            </button>
          </div>
        </section>

        <section
          style={{
            maxWidth: "1400px",
            margin: "0 auto 28px",
            background: "#f8f8fc",
            border: "1px solid #e5e7eb",
            borderRadius: "28px",
            padding: "60px 40px",
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                padding: "10px 18px",
                borderRadius: "999px",
                border: "1px solid #c7d2fe",
                color: "#4f46e5",
                fontWeight: 700,
                marginBottom: "24px",
              }}
            >
              Rise to the top of the game
            </div>

            <h2 style={{ fontSize: "64px", margin: "0 0 18px", fontWeight: 900 }}>
              Session Tracking
            </h2>

            <p style={{ fontSize: "24px", color: "#4b5563", lineHeight: 1.5 }}>
              Log your sessions instantly.
            </p>

            <div style={{ marginTop: "28px", display: "grid", gap: "18px" }}>
              <div style={{ fontSize: "22px" }}>
                <strong>Quick Timing:</strong> On the table or at home, log sessions.
              </div>
              <div style={{ fontSize: "22px" }}>
                <strong>Log Hands:</strong> Add key hands from each session for deeper insights.
              </div>
            </div>
          </div>

          <div style={imageBoxStyle}>
            <img
              src={dashboardImg}
              alt="Dashboard preview"
              style={imageStyle}
            />
          </div>
        </section>

        <section
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            background: "#f8f8fc",
            border: "1px solid #e5e7eb",
            borderRadius: "28px",
            padding: "60px 40px",
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: "40px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              ...imageBoxStyle,
              background: "linear-gradient(135deg, #1f2937 0%, #5b5af7 100%)",
            }}
          >
            <img
              src={statsImg}
              alt="Stats preview"
              style={imageStyle}
            />
          </div>

          <div>
            <div
              style={{
                display: "inline-block",
                padding: "10px 18px",
                borderRadius: "999px",
                border: "1px solid #c7d2fe",
                color: "#4f46e5",
                fontWeight: 700,
                marginBottom: "24px",
              }}
            >
              Go in depth with your game
            </div>

            <h2 style={{ fontSize: "64px", margin: "0 0 18px", fontWeight: 900 }}>
              Advanced Stat Tracking
            </h2>

            <p style={{ fontSize: "24px", color: "#4b5563", lineHeight: 1.5 }}>
              Analyze your performance across games, stakes, locations, and more.
            </p>

            <div style={{ marginTop: "28px", display: "grid", gap: "18px" }}>
              <div style={{ fontSize: "22px" }}>
                <strong>Winrate:</strong> Track your winrate and trends.
              </div>
              <div style={{ fontSize: "22px" }}>
                <strong>Personal Bests:</strong> Spot your most profitable casinos, stakes, and games.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
