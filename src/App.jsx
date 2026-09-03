import React, { useState, useEffect } from "react";
import { TrendingUp, Target, Lightbulb, Clock } from "lucide-react";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import FollowerTracker from "./components/FollowerTracker";
import GoalTracker from "./components/GoalTracker";
import IdeaBank from "./components/IdeaBank";
import BestTimes from "./components/BestTimes";
import Chatbot from "./components/Chatbot";
import storage from "./data/storage";

const TABS = [
  { id: "growth", label: "Büyüme", icon: TrendingUp },
  { id: "goal", label: "Hedef", icon: Target },
  { id: "ideas", label: "Fikirler", icon: Lightbulb },
  { id: "times", label: "Saatler", icon: Clock },
];

function App() {
  const [tab, setTab] = useState("growth");

  const [followers, setFollowers] = useState(() => storage.getFollowers());
  const [goal, setGoal] = useState(() => storage.getGoal());
  const [goalHistory, setGoalHistory] = useState(() => storage.getGoalHistory());
  const [ideas, setIdeas] = useState(() => storage.getIdeas());
  const [posts, setPosts] = useState(() => storage.getPosts());

  // Each tab is its own page — start it at the top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab]);

  /* ---- followers ---- */
  const handleAddFollower = (count, dateStr) =>
    setFollowers([...storage.addFollower(count, dateStr)]);
  const handleDeleteFollower = (date) =>
    setFollowers([...storage.deleteFollower(date)]);

  /* ---- goal ---- */
  const handleSaveGoal = (g) => setGoal({ ...storage.setGoal(g) });
  const handleClearGoal = () => setGoal(storage.clearGoal());
  const handleCompleteGoal = (g, reachedCount) => {
    setGoalHistory([...storage.archiveGoal(g, reachedCount)]);
    setGoal(storage.clearGoal());
  };

  /* ---- ideas ---- */
  const handleSaveIdea = (i) => setIdeas([...storage.saveIdea(i)]);
  const handleDeleteIdea = (id) => setIdeas([...storage.deleteIdea(id)]);

  /* ---- posts ---- */
  const handleSavePost = (p) => setPosts([...storage.savePost(p)]);
  const handleDeletePost = (id) => setPosts([...storage.deletePost(id)]);

  return (
    <div className="min-h-screen bg-pink-veil font-body">
      {/* Ambient wash — keeps the page from reading as flat white */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-72 opacity-60"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, #fce7f3 0%, transparent 70%)",
        }}
      />

      <div className="relative min-h-screen flex flex-col">
        <Navbar />

        {/* flex-1 keeps the footer below the fold on short pages so the
            bottom bar never covers it */}
        <main className="flex-1 w-full max-w-lg mx-auto px-5 pt-7">
          {tab === "growth" && (
            <FollowerTracker
              followers={followers}
              onAddFollower={handleAddFollower}
              onDeleteFollower={handleDeleteFollower}
            />
          )}

          {tab === "goal" && (
            <GoalTracker
              goal={goal}
              goalHistory={goalHistory}
              followers={followers}
              onSaveGoal={handleSaveGoal}
              onClearGoal={handleClearGoal}
              onCompleteGoal={handleCompleteGoal}
            />
          )}

          {tab === "ideas" && (
            <IdeaBank
              ideas={ideas}
              onSaveIdea={handleSaveIdea}
              onDeleteIdea={handleDeleteIdea}
            />
          )}

          {tab === "times" && (
            <BestTimes
              posts={posts}
              onSavePost={handleSavePost}
              onDeletePost={handleDeletePost}
            />
          )}

        </main>

        <Footer />

        <BottomNav tabs={TABS} active={tab} onChange={setTab} />

        <Chatbot
          followers={followers}
          goal={goal}
          ideas={ideas}
          posts={posts}
        />
      </div>
    </div>
  );
}

export default App;
