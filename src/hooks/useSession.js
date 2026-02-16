import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();

      // If Supabase storage is corrupted/stale, wipe it by signing out
      if (error && String(error.message || "").toLowerCase().includes("invalid refresh token")) {
        await supabase.auth.signOut();
        if (mounted) setSession(null);
        setLoading(false);
        return;
      }

      if (mounted) setSession(data.session ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  return { session, loading };
}
