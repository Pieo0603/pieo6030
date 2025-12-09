import React, { useState, useEffect } from 'react';
import { TimeLeft, ThemeConfig } from '../types';

interface CountdownProps {
  targetDate: Date;
  theme: ThemeConfig;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, theme }) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +targetDate - +new Date();
    let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center w-full">
      <div className={`hover-shine w-full aspect-square max-w-[100px] md:max-w-[120px] glass-panel rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-bold ${theme.text} shadow-lg ${theme.shadow} mb-2 transition-all duration-500 border border-white/10`}>
        {value < 10 ? `0${value}` : value}
      </div>
      <span className="text-xs md:text-sm uppercase tracking-widest text-gray-400 font-bold">{label}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-10 w-full max-w-3xl mx-auto justify-items-center">
      <TimeBox value={timeLeft.days} label="Ngày" />
      <TimeBox value={timeLeft.hours} label="Giờ" />
      <TimeBox value={timeLeft.minutes} label="Phút" />
      <TimeBox value={timeLeft.seconds} label="Giây" />
    </div>
  );
};

export default Countdown;