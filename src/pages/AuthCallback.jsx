import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;

    const finishAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        nav("/dashboard", { replace: true });
      } else {
        nav("/auth", { replace: true });
      }
    };

    finishAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session) {
        nav("/dashboard", { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [nav]);

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 520 }}>
        <h2>Signing you in…</h2>
        <p>Finishing Google login.</p>
      </div>
    </div>
  );
}

