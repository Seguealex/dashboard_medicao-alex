-- Drop the table if it already exists
DROP TABLE IF EXISTS public.ordens_servico;

-- Create the new table
CREATE TABLE public.ordens_servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_servico TEXT UNIQUE NOT NULL,
    descricao TEXT,
    local TEXT,
    ativo TEXT,
    status_codigo TEXT,
    tipo_servico TEXT,
    inicio_previsto DATE,
    termino_efetivo DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Note: The UNIQUE constraint on ordem_servico allows us to use
-- the ON CONFLICT clause during upsert operations from the frontend.
