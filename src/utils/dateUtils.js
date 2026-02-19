// Date utility helpers
import { DAYS_TR, DAYS_SHORT_TR, MONTHS_TR } from "../data/chatbotData";

export const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateShort = (date) => {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()].substring(0, 3)}`;
};

export const toDateStr = (date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

export const getDayName = (date) => {
  return DAYS_TR[new Date(date).getDay()];
};

export const getDayNameShort = (date) => {
  return DAYS_SHORT_TR[new Date(date).getDay()];
};

export const isSameDay = (d1, d2) => {
  return toDateStr(d1) === toDateStr(d2);
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const getWeekDates = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(monday, i));
  }
  return dates;
};

export const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, currentMonth: false });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), currentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), currentMonth: false });
  }

  return days;
};

export const filterFollowersByRange = (followers, range) => {
  const now = new Date();
  let startDate;

  switch (range) {
    case "1w":
      startDate = addDays(now, -7);
      break;
    case "1m":
      startDate = addDays(now, -30);
      break;
    case "3m":
      startDate = addDays(now, -90);
      break;
    case "6m":
      startDate = addDays(now, -180);
      break;
    case "1y":
      startDate = addDays(now, -365);
      break;
    default:
      startDate = addDays(now, -30);
  }

  return followers.filter((f) => new Date(f.date) >= startDate);
};
