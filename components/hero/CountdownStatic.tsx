"use client";

import { useEffect, useState } from "react";

type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  ms: string;
};

const targetTimestamp = Date.UTC(2026, 3, 2, 7, 0, 0);

const pad2 = (value: number) => (value < 10 ? `0${value}` : `${value}`);

const getParts = (): CountdownParts => {
  const now = Date.now();
  let diff = targetTimestamp - now;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const minutes = Math.floor(diff / 60000) % 60;
  const seconds = Math.floor(diff / 1000) % 60;
  const ms = Math.floor((diff % 1000) / 10);

  return {
    days: pad2(days),
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
    ms: pad2(ms),
  };
};

export default function CountdownStatic() {
  const [parts, setParts] = useState<CountdownParts>(() => getParts());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setParts(getParts());
    }, 200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 text-center items-baseline tabular-nums">
      <div className="flex flex-col">
        <span className="text-4xl font-bold text-gold inline-block w-[2ch] text-center">
          {parts.days}
        </span>
        <span className="text-sm text-gray-400">Дней</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-bold text-gold inline-block w-[2ch] text-center">
          {parts.hours}
        </span>
        <span className="text-sm text-gray-400">Часов</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-bold text-gold inline-block w-[2ch] text-center">
          {parts.minutes}
        </span>
        <span className="text-sm text-gray-400">Минут</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-bold text-gold inline-block w-[2ch] text-center">
          {parts.seconds}
        </span>
        <span className="text-sm text-gray-400">Секунд</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gold inline-block w-[2ch] text-center">
          {parts.ms}
        </span>
        <span className="text-xs text-gray-500">мс</span>
      </div>
    </div>
  );
}
