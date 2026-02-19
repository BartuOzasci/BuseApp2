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

      <main className="max-w-lg mx-auto pb-24">
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

      {/* Chatbot */}
      <Chatbot
        todos={todos}
        contentCalendar={contentCalendar}
      />
    </div>
  );
}

export default App;
