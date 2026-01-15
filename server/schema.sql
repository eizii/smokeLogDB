PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS brands (
  brand_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  tar_mg REAL,
  nicotine_mg REAL,

  -- 追加：価格計算用
  pack_price_yen INTEGER NOT NULL,     -- 1箱の価格
  sticks_per_pack INTEGER NOT NULL     -- 1箱あたり本数（通常20）
);

CREATE TABLE IF NOT EXISTS smoking_logs (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  smoked_at TEXT NOT NULL,
  brand_id INTEGER NOT NULL,

  -- 追加：その時吸った本数
  sticks INTEGER NOT NULL DEFAULT 1,

  place TEXT,
  note TEXT,

  FOREIGN KEY (brand_id) REFERENCES brands(brand_id)
);

CREATE INDEX IF NOT EXISTS idx_logs_smoked_at ON smoking_logs(smoked_at);
CREATE INDEX IF NOT EXISTS idx_logs_brand_id ON smoking_logs(brand_id);
