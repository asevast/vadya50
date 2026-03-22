"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
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

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Particles background */}
      <div className="absolute inset-0">
        <ФоноваяКарусель />
        <ParticlesBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left column: Text and CTA */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-6xl md:text-8xl font-display mb-6 text-gold объемный-текст">
            Вадя принимает поздравления
          </h1>

          {/* Countdown */}
          <div className="mb-8 flex flex-wrap items-end gap-4">
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
          <Fifty3DComponent />
        </motion.div>
      </div>
    </section>
  );
}
