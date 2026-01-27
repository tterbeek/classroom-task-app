ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS samenwerken boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS zelf_nakijken boolean NOT NULL DEFAULT false;
