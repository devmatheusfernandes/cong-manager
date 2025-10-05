import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Cong Manager - Gestão Congregacional Simplificada",
  description: "Um webapp PWA completo para organizar programações, designações e atividades semanais da sua congregação.",
  keywords: ["congregação", "gestão", "programação", "designações", "PWA"],
  authors: [{ name: "Cong Manager Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#4f46e5",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
