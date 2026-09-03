import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Plus,
  Trash2,
  ChevronDown,
  LineChart as LineChartIcon,
  CalendarDays,
} from "lucide-react";
import colors from "../config/colors";
import { SectionHeader, EmptyState } from "./ui";
import {
  filterFollowersByRange,
  formatDateShort,
  formatDate,
  toDateStr,
  daysBetween,
  compactNumber,
  trNumber,
} from "../utils/dateUtils";

const TIME_RANGES = [
  { key: "1w", label: "1 Hafta" },
  { key: "1m", label: "1 Ay" },
  { key: "3m", label: "3 Ay" },
  { key: "6m", label: "6 Ay" },
  { key: "1y", label: "1 Yıl" },
  { key: "all", label: "Tümü" },
];

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-card-hover border border-pink-100 px-4 py-3">
      <p className="text-[10px] uppercase tracking-label text-pink-400">
        {formatDate(p.fullDate)}
      </p>
      <p className="font-display text-xl text-ink-900 tabular mt-1">
        {trNumber(p.count)}
      </p>
      {p.change !== null && (
        <p
          className={`text-[11px] font-semibold tabular mt-0.5 ${
            p.change >= 0 ? "text-pink-600" : "text-ink-400"
          }`}
        >
          {p.change >= 0 ? "+" : ""}
          {trNumber(p.change)} önceki kayda göre
        </p>
      )}
    </div>
  );
};

const FollowerTracker = ({ followers, onAddFollower, onDeleteFollower }) => {
  const [inputValue, setInputValue] = useState("");
  const [inputDate, setInputDate] = useState(toDateStr(new Date()));
  const [range, setRange] = useState("1m");
  const [showLog, setShowLog] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = Number(inputValue);
    if (!inputValue || Number.isNaN(n) || n < 0) return;
    onAddFollower(n, inputDate);
    setInputValue("");
    setInputDate(toDateStr(new Date()));
  };

  // Range drives the chart as well as the log. The previous build filtered only
  // the table, which made the range buttons look broken.
  const ranged = useMemo(
    () => filterFollowersByRange(followers, range),
    [followers, range],
  );

  const chartData = useMemo(
    () =>
      ranged.map((f, i) => ({
        date: formatDateShort(f.date),
        count: f.count,
        fullDate: f.date,
        change: i > 0 ? f.count - ranged[i - 1].count : null,
      })),
    [ranged],
  );

  const stats = useMemo(() => {
    const last = followers[followers.length - 1];
    const prev = followers[followers.length - 2];
    const lastCount = last ? last.count : 0;
    const diff = prev ? lastCount - prev.count : 0;
    const diffPct = prev && prev.count ? ((diff / prev.count) * 100).toFixed(1) : "0.0";

    const first = ranged[0];
    const rangeGrowth = first && last ? lastCount - first.count : 0;
    const span = first && last ? Math.max(1, daysBetween(first.date, last.date)) : 0;
    const perDay = span ? Math.round(rangeGrowth / span) : 0;

    return { lastCount, diff, diffPct, rangeGrowth, perDay };
  }, [followers, ranged]);

  const rangeLabel = TIME_RANGES.find((r) => r.key === range)?.label ?? "Bu dönem";

  if (followers.length === 0) {
    return (
      <section className="animate-rise">
        <SectionHeader eyebrow="Büyüme" title="Takipçi Takibi" />
        <form onSubmit={handleSubmit} className="card p-5 mb-4">
          <p className="field-label mb-2">Mevcut takipçi sayın</p>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Örn. 12480"
              className="input-lux flex-1 tabular"
            />
            <button type="submit" className="btn-primary px-5">
              <Plus size={16} />
            </button>
          </div>
        </form>
        <EmptyState
          icon={LineChartIcon}
          title="Grafiğin burada oluşacak"
          hint="İlk sayını girdiğin andan itibaren büyümen kaydediliyor. En az iki kayıt olunca eğri çizilmeye başlar."
        />
      </section>
    );
  }

  return (
    <section className="animate-rise">
      <SectionHeader eyebrow="Büyüme" title="Takipçi Takibi" />

      {/* Hero */}
      <div className="relative overflow-hidden rounded-lux bg-pink-sheen text-white shadow-lift mb-4">
        <div
          className="absolute -top-16 -right-10 w-52 h-52 rounded-full opacity-20 blur-2xl"
          style={{
            background: "radial-gradient(circle, #fff 0%, transparent 70%)",
          }}
        />
        <div className="relative px-6 pt-6 pb-5">
          <p className="text-[10px] uppercase tracking-wider2 text-pink-100/90">
            Mevcut Takipçi
          </p>
          <div className="flex items-end gap-3 mt-2">
            <p className="font-display text-[46px] leading-none tabular">
              {trNumber(stats.lastCount)}
            </p>
            <span
              className={`mb-1.5 chip ${
                stats.diff >= 0
                  ? "bg-white/20 text-white"
                  : "bg-ink-900/25 text-white"
              }`}
            >
              <TrendingUp
                size={12}
                className={stats.diff < 0 ? "rotate-180" : ""}
              />
              {stats.diff >= 0 ? "+" : ""}
              {trNumber(stats.diff)} · {stats.diffPct}%
            </span>
          </div>

          <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-label text-pink-100/80">
                {rangeLabel} büyümesi
              </p>
              <p className="font-display text-xl tabular mt-1">
                {stats.rangeGrowth >= 0 ? "+" : ""}
                {trNumber(stats.rangeGrowth)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-label text-pink-100/80">
                Günlük ortalama
              </p>
              <p className="font-display text-xl tabular mt-1">
                {stats.perDay >= 0 ? "+" : ""}
                {trNumber(stats.perDay)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Range rail */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 mb-3">
        {TIME_RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-200 ${
              range === r.key
                ? "bg-ink-900 text-white shadow-card"
                : "bg-white border border-pink-100 text-ink-500 hover:border-pink-200"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-5 mb-4">
        {chartData.length > 1 ? (
          <div className="h-60 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="followerFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={colors.primary}
                      stopOpacity={0.22}
                    />
                    <stop
                      offset="100%"
                      stopColor={colors.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke={colors.chart.grid}
                  strokeDasharray="4 6"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: colors.chart.axis }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                  dy={6}
                />
                <YAxis
                  width={44}
                  tick={{ fontSize: 10, fill: colors.chart.axis }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={compactNumber}
                  domain={["dataMin - 5", "dataMax + 5"]}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{
                    stroke: colors.primaryLight,
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={colors.chart.line}
                  strokeWidth={2.25}
                  fill="url(#followerFill)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: colors.chart.line,
                    stroke: "#fff",
                    strokeWidth: 2.5,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-14 text-center text-[13px] text-ink-400">
            {rangeLabel} için yeterli kayıt yok.
          </p>
        )}
      </div>

      {/* Add entry */}
      <form onSubmit={handleSubmit} className="card p-5 mb-4">
        <p className="field-label mb-2.5">Yeni kayıt</p>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Takipçi sayısı"
            className="input-lux flex-1 tabular"
          />
          <button type="submit" className="btn-primary px-5" aria-label="Ekle">
            <Plus size={16} />
          </button>
        </div>
        <label className="mt-2.5 flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-pink-100 bg-pink-50/40">
          <CalendarDays size={15} className="text-pink-400 shrink-0" />
          <span className="text-[12px] text-ink-500 shrink-0">Tarih</span>
          <input
            type="date"
            value={inputDate}
            max={toDateStr(new Date())}
            onChange={(e) => setInputDate(e.target.value)}
            className="flex-1 bg-transparent text-right text-[13px] text-ink-700 tabular outline-none"
          />
        </label>
        <p className="mt-2 text-[11px] text-ink-400 leading-relaxed">
          Aynı tarihe ikinci kez girersen kayıt güncellenir, yenisi eklenmez.
        </p>
      </form>

      {/* Log */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowLog((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="text-[13px] font-semibold text-ink-700">
            Kayıtlar
            <span className="ml-2 text-[11px] font-medium text-ink-400 tabular">
              {ranged.length}
            </span>
          </span>
          <ChevronDown
            size={17}
            className={`text-pink-400 transition-transform duration-300 ${
              showLog ? "rotate-180" : ""
            }`}
          />
        </button>

        {showLog && (
          <div className="max-h-72 overflow-y-auto border-t border-pink-50">
            {ranged.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-ink-400">
                Bu dönemde kayıt yok.
              </p>
            ) : (
              [...ranged].reverse().map((f, i, arr) => {
                const older = arr[i + 1];
                const change = older ? f.count - older.count : null;
                return (
                  <div
                    key={f.date}
                    className="flex items-center gap-3 px-5 py-3 border-b border-pink-50/70 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-ink-700">
                        {formatDate(f.date)}
                      </p>
                      <p className="text-[11px] text-ink-400 tabular">
                        {trNumber(f.count)} takipçi
                      </p>
                    </div>
                    {change !== null && (
                      <span
                        className={`text-[12px] font-semibold tabular ${
                          change > 0
                            ? "text-pink-600"
                            : change < 0
                              ? "text-ink-400"
                              : "text-ink-300"
                        }`}
                      >
                        {change > 0 ? "+" : ""}
                        {trNumber(change)}
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteFollower(f.date)}
                      className="p-2 -mr-2 rounded-xl text-ink-300 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                      aria-label="Kaydı sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FollowerTracker;
