import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export const ISTClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date in IST
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  };

  const formattedDate = time.toLocaleDateString('en-IN', dateOptions);
  const formattedTime = time.toLocaleTimeString('en-IN', timeOptions);

  return (
    <div className="flex items-center gap-3 bg-doctus-yellow/15 dark:bg-neutral-800/80 border border-doctus-yellow/30 px-3.5 py-1.5 rounded-xl shadow-xs">
      <div className="flex items-center gap-1.5 text-doctus-red font-bold text-xs">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>IST</span>
      </div>
      <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700"></div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-extrabold tracking-wider font-mono text-neutral-900 dark:text-neutral-100">
          {formattedTime}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium hidden sm:inline-block">
          ({formattedDate})
        </span>
      </div>
    </div>
  );
};
