'use client';

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalListeners } from "@/components/GlobalListeners";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    useGameStore.getState().initialize();
  }, []);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalListeners />
        {children}
      </body>
    </html>
  );
}
