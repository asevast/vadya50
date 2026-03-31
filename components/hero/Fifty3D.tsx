"use client";

import { Center, Text3D } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Group, Mesh } from "three";

function Пятьдесят({
  безАнимации,
  размер,
  высота,
  толщинаФаски,
  размерФаски,
}: {
  безАнимации: boolean;
  размер: number;
  высота: number;
  толщинаФаски: number;
  размерФаски: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && !безАнимации) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.geometry.computeBoundingBox();
    meshRef.current.geometry.center();
  }, []);

  return (
    <Center>
      <group ref={groupRef}>
        <Text3D
          ref={meshRef}
          font="/fonts/helvetiker_bold.typeface.json"
          size={размер}
          height={высота}
          bevelEnabled
          bevelThickness={толщинаФаски}
          bevelSize={размерФаски}
          bevelSegments={6}
          curveSegments={24}
        >
          50
          <meshStandardMaterial
            color="#FFE8B0"
            metalness={0.9}
            roughness={0.2}
            emissive="#2a1f0a"
            emissiveIntensity={0.35}
          />
        </Text3D>
      </group>
    </Center>
  );
}

export default function Fifty3DComponent() {
  const [поддержкаWebGL, установитьПоддержкуWebGL] = useState(true);
  const [уменьшенноеДвижение, установитьУменьшенноеДвижение] = useState(false);
  const [низкийFPS, установитьНизкийFPS] = useState(false);
  const [lowPowerDevice, setLowPowerDevice] = useState(false);
  const [dpr, установитьDpr] = useState<[number, number]>([1, 1.5]);
  const [малыйЭкран, установитьМалыйЭкран] = useState(false);
  const [вкладкаСкрыта, установитьВкладкуСкрытой] = useState(false);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const доступенWebGL =
      !!window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    установитьПоддержкуWebGL(!!доступенWebGL);

    const медиаЗапрос = window.matchMedia("(prefers-reduced-motion: reduce)");
    const медиаЗапросЭкрана = window.matchMedia("(max-width: 360px)");
    const обработчикДвижения = () => установитьУменьшенноеДвижение(медиаЗапрос.matches);
    const обработчикЭкрана = () => установитьМалыйЭкран(медиаЗапросЭкрана.matches);
    обработчикДвижения();
    обработчикЭкрана();
    медиаЗапрос.addEventListener("change", обработчикДвижения);
    медиаЗапросЭкрана.addEventListener("change", обработчикЭкрана);

    const коэффициент = Math.min(1.5, window.devicePixelRatio || 1);
    установитьDpr([1, коэффициент]);

    const deviceMemory =
      typeof navigator !== "undefined" && "deviceMemory" in navigator
        ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory
        : undefined;
    const lowPower =
      typeof navigator !== "undefined" &&
      ((deviceMemory !== undefined && deviceMemory <= 2) ||
        ("hardwareConcurrency" in navigator && navigator.hardwareConcurrency <= 4));
    setLowPowerDevice(lowPower);

    const обработчикВкладки = () => {
      установитьВкладкуСкрытой(document.visibilityState !== "visible");
    };
    обработчикВкладки();
    document.addEventListener("visibilitychange", обработчикВкладки);

    return () => {
      медиаЗапрос.removeEventListener("change", обработчикДвижения);
      медиаЗапросЭкрана.removeEventListener("change", обработчикЭкрана);
      document.removeEventListener("visibilitychange", обработчикВкладки);
    };
  }, []);

  useEffect(() => {
    if (!lowPowerDevice) return;
    let кадры = 0;
    let id: number | null = null;
    const начало = performance.now();

    const измерить = (время: number) => {
      кадры += 1;
      const прошло = время - начало;
      if (прошло >= 1500) {
        const fps = (кадры * 1000) / прошло;
        if (fps < 24) {
          установитьНизкийFPS(true);
        }
        return;
      }
      id = requestAnimationFrame(измерить);
    };

    id = requestAnimationFrame(измерить);

    return () => {
      if (id !== null) {
        cancelAnimationFrame(id);
      }
    };
  }, [lowPowerDevice]);

  const безДвижения = уменьшенноеДвижение || малыйЭкран || вкладкаСкрыта;
  const нуженСтатичный = !поддержкаWebGL || уменьшенноеДвижение || (lowPowerDevice && низкийFPS);
  const размерТекста = малыйЭкран ? 1.6 : 2.2;
  const высотаТекста = малыйЭкран ? 0.3 : 0.4;
  const толщинаФаски = малыйЭкран ? 0.045 : 0.06;
  const размерФаски = малыйЭкран ? 0.02 : 0.03;
  const масштаб = малыйЭкран ? 0.7 : 0.85;

  if (нуженСтатичный) {
    return (
      <div className="h-[360px] sm:h-[420px] md:h-[480px] lg:h-[520px] w-full rounded-2xl overflow-hidden bg-transparent flex items-center justify-center hero-50">
        <div
          className="font-display text-[7.5rem] sm:text-[9rem] md:text-[12rem] lg:text-[14rem] text-gold"
          style={{
            color: "#FFE8B0",
            textShadow:
              "0 6px 18px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)",
          }}
        >
          50
        </div>
      </div>
    );
  }

  return (
    <div className="h-[360px] sm:h-[420px] md:h-[480px] lg:h-[520px] w-full rounded-2xl overflow-hidden bg-transparent relative hero-50">
      <Canvas
        data-testid="fifty3d-canvas"
        dpr={dpr}
        camera={{ position: [0, 0, 10], fov: 30, near: 0.1, far: 50 }}
        gl={{ antialias: !малыйЭкран, powerPreference: "low-power", alpha: true }}
        frameloop={безДвижения ? "demand" : "always"}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 6, 4]} intensity={1.2} />
        <directionalLight position={[-4, -2, 2]} intensity={0.6} />
        <Suspense fallback={null}>
          <group position={[0, 0, 0]} scale={[масштаб, масштаб, масштаб]}>
            <Пятьдесят
              безАнимации={безДвижения}
              размер={размерТекста}
              высота={высотаТекста}
              толщинаФаски={толщинаФаски}
              размерФаски={размерФаски}
            />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
