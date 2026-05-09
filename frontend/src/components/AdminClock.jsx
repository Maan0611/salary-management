import React, { useState, useEffect } from "react";

export default function AdminClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center lg:items-end">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-1">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-lg leading-none">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </h1>
          <span className="text-xl md:text-2xl font-black text-white/40 self-end mb-1">
            {currentTime.toLocaleTimeString('en-US', { second: '2-digit' })}
          </span>
        </div>
        <div className="mt-4 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/70 drop-shadow-md">
          {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
