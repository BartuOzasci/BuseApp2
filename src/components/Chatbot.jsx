import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { WELCOME_MESSAGES, FEATURE_LIST } from "../data/chatbotData";
import { IDEA_STAGES } from "./IdeaBank";
import {
  formatDate,
  daysBetween,
  addDays,
  trNumber,
} from "../utils/dateUtils";

const DAY_FULL = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];
const BUCKET_LABELS = ["06–09", "09–12", "12–15", "15–18", "18–21", "21–24"];
const REFERENCE_TOP = [
  { d: 3, b: 4 },
  { d: 2, b: 4 },
  { d: 6, b: 4 },
];

const Chatbot = ({ followers = [], goal, ideas = [], posts = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasInit, setHasInit] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const lastBotMsgRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToLastBot = () => {
    setTimeout(() => {
      if (lastBotMsgRef.current && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const offsetTop = lastBotMsgRef.current.offsetTop - container.offsetTop;
        container.scrollTo({ top: offsetTop - 8, behavior: "smooth" });
      }
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0) scrollToLastBot();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !hasInit) {
      initChat();
      setHasInit(true);
    }
  }, [isOpen]);

  const addBotMessage = (text, delay = 500) =>
    new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: "bot", text, time: new Date() }]);
        setIsTyping(false);
        resolve();
      }, delay);
    });

  const initChat = async () => {
    for (const msg of WELCOME_MESSAGES) await addBotMessage(msg, 550);
  };

  /* ---------------- answers ---------------- */

  const growthAnswer = () => {
    if (followers.length === 0)
      return "Henüz takipçi kaydın yok. Büyüme sekmesinden ilk sayını girersen buradan takip edebilirim 📈";

    const last = followers[followers.length - 1];
    const prev = followers[followers.length - 2];
    let out = `📈 Son kayıt: ${trNumber(last.count)} takipçi (${formatDate(last.date)}).`;

    if (prev) {
      const diff = last.count - prev.count;
      out += `\nÖnceki kayda göre ${diff >= 0 ? "+" : ""}${trNumber(diff)}.`;
    }

    if (followers.length > 1) {
      const first = followers[0];
      const days = Math.max(1, daysBetween(first.date, last.date));
      const perDay = (last.count - first.count) / days;
      out += `\nGünlük ortalaman: ${perDay >= 0 ? "+" : ""}${Math.round(perDay)} takipçi.`;
      out += `\nToplam ${followers.length} kayıt, ${days} günlük veri.`;
    } else {
      out += "\nOrtalama çıkarmam için en az iki kayıt gerekiyor.";
    }
    return out;
  };

  const goalAnswer = () => {
    if (!goal)
      return "Aktif bir hedefin yok. Hedef sekmesinden bir takipçi hedefi belirlersen kalan yolu ve tahmini varış tarihini hesaplarım 🎯";
    if (followers.length === 0)
      return "Hedefin var ama takipçi kaydın yok. Önce güncel sayını gir, sonra ilerlemeni hesaplayayım.";

    const current = followers[followers.length - 1].count;
    const remaining = goal.target - current;

    if (remaining <= 0)
      return `🎉 Hedefine ulaştın! ${trNumber(goal.target)} hedefini ${trNumber(current)} takipçiyle geçtin. Hedef sekmesinden yenisini belirleyebilirsin.`;

    const done = current - goal.startCount;
    const elapsed = Math.max(1, daysBetween(goal.startDate, new Date()));
    const perDay = done > 0 ? done / elapsed : 0;
    const percent = Math.round(
      ((current - goal.startCount) / (goal.target - goal.startCount)) * 100,
    );

    let out = `🎯 Hedef: ${trNumber(goal.target)} takipçi.\nŞu an ${trNumber(current)} — yani %${Math.max(0, percent)} tamamlandı.\nKalan: ${trNumber(remaining)} takipçi.`;

    if (perDay > 0) {
      const daysLeft = Math.ceil(remaining / perDay);
      out += `\n\nGünlük +${Math.round(perDay)} hızınla yaklaşık ${daysLeft} gün, yani ${formatDate(addDays(new Date(), daysLeft))} civarı.`;
    } else {
      out += "\n\nTahmin için birkaç gün üst üste kayıt girmen yeterli.";
    }
    return out;
  };

  const ideasAnswer = () => {
    if (ideas.length === 0)
      return "Fikir bankan boş. Aklına gelen her şeyi oraya at, sonra aşamasını ilerletirsin 💡";

    const byStage = (id) => ideas.filter((i) => i.stage === id);
    const shoot = byStage("cekim");
    const edit = byStage("kurgu");

    let out = `💡 Toplam ${ideas.length} fikir.\n`;
    IDEA_STAGES.forEach((s) => {
      out += `${s.label}: ${byStage(s.id).length}  `;
    });

    if (shoot.length) {
      out += "\n\n🎬 Çekilecekler:";
      shoot.slice(0, 5).forEach((i) => (out += `\n• ${i.title}`));
    }
    if (edit.length) {
      out += "\n\n✂️ Kurguda bekleyenler:";
      edit.slice(0, 5).forEach((i) => (out += `\n• ${i.title}`));
    }
    if (!shoot.length && !edit.length)
      out += "\n\nÇekim sırasında bekleyen bir şey yok. Fikirlerden birini çekim listesine alabilirsin.";

    return out;
  };

  const bestTimeAnswer = () => {
    const valid = posts.filter((p) => p.hour >= 6 && p.hour < 24);

    if (valid.length < 5) {
      const list = REFERENCE_TOP.map(
        (c, i) => `${i + 1}. ${DAY_FULL[c.d]} ${BUCKET_LABELS[c.b]}`,
      ).join("\n");
      return `🕐 Henüz kendi verin için yeterli gönderi yok (${valid.length}/5).\n\nGenel öneriye göre en güçlü aralıklar:\n${list}\n\nHer paylaşımdan sonra tarih, saat ve erişimi girersen bu liste sana özel hale gelir.`;
    }

    const sums = {};
    valid.forEach((p) => {
      const d = (new Date(p.date).getDay() + 6) % 7;
      const b = Math.floor((p.hour - 6) / 3);
      const key = `${d}-${b}`;
      sums[key] = sums[key] || { total: 0, n: 0, d, b };
      sums[key].total += Number(p.reach) || 0;
      sums[key].n += 1;
    });

    const top = Object.values(sums)
      .map((s) => ({ ...s, avg: s.total / s.n }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3);

    let out = `🕐 ${valid.length} gönderinin verisine göre en iyi aralıkların:\n`;
    top.forEach((s, i) => {
      out += `\n${i + 1}. ${DAY_FULL[s.d]} ${BUCKET_LABELS[s.b]} — ort. ${trNumber(Math.round(s.avg))} erişim (${s.n} gönderi)`;
    });
    return out;
  };

  const handleFeatureClick = async (feature) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: feature.label, time: new Date() },
    ]);

    const answers = {
      growth: growthAnswer,
      goal: goalAnswer,
      ideas: ideasAnswer,
      besttime: bestTimeAnswer,
    };

    await addBotMessage(
      answers[feature.id] ? answers[feature.id]() : feature.description,
      450,
    );
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  const lastBotIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--)
      if (messages[i].type === "bot") return i;
    return -1;
  })();

  return (
    <>
      {/* Floating button — sits above the bottom nav */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`fixed bottom-[92px] right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lift ${
          isOpen
            ? "bg-ink-900 rotate-90 scale-95"
            : "bg-pink-sheen hover:scale-105"
        }`}
        aria-label="Asistan"
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-[160px] left-4 right-4 z-50 max-w-sm sm:left-auto sm:right-5 bg-white rounded-lux shadow-lift border border-pink-100 overflow-hidden animate-slideUp"
          style={{ maxHeight: "62vh" }}
        >
          {/* Header */}
          <div className="bg-pink-sheen px-5 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={17} className="text-white" />
            </div>
            <div>
              <p className="text-white text-[15px] font-display leading-tight">
                Asistan
              </p>
              <p className="text-pink-100 text-[10px] uppercase tracking-label">
                Panelini okur
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollContainerRef}
            className="overflow-y-auto px-4 py-4 space-y-3 bg-pink-50/25"
            style={{ maxHeight: "calc(62vh - 66px)" }}
          >
            {messages.map((msg, idx) => {
              const isLastBot = msg.type === "bot" && idx === lastBotIndex;
              return (
                <React.Fragment key={idx}>
                  <div
                    ref={isLastBot ? lastBotMsgRef : null}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 ${
                        msg.type === "user"
                          ? "bg-pink-sheen text-white rounded-br-md"
                          : "bg-white border border-pink-100 text-ink-700 rounded-bl-md shadow-card"
                      }`}
                    >
                      <p className="text-[13px] leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </p>
                      <p
                        className={`text-[9px] mt-1.5 tabular ${
                          msg.type === "user" ? "text-pink-100" : "text-ink-300"
                        }`}
                      >
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>

                  {isLastBot && !isTyping && (
                    <div className="space-y-1.5 pt-1">
                      {FEATURE_LIST.map((feature) => (
                        <button
                          key={feature.id}
                          onClick={() => handleFeatureClick(feature)}
                          className="w-full text-left px-4 py-3 rounded-2xl bg-white border border-pink-100 hover:border-pink-300 hover:bg-pink-50/60 transition-all text-[13px] text-ink-600 active:scale-[0.98]"
                        >
                          {feature.label}
                        </button>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-card">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
