import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase().replace(" ", "");
  return `${date} at ${time}`;
};

const LastUpdated = () => {
  const [latest, setLatest] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      const [a, c] = await Promise.all([
        supabase.from("activity_log").select("created_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("command_update_log").select("created_at").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      const times = [a.data?.created_at, c.data?.created_at].filter(Boolean) as string[];
      if (times.length === 0) return;
      const newest = times.sort().reverse()[0];
      setLatest(newest);
    };
    fetchLatest();
  }, []);

  if (!latest) return null;
  return (
    <p className="text-xs text-muted-foreground text-center mt-8">
      Last Updated {formatDate(latest)}
    </p>
  );
};

export default LastUpdated;
