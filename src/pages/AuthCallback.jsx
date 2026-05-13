import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;

    const finishAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session) {
          nav("/dashboard", { replace: true });
          return;
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!mounted) return;

          if (session) {
            nav("/dashboard", { replace: true });
          }
        });

        setTimeout(() => {
          if (mounted) {
            subscription.unsubscribe();
            nav("/auth", { replace: true });
          }
        }, 3000);
      } catch (error) {
        if (mounted) {
          nav("/auth", { replace: true });
        }
      }
    };

    finishAuth();

    return () => {
      mounted = false;
    };
  }, [nav]);

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 520 }}>
        <h2>Signing you in…</h2>
        <p>Finishing login.</p>
      </div>
    </div>
  );
}
