"use client";

import { useEffect } from "react";

interface ViewCounterBeaconProps {
  slug: string;
}

export default function ViewCounterBeacon({ slug }: ViewCounterBeaconProps) {
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/congratulations/${slug}/view`, {
      method: "POST",
      signal: controller.signal,
    }).catch(() => {});
    return () => controller.abort();
  }, [slug]);

  return null;
}
