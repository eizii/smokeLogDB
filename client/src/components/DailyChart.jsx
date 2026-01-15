import React, { useMemo } from "react";

export default function DailyChart({ data }) {
  const w = 940;
  const h = 220;
  const pad = 36;

  const maxV = useMemo(() => {
    const m = Math.max(0, ...(data ?? []).map((d) => Number(d.sticks ?? 0)));
    return m === 0 ? 1 : m;
  }, [data]);

  const bars = useMemo(() => {
    const n = (data ?? []).length;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;
    const bw = n > 0 ? innerW / n : innerW;

    return (data ?? []).map((d, i) => {
      const v = Number(d.sticks ?? 0);
      const bh = (v / maxV) * innerH;
      const x = pad + i * bw + 4;
      const y = pad + (innerH - bh);
      return { ...d, x, y, bw: Math.max(2, bw - 8), bh };
    });
  }, [data, maxV]);

  // ダークUI向け（固定色）
  const c = {
    border: "rgba(255,255,255,0.12)",
    title: "rgba(255,255,255,0.92)",
    axis: "rgba(255,255,255,0.35)",
    grid: "rgba(255,255,255,0.10)",
    text: "rgba(255,255,255,0.80)",
    textWeak: "rgba(255,255,255,0.65)",
    bar: "rgba(96,165,250,0.85)", // 明るい青
    barHover: "rgba(147,197,253,0.95)",
  };

  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, color: c.title }}>
        日別本数（直近7日）
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="daily chart"
        style={{ display: "block" }}
      >
        {/* 背景（透明のまま。cardの背景を活かす） */}
        <rect x="0" y="0" width={w} height={h} fill="transparent" />

        {/* 横グリッド（見やすさUP） */}
        {Array.from({ length: 4 }).map((_, i) => {
          const y = pad + ((h - pad * 2) * i) / 3;
          return (
            <line
              key={i}
              x1={pad}
              y1={y}
              x2={w - pad}
              y2={y}
              stroke={c.grid}
              strokeWidth={1}
            />
          );
        })}

        {/* 軸 */}
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke={c.axis} strokeWidth={1.5} />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke={c.axis} strokeWidth={1.5} />

        {/* y軸の目盛り（0 / max） */}
        <text x={pad - 8} y={h - pad + 4} fill={c.textWeak} fontSize="11" textAnchor="end">
          0
        </text>
        <text x={pad - 8} y={pad + 4} fill={c.textWeak} fontSize="11" textAnchor="end">
          {maxV}
        </text>

        {/* バー + ラベル */}
        {bars.map((b, idx) => (
          <g key={idx}>
            <rect
              x={b.x}
              y={b.y}
              width={b.bw}
              height={b.bh}
              rx="6"
              fill={c.bar}
            />
            {/* 日付（下） */}
            <text
              x={b.x + b.bw / 2}
              y={h - 12}
              fontSize="11"
              textAnchor="middle"
              fill={c.text}
            >
              {String(b.date).slice(5)}
            </text>
            {/* 本数（上） */}
            <text
              x={b.x + b.bw / 2}
              y={Math.max(pad + 12, b.y - 6)}
              fontSize="11"
              textAnchor="middle"
              fill={c.text}
            >
              {b.sticks}
            </text>
          </g>
        ))}
      </svg>

      {/* 枠線を薄くしたい場合のため（カードCSSに寄せる） */}
      <div style={{ borderTop: `1px solid ${c.border}`, marginTop: 10, paddingTop: 8, color: c.textWeak, fontSize: 12 }}>
        ※ 棒の高さは各日の本数を表す
      </div>
    </div>
  );
}
