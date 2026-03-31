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
            __html: "document.documentElement.classList.add('js-ready');",
          }}
        />
        {children}
      </body>
    </html>
  );
}
