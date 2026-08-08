import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { CSSProperties } from "react";
import { theme } from "@/config/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${theme.app.name} — Track. Improve. Transform.`,
  description:
    "LevelUP is a gamified gym member engagement platform that turns body composition assessments into a motivating, rewarding journey.",
};

export const viewport: Viewport = {
  themeColor: theme.colors.background,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Written onto <html> so every CSS variable in globals.css — and every
// Tailwind utility built on top of them (bg-primary, from-accent, ...) —
// resolves to config/theme.ts without touching CSS.
const themeVars = {
  "--background": theme.colors.background,
  "--foreground": theme.colors.foreground,
  "--primary": theme.colors.primary,
  "--accent": theme.colors.accent,
  "--success": theme.colors.success,
  "--warning": theme.colors.warning,
  "--danger": theme.colors.danger,
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={themeVars}
    >
      <body className="min-h-full flex flex-col bg-background">{children}</body>
    </html>
  );
}
