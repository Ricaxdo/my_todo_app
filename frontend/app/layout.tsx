import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";

import { RouteLoadingOverlay } from "@/components/navigation/RouteLoadingOverlay";
import { AuthProvider } from "@/state/auth/auth-context";
import { NavigationProvider } from "@/state/navigation/navigation-context";
import { WorkspaceProvider } from "@/state/workspaces/workspace-context";

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
    <html lang="en" className="root">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <NavigationProvider>
          <AuthProvider>
            <RouteLoadingOverlay />
            <WorkspaceProvider>{children}</WorkspaceProvider>
          </AuthProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
