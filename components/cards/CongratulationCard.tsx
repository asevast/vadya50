import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, MessageSquare, Mic, Video } from "lucide-react";
import Link from "next/link";

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

interface CardProps {
  data: Congratulations;
}

export default function CongratulationCard({ data }: CardProps) {
  const getTypeIcon = () => {
    switch (data.type) {
      case "audio":
        return <Mic className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (data.type) {
      case "audio":
        return "text-blue-400";
      case "video":
        return "text-purple-400";
      default:
        return "text-green-400";
    }
  };

  const messagePreview = data.message
    ? data.message.length > 150
      ? `${data.message.substring(0, 150)}...`
      : data.message
    : "Нет сообщения";

  return (
    <Card className="bg-black/30 border-gray-800 hover:border-gold/50 transition-all overflow-hidden group">
      {data.media_url && data.type === "video" ? (
        <div className="relative aspect-video">
          <video
            src={data.media_url}
            className="w-full h-full object-cover"
            muted
            tabIndex={0}
            onMouseOver={(e) => e.currentTarget.play()}
            onMouseOut={(e) => e.currentTarget.pause()}
            onFocus={(e) => e.currentTarget.play()}
            onBlur={(e) => e.currentTarget.pause()}
          />
          <div className="absolute top-2 right-2 bg-black/60 p-2 rounded-full">{getTypeIcon()}</div>
        </div>
      ) : data.media_url && data.type === "audio" ? (
        <div className="p-4 bg-black/40">
          {/* Placeholder for audio waveform */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gold rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Аудио-поздравление</span>
          </div>
        </div>
      ) : null}

      <CardContent className="p-4">
        <h3 className="font-display text-xl text-gold mb-2">{data.author_name}</h3>

        <p className="text-gray-300 text-sm leading-relaxed mb-4">{messagePreview}</p>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{data.views_count}</span>
          </div>
          <div className={`flex items-center gap-1 ${getTypeColor()}`}>
            {getTypeIcon()}
            <span className="capitalize">{data.type}</span>
          </div>
        </div>

        <Link href={`/congratulations/${data.slug}`}>
          <Button variant="ghost" className="w-full mt-4 text-gold hover:bg-gold/10">
            Просмотреть
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
