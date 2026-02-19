import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, Users, Plus, X, ChevronDown } from "lucide-react";
import storage from "../data/storage";
import { filterFollowersByRange, formatDateShort } from "../utils/dateUtils";

const TIME_RANGES = [
  { key: "1w", label: "Son 1 Hafta" },
  { key: "1m", label: "Son 1 Ay" },
  { key: "3m", label: "Son 3 Ay" },
  { key: "6m", label: "Son 6 Ay" },
  { key: "1y", label: "Son 1 Yıl" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-pink-100 px-4 py-3">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-base font-semibold text-pink-600">
          {Number(payload[0].value).toLocaleString("tr-TR")} takipçi
        </p>
      </div>
    );
  }
  return null;
};

const FollowerTracker = ({ followers, onAddFollower }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedRange, setSelectedRange] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue && !isNaN(inputValue)) {
      onAddFollower(Number(inputValue));
      setInputValue("");
    }
  };

  const chartData = useMemo(() => {
    return followers.map((f) => ({
      date: formatDateShort(f.date),
      count: f.count,
      fullDate: f.date,
    }));
  }, [followers]);

  const filteredData = useMemo(() => {
    if (!selectedRange) return [];
    return filterFollowersByRange(followers, selectedRange).map((f) => ({
      date: formatDateShort(f.date),
      count: f.count,
      fullDate: f.date,
    }));
  }, [followers, selectedRange]);

  const lastCount =
    followers.length > 0 ? followers[followers.length - 1].count : 0;
  const prevCount =
    followers.length > 1 ? followers[followers.length - 2].count : lastCount;
  const diff = lastCount - prevCount;
  const diffPercent = prevCount > 0 ? ((diff / prevCount) * 100).toFixed(1) : 0;

  return (
    <section className="px-4 py-4">
      {/* Stats Card */}
      {followers.length > 0 && (
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-4 mb-4 text-white shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-body">Mevcut Takipçi</p>
              <p className="text-3xl font-bold font-display">
                {lastCount.toLocaleString("tr-TR")}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${diff >= 0 ? "bg-white/20" : "bg-red-400/30"}`}
            >
              <TrendingUp size={12} className={diff < 0 ? "rotate-180" : ""} />
              <span>
                {diff >= 0 ? "+" : ""}
                {diff.toLocaleString("tr-TR")} ({diffPercent}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Users
              size={20}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-300"
            />
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Mevcut takipçi sayını gir..."
              className="w-full pl-10 pr-4 py-4 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-base font-body transition-all bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium text-base hover:shadow-card-hover active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Ekle</span>
          </button>
        </div>
      </form>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-pink-50 p-4 shadow-card mb-3">
          <h3 className="text-base font-semibold text-gray-700 font-body mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-pink-500" />
            Takipçi Grafiği
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorFollowers"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  fill="url(#colorFollowers)"
                  dot={{ fill: "#db2777", r: 3, strokeWidth: 0 }}
                  activeDot={{
                    r: 5,
                    fill: "#ec4899",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Time Range Buttons */}
      {followers.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TIME_RANGES.map((range) => (
            <button
              key={range.key}
              onClick={() => {
                setSelectedRange(range.key);
                setShowTable(true);
              }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium font-body transition-all ${
                selectedRange === range.key
                  ? "bg-pink-500 text-white shadow-card"
                  : "bg-pink-50 text-pink-600 hover:bg-pink-100"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}

      {/* Data Table Modal */}
      {showTable && selectedRange && (
        <div className="mt-3 bg-white rounded-2xl border border-pink-100 shadow-card overflow-hidden animate-slideUp">
          <div className="flex items-center justify-between p-3 border-b border-pink-50">
            <h4 className="text-base font-semibold text-gray-700 font-body">
              {TIME_RANGES.find((r) => r.key === selectedRange)?.label}
            </h4>
            <button
              onClick={() => setShowTable(false)}
              className="p-1 rounded-full hover:bg-pink-50 transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredData.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 bg-pink-50/80 backdrop-blur-sm">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-sm font-medium text-pink-600">
                      Tarih
                    </th>
                    <th className="text-right px-4 py-2.5 text-sm font-medium text-pink-600">
                      Takipçi
                    </th>
                    <th className="text-right px-4 py-2.5 text-sm font-medium text-pink-600">
                      Değişim
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => {
                    const prev =
                      idx > 0 ? filteredData[idx - 1].count : item.count;
                    const change = item.count - prev;
                    return (
                      <tr
                        key={item.fullDate}
                        className="border-b border-pink-50/50 hover:bg-pink-50/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.date}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium text-right">
                          {item.count.toLocaleString("tr-TR")}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-medium text-right ${change >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {change >= 0 ? "+" : ""}
                          {change.toLocaleString("tr-TR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-sm text-gray-400">
                Bu dönemde veri bulunmuyor
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default FollowerTracker;
