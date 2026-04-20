import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis } from "recharts";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const chartConfig = {
  edits: {
    label: "Edits",
    color: "hsl(var(--primary))",
  },
};

interface LogRow {
  created_at: string;
}

const ProgressGraph = () => {
  const [data, setData] = useState<{ hour: string; edits: number }[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const [activityRes, commandRes] = await Promise.all([
        supabase.from("activity_log").select("created_at").order("created_at", { ascending: true }),
        supabase.from("command_update_log").select("created_at").order("created_at", { ascending: true }),
      ]);

      const all: LogRow[] = [];
      // Use activity_log (which has backfilled command updates) only, to avoid double-counting
      if (activityRes.data && activityRes.data.length > 0) {
        all.push(...activityRes.data);
      } else if (commandRes.data) {
        all.push(...commandRes.data);
      }

      const grouped: Record<string, { sortKey: number; count: number }> = {};
      all.forEach(d => {
        const dt = new Date(d.created_at);
        // Bucket by hour (local time)
        const bucket = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours());
        const sortKey = bucket.getTime();
        const label = bucket.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          hour12: true,
        });
        if (!grouped[label]) grouped[label] = { sortKey, count: 0 };
        grouped[label].count += 1;
      });

      const arr = Object.entries(grouped)
        .map(([hour, v]) => ({ hour, edits: v.count, sortKey: v.sortKey }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(({ hour, edits }) => ({ hour, edits }));
      setData(arr);
    };

    if (open) fetchAll();
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="px-3 py-1.5 text-xs bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors font-mc"
          title="View edit activity"
        >
          View activity graph
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-3" align="start">
        <p className="text-xs text-muted-foreground mb-2">Edits per hour (all tabs)</p>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-40 w-full">
            <LineChart data={data}>
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={24} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="edits" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-6">No edits yet</p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ProgressGraph;
