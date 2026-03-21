"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: Date;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ms: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          ms: Math.floor((difference % 1000) / 10), // десятки мс
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 50); // 20 FPS
    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex gap-4 text-center items-baseline tabular-nums">
      <div className="flex flex-col">
        <span className="text-4xl font-bold text-gold inline-block w-[2ch] text-center">
          {formatNumber(timeLeft.days)}
        </span>
        <span className="text-sm text-gray-400">Дней</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-bold text-gold inline-block w-[2ch] text-center">
          {formatNumber(timeLeft.hours)}
        </span>
        <span className="text-sm text-gray-400">Часов</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-bold text-gold inline-block w-[2ch] text-center">
          {formatNumber(timeLeft.minutes)}
        </span>
        <span className="text-sm text-gray-400">Минут</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-bold text-gold inline-block w-[2ch] text-center">
          {formatNumber(timeLeft.seconds)}
        </span>
        <span className="text-sm text-gray-400">Секунд</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gold inline-block w-[2ch] text-center">
          {timeLeft.ms}
        </span>
        <span className="text-xs text-gray-500">мс</span>
      </div>
    </div>
  );
}
