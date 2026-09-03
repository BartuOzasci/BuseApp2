/**
 * Tek veri katmanı.
 *
 * Supabase env değişkenleri tanımlıysa okuma/yazma buluta gider ve sonuç
 * ayrıca localStorage'a önbelleklenir (bağlantı koptuğunda son hali görünür).
 * Tanımlı değilse her şey eskisi gibi localStorage üzerinde çalışır.
 *
 * Her fonksiyon ilgili koleksiyonun GÜNCEL TAMAMINI döndürür; App tarafı
 * dönen değeri doğrudan state'e yazar.
 */
import { supabase, isRemote } from "../lib/supabase";
import storage, { uid } from "./storage";
import { toDateStr } from "../utils/dateUtils";

export { isRemote };

/* -------------------------------------------------------------------- */
/* satır <-> uygulama biçimi dönüşümleri                                 */
/* -------------------------------------------------------------------- */

const rowToGoal = (r) =>
  r ? { target: r.target, startCount: r.start_count, startDate: r.start_date } : null;

const goalToRow = (g) => ({
  id: 1,
  target: g.target,
  start_count: g.startCount,
  start_date: g.startDate,
});

const rowToHistory = (r) => ({
  id: r.id,
  target: r.target,
  startCount: r.start_count,
  startDate: r.start_date,
  reachedCount: r.reached_count,
  reachedDate: r.reached_date,
});

const rowToIdea = (r) => ({
  id: r.id,
  title: r.title,
  format: r.format,
  stage: r.stage,
  category: r.category ?? "",
  note: r.note ?? "",
  starred: Boolean(r.starred),
  createdAt: r.created_at,
});

const ideaToRow = (i) => ({
  id: i.id,
  title: i.title,
  format: i.format,
  stage: i.stage,
  category: i.category ?? "",
  note: i.note ?? "",
  starred: Boolean(i.starred),
  created_at: i.createdAt ?? toDateStr(new Date()),
});

const rowToPost = (r) => ({
  id: r.id,
  date: r.date,
  hour: r.hour,
  reach: r.reach,
});

/* -------------------------------------------------------------------- */
/* yardımcılar                                                           */
/* -------------------------------------------------------------------- */

const fail = (error) => {
  if (error) throw new Error(error.message || "Supabase isteği başarısız");
};

/** Buluttan gelen sonucu yerel önbelleğe yazar. */
const cache = {
  followers: (v) => storage.set("buse_followers", v),
  goal: (v) => (v ? storage.set("buse_goal", v) : storage.remove("buse_goal")),
  goalHistory: (v) => storage.set("buse_goal_history", v),
  ideas: (v) => storage.set("buse_ideas", v),
  posts: (v) => storage.set("buse_posts", v),
};

/* -------------------------------------------------------------------- */
/* okuma                                                                 */
/* -------------------------------------------------------------------- */

const fetchFollowers = async () => {
  const { data, error } = await supabase
    .from("followers")
    .select("date, count")
    .order("date", { ascending: true });
  fail(error);
  const list = (data ?? []).map((r) => ({ date: r.date, count: r.count }));
  cache.followers(list);
  return list;
};

const fetchGoal = async () => {
  const { data, error } = await supabase
    .from("goal")
    .select("target, start_count, start_date")
    .eq("id", 1)
    .maybeSingle();
  fail(error);
  const goal = rowToGoal(data);
  cache.goal(goal);
  return goal;
};

const fetchGoalHistory = async () => {
  const { data, error } = await supabase
    .from("goal_history")
    .select("*")
    .order("reached_date", { ascending: false });
  fail(error);
  const list = (data ?? []).map(rowToHistory);
  cache.goalHistory(list);
  return list;
};

const fetchIdeas = async () => {
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });
  fail(error);
  const list = (data ?? []).map(rowToIdea);
  cache.ideas(list);
  return list;
};

const fetchPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("date", { ascending: false });
  fail(error);
  const list = (data ?? []).map(rowToPost);
  cache.posts(list);
  return list;
};

/* -------------------------------------------------------------------- */
/* genel API                                                             */
/* -------------------------------------------------------------------- */

export const api = {
  isRemote,

  /** Yerel önbellek — bulut cevabı beklenirken ekranı doldurmak için. */
  readCache() {
    return {
      followers: storage.getFollowers(),
      goal: storage.getGoal(),
      goalHistory: storage.getGoalHistory(),
      ideas: storage.getIdeas(),
      posts: storage.getPosts(),
    };
  },

  async loadAll() {
    if (!isRemote) return this.readCache();

    const [followers, goal, goalHistory, ideas, posts] = await Promise.all([
      fetchFollowers(),
      fetchGoal(),
      fetchGoalHistory(),
      fetchIdeas(),
      fetchPosts(),
    ]);
    return { followers, goal, goalHistory, ideas, posts };
  },

  /* ---- takipçi ---- */

  async addFollower(count, dateStr) {
    const date = dateStr || toDateStr(new Date());
    if (!isRemote) return storage.addFollower(count, date);

    const { error } = await supabase
      .from("followers")
      .upsert({ date, count: Number(count) }, { onConflict: "date" });
    fail(error);
    return fetchFollowers();
  },

  async deleteFollower(date) {
    if (!isRemote) return storage.deleteFollower(date);

    const { error } = await supabase.from("followers").delete().eq("date", date);
    fail(error);
    return fetchFollowers();
  },

  /* ---- hedef ---- */

  async setGoal(goal) {
    if (!isRemote) return storage.setGoal(goal);

    const { error } = await supabase
      .from("goal")
      .upsert(goalToRow(goal), { onConflict: "id" });
    fail(error);
    return fetchGoal();
  },

  async clearGoal() {
    if (!isRemote) return storage.clearGoal();

    const { error } = await supabase.from("goal").delete().eq("id", 1);
    fail(error);
    cache.goal(null);
    return null;
  },

  async archiveGoal(goal, reachedCount) {
    if (!isRemote) {
      const history = storage.archiveGoal(goal, reachedCount);
      storage.clearGoal();
      return history;
    }

    const { error } = await supabase.from("goal_history").insert({
      id: uid(),
      target: goal.target,
      start_count: goal.startCount,
      start_date: goal.startDate,
      reached_count: reachedCount,
      reached_date: toDateStr(new Date()),
    });
    fail(error);

    const { error: delError } = await supabase.from("goal").delete().eq("id", 1);
    fail(delError);
    cache.goal(null);

    return fetchGoalHistory();
  },

  /* ---- fikirler ---- */

  async saveIdea(idea) {
    if (!isRemote) return storage.saveIdea(idea);

    const row = ideaToRow({ ...idea, id: idea.id || uid() });
    const { error } = await supabase.from("ideas").upsert(row, { onConflict: "id" });
    fail(error);
    return fetchIdeas();
  },

  async deleteIdea(id) {
    if (!isRemote) return storage.deleteIdea(id);

    const { error } = await supabase.from("ideas").delete().eq("id", id);
    fail(error);
    return fetchIdeas();
  },

  /* ---- gönderiler ---- */

  async savePost(post) {
    if (!isRemote) return storage.savePost(post);

    const { error } = await supabase.from("posts").insert({
      id: post.id || uid(),
      date: post.date,
      hour: Number(post.hour),
      reach: Number(post.reach),
    });
    fail(error);
    return fetchPosts();
  },

  async deletePost(id) {
    if (!isRemote) return storage.deletePost(id);

    const { error } = await supabase.from("posts").delete().eq("id", id);
    fail(error);
    return fetchPosts();
  },

  /* ---- yerel veriyi buluta taşıma ---- */

  /** Bulutta hiç kayıt yoksa true döner — taşıma teklifi bunun üzerine çıkar. */
  async isRemoteEmpty() {
    if (!isRemote) return false;
    const [f, i, p] = await Promise.all([
      supabase.from("followers").select("date", { count: "exact", head: true }),
      supabase.from("ideas").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
    ]);
    return (f.count ?? 0) === 0 && (i.count ?? 0) === 0 && (p.count ?? 0) === 0;
  },

  /** localStorage'daki her şeyi Supabase'e yükler ve yeni durumu döndürür. */
  async pushLocalToRemote() {
    if (!isRemote) throw new Error("Supabase yapılandırılmamış");

    const local = this.readCache();

    if (local.followers.length) {
      const { error } = await supabase
        .from("followers")
        .upsert(
          local.followers.map((f) => ({ date: f.date, count: Number(f.count) })),
          { onConflict: "date" },
        );
      fail(error);
    }

    if (local.goal) {
      const { error } = await supabase
        .from("goal")
        .upsert(goalToRow(local.goal), { onConflict: "id" });
      fail(error);
    }

    if (local.goalHistory.length) {
      const { error } = await supabase.from("goal_history").upsert(
        local.goalHistory.map((h) => ({
          id: h.id || uid(),
          target: h.target,
          start_count: h.startCount,
          start_date: h.startDate,
          reached_count: h.reachedCount,
          reached_date: h.reachedDate,
        })),
        { onConflict: "id" },
      );
      fail(error);
    }

    if (local.ideas.length) {
      const { error } = await supabase
        .from("ideas")
        .upsert(local.ideas.map((i) => ideaToRow({ ...i, id: i.id || uid() })), {
          onConflict: "id",
        });
      fail(error);
    }

    if (local.posts.length) {
      const { error } = await supabase.from("posts").upsert(
        local.posts.map((p) => ({
          id: p.id || uid(),
          date: p.date,
          hour: Number(p.hour),
          reach: Number(p.reach),
        })),
        { onConflict: "id" },
      );
      fail(error);
    }

    return this.loadAll();
  },

  /** Yedekleme için tüm veriyi tek nesne olarak verir. */
  exportAll() {
    return { ...this.readCache(), exportedAt: new Date().toISOString() };
  },
};

export default api;
