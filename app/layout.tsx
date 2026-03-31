import type { Metadata } from "next";
import { Geist, Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
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
        <Script id="set-ios-flag" strategy="beforeInteractive">
          {`if (/iPad|iPhone|iPod/i.test(navigator.userAgent)) { document.documentElement.classList.add('ios'); }`}
        </Script>
        {children}
      </body>
    </html>
  );
}
