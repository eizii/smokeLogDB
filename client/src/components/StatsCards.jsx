import React from "react";

function cardStyle() {
  return { border: "1px solid #ddd", borderRadius: 10, padding: 12, flex: "1 1 200px" };
}

export default function StatsCards({ summary, weekly }) {
  const totalSticks = Number(summary?.total_sticks ?? 0);
  const avgSticks = Number(summary?.avg_sticks_per_day ?? 0);
  const totalYen = Number(summary?.total_yen ?? 0);

  const thisWeek = Number(weekly?.this_week ?? 0);
  const lastWeek = Number(weekly?.last_week ?? 0);
  const diff = Number(weekly?.diff ?? 0);

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <div style={cardStyle()}>
        <div style={{ fontSize: 12, color: "#555" }}>合計本数（SUM(sticks)）</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{totalSticks}</div>
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 12, color: "#555" }}>1日あたり平均本数（AVG）</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{avgSticks.toFixed(2)}</div>
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 12, color: "#555" }}>合計金額（JOIN + SUM）</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{Math.round(totalYen).toLocaleString()} 円</div>
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 12, color: "#555" }}>今週 vs 先週（本数）</div>
        <div style={{ fontSize: 14, marginTop: 6 }}>
          今週: <b>{thisWeek}</b> / 先週: <b>{lastWeek}</b>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>
          差分: {diff >= 0 ? "+" : ""}
          {diff}
        </div>
      </div>
    </div>
  );
}
