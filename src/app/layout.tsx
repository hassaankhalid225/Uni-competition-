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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#16181d" },
  ],
};

// Runs before first paint: applies the saved theme (or the system's) so the page never flashes
// the wrong colours. Kept tiny and dependency-free on purpose.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("cc-theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

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
