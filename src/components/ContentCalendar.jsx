import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Plus,
  Save,
  Film,
} from "lucide-react";
import { DAYS_TR } from "../data/chatbotData";
import {
  getWeekDates,
  toDateStr,
  formatDate,
  addDays,
  getDayName,
} from "../utils/dateUtils";
import { MONTHS_TR } from "../data/chatbotData";

const ContentCalendar = ({ contentCalendar, onUpdateContent }) => {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(today);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return d;
  });
  const [editingDate, setEditingDate] = useState(null);
  const [editText, setEditText] = useState("");
  const [newContentDate, setNewContentDate] = useState(null);
  const [newContentText, setNewContentText] = useState("");

  const weekDates = getWeekDates(weekStart);

  const prevWeek = () => setWeekStart(addDays(weekStart, -7));
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));

  const getContent = (date) => {
    const dateStr = toDateStr(date);
    return contentCalendar[dateStr] || [];
  };

  const addContent = (date) => {
    if (!newContentText.trim()) return;
    const dateStr = toDateStr(date);
    const current = contentCalendar[dateStr] || [];
    const newItem = {
      id: Date.now(),
      text: newContentText.trim(),
    };
    onUpdateContent(dateStr, [...current, newItem]);
    setNewContentText("");
    setNewContentDate(null);
  };

  const deleteContent = (date, itemId) => {
    const dateStr = toDateStr(date);
    const current = contentCalendar[dateStr] || [];
    onUpdateContent(
      dateStr,
      current.filter((c) => c.id !== itemId),
    );
  };

  const startEdit = (item) => {
    setEditingDate(item.id);
    setEditText(item.text);
  };

  const saveEdit = (date, itemId) => {
    if (!editText.trim()) return;
    const dateStr = toDateStr(date);
    const current = contentCalendar[dateStr] || [];
    const updated = current.map((c) =>
      c.id === itemId ? { ...c, text: editText.trim() } : c,
    );
    onUpdateContent(dateStr, updated);
    setEditingDate(null);
    setEditText("");
  };

  const isToday = (date) => toDateStr(date) === toDateStr(today);

  const weekLabel = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${MONTHS_TR[start.getMonth()]}`;
    }
    return `${start.getDate()} ${MONTHS_TR[start.getMonth()].substring(0, 3)} - ${end.getDate()} ${MONTHS_TR[end.getMonth()].substring(0, 3)}`;
  };

  return (
    <section className="px-4 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-display font-bold text-gray-800 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
            <Film size={12} className="text-white" />
          </span>
          İçerik Takvimi
        </h2>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-3 bg-white rounded-xl border border-pink-50 shadow-card p-3">
        <button
          onClick={prevWeek}
          className="p-1.5 rounded-lg hover:bg-pink-50 transition-colors"
        >
          <ChevronLeft size={16} className="text-pink-500" />
        </button>
        <span className="text-sm font-semibold text-gray-700 font-body">
          {weekLabel()}
        </span>
        <button
          onClick={nextWeek}
          className="p-1.5 rounded-lg hover:bg-pink-50 transition-colors"
        >
          <ChevronRight size={16} className="text-pink-500" />
        </button>
      </div>

      {/* Week days */}
      <div className="space-y-2">
        {weekDates.map((date) => {
          const content = getContent(date);
          const dayIsToday = isToday(date);

          return (
            <div
              key={toDateStr(date)}
              className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                dayIsToday
                  ? "border-pink-300 shadow-card-hover"
                  : "border-pink-50 shadow-card"
              }`}
            >
              {/* Day header */}
              <div
                className={`px-4 py-2.5 flex items-center justify-between ${dayIsToday ? "bg-gradient-to-r from-pink-500 to-pink-600" : "bg-pink-50/50"}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold font-body ${dayIsToday ? "text-white" : "text-pink-600"}`}
                  >
                    {getDayName(date)}
                  </span>
                  <span
                    className={`text-xs font-body ${dayIsToday ? "text-pink-100" : "text-gray-400"}`}
                  >
                    {date.getDate()} {MONTHS_TR[date.getMonth()]}
                  </span>
                  {dayIsToday && (
                    <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-medium">
                      BUGÜN
                    </span>
                  )}
                </div>
                <button
                  onClick={() =>
                    setNewContentDate(
                      newContentDate === toDateStr(date)
                        ? null
                        : toDateStr(date),
                    )
                  }
                  className={`p-1 rounded-full transition-colors ${dayIsToday ? "hover:bg-white/20 text-white" : "hover:bg-pink-100 text-pink-500"}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Content items */}
              <div className="px-4 py-2 space-y-1.5">
                {content.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-300 mt-1.5 flex-shrink-0"></div>
                    {editingDate === item.id ? (
                      <div className="flex-1 flex gap-1">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && saveEdit(date, item.id)
                          }
                          className="flex-1 text-xs px-2 py-1 border border-pink-200 rounded-lg outline-none focus:border-pink-400"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(date, item.id)}
                          className="p-1 text-pink-500"
                        >
                          <Save size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 text-xs text-gray-600 font-body">
                          {item.text}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-0.5 text-gray-300 hover:text-pink-500"
                          >
                            <Edit3 size={10} />
                          </button>
                          <button
                            onClick={() => deleteContent(date, item.id)}
                            className="p-0.5 text-gray-300 hover:text-red-500"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {content.length === 0 && !newContentDate && (
                  <p className="text-[10px] text-gray-300 py-1 font-body italic">
                    İçerik planlanmadı
                  </p>
                )}
              </div>

              {/* Add content input */}
              {newContentDate === toDateStr(date) && (
                <div className="px-4 py-2 border-t border-pink-50">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newContentText}
                      onChange={(e) => setNewContentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addContent(date)}
                      placeholder="İçerik planı ekle..."
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-pink-100 outline-none focus:border-pink-400 font-body"
                      autoFocus
                    />
                    <button
                      onClick={() => addContent(date)}
                      className="px-2.5 py-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ContentCalendar;
