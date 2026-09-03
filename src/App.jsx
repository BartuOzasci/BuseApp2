import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, Target, Lightbulb, Clock } from "lucide-react";

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import SyncBar from "./components/SyncBar";
import FollowerTracker from "./components/FollowerTracker";
import GoalTracker from "./components/GoalTracker";
import IdeaBank from "./components/IdeaBank";
import BestTimes from "./components/BestTimes";
import Chatbot from "./components/Chatbot";
import api, { isRemote } from "./data/api";

const TABS = [
  { id: "growth", label: "Büyüme", icon: TrendingUp },
  { id: "goal", label: "Hedef", icon: Target },
  { id: "ideas", label: "Fikirler", icon: Lightbulb },
  { id: "times", label: "Saatler", icon: Clock },
];

function App() {
  const [tab, setTab] = useState("growth");

  // Önbellekle başla: bulut cevabı gelene kadar ekran boş kalmasın.
  // Lazy initializer — localStorage her render'da değil, yalnızca ilk
  // mount'ta okunur.
  const [followers, setFollowers] = useState(() => api.readCache().followers);
  const [goal, setGoal] = useState(() => api.readCache().goal);
  const [goalHistory, setGoalHistory] = useState(() => api.readCache().goalHistory);
  const [ideas, setIdeas] = useState(() => api.readCache().ideas);
  const [posts, setPosts] = useState(() => api.readCache().posts);

  const [status, setStatus] = useState(isRemote ? "loading" : "ready");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [migration, setMigration] = useState(null);

  const applyAll = (data) => {
    setFollowers(data.followers);
    setGoal(data.goal);
    setGoalHistory(data.goalHistory);
    setIdeas(data.ideas);
    setPosts(data.posts);
  };

  const load = useCallback(async () => {
    if (!isRemote) return;
    setStatus("loading");
    try {
      const data = await api.loadAll();
      applyAll(data);
      setError(null);
      setStatus("ready");

      // Bulut boş ama bu cihazda veri varsa taşımayı teklif et
      const local = api.readCache();
      const localCount =
        local.followers.length + local.ideas.length + local.posts.length;
      if (localCount > 0 && (await api.isRemoteEmpty())) {
        setMigration({
          followers: local.followers.length,
          ideas: local.ideas.length,
          posts: local.posts.length,
        });
      }
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Her sekme kendi sayfası — en üstten başlasın
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab]);

  /**
   * Yazma işlemlerinin ortak sarmalayıcısı: hatayı yakalar, ekranda
   * gösterir ve state'i sadece işlem başarılıysa günceller.
   */
  const run = async (fn, apply) => {
    setBusy(true);
    try {
      const result = await fn();
      apply(result);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  /* ---- takipçi ---- */
  const handleAddFollower = (count, dateStr) =>
    run(() => api.addFollower(count, dateStr), (r) => setFollowers([...r]));
  const handleDeleteFollower = (date) =>
    run(() => api.deleteFollower(date), (r) => setFollowers([...r]));

  /* ---- hedef ---- */
  const handleSaveGoal = (g) =>
    run(() => api.setGoal(g), (r) => setGoal(r ? { ...r } : null));
  const handleClearGoal = () => run(() => api.clearGoal(), () => setGoal(null));
  const handleCompleteGoal = (g, reachedCount) =>
    run(
      () => api.archiveGoal(g, reachedCount),
      (history) => {
        setGoalHistory([...history]);
        setGoal(null);
      },
    );

  /* ---- fikirler ---- */
  const handleSaveIdea = (i) =>
    run(() => api.saveIdea(i), (r) => setIdeas([...r]));
  const handleDeleteIdea = (id) =>
    run(() => api.deleteIdea(id), (r) => setIdeas([...r]));

  /* ---- gönderiler ---- */
  const handleSavePost = (p) =>
    run(() => api.savePost(p), (r) => setPosts([...r]));
  const handleDeletePost = (id) =>
    run(() => api.deletePost(id), (r) => setPosts([...r]));

  /* ---- yerelden buluta taşıma ---- */
  const handleMigrate = async () => {
    setBusy(true);
    try {
      applyAll(await api.pushLocalToRemote());
      setMigration(null);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

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
          <SyncBar
            isRemote={isRemote}
            status={status}
            error={error}
            onRetry={load}
            migration={migration}
            onMigrate={handleMigrate}
            onDismissMigration={() => setMigration(null)}
            busy={busy}
          />

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
