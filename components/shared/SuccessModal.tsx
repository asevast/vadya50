"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { confetti } from "tsparticles-confetti";

interface SuccessModalProps {
  isOpen: boolean;
  shareUrl: string;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, shareUrl, onClose }: SuccessModalProps) {
  const [статусСообщение, установитьСтатус] = useState<string | null>(null);

  const актуальнаяСсылка = useMemo(() => {
    if (typeof window === "undefined") return shareUrl;
    try {
      const исходная = new URL(shareUrl);
      const origin = window.location.origin;
      if (исходная.hostname === "localhost" || исходная.hostname === "127.0.0.1") {
        return `${origin}${исходная.pathname}`;
      }
      return shareUrl;
    } catch {
      return shareUrl;
    }
  }, [shareUrl]);
  const fireConfetti = useCallback(() => {
    const duration = 5 * 60;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#FFD700", "#00D4FF"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#FFD700", "#00D4FF"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fireConfetti();
    }
  }, [isOpen, fireConfetti]);

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(актуальнаяСсылка);
        установитьСтатус("Ссылка скопирована!");
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = актуальнаяСсылка;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      установитьСтатус(ok ? "Ссылка скопирована!" : "Не удалось скопировать ссылку");
    } catch (err) {
      console.error("Failed to copy:", err);
      установитьСтатус("Не удалось скопировать ссылку");
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Вадя принимает поздравления",
          text: "Посмотрите моё поздравление!",
          url: актуальнаяСсылка,
        });
        установитьСтатус("Готово! Выберите приложение для отправки.");
      } catch (err) {
        console.error("Share failed:", err);
        await copyToClipboard();
      }
    } else {
      await copyToClipboard();
      установитьСтатус(
        window.isSecureContext
          ? "Поделиться можно через копирование ссылки."
          : "Поделиться можно через копирование ссылки (нужен HTTPS для Web Share)."
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-background-primary border border-gold rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <h2 className="text-3xl font-display text-gold text-center mb-4">Ура! 🎉</h2>
            <p className="text-gray-300 text-center mb-6">
              Поздравление отправлено! Вот ваша персональная ссылка:
            </p>

            <div className="bg-black/30 p-4 rounded-lg mb-6 break-all text-center text-gold">
              <a className="underline" href={актуальнаяСсылка} target="_blank" rel="noreferrer">
                {актуальнаяСсылка}
              </a>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={copyToClipboard}
                className="flex-1 bg-gold text-black hover:bg-yellow-400"
              >
                <Copy className="w-5 h-5 mr-2" />
                Копировать
              </Button>
              <Button
                onClick={shareViaWebShare}
                variant="outline"
                className="flex-1 border-gold text-gold hover:bg-gold/10"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Поделиться
              </Button>
            </div>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full mt-4 text-gray-400 hover:text-white"
            >
              Закрыть
            </Button>

            {статусСообщение && (
              <p className="mt-3 text-center text-sm text-gray-400">{статусСообщение}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
