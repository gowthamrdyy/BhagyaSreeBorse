import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Experience the future of academic management. TimetableX v4.0 - Clarity, redefined.";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://timetablex.vercel.app"),
  title: "BhagyaSreeBorse",
  description,
  authors: [{ name: "BhagyaSreeBorse" }],
  keywords: ["Academic Management", "Student Portal", "BhagyaSreeBorse", "Education", "University", "NextJS"],
  openGraph: {
    title: "BhagyaSreeBorse",
    description,
    url: process.env.NEXT_PUBLIC_APP_URL || "https://timetablex.vercel.app",
    siteName: "BhagyaSreeBorse",
    images: [
      {
        url: "/Landing/BigScreen.png",
        width: 1200,
        height: 630,
        alt: "BhagyaSreeBorse",
        type: "image/png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BhagyaSreeBorse",
    description,
    images: ["/Landing/BigScreen.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/bhagyasree.png" />
        <link rel="icon" type="image/png" href="/bhagyasree.png" sizes="96x96" />
        <link rel="apple-touch-icon" href="/bhagyasree.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="google-site-verification" content="GQpqlnXojBcBG2VI5gZA-wYgHrpfUj6zht0ucq2-iGc" />
      </head>
      <body
        className={`${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
