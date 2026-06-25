import { useState, useEffect } from "react";

const initialStations = [
  { id: 1, name: "Station Alpha", location: "Fremont, CA", status: "available", battery: 100, speed: 0, timeLeft: 0 },
  { id: 2, name: "Station Beta", location: "San Jose, CA", status: "charging", battery: 67, speed: 150, timeLeft: 24 },
  { id: 3, name: "Station Gamma", location: "Oakland, CA", status: "charging", battery: 43, speed: 250, timeLeft: 41 },
  { id: 4, name: "Station Delta", location: "Palo Alto, CA", status: "offline", battery: 0, speed: 0, timeLeft: 0 },
  { id: 5, name: "Station Epsilon", location: "Sunnyvale, CA", status: "available", battery: 100, speed: 0, timeLeft: 0 },
  { id: 6, name: "Station Zeta", location: "Mountain View, CA", status: "charging", battery: 82, speed: 100, timeLeft: 12 },
];

const statusStyles = {
  available: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  charging: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  offline: "text-zinc-500 bg-zinc-500/10 border-zinc-500/30",
};

const batteryStyles = {
  available: "bg-gradient-to-r from-emerald-500 to-emerald-400",
  charging: "bg-gradient-to-r from-sky-500 to-emerald-400",
  offline: "bg-zinc-700",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function App() {
  const [filter, setFilter] = useState("all");
  const [stations, setStations] = useState(initialStations);
  const [time, setTime] = useState(new Date());
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 200);
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => prev.map(s => {
        if (s.status !== "charging") return s;
        const newBattery = Math.min(100, s.battery + 0.3);
        const newTimeLeft = Math.max(0, s.timeLeft - 0.05);
        const done = newBattery >= 100;
        return {
          ...s,
          battery: Math.round(newBattery * 10) / 10,
          timeLeft: Math.round(newTimeLeft * 10) / 10,
          status: done ? "available" : "charging",
          speed: done ? 0 : s.speed,
        };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleStation = (id) => {
    setStations(prev => prev.map(s => {
      if (s.id !== id || s.status === "offline") return s;
      if (s.status === "available") {
        return { ...s, status: "charging", speed: 150, timeLeft: Math.round((100 - s.battery) / 150 * 60) };
      }
      return { ...s, status: "available", speed: 0, timeLeft: 0 };
    }));
  };

  const filtered = filter === "all" ? stations : stations.filter(s => s.status === filter);
  const charging = stations.filter(s => s.status === "charging").length;
  const available = stations.filter(s => s.status === "available").length;
  const offline = stations.filter(s => s.status === "offline").length;
  const totalEnergy = stations.reduce((sum, s) => sum + (s.status === "charging" ? s.speed : 0), 0);

  return (
    <div className="min-h-screen bg-[#080c0a] text-white font-sans">

      {/* Top Bar */}
      <div className="border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-gray-400 tracking-widest uppercase">Bay Area EV Network</span>
        </div>
        <span className="text-sm text-gray-500 font-mono">{time.toLocaleTimeString()}</span>
      </div>

      <div className="px-8 py-10 max-w-7xl mx-auto">

        {/* Greeting */}
        <div className="mb-10">
          <p className="text-emerald-400 text-sm font-medium tracking-wide mb-1">
            {getGreeting()}, Thel 👋
          </p>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Charging Network
            <span className="text-emerald-400"> Dashboard</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Monitor and control all stations in real time. Click any card to start or stop charging.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Stations", value: stations.length, color: "text-white" },
            { label: "Charging Now", value: charging, color: "text-sky-400" },
            { label: "Available", value: available, color: "text-emerald-400" },
            { label: "Energy Output", value: `${totalEnergy} kW`, color: "text-emerald-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/3 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-8">
          {["all", "available", "charging", "offline"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium capitalize border transition-all duration-200 ${
                filter === f
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                  : "bg-transparent border-white/10 text-gray-400 hover:border-white/25 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((station, index) => (
            <div
              key={station.id}
              onClick={() => toggleStation(station.id)}
              style={{ transitionDelay: `${index * 60}ms` }}
              className={`
                group rounded-2xl p-6 border transition-all duration-300 cursor-pointer
                ${station.status === "offline"
                  ? "bg-white/2 border-white/5 opacity-40 cursor-not-allowed"
                  : "bg-white/3 border-white/8 hover:bg-white/5 hover:border-emerald-500/20 hover:shadow-[0_0_30px_rgba(52,211,153,0.05)]"
                }
                ${station.status === "charging"
                  ? "shadow-[0_0_25px_rgba(56,189,248,0.06)]"
                  : ""
                }
                ${animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
              `}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-white text-base group-hover:text-emerald-300 transition-colors">
                    {station.name}
                  </h3>
                  <p className="text-gray-600 text-xs mt-0.5">📍 {station.location}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex items-center gap-1.5 ${statusStyles[station.status]}`}>
                    {station.status === "charging" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    )}
                    {station.status}
                  </span>
                  {station.status !== "offline" && (
                    <span className="text-[10px] text-gray-700 group-hover:text-gray-500 transition-colors">
                      {station.status === "charging" ? "tap to stop" : "tap to charge"}
                    </span>
                  )}
                </div>
              </div>

              {/* Battery */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Battery</span>
                  <span className={station.status === "charging" ? "text-emerald-400" : "text-gray-400"}>
                    {station.battery}%
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-1000 ${batteryStyles[station.status]}`}
                    style={{ width: animated ? `${station.battery}%` : "0%" }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-gray-600 text-xs mb-1">Speed</p>
                  <p className="text-white text-sm font-semibold">
                    {station.speed > 0 ? `${station.speed} kW` : "—"}
                  </p>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-gray-600 text-xs mb-1">Time Left</p>
                  <p className="text-white text-sm font-semibold">
                    {station.timeLeft > 0 ? `${Math.round(station.timeLeft)} min` : "—"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-gray-700 text-xs">Built by Thel Theint Theint Sen</p>
          <p className="text-gray-700 text-xs">⚡ Powered by clean energy</p>
        </div>

      </div>
    </div>
  );
}