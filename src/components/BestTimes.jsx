import React, { useState, useMemo } from "react";
import { Plus, Clock, Trash2, Info, Sparkles } from "lucide-react";
import colors from "../config/colors";
import { SectionHeader, Sheet } from "./ui";
import { toDateStr, formatDate, trNumber } from "../utils/dateUtils";

/* Monday-first day labels */
const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const DAY_FULL = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

const BUCKETS = [
  { label: "06–09", from: 6, to: 9 },
  { label: "09–12", from: 9, to: 12 },
  { label: "12–15", from: 12, to: 15 },
  { label: "15–18", from: 15, to: 18 },
  { label: "18–21", from: 18, to: 21 },
  { label: "21–24", from: 21, to: 24 },
];

/* Baseline for a Turkish audience — used until enough of your own posts exist.
   Values are relative strength (0–1), not absolute numbers. */
const REFERENCE = [
  [0.2, 0.4, 0.6, 0.45, 0.75, 0.6],
  [0.25, 0.45, 0.7, 0.5, 0.85, 0.65],
  [0.25, 0.5, 0.8, 0.55, 0.9, 0.7],
  [0.3, 0.5, 0.8, 0.55, 0.95, 0.7],
  [0.25, 0.45, 0.7, 0.5, 0.7, 0.55],
  [0.2, 0.55, 0.6, 0.5, 0.65, 0.6],
  [0.25, 0.6, 0.65, 0.55, 0.85, 0.75],
];

const MIN_POSTS_FOR_OWN = 5;

/* JS getDay() is Sunday-first; the grid is Monday-first */
const dayIndex = (date) => (new Date(date).getDay() + 6) % 7;
const bucketIndex = (hour) => BUCKETS.findIndex((b) => hour >= b.from && hour < b.to);

const shade = (v) => {
  if (v <= 0) return colors.heat[0];
  const i = Math.min(colors.heat.length - 1, Math.floor(v * (colors.heat.length - 1)) + 1);
  return colors.heat[i];
};

const emptyPost = () => ({
  date: toDateStr(new Date()),
  hour: 19,
  reach: "",
});

const BestTimes = ({ posts, onSavePost, onDeletePost }) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState(emptyPost());
  const [mode, setMode] = useState("auto"); // auto | own | reference
  const [selected, setSelected] = useState(null);

  const valid = posts.filter((p) => bucketIndex(p.hour) >= 0);
  const hasOwn = valid.length >= MIN_POSTS_FOR_OWN;
  const showOwn = mode === "own" || (mode === "auto" && hasOwn);

  /* Average reach per (day, bucket) from your own posts */
  const own = useMemo(() => {
    const sums = Array.from({ length: 7 }, () => Array(BUCKETS.length).fill(0));
    const counts = Array.from({ length: 7 }, () => Array(BUCKETS.length).fill(0));

    valid.forEach((p) => {
      const d = dayIndex(p.date);
      const b = bucketIndex(p.hour);
      sums[d][b] += Number(p.reach) || 0;
      counts[d][b] += 1;
    });

    const avg = sums.map((row, d) =>
      row.map((s, b) => (counts[d][b] ? s / counts[d][b] : null)),
    );
    const max = Math.max(0, ...avg.flat().filter((v) => v !== null));

    return {
      avg,
      counts,
      normalized: avg.map((row) => row.map((v) => (v === null || !max ? 0 : v / max))),
    };
  }, [valid]);

  const grid = showOwn ? own.normalized : REFERENCE;

  const top = useMemo(() => {
    const cells = [];
    grid.forEach((row, d) =>
      row.forEach((v, b) => {
        if (v > 0) cells.push({ d, b, v, samples: own.counts[d][b] });
      }),
    );
    return cells.sort((x, y) => y.v - x.v).slice(0, 3);
  }, [grid, own]);

  const save = () => {
    if (draft.reach === "" || Number.isNaN(Number(draft.reach))) return;
    onSavePost({ ...draft, hour: Number(draft.hour), reach: Number(draft.reach) });
    setSheetOpen(false);
    setDraft(emptyPost());
  };

  return (
    <section className="animate-rise">
      <SectionHeader
        eyebrow="Zamanlama"
        title="En İyi Paylaşım Saatleri"
        action={
          <button
            onClick={() => {
              setDraft(emptyPost());
              setSheetOpen(true);
            }}
            className="shrink-0 p-2.5 rounded-2xl bg-pink-sheen text-white shadow-card active:scale-95 transition-transform"
            aria-label="Gönderi ekle"
          >
            <Plus size={17} />
          </button>
        }
      />

      {/* Source toggle */}
      <div className="flex gap-1.5 mb-3">
        {[
          { id: "own", label: "Kendi Verim", disabled: !hasOwn },
          { id: "reference", label: "Genel Öneri", disabled: false },
        ].map((t) => {
          const active = t.id === (showOwn ? "own" : "reference");
          return (
            <button
              key={t.id}
              disabled={t.disabled}
              onClick={() => setMode(t.id)}
              className={`flex-1 py-2.5 rounded-2xl text-[12px] font-semibold transition-all disabled:opacity-40 ${
                active
                  ? "bg-ink-900 text-white shadow-card"
                  : "bg-white border border-pink-100 text-ink-500"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {!hasOwn && (
        <div className="mb-3 flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-pink-50/70 border border-pink-100">
          <Info size={15} className="text-pink-500 mt-0.5 shrink-0" />
          <p className="text-[12px] text-ink-600 leading-relaxed">
            Şu an genel öneri haritasını görüyorsun. {MIN_POSTS_FOR_OWN} gönderi
            kaydettiğinde ({valid.length}/{MIN_POSTS_FOR_OWN}) kendi verine göre
            hesaplamaya geçer.
          </p>
        </div>
      )}

      {/* Heatmap */}
      <div className="card p-4 mb-4">
        <div className="flex">
          <div className="w-9 shrink-0" />
          <div className="flex-1 grid grid-cols-6 gap-1">
            {BUCKETS.map((b) => (
              <p
                key={b.label}
                className="text-[9px] text-center text-ink-300 tabular pb-1.5"
              >
                {b.label}
              </p>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {DAY_LABELS.map((day, d) => (
            <div key={day} className="flex items-center">
              <p className="w-9 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                {day}
              </p>
              <div className="flex-1 grid grid-cols-6 gap-1">
                {BUCKETS.map((b, bi) => {
                  const v = grid[d][bi];
                  const isSel = selected && selected.d === d && selected.b === bi;
                  return (
                    <button
                      key={b.label}
                      onClick={() => setSelected(isSel ? null : { d, b: bi })}
                      className={`h-9 rounded-lg transition-all duration-200 ${
                        isSel ? "ring-2 ring-ink-900 ring-offset-1" : ""
                      }`}
                      style={{ backgroundColor: shade(v) }}
                      aria-label={`${DAY_FULL[d]} ${b.label}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-[10px] text-ink-300">Düşük</span>
          <div className="flex gap-0.5">
            {colors.heat.map((c) => (
              <span
                key={c}
                className="w-4 h-2.5 rounded-sm"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <span className="text-[10px] text-ink-300">Yüksek</span>
        </div>

        {selected && (
          <div className="mt-4 pt-4 border-t border-pink-50 animate-fadeIn">
            <p className="field-label mb-1">
              {DAY_FULL[selected.d]} · {BUCKETS[selected.b].label}
            </p>
            {showOwn ? (
              own.counts[selected.d][selected.b] > 0 ? (
                <p className="text-[14px] text-ink-800">
                  Ortalama{" "}
                  <span className="font-display text-lg tabular">
                    {trNumber(Math.round(own.avg[selected.d][selected.b]))}
                  </span>{" "}
                  erişim
                  <span className="text-ink-400 text-[12px]">
                    {" "}
                    · {own.counts[selected.d][selected.b]} gönderi
                  </span>
                </p>
              ) : (
                <p className="text-[13px] text-ink-400">
                  Bu aralıkta henüz gönderin yok.
                </p>
              )
            ) : (
              <p className="text-[13px] text-ink-600">
                Genel öneri gücü:{" "}
                <span className="font-semibold">
                  {Math.round(REFERENCE[selected.d][selected.b] * 100)}/100
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Top slots */}
      {top.length > 0 && (
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} className="text-pink-500" />
            <p className="field-label">
              {showOwn ? "Sana en iyi gelen" : "Önerilen"} 3 aralık
            </p>
          </div>
          <div className="space-y-2.5 stagger">
            {top.map((c, i) => (
              <div
                key={`${c.d}-${c.b}`}
                className="flex items-center gap-3.5"
              >
                <span className="w-7 h-7 rounded-full bg-pink-50 text-pink-600 font-display text-[13px] flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-ink-800">
                    {DAY_FULL[c.d]}{" "}
                    <span className="text-ink-400">· {BUCKETS[c.b].label}</span>
                  </p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-pink-50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-pink-sheen transition-all duration-700"
                      style={{ width: `${Math.round(c.v * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post log */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-pink-50">
          <p className="text-[13px] font-semibold text-ink-700">
            Gönderi kayıtları
            <span className="ml-2 text-[11px] font-medium text-ink-400 tabular">
              {posts.length}
            </span>
          </p>
          <Clock size={15} className="text-pink-400" />
        </div>

        {posts.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-ink-400 leading-relaxed">
            Paylaştığın her gönderi için sadece
            <br />
            <span className="text-ink-600">tarih · saat · erişim</span> gir.
          </p>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {posts.slice(0, 40).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-5 py-3 border-b border-pink-50/70 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-ink-700">
                    {formatDate(p.date)}{" "}
                    <span className="text-ink-400 tabular">
                      · {String(p.hour).padStart(2, "0")}:00
                    </span>
                  </p>
                  <p className="text-[11px] text-ink-400 tabular">
                    {trNumber(p.reach)} erişim
                  </p>
                </div>
                <button
                  onClick={() => onDeletePost(p.id)}
                  className="p-2 -mr-2 rounded-xl text-ink-300 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                  aria-label="Kaydı sil"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Gönderi Kaydet"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-4"
        >
          <div>
            <p className="field-label mb-2">Paylaşım tarihi</p>
            <input
              type="date"
              value={draft.date}
              max={toDateStr(new Date())}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="input-lux tabular"
            />
          </div>

          <div>
            <p className="field-label mb-2">Paylaşım saati</p>
            <select
              value={draft.hour}
              onChange={(e) => setDraft({ ...draft, hour: e.target.value })}
              className="input-lux tabular"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="field-label mb-2">Erişim</p>
            <input
              type="number"
              inputMode="numeric"
              autoFocus
              value={draft.reach}
              onChange={(e) => setDraft({ ...draft, reach: e.target.value })}
              placeholder="Instagram'da gördüğün erişim sayısı"
              className="input-lux tabular"
            />
            <p className="mt-2 text-[11px] text-ink-400 leading-relaxed">
              Gönderi altındaki “Görüntülenme / Erişim” sayısı yeterli. Tek sayı,
              başka bir şey girmene gerek yok.
            </p>
          </div>

          <button type="submit" className="btn-primary w-full">
            Kaydet
          </button>
        </form>
      </Sheet>
    </section>
  );
};

export default BestTimes;
