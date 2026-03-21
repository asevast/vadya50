"use client";

import type { CongratulationFormData } from "@/lib/validations";
import { useState } from "react";

interface UseCongratulationReturn {
  isLoading: boolean;
  error: string | null;
  slug: string | null;
  shareUrl: string | null;
  submitCongratulation: (
    data: CongratulationFormData
  ) => Promise<{ success: boolean; slug?: string; shareUrl?: string; error?: string }>;
}

export default function useCongratulation(): UseCongratulationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const submitCongratulation = async (data: CongratulationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      if (data.type === "text") {
        formData.append("author_name", data.author_name);
        formData.append("type", "text");
        if (data.message) {
          formData.append("message", data.message);
        }
      } else if (data.type === "audio" || data.type === "video") {
        if (!data.media_file) {
          throw new Error("Медиафайл обязателен");
        }
        formData.append("author_name", data.author_name);
        formData.append("type", data.type);
        if (data.message) {
          formData.append("message", data.message);
        }
        formData.append("media_file", data.media_file);
      }

      const response = await fetch("/api/congratulations", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Ошибка при отправке поздравления");
      }

      setSlug(result.slug);
      setShareUrl(result.share_url);

      return { success: true, slug: result.slug, shareUrl: result.share_url };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    slug,
    shareUrl,
    submitCongratulation,
  };
}
