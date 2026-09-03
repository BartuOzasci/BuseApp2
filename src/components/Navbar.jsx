import React from "react";
import { MONTHS_TR } from "../data/chatbotData";
import { getDayName } from "../utils/dateUtils";

const Navbar = () => {
  const today = new Date();
  const dateLabel = `${today.getDate()} ${MONTHS_TR[today.getMonth()]}`;

  return (
    <header className="sticky top-0 z-40 safe-top bg-white/80 backdrop-blur-xl border-b border-pink-100/60">
      <div className="max-w-lg mx-auto px-5 py-3.5 flex items-center gap-3.5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden ring-1 ring-pink-200 ring-offset-2 ring-offset-white">
            <img
              src="/logo.jpeg"
              alt="Buse Acar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement.innerHTML =
                  '<div class="w-full h-full bg-pink-sheen flex items-center justify-center text-white font-display text-sm">BA</div>';
              }}
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-pink-500 ring-2 ring-white" />
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <p className="eyebrow leading-none">İçerik Üreticisi Paneli</p>
          <h1 className="font-display text-[19px] leading-tight text-ink-900 truncate">
            Buse Acar
          </h1>
        </div>

        {/* Date */}
        <div className="text-right shrink-0">
          <p className="font-display text-[15px] leading-none text-ink-800 tabular">
            {dateLabel}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-label text-pink-400">
            {getDayName(today)}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
