import React, { useState, useEffect } from "react";

export default function LiveClock({ className, containerClass }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={className || "hidden md:flex flex-col items-end gap-3 text-right"}>
      <div className={containerClass || "bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-inner"}>
        <div className="text-4xl font-black tracking-tighter mb-1">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <span className="text-xl opacity-60 ml-1 font-bold">{currentTime.toLocaleTimeString([], { second: '2-digit' })}</span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">
          {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
