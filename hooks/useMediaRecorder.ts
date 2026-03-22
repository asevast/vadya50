"use client";

import { useCallback, useRef, useState } from "react";

type MediaType = "audio" | "video";

interface UseMediaRecorderReturn {
  isRecording: boolean;
  mediaBlob: Blob | null;
  mediaUrl: string | null;
  duration: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export default function useMediaRecorder(type: MediaType): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === "video",
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mimeType = type === "video" ? "video/webm;codecs=vp9" : "audio/webm";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setMediaBlob(blob);
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);

        if (streamRef.current) {
          for (const track of streamRef.current.getTracks()) {
            track.stop();
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setIsRecording(false);
    }
  }, [type]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const reset = useCallback(() => {
    setMediaBlob(null);
    setMediaUrl(null);
    setDuration(0);
    setError(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  return {
    isRecording,
    mediaBlob,
    mediaUrl,
    duration,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}
