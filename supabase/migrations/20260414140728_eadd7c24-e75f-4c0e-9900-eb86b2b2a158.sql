CREATE TABLE public.command_status (
  command_name TEXT PRIMARY KEY,
  checked BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.command_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read command status" ON public.command_status FOR SELECT USING (true);
CREATE POLICY "Anyone can insert command status" ON public.command_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update command status" ON public.command_status FOR UPDATE USING (true);