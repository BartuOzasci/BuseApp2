import React, { useState, useMemo } from "react";
import {
  Plus,
  Lightbulb,
  Trash2,
  Star,
  Search,
  Film,
  Image as ImageIcon,
  Layers,
  Circle,
  Check,
  Clapperboard,
} from "lucide-react";
import { SectionHeader, EmptyState, Sheet } from "./ui";
import { formatDate } from "../utils/dateUtils";

export const IDEA_FORMATS = [
  { id: "reels", label: "Reels", icon: Film },
  { id: "post", label: "Post", icon: ImageIcon },
  { id: "story", label: "Story", icon: Circle },
  { id: "karusel", label: "Karusel", icon: Layers },
];

export const IDEA_STAGES = [
  { id: "fikir", label: "Fikir" },
  { id: "cekim", label: "Çekilecek" },
  { id: "kurgu", label: "Kurguda" },
  { id: "paylasildi", label: "Paylaşıldı" },
];

const CATEGORIES = [
  "Günlük Vlog",
  "Ürün Tanıtımı",
  "Moda",
  "Güzellik",
  "Seyahat",
  "Yemek",
  "Soru-Cevap",
  "Kamera Arkası",
  "Trend",
];

const formatOf = (id) => IDEA_FORMATS.find((f) => f.id === id) ?? IDEA_FORMATS[0];
const stageOf = (id) => IDEA_STAGES.find((s) => s.id === id) ?? IDEA_STAGES[0];

const emptyIdea = () => ({
  title: "",
  format: "reels",
  stage: "fikir",
  category: "",
  note: "",
  starred: false,
});

const IdeaForm = ({ value, onChange, onSubmit, onDelete }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      if (!value.title.trim()) return;
      onSubmit();
    }}
    className="space-y-4"
  >
    <div>
      <p className="field-label mb-2">Fikir</p>
      <textarea
        autoFocus
        rows={2}
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="Örn. Sabah rutinim — 3 ürünle 5 dakika"
        className="input-lux resize-none leading-relaxed"
      />
    </div>

    <div>
      <p className="field-label mb-2">Format</p>
      <div className="grid grid-cols-4 gap-1.5">
        {IDEA_FORMATS.map((f) => {
          const Icon = f.icon;
          const on = value.format === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange({ ...value, format: f.id })}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-[11px] font-semibold transition-all ${
                on
                  ? "bg-pink-sheen text-white shadow-card"
                  : "bg-pink-50 text-pink-700 hover:bg-pink-100"
              }`}
            >
              <Icon size={17} strokeWidth={1.8} />
              {f.label}
            </button>
          );
        })}
      </div>
    </div>

    <div>
      <p className="field-label mb-2">Aşama</p>
      <div className="flex flex-wrap gap-1.5">
        {IDEA_STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange({ ...value, stage: s.id })}
            className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all ${
              value.stage === s.id
                ? "bg-ink-900 text-white"
                : "bg-ink-50 text-ink-500 hover:bg-ink-100"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>

    <div>
      <p className="field-label mb-2">Kategori</p>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() =>
              onChange({ ...value, category: value.category === c ? "" : c })
            }
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
              value.category === c
                ? "bg-pink-600 text-white"
                : "bg-pink-50 text-pink-700 hover:bg-pink-100"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>

    <div>
      <p className="field-label mb-2">Detay</p>
      <textarea
        rows={3}
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
        placeholder="Çekim yeri, müzik, kıyafet, açılış cümlesi..."
        className="input-lux resize-none leading-relaxed"
      />
    </div>

    <button
      type="button"
      onClick={() => onChange({ ...value, starred: !value.starred })}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold transition-all ${
        value.starred
          ? "bg-pink-100 text-pink-700"
          : "bg-ink-50 text-ink-400 hover:bg-ink-100"
      }`}
    >
      <Star size={15} fill={value.starred ? "currentColor" : "none"} />
      {value.starred ? "Öne çıkarıldı" : "Öne çıkar"}
    </button>

    <div className="flex gap-2 pt-1">
      <button type="submit" className="btn-primary flex-1">
        Kaydet
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="px-4 py-3.5 rounded-2xl bg-ink-50 text-ink-400 hover:text-pink-600 transition-colors"
          aria-label="Sil"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  </form>
);

const IdeaBank = ({ ideas, onSaveIdea, onDeleteIdea }) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState(emptyIdea());
  const [stageFilter, setStageFilter] = useState("hepsi");
  const [query, setQuery] = useState("");

  const openNew = () => {
    setDraft(emptyIdea());
    setSheetOpen(true);
  };

  const openEdit = (idea) => {
    setDraft(idea);
    setSheetOpen(true);
  };

  const save = () => {
    onSaveIdea({ ...draft, title: draft.title.trim() });
    setSheetOpen(false);
  };

  const toggleStar = (idea, e) => {
    e.stopPropagation();
    onSaveIdea({ ...idea, starred: !idea.starred });
  };

  const advance = (idea, e) => {
    e.stopPropagation();
    const i = IDEA_STAGES.findIndex((s) => s.id === idea.stage);
    const next = IDEA_STAGES[Math.min(i + 1, IDEA_STAGES.length - 1)];
    onSaveIdea({ ...idea, stage: next.id });
  };

  const counts = useMemo(() => {
    const c = { hepsi: ideas.length };
    IDEA_STAGES.forEach((s) => {
      c[s.id] = ideas.filter((i) => i.stage === s.id).length;
    });
    return c;
  }, [ideas]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return ideas
      .filter((i) => stageFilter === "hepsi" || i.stage === stageFilter)
      .filter(
        (i) =>
          !q ||
          i.title.toLocaleLowerCase("tr").includes(q) ||
          (i.category || "").toLocaleLowerCase("tr").includes(q) ||
          (i.note || "").toLocaleLowerCase("tr").includes(q),
      )
      .sort((a, b) => Number(b.starred) - Number(a.starred));
  }, [ideas, stageFilter, query]);

  const addButton = (
    <button
      onClick={openNew}
      className="shrink-0 p-2.5 rounded-2xl bg-pink-sheen text-white shadow-card active:scale-95 transition-transform"
      aria-label="Fikir ekle"
    >
      <Plus size={17} />
    </button>
  );

  return (
    <section className="animate-rise">
      <SectionHeader
        eyebrow="Üretim"
        title="İçerik Fikir Bankası"
        action={ideas.length > 0 ? addButton : null}
      />

      {ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Aklına geleni buraya at"
          hint="Fikir aklına geldiği anda kaydet. Sonra aşamasını ilerlet: Fikir → Çekilecek → Kurguda → Paylaşıldı."
          action={
            <button onClick={openNew} className="btn-primary">
              <Plus size={15} />
              İlk Fikri Ekle
            </button>
          }
        />
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Fikirlerde ara..."
              className="input-lux pl-11"
            />
          </div>

          {/* Stage filter */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 mb-3">
            {[{ id: "hepsi", label: "Hepsi" }, ...IDEA_STAGES].map((s) => (
              <button
                key={s.id}
                onClick={() => setStageFilter(s.id)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all ${
                  stageFilter === s.id
                    ? "bg-ink-900 text-white"
                    : "bg-white border border-pink-100 text-ink-500 hover:border-pink-200"
                }`}
              >
                {s.label}
                <span className="ml-1.5 opacity-60 tabular">{counts[s.id]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="card px-5 py-8 text-center text-[13px] text-ink-400">
              Eşleşen fikir yok.
            </p>
          ) : (
            <div className="space-y-2.5 stagger">
              {visible.map((idea) => {
                const fmt = formatOf(idea.format);
                const Icon = fmt.icon;
                const stage = stageOf(idea.stage);
                const done = idea.stage === "paylasildi";

                return (
                  <div
                    key={idea.id}
                    onClick={() => openEdit(idea)}
                    className="card p-4 cursor-pointer hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          done ? "bg-pink-600 text-white" : "bg-pink-50 text-pink-500"
                        }`}
                      >
                        <Icon size={17} strokeWidth={1.8} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[14px] leading-snug ${
                            done ? "text-ink-400 line-through" : "text-ink-800"
                          }`}
                        >
                          {idea.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="chip bg-ink-50 text-ink-500">
                            {stage.label}
                          </span>
                          {idea.category && (
                            <span className="chip bg-pink-50 text-pink-700">
                              {idea.category}
                            </span>
                          )}
                          <span className="text-[10px] text-ink-300 tabular">
                            {formatDate(idea.createdAt)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleStar(idea, e)}
                        className={`p-1.5 h-fit rounded-xl transition-colors ${
                          idea.starred
                            ? "text-pink-500"
                            : "text-ink-200 hover:text-pink-400"
                        }`}
                        aria-label="Öne çıkar"
                      >
                        <Star
                          size={16}
                          fill={idea.starred ? "currentColor" : "none"}
                        />
                      </button>
                    </div>

                    {idea.note && (
                      <p className="mt-3 pt-3 border-t border-pink-50 text-[12px] text-ink-500 leading-relaxed line-clamp-2">
                        {idea.note}
                      </p>
                    )}

                    {!done && (
                      <button
                        onClick={(e) => advance(idea, e)}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-pink-50 text-pink-700 text-[12px] font-semibold hover:bg-pink-100 transition-colors"
                      >
                        {idea.stage === "kurgu" ? (
                          <Check size={13} />
                        ) : (
                          <Clapperboard size={13} />
                        )}
                        {idea.stage === "fikir"
                          ? "Çekim listesine al"
                          : idea.stage === "cekim"
                            ? "Kurguya al"
                            : "Paylaşıldı olarak işaretle"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={draft.id ? "Fikri Düzenle" : "Yeni Fikir"}
      >
        <IdeaForm
          value={draft}
          onChange={setDraft}
          onSubmit={save}
          onDelete={
            draft.id
              ? () => {
                  onDeleteIdea(draft.id);
                  setSheetOpen(false);
                }
              : null
          }
        />
      </Sheet>
    </section>
  );
};

export default IdeaBank;
