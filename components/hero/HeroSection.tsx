"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { Component, useEffect, useState } from "react";
import ФоноваяКарусель from "./BackgroundCarousel";
import Countdown from "./Countdown";
import ParticlesBackground from "./Particles";

const Fifty3DComponent = dynamic(() => import("./Fifty3D"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center">
      <div className="text-gold animate-pulse">Загрузка 3D...</div>
    </div>
  ),
});

export default function HeroSection() {
  // Target: April 2, 2026 10:00 GMT+3 (MSK)
  const targetDate = new Date("2026-04-02T10:00:00+03:00");
  const [безТяжелыхЭффектов, установитьБезТяжелыхЭффектов] = useState(false);
  const [этоIOS, установитьЭтоIOS] = useState(true);
  const [клиентГотов, установитьКлиентГотов] = useState(false);

  useEffect(() => {
    установитьКлиентГотов(true);
    const агент = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const ios = /iPad|iPhone|iPod/i.test(агент);
    const уменьшенноеДвижение =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const памятьУстройства =
      typeof navigator !== "undefined" && "deviceMemory" in navigator
        ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory
        : undefined;
    const слабоеУстройство =
      typeof navigator !== "undefined" &&
      ((памятьУстройства !== undefined && памятьУстройства <= 2) ||
        ("hardwareConcurrency" in navigator && navigator.hardwareConcurrency <= 4));

    установитьЭтоIOS(ios);

    if (ios || уменьшенноеДвижение || слабоеУстройство) {
      установитьБезТяжелыхЭффектов(true);
    }
  }, []);

  const показыватьДинамику = клиентГотов && !этоIOS;

  if (этоIOS) {
    return null;
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden hero-wrapper hero-dynamic">
      {/* Particles background */}
      <div className="absolute inset-0">
        <ФоноваяКарусель />
        {показыватьДинамику && !безТяжелыхЭффектов && <ParticlesBackground />}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center hero-grid">
        {/* Left column: Text and CTA */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display mb-4 sm:mb-6 text-gold объемный-текст leading-tight">
            Вадя принимает поздравления
          </h1>

          {/* Countdown */}
          <div className="mb-6 sm:mb-8 flex flex-wrap items-end gap-4">
            <Countdown targetDate={targetDate} />
            <span className="text-sm md:text-base text-gray-300 whitespace-nowrap self-end min-w-[8ch] text-right">
              до рождения
            </span>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="bg-gold text-black hover:bg-yellow-400 text-lg px-8 py-6"
            onClick={() => {
              document.getElementById("congratulation-form")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Поздравить
          </Button>
        </motion.div>

        {/* Right column: 3D figure */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          {показыватьДинамику ? (
            <ГраницаОшибки3D fallback={<Статичный50 />}>
              <Fifty3DComponent />
            </ГраницаОшибки3D>
          ) : (
            <Статичный50 />
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Статичный50() {
  return (
          <div className="h-[260px] sm:h-[320px] md:h-[360px] lg:h-[400px] w-full rounded-2xl overflow-hidden bg-transparent flex items-center justify-center hero-50">
      <div
        className="font-display text-[5.5rem] sm:text-[6.5rem] md:text-[8rem] lg:text-[9rem] text-gold"
        style={{
          color: "#FFE8B0",
          textShadow: "0 6px 18px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)",
        }}
      >
        50
      </div>
    </div>
  );
}

class ГраницаОшибки3D extends Component<
  { fallback: ReactNode; children: ReactNode },
  { естьОшибка: boolean }
> {
  state = { естьОшибка: false };

  static getDerivedStateFromError() {
    return { естьОшибка: true };
  }

  render() {
    if (this.state.естьОшибка) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
