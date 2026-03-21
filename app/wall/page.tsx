"use client";

import CongratulationCard from "@/components/cards/CongratulationCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useRef, useState } from "react";

type CongratulationType = "all" | "text" | "audio" | "video";

interface Congratulations {
  id: string;
  slug: string;
  author_name: string;
  type: string;
  message: string | null;
  media_url: string | null;
  views_count: number;
  created_at: string;
}

export default function WallPage() {
  const [items, setItems] = useState<Congratulations[]>([]);
  const [filter, setFilter] = useState<CongratulationType>("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback(
    async (pageNum: number, type: CongratulationType, reset = false) => {
      setIsLoading(true);
      try {
        let url = `/api/congratulations?page=${pageNum}&limit=12`;
        if (type !== "all") {
          url += `&type=${type}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          const newItems = data.congratulations || data;
          setItems((prev) => (reset ? newItems : [...prev, ...newItems]));
          setHasMore(newItems.length === 12);
        } else {
          console.error("Failed to fetch:", data);
        }
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setItems([]);
    setPage(0);
    fetchItems(0, filter, true);
  }, [filter, fetchItems]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchItems(nextPage, filter);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading, page, filter, fetchItems]);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-display text-gold text-center mb-4">Стена поздравлений</h1>
        <p className="text-gray-400 text-center mb-12">
          {items.length} {items.length === 1 ? "поздравление" : "поздравлений"}
        </p>

        {/* Filter tabs */}
        <div className="mb-8">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as CongratulationType)}>
            <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto bg-black/30">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="text">Текст</TabsTrigger>
              <TabsTrigger value="audio">Аудио</TabsTrigger>
              <TabsTrigger value="video">Видео</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {items.map((item) => (
            <CongratulationCard key={item.id} data={item} />
          ))}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Загрузка...</p>
          </div>
        )}

        {/* No more content */}
        {!hasMore && items.length > 0 && (
          <div className="text-center py-8 text-gray-500">Все поздравления загружены</div>
        )}

        {/* Observer target */}
        <div ref={observerTarget} className="h-10" />
      </div>
    </div>
  );
}
