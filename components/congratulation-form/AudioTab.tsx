"use client";

import { Button } from "@/components/ui/button";
import type { CongratulationFormData } from "@/lib/validations";
import { Mic, Pause, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import WaveSurfer from "wavesurfer.js";

interface AudioTabProps {
  form: UseFormReturn<CongratulationFormData>;
}

const getSupportedAudioMimeType = () => {
  const candidates = ["audio/mp4", "audio/aac", "audio/m4a", "audio/webm;codecs=opus", "audio/webm"];
  if (typeof MediaRecorder === "undefined") return "";
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return "";
};

const getAudioFileName = (mimeType: string) => {
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "audio.m4a";
  if (mimeType.includes("aac")) return "audio.aac";
  return "audio.webm";
};

export default function AudioTab({ form }: AudioTabProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize WaveSurfer when we have a URL
  useEffect(() => {
    if (waveformRef.current && audioUrl) {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }

      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#FFD700",
        progressColor: "#00D4FF",
        cursorColor: "#FFD700",
        barWidth: 2,
        barHeight: 20,
        height: 100,
        normalize: true,
      });

      wavesurfer.load(audioUrl);

      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration());
      });

      wavesurfer.on("play", () => setIsPlaying(true));
      wavesurfer.on("pause", () => setIsPlaying(false));
      wavesurfer.on("finish", () => setIsPlaying(false));

      wavesurferRef.current = wavesurfer;

      return () => {
        wavesurfer.destroy();
      };
    }
  }, [audioUrl]);

  const handleMediaRecorded = (blob: Blob, url: string) => {
    setAudioUrl(url);
    // For display purposes, we'll create a file-like object
    const mimeType = blob.type || "audio/webm";
    const fileName = getAudioFileName(mimeType);
    const file = new File([blob], fileName, { type: mimeType });
    form.setValue("media_file", file);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      alert("Пожалуйста, выберите аудиофайл");
      return;
    }
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    form.setValue("media_file", file);
  };

  // Simple recording implementation without custom hook for now
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canRecord = typeof MediaRecorder !== "undefined" && getSupportedAudioMimeType() !== "";

  const startRecording = async () => {
    try {
      setRecordingError(null);
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getSupportedAudioMimeType();
      if (!mimeType) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        setRecordingError("Запись аудио недоступна в этом браузере.");
        return;
      }
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        handleMediaRecorded(blob, url);
        for (const track of stream.getTracks()) {
          track.stop();
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      setRecordingError(err instanceof Error ? err.message : "Ошибка записи");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const clearAudio = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
    setAudioUrl(null);
    form.setValue("media_file", undefined);
    setIsPlaying(false);
    setDuration(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        {/* Waveform display */}
        <div ref={waveformRef} className="w-full h-24 bg-black/30 rounded-lg" />

        {/* Controls */}
        <div className="flex items-center gap-4">
          {!audioUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                data-testid="audio-select"
              >
                Загрузить файл
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                data-testid="audio-record"
                aria-label={isRecording ? "Остановить запись" : "Начать запись"}
                className={`rounded-full w-16 h-16 ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-gold text-black hover:bg-yellow-400"}`}
                disabled={!canRecord}
              >
                {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              <div className="text-sm text-gray-400">
                {isRecording ? "Запись..." : "Начать запись"}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                capture="user"
                data-testid="audio-file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="hidden"
              />
            </>
          ) : (
            <>
              <Button
                type="button"
                size="lg"
                onClick={togglePlayback}
                className="rounded-full w-16 h-16 bg-gold text-black hover:bg-yellow-400"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={clearAudio}
                data-testid="audio-delete"
                className="rounded-full"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Удалить запись"
                >
                  <title>Удалить запись</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
              <div className="text-sm text-gray-400">{Math.floor(duration)} сек</div>
            </>
          )}
        </div>

        {!canRecord && (
          <p className="text-sm text-gray-400">
            Запись в браузере недоступна, используйте “Загрузить файл” для записи через системный
            диктофон.
          </p>
        )}
        {recordingError && <p className="text-sm text-red-400">{recordingError}</p>}
      </div>
    </div>
  );
}
