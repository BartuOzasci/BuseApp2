import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { MONTHS_TR, DAYS_TR } from "../data/chatbotData";
import { toDateStr, addDays, formatDate } from "../utils/dateUtils";

const TodoCards = ({ todos, onUpdateTodos }) => {
  const today = new Date();
  const [centerDate, setCenterDate] = useState(today);
  const [newTodoText, setNewTodoText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(toDateStr(today));
  const [swipeStart, setSwipeStart] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardContainerRef = useRef(null);

  const dates = [addDays(centerDate, -1), centerDate, addDays(centerDate, 1)];

  const getTodosForDate = (date) => {
    const dateStr = toDateStr(date);
    return todos[dateStr] || [];
  };

  const addTodo = (date) => {
    if (!newTodoText.trim()) return;
    const dateStr = toDateStr(date);
    const currentTodos = todos[dateStr] || [];
    const newTodo = {
      id: Date.now(),
      text: newTodoText.trim(),
      completed: false,
    };
    onUpdateTodos(dateStr, [...currentTodos, newTodo]);
    setNewTodoText("");
  };

  const toggleTodo = (date, todoId) => {
    const dateStr = toDateStr(date);
    const currentTodos = todos[dateStr] || [];
    const updated = currentTodos.map((t) =>
      t.id === todoId ? { ...t, completed: !t.completed } : t,
    );
    onUpdateTodos(dateStr, updated);
  };

  const deleteTodo = (date, todoId) => {
    const dateStr = toDateStr(date);
    const currentTodos = todos[dateStr] || [];
    onUpdateTodos(
      dateStr,
      currentTodos.filter((t) => t.id !== todoId),
    );
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (date, todoId) => {
    if (!editText.trim()) return;
    const dateStr = toDateStr(date);
    const currentTodos = todos[dateStr] || [];
    const updated = currentTodos.map((t) =>
      t.id === todoId ? { ...t, text: editText.trim() } : t,
    );
    onUpdateTodos(dateStr, updated);
    setEditingId(null);
    setEditText("");
  };

  const goToDate = (direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCenterDate(addDays(centerDate, direction));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const selectDate = () => {
    setCenterDate(new Date(datePickerValue));
    setShowDatePicker(false);
  };

  // Touch handling
  const handleTouchStart = (e) => {
    setSwipeStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (swipeStart === null) return;
    const diff = e.touches[0].clientX - swipeStart;
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeOffset) > 60) {
      goToDate(swipeOffset < 0 ? 1 : -1);
    }
    setSwipeStart(null);
    setSwipeOffset(0);
  };

  const formatCardDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()} ${MONTHS_TR[d.getMonth()]}`;
  };

  const isToday = (date) => toDateStr(date) === toDateStr(today);

  return (
    <section className="px-4 py-3">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-display font-bold text-gray-800 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
            <Check size={12} className="text-white" />
          </span>
          Yapılacaklar
        </h2>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors font-body"
        >
          <Calendar size={12} />
          Tarih Seç
        </button>
      </div>

      {/* Date Picker */}
      {showDatePicker && (
        <div className="mb-3 bg-white rounded-xl border border-pink-100 p-3 shadow-card animate-slideUp">
          <input
            type="date"
            value={datePickerValue}
            onChange={(e) => setDatePickerValue(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-pink-200 text-sm font-body focus:outline-none focus:border-pink-400 mb-2"
          />
          <button
            onClick={selectDate}
            className="w-full py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg text-sm font-medium"
          >
            Git
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => goToDate(-1)}
          className="p-2 rounded-full hover:bg-pink-50 transition-colors"
        >
          <ChevronLeft size={18} className="text-pink-500" />
        </button>
        <div className="flex items-center gap-1 text-sm font-body">
          <span className="text-gray-400 text-xs">
            {DAYS_TR[centerDate.getDay()]}
          </span>
          <span className="font-semibold text-gray-700">
            {formatCardDate(centerDate)}
          </span>
          {isToday(centerDate) && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-600 text-[10px] font-medium">
              Bugün
            </span>
          )}
        </div>
        <button
          onClick={() => goToDate(1)}
          className="p-2 rounded-full hover:bg-pink-50 transition-colors"
        >
          <ChevronRight size={18} className="text-pink-500" />
        </button>
      </div>

      {/* Cards Container */}
      <div
        ref={cardContainerRef}
        className="relative h-72 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {dates.map((date, idx) => {
          const position = idx - 1; // -1, 0, 1
          const dateTodos = getTodosForDate(date);
          const translateX =
            position * 85 + (swipeStart !== null ? swipeOffset / 4 : 0);
          const scale = position === 0 ? 1 : 0.88;
          const opacity = position === 0 ? 1 : 0.5;
          const zIndex = position === 0 ? 10 : 5;

          return (
            <div
              key={toDateStr(date)}
              className="absolute inset-x-0 transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${translateX}%) scale(${scale})`,
                opacity,
                zIndex,
              }}
            >
              <div
                className={`bg-white rounded-2xl border ${isToday(date) ? "border-pink-300" : "border-pink-100"} shadow-card h-64 flex flex-col overflow-hidden`}
              >
                {/* Card Header */}
                <div
                  className={`px-4 py-2.5 border-b border-pink-50 flex items-center justify-between ${isToday(date) ? "bg-gradient-to-r from-pink-50 to-pink-100/50" : "bg-pink-50/30"}`}
                >
                  <div>
                    <p className="text-[10px] text-pink-400 uppercase tracking-wide font-body">
                      {DAYS_TR[date.getDay()]}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 font-body">
                      {formatCardDate(date)}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 font-medium">
                    {dateTodos.filter((t) => t.completed).length}/
                    {dateTodos.length}
                  </span>
                </div>

                {/* Todos List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                  {dateTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-2 group"
                    >
                      <button
                        onClick={() => toggleTodo(date, todo.id)}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          todo.completed
                            ? "border-pink-500 bg-pink-500"
                            : "border-pink-200 hover:border-pink-400"
                        }`}
                      >
                        {todo.completed && (
                          <Check size={10} className="text-white" />
                        )}
                      </button>
                      {editingId === todo.id ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={() => saveEdit(date, todo.id)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && saveEdit(date, todo.id)
                          }
                          className="flex-1 text-xs px-2 py-1 border border-pink-200 rounded-lg outline-none focus:border-pink-400"
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`flex-1 text-xs font-body ${todo.completed ? "line-through text-gray-300" : "text-gray-600"}`}
                        >
                          {todo.text}
                        </span>
                      )}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(todo)}
                          className="p-0.5 hover:text-pink-500 text-gray-300"
                        >
                          <Edit3 size={10} />
                        </button>
                        <button
                          onClick={() => deleteTodo(date, todo.id)}
                          className="p-0.5 hover:text-red-500 text-gray-300"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {dateTodos.length === 0 && (
                    <p className="text-xs text-gray-300 text-center py-4 font-body">
                      Henüz görev eklenmedi
                    </p>
                  )}
                </div>

                {/* Add Todo */}
                {position === 0 && (
                  <div className="px-3 py-2 border-t border-pink-50">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTodo(date)}
                        placeholder="Yeni görev ekle..."
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-pink-100 outline-none focus:border-pink-400 font-body"
                      />
                      <button
                        onClick={() => addTodo(date)}
                        className="px-2.5 py-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TodoCards;
