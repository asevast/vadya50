"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface AudioPlayerProps {
  src: string;
  duration?: number;
}

export default function AudioPlayer({ src, duration }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (containerRef.current && src) {
      const wavesurfer = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#4ADE80",
        progressColor: "#FFD700",
        cursorColor: "#FFD700",
        barWidth: 2,
        barHeight: 16,
        height: 60,
        normalize: true,
      });

      wavesurfer.load(src);

      wavesurfer.on("ready", () => {
        setIsPlaying(false);
      });

      wavesurfer.on("play", () => setIsPlaying(true));
      wavesurfer.on("pause", () => setIsPlaying(false));
      wavesurfer.on("finish", () => setIsPlaying(false));

      wavesurferRef.current = wavesurfer;

      return () => {
        wavesurfer.destroy();
      };
    }
  }, [src]);

  const togglePlayback = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="bg-black/30 rounded-lg p-4">
      <div ref={containerRef} className="mb-3" />
      <div className="flex items-center justify-between text-sm text-gray-300">
        <button
          type="button"
          onClick={togglePlayback}
          className="flex items-center gap-2 text-gold hover:text-yellow-400 transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? "Пауза" : "Воспроизвести"}
        </button>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          <span>{duration ? `${Math.floor(duration)} сек` : "..."}</span>
        </div>
      </div>
    </div>
  );
}
