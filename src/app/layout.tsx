import type { ReactNode } from "react";
import { Crimson_Pro, DM_Sans, JetBrains_Mono, Cormorant } from "next/font/google";
import "./globals.css";

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const fontVariables = `${crimsonPro.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${cormorant.variable}`;

// Root layout only renders children - the locale layout handles <html> and <body>
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
