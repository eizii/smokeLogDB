import React, { useMemo, useState } from "react";

function toNumOrNull(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function BrandManager({ onAdded }) {
  const [open, setOpen] = useState(false);

  // 単発追加フォーム
  const [name, setName] = useState("");
  const [tar, setTar] = useState("");
  const [nic, setNic] = useState("");
  const [price, setPrice] = useState(600);
  const [spp, setSpp] = useState(20);

  // 一括追加（コピペ）
  const [bulk, setBulk] = useState("");

  const canAdd = useMemo(() => {
    return name.trim().length > 0 && Number(price) > 0 && Number(spp) > 0;
  }, [name, price, spp]);

  async function addOne() {
    if (!canAdd) return;

    const payload = {
      name: name.trim(),
      tar_mg: toNumOrNull(tar),
      nicotine_mg: toNumOrNull(nic),
      pack_price_yen: Number(price),
      sticks_per_pack: Number(spp),
    };

    const r = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j.error ?? "failed to add brand");
      return;
    }

    setName("");
    setTar("");
    setNic("");
    setPrice(600);
    setSpp(20);

    await onAdded();
    alert("追加しました");
  }

  // 一括：1行 = name,tar,nic,price,sticksPerPack
  // tar/nic は空でもOK。例：セブンスター,, ,600,20 でもOK（空はnull）
  async function addBulk() {
    const lines = bulk
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (lines.length === 0) return;

    let ok = 0;
    let ng = 0;

    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      const [n, t, ni, p, sp] = parts;

      if (!n) {
        ng += 1;
        continue;
      }

      const payload = {
        name: n,
        tar_mg: toNumOrNull(t),
        nicotine_mg: toNumOrNull(ni),
        pack_price_yen: Number(p || 600),
        sticks_per_pack: Number(sp || 20),
      };

      const r = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (r.ok) ok += 1;
      else ng += 1;
    }

    await onAdded();
    alert(`一括追加：成功 ${ok} / 失敗 ${ng}\n（同名重複は失敗になります）`);
  }

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 800 }}>銘柄管理</div>
        <button
          type="button"
          className="primaryButton"
          style={{ width: 140 }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "閉じる" : "追加する"}
        </button>
      </div>

      {!open ? (
        <div className="hint" style={{ marginTop: 10 }}>
          銘柄をアプリ上で追加できます（ログは残る）。一括追加にも対応。
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {/* 単発追加 */}
          <div className="card" style={{ boxShadow: "none" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>単発追加</div>

            <div className="formGrid" style={{ gridTemplateColumns: "1fr 120px 120px 130px 120px 170px" }}>
              <div className="field">
                <label className="label">銘柄名</label>
                <input className="control" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="field">
                <label className="label">タール</label>
                <input className="control" value={tar} onChange={(e) => setTar(e.target.value)} placeholder="例 8" />
              </div>

              <div className="field">
                <label className="label">ニコチン</label>
                <input className="control" value={nic} onChange={(e) => setNic(e.target.value)} placeholder="例 0.7" />
              </div>

              <div className="field">
                <label className="label">価格(円/箱)</label>
                <input className="control" type="number" min="1" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>

              <div className="field">
                <label className="label">本数(本/箱)</label>
                <input className="control" type="number" min="1" value={spp} onChange={(e) => setSpp(Number(e.target.value))} />
              </div>

              <button type="button" className="primaryButton" onClick={addOne} disabled={!canAdd}>
                追加
              </button>
            </div>

            <div className="hint" style={{ marginTop: 10 }}>
              タール/ニコチンは空でもOK。金額計算は (価格 ÷ 本数) × sticks。
            </div>
          </div>

          {/* 一括追加 */}
          <div className="card" style={{ boxShadow: "none" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>一括追加（コピペ）</div>

            <div className="hint" style={{ marginBottom: 8 }}>
              1行 = <b>name,tar,nic,price,sticksPerPack</b>（tar/nic は空可）<br />
              例：<br />
              マールボロ,12,1.0,600,20<br />
              ラッキー・ストライク,10,0.8,600,20
            </div>

            <textarea
              className="control"
              style={{ height: 160, paddingTop: 10 }}
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder="ここに複数行を貼り付け"
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button type="button" className="primaryButton" onClick={addBulk}>
                一括追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
