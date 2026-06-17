import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "DracinPlay - Streaming Drama, Anime & Manga Gratis",
  description: "Nonton drama China, Korea, Short Drama, Anime, Movie, dan Manga favorit kamu secara gratis. Kualitas HD, subtitle Indonesia.",
  keywords: "drama, anime, manga, streaming, gratis, subtitle indonesia",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0f',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-gray-100" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
        <Navbar />
        <main className="flex-1 pt-14 page-enter">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
