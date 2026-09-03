// Date utility helpers
import { DAYS_TR, DAYS_SHORT_TR, MONTHS_TR } from "../data/chatbotData";

// Local-time safe YYYY-MM-DD (toISOString shifts to UTC and breaks TR evenings)
export const toDateStr = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateShort = (date) => {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()].substring(0, 3)}`;
};

export const getDayName = (date) => DAYS_TR[new Date(date).getDay()];

export const getDayNameShort = (date) => DAYS_SHORT_TR[new Date(date).getDay()];

export const isSameDay = (d1, d2) => toDateStr(d1) === toDateStr(d2);

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const daysBetween = (a, b) => {
  const ms = new Date(toDateStr(b)) - new Date(toDateStr(a));
  return Math.round(ms / 86400000);
};

export const getWeekDates = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

export const RANGE_DAYS = { "1w": 7, "1m": 30, "3m": 90, "6m": 180, "1y": 365 };

export const filterFollowersByRange = (followers, range) => {
  if (range === "all") return followers;
  const startDate = addDays(new Date(), -(RANGE_DAYS[range] ?? 30));
  return followers.filter((f) => new Date(f.date) >= startDate);
};

// Compact number for axis labels: 12.4B / 1.2M
export const compactNumber = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}B`;
  return String(n);
};

export const trNumber = (n) => Number(n || 0).toLocaleString("tr-TR");
