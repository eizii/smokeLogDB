import React from "react";

function fmt(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function LogTable({ logs }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>喫煙ログ（最新200件）</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["日時", "銘柄", "本数", "費用(円)", "場所"].map((h) => (
                <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((r) => (
              <tr key={r.log_id}>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{fmt(r.smoked_at)}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{r.brand_name}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{r.sticks}</td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                  {Math.round(Number(r.cost_yen ?? 0)).toLocaleString()}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{r.place ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
