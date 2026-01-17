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
  title: "Leadership Presence Tracker",
  description: "Leadership isn't about being perfect. It's about being present.",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Leadership Tracker",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    title: "Leadership Presence Tracker",
    description: "Leadership isn't about being perfect. It's about being present.",
    url: "https://cascadia-tracker.vercel.app",
    siteName: "Leadership Presence Tracker",
    type: "website",
    images: [
      {
        url: "https://cascadia-tracker.vercel.app/icon-512.png",
        width: 512,
        height: 512,
        alt: "Leadership Presence Tracker Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Leadership Presence Tracker",
    description: "Leadership isn't about being perfect. It's about being present.",
    images: ["https://cascadia-tracker.vercel.app/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cascadia" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
