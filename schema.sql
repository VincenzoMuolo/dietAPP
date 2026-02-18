-- Schema Cloudflare D1 per DietAPP
-- Ricette + Pesate

-- ============================================
-- TABELLA RICETTE (con foto base64)
-- ============================================
CREATE TABLE IF NOT EXISTS ricette (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    porzione_g INTEGER,
    foto_base64 TEXT,
    note TEXT,
    user_id TEXT DEFAULT 'default_user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELLA INGREDIENTI
-- ============================================
CREATE TABLE IF NOT EXISTS ingredienti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ricetta_id INTEGER NOT NULL,
    ingrediente TEXT NOT NULL,
    quantita_g REAL NOT NULL,
    ordine INTEGER DEFAULT 0,
    FOREIGN KEY (ricetta_id) REFERENCES ricette(id) ON DELETE CASCADE
);

-- ============================================
-- TABELLA PESATE
-- ============================================
CREATE TABLE IF NOT EXISTS pesate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data DATE NOT NULL UNIQUE,
    peso REAL NOT NULL,
    note TEXT,
    user_id TEXT DEFAULT 'default_user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDICI PER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ricette_categoria ON ricette(categoria);
CREATE INDEX IF NOT EXISTS idx_ricette_user ON ricette(user_id);
CREATE INDEX IF NOT EXISTS idx_ricette_nome ON ricette(nome);
CREATE INDEX IF NOT EXISTS idx_ingredienti_ricetta ON ingredienti(ricetta_id);
CREATE INDEX IF NOT EXISTS idx_pesate_data ON pesate(data DESC);
CREATE INDEX IF NOT EXISTS idx_pesate_user ON pesate(user_id);