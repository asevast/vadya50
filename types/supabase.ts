export type Database = {
  public: {
    Tables: {
      congratulations: {
        Row: {
          id: string;
          slug: string;
          author_name: string;
          type: "text" | "audio" | "video";
          message: string | null;
          media_url: string | null;
          media_key: string | null;
          duration_sec: number | null;
          thumbnail_url: string | null;
          is_approved: boolean;
          views_count: number;
          created_at: string;
          updated_at?: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          author_name: string;
          type: "text" | "audio" | "video";
          message?: string | null;
          media_url?: string | null;
          media_key?: string | null;
          duration_sec?: number | null;
          thumbnail_url?: string | null;
          is_approved?: boolean;
          views_count?: number;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          slug?: string;
          author_name?: string;
          type?: "text" | "audio" | "video";
          message?: string | null;
          media_url?: string | null;
          media_key?: string | null;
          duration_sec?: number | null;
          thumbnail_url?: string | null;
          is_approved?: boolean;
          views_count?: number;
          updated_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
