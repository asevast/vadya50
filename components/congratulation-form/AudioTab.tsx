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

export default function AudioTab({ form }: AudioTabProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
    form.setValue("media_file", blob as File);
    // For display purposes, we'll create a file-like object
    const file = new File([blob], "audio.webm", { type: "audio/webm" });
    form.setValue("media_file", file);
  };

  // Simple recording implementation without custom hook for now
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setRecordingError(null);
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        handleMediaRecorded(blob, url);
        for (const track of stream.getTracks()) {
          track.stop();
        }
      };

      mediaRecorder.start();
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
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className={`rounded-full w-16 h-16 ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-gold text-black hover:bg-yellow-400"}`}
              >
                {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              <div className="text-sm text-gray-400">
                {isRecording ? "Запись..." : "Нажмите для записи"}
              </div>
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

        {recordingError && <p className="text-sm text-red-400">{recordingError}</p>}
      </div>
    </div>
  );
}
