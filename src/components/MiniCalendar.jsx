import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTHS_TR, DAYS_SHORT_TR } from "../data/chatbotData";
import { getMonthDays, isSameDay } from "../utils/dateUtils";

const MiniCalendar = () => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const days = getMonthDays(viewDate.getFullYear(), viewDate.getMonth());

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  return (
    <section className="px-4 py-3">
      <div className="bg-white rounded-2xl border border-pink-50 shadow-card p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-pink-50 transition-colors"
          >
            <ChevronLeft size={20} className="text-pink-500" />
          </button>
          <h3 className="text-base font-semibold font-display text-gray-700">
            {MONTHS_TR[viewDate.getMonth()]} {viewDate.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-pink-50 transition-colors"
          >
            <ChevronRight size={20} className="text-pink-500" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-pink-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const isToday = isSameDay(day.date, today);
            return (
              <div
                key={idx}
                className={`
                  text-center text-sm py-2 rounded-lg font-body transition-all
                  ${!day.currentMonth ? "text-gray-200" : "text-gray-600"}
                  ${isToday ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white font-bold shadow-md scale-110" : ""}
                  ${day.currentMonth && !isToday ? "hover:bg-pink-50" : ""}
                `}
              >
                {day.date.getDate()}
              </div>
            );
          })}
        </div>

        {/* Today indicator */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
          <span className="text-sm text-gray-400 font-body">
            Bugün: {today.getDate()} {MONTHS_TR[today.getMonth()]}{" "}
            {today.getFullYear()}
          </span>
        </div>
      </div>
    </section>
  );
};

export default MiniCalendar;
