ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo'));
