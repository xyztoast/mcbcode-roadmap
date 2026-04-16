
-- Create tabs table
CREATE TABLE public.tabs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tabs" ON public.tabs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert tabs" ON public.tabs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tabs" ON public.tabs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete tabs" ON public.tabs FOR DELETE USING (true);

-- Create content blocks table
CREATE TABLE public.tab_content_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tab_id UUID NOT NULL REFERENCES public.tabs(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tab_content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read content blocks" ON public.tab_content_blocks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert content blocks" ON public.tab_content_blocks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update content blocks" ON public.tab_content_blocks FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete content blocks" ON public.tab_content_blocks FOR DELETE USING (true);

-- Insert default "Commands" tab
INSERT INTO public.tabs (title, sort_order, is_default) VALUES ('Commands', 0, true);
