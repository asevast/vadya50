"use client";

import SuccessModal from "@/components/shared/SuccessModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCongratulation from "@/hooks/useCongratulation";
import { type CongratulationFormData, congratulationSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import AudioTab from "./AudioTab";
import TextTab from "./TextTab";
import VideoTab from "./VideoTab";

export default function CongratulationForm() {
  const [activeTab, setActiveTab] = useState<string>("text");
  const { submitCongratulation, isLoading, error, slug, shareUrl } = useCongratulation();
  const [submitResult, setSubmitResult] = useState<{ slug: string; shareUrl: string } | null>(null);

  const form = useForm<CongratulationFormData>({
    resolver: zodResolver(congratulationSchema),
    defaultValues: {
      author_name: "",
      type: "text",
      message: "",
      media_file: undefined,
    },
  });

  // Update form type when tab changes
  useEffect(() => {
    form.setValue("type", activeTab as "text" | "audio" | "video");
  }, [activeTab, form]);

  const onSubmit = async (data: CongratulationFormData) => {
    const result = await submitCongratulation(data);
    if (result.success && result.slug && result.shareUrl) {
      setSubmitResult({ slug: result.slug, shareUrl: result.shareUrl });
    }
  };

  // Watch the type to update the form type value
  const watchType = form.watch("type");

  return (
    <div
      id="congratulation-form"
      className="max-w-2xl mx-auto glass-card p-8 rounded-2xl space-y-6"
    >
      <h2 className="text-3xl font-display text-gold text-center mb-6 объемный-текст">
        Вадя принимает
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/30">
          <TabsTrigger value="text">Текст</TabsTrigger>
          <TabsTrigger value="audio">Аудио</TabsTrigger>
          <TabsTrigger value="video">Видео</TabsTrigger>
        </TabsList>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Author name - common for all types */}
          <div>
            <label htmlFor="author_name" className="block text-sm font-medium mb-2">
              Ваше имя *
            </label>
            <input
              {...form.register("author_name")}
              id="author_name"
              className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Введите ваше имя"
            />
            {form.formState.errors.author_name && (
              <p className="mt-1 text-sm text-red-400">
                {form.formState.errors.author_name.message}
              </p>
            )}
          </div>

          <TabsContent value="text" className="space-y-4 mt-4">
            <TextTab form={form} />
          </TabsContent>

          <TabsContent value="audio" className="space-y-4 mt-4">
            <AudioTab form={form} />
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-4">
            <VideoTab form={form} />
          </TabsContent>

          {/* Submit and Clear buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex-1 bg-gold text-black hover:bg-yellow-400 text-lg py-6"
            >
              {form.formState.isSubmitting ? "Отправка..." : "Отправить"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              className="px-4"
              aria-label="Очистить"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </Tabs>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 mt-4">
          {error}
        </div>
      )}

      {/* Success Modal */}
      {submitResult && (
        <SuccessModal
          isOpen={!!submitResult}
          shareUrl={submitResult.shareUrl}
          onClose={() => setSubmitResult(null)}
        />
      )}
    </div>
  );
}
