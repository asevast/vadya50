"use client";

import { Button } from "@/components/ui/button";
import type { CongratulationFormData } from "@/lib/validations";
import { Pause, Play, Upload, Video, X } from "lucide-react";
import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

interface VideoTabProps {
  form: UseFormReturn<CongratulationFormData>;
}

export default function VideoTab({ form }: VideoTabProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [canRecord, setCanRecord] = useState(false);
  const [малыйЭкран, установитьМалыйЭкран] = useState(false);
  const [нужныНативныеКонтролы, установитьНативныеКонтролы] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setCanRecord(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia &&
        typeof MediaRecorder !== "undefined"
    );
  }, []);

  useEffect(() => {
    const запрос = window.matchMedia("(max-width: 480px)");
    const обработчик = () => установитьМалыйЭкран(запрос.matches);
    обработчик();
    запрос.addEventListener("change", обработчик);
    return () => запрос.removeEventListener("change", обработчик);
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    установитьНативныеКонтролы(isIOS);
  }, []);

  useEffect(() => {
    return () => {
      if (recordedUrlRef.current) {
        URL.revokeObjectURL(recordedUrlRef.current);
      }
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, []);

  const выбратьMimeType = () => {
    const варианты = [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm",
    ];
    for (const вариант of варианты) {
      if (MediaRecorder.isTypeSupported(вариант)) {
        return вариант;
      }
    }
    return "";
  };

  const loadVideoDuration = (url: string) =>
    new Promise<number>((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const value = Number.isFinite(video.duration) ? video.duration : 0;
        resolve(value);
      };
      video.onerror = () => resolve(0);
      video.src = url;
    });

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const units = ["KB", "MB", "GB", "TB"];
    let value = bytes / 1024;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    return `${value.toFixed(2)} ${units[unitIndex]}`;
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Пожалуйста, выберите видеофайл");
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setFileSizeBytes(file.size);
    form.setValue("media_file", file);

    loadVideoDuration(url).then((value) => {
      setDuration(value);
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearVideo = () => {
    setVideoUrl(null);
    setDuration(0);
    setFileSizeBytes(null);
    setIsPlaying(false);
    form.setValue("media_file", undefined);
    setRecordingError(null);
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
      recordedUrlRef.current = null;
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const начатьЗапись = async () => {
    try {
      setRecordingError(null);
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      const mimeType = выбратьMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const тип = mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type: тип });
        if (recordedUrlRef.current) {
          URL.revokeObjectURL(recordedUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        recordedUrlRef.current = url;
        setVideoUrl(url);
        setFileSizeBytes(blob.size);

        const имяФайла = тип.includes("mp4") ? "video.mp4" : "video.webm";
        const файл = new File([blob], имяФайла, { type: тип });
        form.setValue("media_file", файл);
        loadVideoDuration(url).then((value) => {
          setDuration(value);
        });

        if (streamRef.current) {
          for (const track of streamRef.current.getTracks()) {
            track.stop();
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setRecordingError(err instanceof Error ? err.message : "Ошибка записи");
      setIsRecording(false);
    }
  };

  const остановитьЗапись = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      {!videoUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? "border-gold bg-gold/10" : "border-gray-700 hover:border-gold/50"
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300 mb-2">Перетащите видеофайл сюда или нажмите для выбора</p>
          <p className="text-sm text-gray-500 mb-4">
            Поддерживаемые форматы: MP4, WebM (макс. 200MB)
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              data-testid="video-select"
            >
              Выбрать файл
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={isRecording ? остановитьЗапись : начатьЗапись}
              disabled={!canRecord}
              className="gap-2"
              data-testid="video-record"
              aria-label={isRecording ? "Остановить запись" : "Записать видео"}
            >
              <Video className="w-4 h-4" />
              {isRecording ? "Остановить запись" : "Записать видео"}
            </Button>
          </div>
          {!canRecord && (
            <p className="text-xs text-gray-500 mt-3">Запись видео недоступна в этом браузере.</p>
          )}
          {recordingError && <p className="text-sm text-red-400 mt-3">{recordingError}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            data-testid="video-file"
            onChange={onFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black/30">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full max-h-[300px] object-contain"
              data-testid="video-preview"
              controls={малыйЭкран || нужныНативныеКонтролы}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <track
                kind="captions"
                src="/captions/empty.vtt"
                srcLang="ru"
                label="Русские"
                default
              />
            </video>
            {!малыйЭкран && !нужныНативныеКонтролы && (
              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  className="rounded-full bg-black/70 hover:bg-black/80 text-gold shadow-lg shadow-black/40"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-gold" />
                  ) : (
                    <Play className="w-5 h-5 text-gold" />
                  )}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="rounded-full bg-black/70 hover:bg-black/80 text-gold border-gold/40 shadow-lg shadow-black/40"
                  onClick={clearVideo}
                  data-testid="video-delete"
                >
                  <X className="w-5 h-5 text-gold" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Длительность: {Math.floor(duration)} сек</span>
            <span>{fileSizeBytes ? formatBytes(fileSizeBytes) : "—"}</span>
          </div>
        </div>
      )}

      {form.formState.errors.media_file && (
        <p className="text-sm text-red-400">{form.formState.errors.media_file.message}</p>
      )}
    </div>
  );
}
