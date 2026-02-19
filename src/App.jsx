import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FollowerTracker from './components/FollowerTracker';
import MiniCalendar from './components/MiniCalendar';
import TodoCards from './components/TodoCards';
import ContentCalendar from './components/ContentCalendar';
import Chatbot from './components/Chatbot';
import storage from './data/storage';

function App() {
  const [followers, setFollowers] = useState(() => storage.getFollowers());
  const [todos, setTodos] = useState(() => storage.getTodos());
  const [contentCalendar, setContentCalendar] = useState(() => storage.getContentCalendar());

  const handleAddFollower = (count) => {
    const updated = storage.addFollower(count);
    setFollowers([...updated]);
  };

  const handleUpdateTodos = (dateStr, dateTodos) => {
    const updated = storage.setTodosForDate(dateStr, dateTodos);
    setTodos({ ...updated });
  };

  const handleUpdateContent = (dateStr, content) => {
    const updated = storage.setContentForDate(dateStr, content);
    setContentCalendar({ ...updated });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 via-white to-pink-50/20 font-body">
      <Navbar />

      <main className="max-w-lg mx-auto pt-4 pb-24">
        {/* Follower Tracker */}
        <FollowerTracker
          followers={followers}
          onAddFollower={handleAddFollower}
        />

        {/* Divider */}
        <div className="px-4">
          <div className="border-t border-pink-100/50"></div>
        </div>

        {/* Mini Calendar */}
        <MiniCalendar />

        {/* Divider */}
        <div className="px-4">
          <div className="border-t border-pink-100/50"></div>
        </div>

        {/* Todo Cards */}
        <TodoCards
          todos={todos}
          onUpdateTodos={handleUpdateTodos}
        />

        {/* Divider */}
        <div className="px-4">
          <div className="border-t border-pink-100/50"></div>
        </div>

        {/* Content Calendar */}
        <ContentCalendar
          contentCalendar={contentCalendar}
          onUpdateContent={handleUpdateContent}
        />
      </main>

      {/* Instagram */}
      <div className="max-w-lg mx-auto px-4 py-6 flex justify-center">
        <a
          href="https://www.instagram.com/buuseaacar?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-body font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          @buuseaacar
        </a>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 bg-gradient-to-r from-pink-100 to-pink-200 border-t border-pink-200">
        <p className="text-center text-sm font-body text-pink-600 font-medium tracking-wide">
          Bartu Seni Çok Seviyor ❤️
        </p>
      </footer>

      {/* Chatbot */}
      <Chatbot
        todos={todos}
        contentCalendar={contentCalendar}
      />
    </div>
  );
}

export default App;
