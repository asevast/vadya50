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
      const type = data.type || "text";

      let response: Response;

      if (type === "text") {
        response = await fetch("/api/congratulations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author_name: data.author_name || "",
            type: "text",
            message: data.message || "",
          }),
        });
      } else {
        if (!data.media_file) {
          throw new Error("Медиафайл обязателен");
        }
        const formData = new FormData();
        formData.append("author_name", data.author_name || "");
        formData.append("type", type);
        if (data.message !== undefined) {
          formData.append("message", data.message);
        }
        formData.append("media_file", data.media_file);

        response = await fetch("/api/congratulations", {
          method: "POST",
          body: formData,
        });
      }

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
