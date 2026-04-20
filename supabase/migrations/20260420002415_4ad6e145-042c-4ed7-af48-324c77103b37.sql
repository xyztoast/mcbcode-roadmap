CREATE TABLE public.activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL,
  detail text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read activity log" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Anyone can insert activity log" ON public.activity_log FOR INSERT WITH CHECK (true);

CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Backfill existing command updates so the chart includes history
INSERT INTO public.activity_log (source, detail, created_at)
SELECT 'command', command_name || ':' || new_status, created_at
FROM public.command_update_log;