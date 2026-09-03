import React from "react";

const BottomNav = ({ tabs, active, onChange }) => (
  <nav className="fixed bottom-0 inset-x-0 z-40">
    <div className="max-w-lg mx-auto px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      <div className="bg-white/90 backdrop-blur-xl border border-pink-100 rounded-[22px] shadow-lift px-1.5 py-1.5 flex">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300 ${
                isActive ? "text-white" : "text-ink-400 hover:text-pink-500"
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-2xl bg-pink-sheen shadow-card" />
              )}
              <Icon
                size={18}
                strokeWidth={isActive ? 2.1 : 1.7}
                className="relative"
              />
              <span
                className={`relative text-[10px] tracking-wide ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);

export default BottomNav;
