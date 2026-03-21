"use client";

import { useState } from "react";

interface ShareActionsProps {
  shareUrl: string;
}

export default function ShareActions({ shareUrl }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-800">
      <p className="text-sm text-gray-400 mb-2">Поделиться:</p>
      <div className="flex gap-2 flex-wrap">
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Посмотрите это поздравление!")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b3] transition-colors text-sm"
        >
          Telegram
        </a>
        <a
          href={`https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#4680C2] text-white rounded-lg hover:bg-[#3a6ba3] transition-colors text-sm"
        >
          VKontakte
        </a>
        <button
          type="button"
          onClick={copyToClipboard}
          className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
    </div>
  );
}
