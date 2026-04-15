
CREATE TABLE public.command_update_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  command_name text NOT NULL,
  new_status text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.command_update_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read update log" ON public.command_update_log FOR SELECT USING (true);
CREATE POLICY "Anyone can insert update log" ON public.command_update_log FOR INSERT WITH CHECK (true);
