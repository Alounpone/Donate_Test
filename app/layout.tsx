import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Donate Laos - Live Stream Donation Platform",
  description:
    "Real-time Live Stream Donation platform for Lao streamers with BCEL One QR payments, OBS transparent overlays, instant audio chimes, and TTS alerts.",
  keywords: ["Donate Laos", "BCEL One", "Lao Streamer", "OBS Overlay", "Supabase", "Live Stream Donation Laos"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lo" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
