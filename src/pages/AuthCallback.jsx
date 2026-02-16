// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      // Supabase confirmation links land here; session is established automatically.
      await supabase.auth.getSession();
      nav("/", { replace: true }); 
    })();
  }, [nav]);

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 520 }}>
        <h2>Confirming your email…</h2>
        <p>Finishing sign-in.</p>
      </div>
    </div>
  );
}
