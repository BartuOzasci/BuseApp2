import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/* Editorial section heading: eyebrow + serif title + optional action */
export const SectionHeader = ({ eyebrow, title, action }) => (
  <header className="flex items-end justify-between gap-4 mb-5">
    <div className="min-w-0">
      {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
      <h2 className="section-title truncate">{title}</h2>
    </div>
    {action}
  </header>
);

/* Quiet, non-nagging empty state */
export const EmptyState = ({ icon: Icon, title, hint, action }) => (
  <div className="card px-6 py-10 text-center">
    {Icon && (
      <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-pink-50 flex items-center justify-center">
        <Icon size={22} className="text-pink-400" strokeWidth={1.6} />
      </div>
    )}
    <p className="font-display text-lg text-ink-800">{title}</p>
    {hint && (
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400 max-w-[34ch] mx-auto">
        {hint}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* Small labelled figure used inside cards */
export const Metric = ({ label, value, sub, tone = "default" }) => (
  <div>
    <p className="field-label mb-1">{label}</p>
    <p
      className={`font-display text-2xl tabular leading-none ${
        tone === "pink" ? "text-pink-600" : "text-ink-900"
      }`}
    >
      {value}
    </p>
    {sub && <p className="mt-1 text-[11px] text-ink-400">{sub}</p>}
  </div>
);

export const Chip = ({ children, tone = "pink" }) => {
  const tones = {
    pink: "bg-pink-50 text-pink-700",
    solid: "bg-pink-600 text-white",
    ink: "bg-ink-100 text-ink-600",
    outline: "border border-pink-200 text-pink-600",
  };
  return <span className={`chip ${tones[tone]}`}>{children}</span>;
};

/* Bottom sheet — mobile-first modal */
export const Sheet = ({ open, onClose, title, children }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  // Rendered through a portal: section wrappers keep a transform from their
  // entrance animation, and that would trap a `fixed` panel inside them.
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-ink-900/30 backdrop-blur-[2px] animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-lux shadow-lift animate-slideUp max-h-[88vh] flex flex-col">
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <span className="w-10 h-1 rounded-full bg-pink-100" />
        </div>
        <div className="px-6 pt-3 pb-4 border-b border-pink-50 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl text-ink-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 -mr-2 rounded-xl text-ink-300 hover:text-pink-600 hover:bg-pink-50 transition-colors"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto safe-bottom">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default { SectionHeader, EmptyState, Metric, Chip, Sheet };
