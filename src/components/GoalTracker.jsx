import React, { useState, useMemo } from "react";
import { Target, Sparkles, Pencil, Flag, Trash2, Check } from "lucide-react";
import colors from "../config/colors";
import { SectionHeader, EmptyState } from "./ui";
import {
  toDateStr,
  formatDate,
  daysBetween,
  addDays,
  trNumber,
} from "../utils/dateUtils";

const QUICK_TARGETS = [1000, 5000, 10000, 25000, 50000, 100000];

/* Progress ring drawn with plain SVG so it stays crisp at any size */
const Ring = ({ percent, children }) => {
  const size = 188;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.primaryDark} />
            <stop offset="100%" stopColor={colors.accent} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors.primaryLightest}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * clamped) / 100}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
};

const GoalForm = ({ initial, currentCount, onSave, onCancel }) => {
  const [value, setValue] = useState(initial ? String(initial.target) : "");

  const submit = (e) => {
    e.preventDefault();
    const target = Number(value);
    if (!target || Number.isNaN(target)) return;
    if (target <= currentCount) return;
    onSave({
      target,
      startCount: initial ? initial.startCount : currentCount,
      startDate: initial ? initial.startDate : toDateStr(new Date()),
    });
  };

  const invalid = value !== "" && Number(value) <= currentCount;

  return (
    <form onSubmit={submit} className="card p-5">
      <p className="field-label mb-2.5">Hedef takipçi sayısı</p>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        placeholder={`${trNumber(currentCount + 1000)} gibi`}
        className="input-lux tabular text-lg"
      />
      {invalid && (
        <p className="mt-2 text-[11px] text-pink-600">
          Hedef, şu anki takipçi sayından ({trNumber(currentCount)}) büyük olmalı.
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-3">
        {QUICK_TARGETS.filter((t) => t > currentCount)
          .slice(0, 4)
          .map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue(String(t))}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors tabular"
            >
              {trNumber(t)}
            </button>
          ))}
      </div>

      <div className="flex gap-2 mt-5">
        <button type="submit" disabled={invalid} className="btn-primary flex-1 disabled:opacity-40">
          <Check size={15} />
          Hedefi Kaydet
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Vazgeç
          </button>
        )}
      </div>
    </form>
  );
};

const GoalTracker = ({
  goal,
  goalHistory,
  followers,
  onSaveGoal,
  onClearGoal,
  onCompleteGoal,
}) => {
  const [editing, setEditing] = useState(false);

  const currentCount = followers.length
    ? followers[followers.length - 1].count
    : 0;

  const progress = useMemo(() => {
    if (!goal) return null;
    const span = goal.target - goal.startCount;
    const done = currentCount - goal.startCount;
    const percent = span > 0 ? (done / span) * 100 : 0;
    const remaining = Math.max(0, goal.target - currentCount);

    // Daily pace from the goal window, falling back to the last 30 days
    const elapsed = Math.max(1, daysBetween(goal.startDate, new Date()));
    let perDay = done > 0 ? done / elapsed : 0;

    if (perDay <= 0 && followers.length > 1) {
      const first = followers[0];
      const last = followers[followers.length - 1];
      const d = Math.max(1, daysBetween(first.date, last.date));
      perDay = (last.count - first.count) / d;
    }

    const daysLeft = perDay > 0 ? Math.ceil(remaining / perDay) : null;
    const eta = daysLeft ? addDays(new Date(), daysLeft) : null;

    return {
      percent: Math.max(0, Math.min(100, percent)),
      rawPercent: percent,
      done,
      remaining,
      perDay,
      daysLeft,
      eta,
      reached: currentCount >= goal.target,
    };
  }, [goal, currentCount, followers]);

  /* ---------- No goal yet ---------- */
  if (!goal) {
    return (
      <section className="animate-rise">
        <SectionHeader eyebrow="Hedef" title="Hedef ve İlerleme" />
        {editing ? (
          <GoalForm
            currentCount={currentCount}
            onSave={(g) => {
              onSaveGoal(g);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <EmptyState
            icon={Target}
            title="Bir hedef belirle"
            hint={
              followers.length
                ? "Şu an nerede olduğunu biliyoruz. Nereye gitmek istediğini söyle, kalan yolu ve tahmini varış tarihini hesaplayayım."
                : "Önce Büyüme sekmesinden takipçi sayını gir, sonra buraya hedefini yaz."
            }
            action={
              followers.length ? (
                <button onClick={() => setEditing(true)} className="btn-primary">
                  <Flag size={15} />
                  Hedef Belirle
                </button>
              ) : null
            }
          />
        )}
        {goalHistory.length > 0 && <History items={goalHistory} />}
      </section>
    );
  }

  /* ---------- Editing an existing goal ---------- */
  if (editing) {
    return (
      <section className="animate-rise">
        <SectionHeader eyebrow="Hedef" title="Hedefi Düzenle" />
        <GoalForm
          initial={goal}
          currentCount={currentCount}
          onSave={(g) => {
            onSaveGoal(g);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
        <button
          onClick={() => {
            onClearGoal();
            setEditing(false);
          }}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold text-ink-400 hover:text-pink-600 transition-colors"
        >
          <Trash2 size={14} />
          Hedefi tamamen kaldır
        </button>
      </section>
    );
  }

  /* ---------- Active goal ---------- */
  return (
    <section className="animate-rise">
      <SectionHeader
        eyebrow="Hedef"
        title="Hedef ve İlerleme"
        action={
          <button
            onClick={() => setEditing(true)}
            className="shrink-0 p-2.5 rounded-2xl bg-white border border-pink-100 text-pink-500 hover:border-pink-300 transition-colors"
            aria-label="Hedefi düzenle"
          >
            <Pencil size={15} />
          </button>
        }
      />

      {progress.reached && (
        <div className="mb-4 rounded-lux bg-pink-sheen text-white shadow-lift px-5 py-5 animate-scaleIn">
          <div className="flex items-center gap-2.5">
            <Sparkles size={20} />
            <p className="font-display text-xl">Hedefe ulaştın!</p>
          </div>
          <p className="mt-1.5 text-[13px] text-pink-50/90 leading-relaxed">
            {trNumber(goal.target)} hedefini {trNumber(currentCount)} takipçiyle
            geçtin. Sıradaki hedefini şimdi belirleyebilirsin.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                onCompleteGoal(goal, currentCount);
                setEditing(true);
              }}
              className="flex-1 py-3 rounded-2xl bg-white text-pink-700 text-[13px] font-semibold active:scale-[0.97] transition-transform"
            >
              Yeni Hedef Belirle
            </button>
            <button
              onClick={() => onCompleteGoal(goal, currentCount)}
              className="px-4 py-3 rounded-2xl bg-white/15 text-white text-[13px] font-semibold active:scale-[0.97] transition-transform"
            >
              Arşivle
            </button>
          </div>
        </div>
      )}

      <div className="card px-5 pt-7 pb-6">
        <Ring percent={progress.percent}>
          <p className="eyebrow">Tamamlanan</p>
          <p className="font-display text-[40px] leading-none text-ink-900 tabular mt-1">
            {Math.round(progress.percent)}
            <span className="text-xl text-pink-400">%</span>
          </p>
          <p className="mt-1.5 text-[11px] text-ink-400 tabular">
            {trNumber(currentCount)} / {trNumber(goal.target)}
          </p>
        </Ring>

        <div className="mt-7 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="field-label mb-1.5">Kalan</p>
            <p className="font-display text-lg text-ink-900 tabular">
              {trNumber(progress.remaining)}
            </p>
          </div>
          <div className="border-x border-pink-50">
            <p className="field-label mb-1.5">Günlük</p>
            <p className="font-display text-lg text-ink-900 tabular">
              {progress.perDay > 0 ? `+${Math.round(progress.perDay)}` : "—"}
            </p>
          </div>
          <div>
            <p className="field-label mb-1.5">Kalan gün</p>
            <p className="font-display text-lg text-ink-900 tabular">
              {progress.daysLeft ?? "—"}
            </p>
          </div>
        </div>

        <div className="rule my-5" />

        <div className="grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <p className="field-label mb-1.5">Başlangıç</p>
            <p className="text-[13px] text-ink-600">
              {formatDate(goal.startDate)}
            </p>
            <p className="text-[11px] text-ink-400 tabular mt-0.5">
              {trNumber(goal.startCount)} takipçi
            </p>
          </div>
          <div className="min-w-0">
            <p className="field-label mb-1.5">Tahmini varış</p>
            <p className="text-[13px] text-pink-600 font-semibold">
              {progress.reached
                ? "Ulaşıldı"
                : progress.eta
                  ? formatDate(progress.eta)
                  : "Hesaplanıyor"}
            </p>
            <p className="text-[11px] text-ink-400 tabular mt-0.5">
              {trNumber(goal.target)} hedef
            </p>
          </div>
        </div>

        {!progress.reached && !progress.eta && (
          <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
            Tahmin için birkaç gün üst üste takipçi kaydı girmen yeterli.
          </p>
        )}
      </div>

      {goalHistory.length > 0 && <History items={goalHistory} />}
    </section>
  );
};

const History = ({ items }) => (
  <div className="mt-5">
    <p className="field-label mb-2.5">Tamamlanan hedefler</p>
    <div className="space-y-2 stagger">
      {items.map((h) => (
        <div
          key={h.id}
          className="card-quiet px-4 py-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
            <Flag size={14} className="text-pink-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-ink-800 tabular">
              {trNumber(h.target)} takipçi
            </p>
            <p className="text-[11px] text-ink-400">
              {formatDate(h.startDate)} → {formatDate(h.reachedDate)}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-pink-600 tabular">
            +{trNumber(h.reachedCount - h.startCount)}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default GoalTracker;
