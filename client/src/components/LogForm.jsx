import React from "react";

export default function LogForm({
  brands,
  brandId,
  setBrandId,
  sticks,
  setSticks,
  place,
  setPlace,
  onSmoke,
  canSubmit,
}) {
  return (
    <div className="card">
      <div className="formGrid">
        <div className="field">
          <label className="label">銘柄</label>
          <select
            className="control"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
          >
            {brands.map((b) => (
              <option key={b.brand_id} value={b.brand_id}>
                {b.name}（{b.pack_price_yen}円 / {b.sticks_per_pack}本）
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label">本数</label>
          <input
            className="control"
            type="number"
            min="1"
            step="1"
            value={sticks}
            onChange={(e) => setSticks(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label className="label">場所（任意）</label>
          <input
            className="control"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="例：自宅 / 屋外"
          />
        </div>

        <button
          type="button"
          className="primaryButton"
          onClick={onSmoke}
          disabled={!canSubmit}
        >
          記録（吸った）
        </button>
      </div>

      <div className="hint">
        金額は「本数 × (1箱価格 / 1箱本数)」をDBのJOINで算出（ユーザー入力不要）
      </div>
    </div>
  );
}
