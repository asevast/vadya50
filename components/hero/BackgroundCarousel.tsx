"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type СлайдФона = {
  id: string;
  src: string;
  alt: string;
  x: number; // проценты
  y: number; // проценты
  width: number; // проценты
  height: number; // проценты
  rotate: number; // градусы
  scale: number;
  opacity: number;
  blur: number;
};

const ЗАПАСНЫЕ_СЛАЙДЫ: СлайдФона[] = [];

export default function ФоноваяКарусель() {
  const [слайды, установитьСлайды] = useState<СлайдФона[]>(ЗАПАСНЫЕ_СЛАЙДЫ);
  const [индекс, установитьИндекс] = useState(0);
  const [переход, установитьПереход] = useState(false);
  const предыдущийИндекс = useRef(0);

  useEffect(() => {
    let отменено = false;

    async function загрузить() {
      try {
        const ответ = await fetch("/api/admin/background-carousel");
        if (!ответ.ok) return;
        const данные = (await ответ.json()) as { slides?: СлайдФона[] };
        if (!отменено && данные.slides && данные.slides.length > 0) {
          установитьСлайды(данные.slides);
        }
      } catch {
        // молча используем запасной список
      }
    }

    загрузить();
    return () => {
      отменено = true;
    };
  }, []);

  useEffect(() => {
    if (слайды.length <= 1) return;
    const интервал = setInterval(() => {
      установитьПереход(true);
      установитьИндекс((текущий) => {
        предыдущийИндекс.current = текущий;
        return (текущий + 1) % слайды.length;
      });
      setTimeout(() => {
        установитьПереход(false);
      }, 2200);
    }, 9000);
    return () => clearInterval(интервал);
  }, [слайды.length]);

  const естьСлайды = слайды.length > 0;
  const текущийId = useMemo(
    () => (естьСлайды ? слайды[индекс].id : ""),
    [естьСлайды, индекс, слайды]
  );
  const предыдущийId = useMemo(
    () => (естьСлайды ? слайды[предыдущийИндекс.current]?.id : ""),
    [естьСлайды, слайды]
  );

  if (!естьСлайды) {
    return <div className="absolute inset-0" aria-hidden="true" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {слайды.map((слайд, i) => {
        const активен = i === индекс;
        const былАктивен = i === предыдущийИндекс.current;
        const стиль = {
          left: `${слайд.x}%`,
          top: `${слайд.y}%`,
          width: `${слайд.width}%`,
          height: `${слайд.height}%`,
          transform: `translate(-50%, -50%) rotate(${слайд.rotate}deg) scale(${слайд.scale})`,
          opacity: активен ? слайд.opacity : былАктивен && переход ? слайд.opacity : 0,
          filter: `blur(${слайд.blur}px)`,
        } as const;

        return (
          <div
            key={`${слайд.id}-${текущийId}-${предыдущийId}`}
            style={стиль}
            className="absolute rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-opacity duration-[2200ms] ease-in-out"
          >
            <img
              src={слайд.src}
              alt={слайд.alt}
              loading="lazy"
              className="w-full h-full object-contain rounded-2xl bg-black/30"
            />
          </div>
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/45" />
    </div>
  );
}
