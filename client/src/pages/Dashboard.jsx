import React, { useEffect, useMemo, useState } from "react";
import LogForm from "../components/LogForm";
import StatsCards from "../components/StatsCards";
import DailyChart from "../components/DailyChart";
import LogTable from "../components/LogTable";
import BrandManager from "../components/BrandManager";


export default function Dashboard() {
  const [brands, setBrands] = useState([]);
  const [logs, setLogs] = useState([]);

  const [summary, setSummary] = useState({
    total_sticks: 0,
    avg_sticks_per_day: 0,
    total_yen: 0,
  });
  const [weekly, setWeekly] = useState({ this_week: 0, last_week: 0, diff: 0 });
  const [daily, setDaily] = useState({ days: 7, series: [] });

  const [place, setPlace] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sticks, setSticks] = useState(1);

  const canSubmit = useMemo(() => {
    return Number.isFinite(Number(brandId)) && Number.isFinite(Number(sticks)) && Number(sticks) > 0;
  }, [brandId, sticks]);

  async function loadAll() {
    const [b, l, s, w, d] = await Promise.all([
      fetch("/api/brands").then((r) => r.json()),
      fetch("/api/logs").then((r) => r.json()),
      fetch("/api/stats/summary").then((r) => r.json()),
      fetch("/api/stats/weekly-compare").then((r) => r.json()),
      fetch("/api/stats/daily?days=7").then((r) => r.json()),
    ]);

    setBrands(b);
    setLogs(l);
    setSummary(s);
    setWeekly(w);
    setDaily(d);

    if (b.length > 0 && !brandId) {
      setBrandId(String(b[0].brand_id));
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSmoke() {
    if (!canSubmit) return;

    // 1) クリック時のスクロール位置を保存
    const y = window.scrollY;

    // 2) フォーカス由来の微妙なスクロールを避ける（おまじない）
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }

    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_id: Number(brandId),
        sticks: Number(sticks),
        place: place.trim() ? place.trim() : null,
      }),
    });

    setPlace("");
    setSticks(1);

    // 3) 再取得→再描画後にスクロールを元に戻す
    await loadAll();
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: 0, behavior: "auto" });
    });
  }

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">SmokeLog DB</h1>
        <BrandManager onAdded={loadAll} />
        <div className="spacer" />

        <LogForm
          brands={brands}
          brandId={brandId}
          setBrandId={setBrandId}
          sticks={sticks}
          setSticks={setSticks}
          place={place}
          setPlace={setPlace}
          onSmoke={handleSmoke}
          canSubmit={canSubmit}
        />

        <div className="spacer" />

        <StatsCards summary={summary} weekly={weekly} />

        <div className="spacer" />

        <DailyChart data={daily.series} />

        <div className="spacer" />

        <LogTable logs={logs} />
      </div>
    </div>
  );
}
