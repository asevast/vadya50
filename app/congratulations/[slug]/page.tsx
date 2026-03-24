import AudioPlayer from "@/components/shared/AudioPlayer";
import ShareActions from "@/components/shared/ShareActions";
import VideoPlayer from "@/components/shared/VideoPlayer";
import ViewCounterBeacon from "@/components/shared/ViewCounterBeacon";
import { Card, CardContent } from "@/components/ui/card";
import { получитьSupabaseAdmin } from "@/lib/supabase/server";
import { Calendar, User } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabaseAdmin = получитьSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("congratulations")
    .select("author_name, type, message")
    .eq("slug", slug)
    .eq("is_approved", true)
    .single();

  if (!data) {
    return {
      title: "Поздравление не найдено",
    };
  }

  return {
    title: `Поздравление от ${data.author_name}`,
    description: data.message || "Поздравление с 50-летием",
    openGraph: {
      title: `Поздравление от ${data.author_name}`,
      description: data.message || "Посмотрите это поздравление!",
      type: "website",
    },
  };
}

export default async function CongratulationsPage({ params }: PageProps) {
  const { slug } = await params;

  const supabaseAdmin = получитьSupabaseAdmin();
  const { data: congratulation, error } = await supabaseAdmin
    .from("congratulations")
    .select("*")
    .eq("slug", slug)
    .eq("is_approved", true)
    .single();

  if (error || !congratulation) {
    notFound();
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/congratulations/${slug}`;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-background-primary border-gold/30">
          <CardContent className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-gold mb-4">
                <User className="w-5 h-5" />
                <span className="font-medium">{congratulation.author_name}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(congratulation.created_at).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="mx-2">•</span>
                <span>{congratulation.views_count} просмотров</span>
              </div>
            </div>

            {/* Content based on type */}
            {congratulation.type === "text" && (
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {congratulation.message}
                </p>
              </div>
            )}

            {congratulation.type === "audio" && congratulation.media_url && (
              <div className="space-y-4">
                <AudioPlayer
                  src={congratulation.media_url}
                  duration={congratulation.duration_sec}
                />
              </div>
            )}

            {congratulation.type === "video" && congratulation.media_url && (
              <div className="space-y-4">
                <VideoPlayer
                  src={congratulation.media_url}
                  poster={congratulation.thumbnail_url || undefined}
                />
              </div>
            )}

            {/* Share section */}
            <ShareActions shareUrl={shareUrl} />
          </CardContent>
        </Card>
      </div>
      <ViewCounterBeacon slug={slug} />
    </div>
  );
}
