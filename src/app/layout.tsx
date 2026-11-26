import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/fraunces";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Campus Connect: CS Department", template: "%s · Campus Connect" },
  description: "Clubs, discussions, official announcements and the event calendar for CS Department students.",
};

export const viewport: Viewport = {
  themeColor: "#f8f5f0",
};

// Runs before first paint: light by default for everyone (whatever the device setting);
// a visitor's own choice from the theme toggle is remembered and wins.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("cc-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
