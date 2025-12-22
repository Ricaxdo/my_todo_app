import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";

import { RouteLoadingOverlay } from "@/components/RouteLoadingOverlay";
import { AuthProvider } from "@/features/auth/auth-context";
import { NavigationProvider } from "@/features/navigation/navigation-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StaiFocus",
  description: "A minimalist and efficient todo list",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <NavigationProvider>
          <AuthProvider>
            <RouteLoadingOverlay />
            {children}
          </AuthProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
