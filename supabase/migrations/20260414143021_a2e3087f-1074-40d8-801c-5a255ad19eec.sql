
ALTER TABLE public.command_status 
ADD COLUMN status text NOT NULL DEFAULT 'unchecked';

-- Migrate existing data: checked=true becomes 'done'
UPDATE public.command_status SET status = 'done' WHERE checked = true;
UPDATE public.command_status SET status = 'unchecked' WHERE checked = false;
