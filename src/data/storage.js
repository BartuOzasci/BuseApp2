// LocalStorage helper utilities
const STORAGE_KEYS = {
  FOLLOWERS: "buse_followers",
  TODOS: "buse_todos",
  CONTENT_CALENDAR: "buse_content_calendar",
};

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

  // Follower data
  getFollowers() {
    return this.get(STORAGE_KEYS.FOLLOWERS) || [];
  },

  addFollower(count) {
    const followers = this.getFollowers();
    const today = new Date().toISOString().split("T")[0];
    const existing = followers.findIndex((f) => f.date === today);
    if (existing >= 0) {
      followers[existing].count = count;
    } else {
      followers.push({ date: today, count: Number(count) });
    }
    followers.sort((a, b) => new Date(a.date) - new Date(b.date));
    this.set(STORAGE_KEYS.FOLLOWERS, followers);
    return followers;
  },

  // Todo data
  getTodos() {
    return this.get(STORAGE_KEYS.TODOS) || {};
  },

  setTodosForDate(dateStr, todos) {
    const allTodos = this.getTodos();
    allTodos[dateStr] = todos;
    this.set(STORAGE_KEYS.TODOS, allTodos);
    return allTodos;
  },

  // Content Calendar
  getContentCalendar() {
    return this.get(STORAGE_KEYS.CONTENT_CALENDAR) || {};
  },

  setContentForDate(dateStr, content) {
    const calendar = this.getContentCalendar();
    calendar[dateStr] = content;
    this.set(STORAGE_KEYS.CONTENT_CALENDAR, calendar);
    return calendar;
  },
};

export { STORAGE_KEYS };
export default storage;
