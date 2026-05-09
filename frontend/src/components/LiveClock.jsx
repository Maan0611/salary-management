import React, { useState, useEffect } from "react";

export default function LiveClock({ className, containerClass }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={className || "flex flex-col items-center"}>
      <div className={containerClass || "bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-xl flex flex-col items-center justify-center text-center relative"}>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center leading-none">
            <h2 className="text-4xl font-black text-white drop-shadow-md">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </h2>
            <h2 className="text-3xl font-black text-white drop-shadow-sm mt-1">
              {currentTime.getHours() >= 12 ? 'PM' : 'AM'}
            </h2>
          </div>
          <span className="text-xl font-black text-white/30 absolute right-6 top-1/2 -translate-y-1/2">
            {currentTime.toLocaleTimeString('en-US', { second: '2-digit' })}
          </span>
        </div>
        <div className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/60">
          {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
