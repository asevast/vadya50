import CountdownStatic from "./CountdownStatic";

export default function HeroStatic() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden hero-wrapper hero-static">
      <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center hero-grid">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display mb-4 sm:mb-6 text-gold объемный-текст leading-tight">
            Вадя принимает поздравления
          </h1>
          <div className="mb-6 sm:mb-8 flex flex-wrap items-end gap-4">
            <CountdownStatic />
            <span className="text-sm md:text-base text-gray-300 whitespace-nowrap self-end min-w-[8ch] text-right">
              до рождения
            </span>
          </div>
          <a
            href="#congratulation-form"
            className="inline-flex items-center justify-center rounded-lg bg-gold text-black hover:bg-yellow-400 text-lg px-8 py-6 font-medium transition-colors"
          >
            Поздравить
          </a>
        </div>
        <div className="flex justify-center">
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
        </div>
      </div>
    </section>
  );
}
