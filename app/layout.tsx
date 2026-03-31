import type { Metadata } from "next";
import { Geist, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vadya 50 - Поздравление с 50-летием",
  description: "Интерактивное поздравление с юбилеем",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={cn("dark font-sans", geist.variable)}>
      <body className={`${geist.variable} ${playfair.variable} antialiased`}>
        <script
          // Добавляем класс, чтобы скрывать статичный hero после запуска JS
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js-ready');if(/iPad|iPhone|iPod/i.test(navigator.userAgent)){document.documentElement.classList.add('ios');}",
          }}
        />
        <script
          // Легкий счетчик для статичного hero, работает даже без React-гидрации
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var run=function(){var root=document.querySelector('[data-countdown-root]');if(!root){setTimeout(run,200);return;}var target=new Date('2026-04-02T10:00:00+03:00').getTime();var pad=function(n){return String(n).padStart(2,'0');};var tick=function(){var now=Date.now();var diff=target-now;if(diff<0){diff=0;}var days=Math.floor(diff/86400000);var hours=Math.floor(diff/3600000)%24;var minutes=Math.floor(diff/60000)%60;var seconds=Math.floor(diff/1000)%60;var ms=Math.floor((diff%1000)/10);var set=function(key,val){var el=root.querySelector('[data-countdown=\"'+key+'\"]');if(el){el.textContent=pad(val);} };set('days',days);set('hours',hours);set('minutes',minutes);set('seconds',seconds);set('ms',ms);};tick();setInterval(tick,50);};if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
