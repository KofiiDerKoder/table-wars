/**
 * TABLE WARS! - Root Layout
 * 
 * Provides the global layout structure, fonts, and initializes the application 
 * state store on mount. Also contains GlobalListeners for app-wide UI/input events.
 * 
 * Last Updated: May 13, 2026
 */

'use client';

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import "./globals.css";
import { GlobalListeners } from "@/components/GlobalListeners";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * RootLayout component that defines the overall structure of the application
 * @param children - The React nodes to be rendered within the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize the game store when the component mounts
  useEffect(() => {
    useGameStore.getState().initialize();
  }, []);

  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <GlobalListeners /> {/* Component for handling global event listeners */}
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
