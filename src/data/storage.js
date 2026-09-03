// LocalStorage helper utilities
import { toDateStr } from "../utils/dateUtils";

const STORAGE_KEYS = {
  FOLLOWERS: "buse_followers",
  GOAL: "buse_goal",
  GOAL_HISTORY: "buse_goal_history",
  IDEAS: "buse_ideas",
  POSTS: "buse_posts",
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  /* ---------------- Followers ---------------- */

  getFollowers() {
    return this.get(STORAGE_KEYS.FOLLOWERS) || [];
  },

  addFollower(count, dateStr) {
    const followers = this.getFollowers();
    const date = dateStr || toDateStr(new Date());
    const existing = followers.findIndex((f) => f.date === date);
    if (existing >= 0) {
      followers[existing].count = Number(count);
    } else {
      followers.push({ date, count: Number(count) });
    }
    followers.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.set(STORAGE_KEYS.FOLLOWERS, followers);
    return followers;
  },

  deleteFollower(date) {
    const followers = this.getFollowers().filter((f) => f.date !== date);
    this.set(STORAGE_KEYS.FOLLOWERS, followers);
    return followers;
  },

  /* ---------------- Goal ---------------- */

  getGoal() {
    return this.get(STORAGE_KEYS.GOAL);
  },

  setGoal(goal) {
    this.set(STORAGE_KEYS.GOAL, goal);
    return goal;
  },

  clearGoal() {
    this.remove(STORAGE_KEYS.GOAL);
    return null;
  },

  getGoalHistory() {
    return this.get(STORAGE_KEYS.GOAL_HISTORY) || [];
  },

  archiveGoal(goal, reachedCount) {
    const history = this.getGoalHistory();
    history.unshift({
      id: uid(),
      target: goal.target,
      startCount: goal.startCount,
      startDate: goal.startDate,
      reachedCount,
      reachedDate: toDateStr(new Date()),
    });
    this.set(STORAGE_KEYS.GOAL_HISTORY, history.slice(0, 20));
    return history;
  },

  /* ---------------- Idea bank ---------------- */

  getIdeas() {
    return this.get(STORAGE_KEYS.IDEAS) || [];
  },

  saveIdea(idea) {
    const ideas = this.getIdeas();
    if (idea.id) {
      const i = ideas.findIndex((x) => x.id === idea.id);
      if (i >= 0) ideas[i] = idea;
    } else {
      ideas.unshift({ ...idea, id: uid(), createdAt: toDateStr(new Date()) });
    }
    this.set(STORAGE_KEYS.IDEAS, ideas);
    return ideas;
  },

  deleteIdea(id) {
    const ideas = this.getIdeas().filter((x) => x.id !== id);
    this.set(STORAGE_KEYS.IDEAS, ideas);
    return ideas;
  },

  /* ---------------- Posts (best time heatmap) ---------------- */

  getPosts() {
    return this.get(STORAGE_KEYS.POSTS) || [];
  },

  savePost(post) {
    const posts = this.getPosts();
    posts.unshift({ ...post, id: uid() });
    this.set(STORAGE_KEYS.POSTS, posts);
    return posts;
  },

  deletePost(id) {
    const posts = this.getPosts().filter((p) => p.id !== id);
    this.set(STORAGE_KEYS.POSTS, posts);
    return posts;
  },
};

export { STORAGE_KEYS, uid };
export default storage;
