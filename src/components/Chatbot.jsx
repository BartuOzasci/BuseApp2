import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import {
  WELCOME_MESSAGES,
  FEATURE_LIST,
  QUICK_ACTIONS,
  MONTHS_TR,
  DAYS_TR,
} from "../data/chatbotData";
import { toDateStr, getWeekDates, getDayName } from "../utils/dateUtils";

const Chatbot = ({ todos, contentCalendar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasInit, setHasInit] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !hasInit) {
      initChat();
      setHasInit(true);
    }
  }, [isOpen]);

  const addBotMessage = (text, delay = 500) => {
    return new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text, time: new Date() },
        ]);
        setIsTyping(false);
        resolve();
      }, delay);
    });
  };

  const initChat = async () => {
    for (const msg of WELCOME_MESSAGES) {
      await addBotMessage(msg, 600);
    }
    await addBotMessage("İşte sana yardımcı olabileceğim konular:", 400);
  };

  const handleFeatureClick = async (feature) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: feature.label, time: new Date() },
    ]);

    if (feature.id === "today_todos") {
      const todayStr = toDateStr(new Date());
      const todayTodos = todos[todayStr] || [];
      if (todayTodos.length === 0) {
        await addBotMessage(
          "Bugün için henüz yapılacak bir şey eklememişsin! Yapılacaklar bölümünden ekleyebilirsin. 📝",
        );
      } else {
        const completed = todayTodos.filter((t) => t.completed).length;
        let response = `Bugün ${todayTodos.length} görevin var (${completed} tamamlandı):\n\n`;
        todayTodos.forEach((todo, i) => {
          response += `${todo.completed ? "✅" : "⬜"} ${todo.text}\n`;
        });
        await addBotMessage(response);
      }
    } else if (feature.id === "weekly_content") {
      const today = new Date();
      const weekDates = getWeekDates(today);
      let response = "📅 Bu haftanın içerik planı:\n\n";
      let hasContent = false;

      weekDates.forEach((date) => {
        const dateStr = toDateStr(date);
        const content = contentCalendar[dateStr] || [];
        const dayName = getDayName(date);
        const dayNum = date.getDate();
        const monthName = MONTHS_TR[date.getMonth()];

        response += `📌 ${dayName} (${dayNum} ${monthName}):\n`;
        if (content.length > 0) {
          content.forEach((item) => {
            response += `   • ${item.text}\n`;
          });
          hasContent = true;
        } else {
          response += `   Henüz plan yok\n`;
        }
        response += "\n";
      });

      if (!hasContent) {
        response +=
          "\nHenüz bu hafta için içerik planlanmamış. İçerik Takvimi bölümünden ekleyebilirsin! 🎬";
      }

      await addBotMessage(response);
    } else {
      await addBotMessage(feature.description);
    }
  };

  const handleQuickAction = (action) => {
    const feature = FEATURE_LIST.find((f) => f.id === action.id);
    if (feature) {
      handleFeatureClick(feature);
    } else if (action.id === "help") {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: action.label, time: new Date() },
      ]);
      addBotMessage(
        'Bana şunları sorabilirsin:\n\n• "Bugünkü yapılacaklarım ne?" - Bugünkü görevlerini listelerim\n• "Haftalık içerik planım ne?" - Bu haftanın içerik takvimini gösterim\n\nAyrıca aşağıdaki konularda bilgi alabılırsin! 👇',
      );
    }
  };

  const formatTime = (date) => {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-5 left-5 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-gray-500 rotate-90 scale-90"
            : "bg-gradient-to-br from-pink-500 to-pink-600 hover:shadow-card-hover hover:scale-105"
        }`}
        style={{
          boxShadow: isOpen ? undefined : "0 4px 20px rgba(236, 72, 153, 0.4)",
        }}
      >
        {isOpen ? (
          <X size={26} className="text-white" />
        ) : (
          <MessageCircle size={26} className="text-white" />
        )}
      </button>

      {/* Pulse effect */}
      {!isOpen && (
        <div className="fixed bottom-5 left-5 z-40 w-16 h-16 rounded-full bg-pink-400 animate-ping opacity-20 pointer-events-none"></div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-4 right-4 z-50 max-w-sm bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden animate-slideUp"
          style={{ maxHeight: "70vh" }}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white text-base font-semibold font-body">
                Asistan
              </p>
              <p className="text-pink-100 text-xs">
                Her zaman buradayım ✨
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto px-4 py-3 space-y-3 bg-pink-50/30">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-br-md"
                      : "bg-white border border-pink-100 text-gray-700 rounded-bl-md shadow-sm"
                  }`}
                >
                  <p className="text-sm font-body whitespace-pre-line">
                    {msg.text}
                  </p>
                  <p
                    className={`text-[10px] mt-1 ${msg.type === "user" ? "text-pink-200" : "text-gray-300"}`}
                  >
                    {formatTime(msg.time)}
                  </p>
                </div>
              </div>
            ))}

            {/* Feature buttons */}
            {messages.length >= 3 && (
              <div className="space-y-1.5">
                {FEATURE_LIST.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureClick(feature)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-white border border-pink-100 hover:border-pink-300 hover:bg-pink-50 transition-all text-sm font-body text-gray-600"
                  >
                    {feature.label}
                  </button>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-pink-300 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-2 border-t border-pink-50 bg-white">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex-shrink-0 px-3.5 py-2 rounded-full bg-pink-50 text-pink-600 text-xs font-medium font-body hover:bg-pink-100 transition-colors whitespace-nowrap"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
