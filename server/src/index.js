const express = require("express");
const cors = require("cors");
const { db } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5174;

app.get("/api/health", (req, res) => res.json({ ok: true }));

/* ========== brands ========== */
app.get("/api/brands", (req, res) => {
  db.all(
    `
    SELECT brand_id, name, tar_mg, nicotine_mg, pack_price_yen, sticks_per_pack
    FROM brands
    ORDER BY name ASC;
    `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post("/api/brands", (req, res) => {
  const { name, tar_mg, nicotine_mg, pack_price_yen, sticks_per_pack } = req.body ?? {};
  const n = typeof name === "string" ? name.trim() : "";
  if (!n) return res.status(400).json({ error: "name is required" });

  const price = Number(pack_price_yen);
  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: "pack_price_yen must be positive number" });
  }

  const spp = Number(sticks_per_pack ?? 20);
  if (!Number.isFinite(spp) || spp <= 0) {
    return res.status(400).json({ error: "sticks_per_pack must be positive number" });
  }

  const tar = tar_mg === "" || tar_mg == null ? null : Number(tar_mg);
  const nic = nicotine_mg === "" || nicotine_mg == null ? null : Number(nicotine_mg);
  if (tar != null && !Number.isFinite(tar)) return res.status(400).json({ error: "tar_mg must be number or null" });
  if (nic != null && !Number.isFinite(nic)) return res.status(400).json({ error: "nicotine_mg must be number or null" });

  db.run(
    `
    INSERT INTO brands (name, tar_mg, nicotine_mg, pack_price_yen, sticks_per_pack)
    VALUES (?, ?, ?, ?, ?);
    `,
    [n, tar, nic, Math.round(price), Math.floor(spp)],
    function (err) {
      if (err) {
        if (String(err.message || "").includes("UNIQUE")) {
          return res.status(409).json({ error: "brand name already exists" });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ brand_id: this.lastID });
    }
  );
});

/* ========== logs ========== */
app.post("/api/logs", (req, res) => {
  const { brand_id, sticks, place, note } = req.body ?? {};

  if (!Number.isFinite(Number(brand_id))) {
    return res.status(400).json({ error: "brand_id is required (number)" });
  }

  const s = Number(sticks ?? 1);
  if (!Number.isFinite(s) || s <= 0) {
    return res.status(400).json({ error: "sticks must be positive number" });
  }

  const at = new Date().toISOString();

  db.run(
    `
    INSERT INTO smoking_logs (smoked_at, brand_id, sticks, place, note)
    VALUES (?, ?, ?, ?, ?);
    `,
    [at, Number(brand_id), Math.floor(s), place ?? null, note ?? null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ log_id: this.lastID });
    }
  );
});

app.get("/api/logs", (req, res) => {
  db.all(
    `
    SELECT
      l.log_id,
      l.smoked_at,
      l.sticks,
      l.place,
      l.note,
      b.name AS brand_name,
      b.pack_price_yen,
      b.sticks_per_pack,
      ROUND(l.sticks * (b.pack_price_yen * 1.0 / b.sticks_per_pack), 2) AS cost_yen
    FROM smoking_logs l
    JOIN brands b ON b.brand_id = l.brand_id
    ORDER BY l.smoked_at DESC
    LIMIT 200;
    `,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/* ========== stats: summary ========== */
app.get("/api/stats/summary", (req, res) => {
  const sql = `
    WITH daily AS (
      SELECT date(l.smoked_at) AS d, COALESCE(SUM(l.sticks), 0) AS sticks_sum
      FROM smoking_logs l
      GROUP BY date(l.smoked_at)
    ),
    cost AS (
      SELECT COALESCE(SUM(l.sticks * (b.pack_price_yen * 1.0 / b.sticks_per_pack)), 0) AS total_yen
      FROM smoking_logs l
      JOIN brands b ON b.brand_id = l.brand_id
    )
    SELECT
      (SELECT COALESCE(SUM(sticks_sum), 0) FROM daily) AS total_sticks,
      (SELECT COALESCE(AVG(sticks_sum), 0) FROM daily) AS avg_sticks_per_day,
      (SELECT COALESCE(total_yen, 0) FROM cost) AS total_yen;
  `;

  db.get(sql, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

/* ========== stats: daily (last N days) ========== */
app.get("/api/stats/daily", (req, res) => {
  const days = Number(req.query.days ?? 7);
  const n = Number.isFinite(days) && days > 0 && days <= 60 ? Math.floor(days) : 7;

  const sql = `
    WITH dates AS (
      SELECT date('now', '-' || (? - 1) || ' day') AS d
      UNION ALL
      SELECT date(d, '+1 day') FROM dates WHERE d < date('now')
    ),
    sums AS (
      SELECT date(smoked_at) AS d, COALESCE(SUM(sticks), 0) AS sticks_sum
      FROM smoking_logs
      WHERE date(smoked_at) >= date('now', '-' || (? - 1) || ' day')
      GROUP BY date(smoked_at)
    )
    SELECT dates.d AS date, COALESCE(sums.sticks_sum, 0) AS sticks
    FROM dates
    LEFT JOIN sums ON sums.d = dates.d
    ORDER BY dates.d ASC;
  `;

  db.all(sql, [n, n], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ days: n, series: rows });
  });
});

/* ========== stats: weekly compare ========== */
app.get("/api/stats/weekly-compare", (req, res) => {
  const sql = `
    WITH this_week AS (
      SELECT COALESCE(SUM(sticks), 0) AS s
      FROM smoking_logs
      WHERE date(smoked_at) >= date('now', '-6 day')
    ),
    last_week AS (
      SELECT COALESCE(SUM(sticks), 0) AS s
      FROM smoking_logs
      WHERE date(smoked_at) >= date('now', '-13 day')
        AND date(smoked_at) <= date('now', '-7 day')
    )
    SELECT
      (SELECT s FROM this_week) AS this_week,
      (SELECT s FROM last_week) AS last_week,
      (SELECT s FROM this_week) - (SELECT s FROM last_week) AS diff;
  `;

  db.get(sql, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));
