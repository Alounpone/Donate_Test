"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Tv, LayoutDashboard, QrCode, Sparkles, ArrowRight, ShieldCheck, Volume2, Database, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [streamerSlug, setStreamerSlug] = useState("test");

  const currentSlug = streamerSlug.trim() || "test";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-amber-500/10 via-red-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-900/30">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
                DonateLaos Portal
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/30 text-red-300">
                🇱🇦 BCEL One Ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/donate/test"
              className="px-3.5 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <QrCode className="w-4 h-4" /> Donor (/donate/test)
            </Link>
            <Link
              href="/overlay/test"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Tv className="w-4 h-4" /> Overlay (/overlay/test)
            </Link>
            <Link
              href="/dashboard/test"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard (/dashboard/test)
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-12 text-center relative z-10 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium mb-6 mx-auto shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Real-time Live Stream Donations Portal in Laos</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
          Live Stream Donation Laos <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-amber-400 via-red-500 to-amber-200 bg-clip-text text-transparent">
            BCEL One & Live OBS Alerts Portal
          </span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Welcome to the live stream donation platform portal. Select a page below to view the donor submission form, transparent OBS alert overlay, or streamer management dashboard.
        </p>

        {/* Streamer Handle Input Box */}
        <div className="max-w-xl mx-auto w-full glass-panel p-6 rounded-2xl shadow-2xl border border-slate-800 mb-12">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 text-left">
            Enter Streamer Handle (Default: &quot;test&quot;):
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                @
              </span>
              <input
                type="text"
                value={streamerSlug}
                onChange={(e) => setStreamerSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="test"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-base font-bold"
              />
            </div>
            <Link
              href={`/donate/${currentSlug}`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <span>Go to /donate/{currentSlug}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Quick Presets:</span>
            {["test", "souk", "laostreamer", "gamer_lao"].map((slug) => (
              <button
                key={slug}
                onClick={() => setStreamerSlug(slug)}
                className={`px-3 py-1 rounded-lg transition-colors font-mono ${
                  streamerSlug === slug
                    ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                @{slug}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Prominent Portal Links requested by User */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Portal Card 1: /donate/test */}
          <Link
            href={`/donate/${currentSlug}`}
            className="group glass-card p-6 rounded-2xl border border-red-900/40 hover:border-red-500/60 transition-all hover:-translate-y-1 shadow-xl block"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-red-400 transition-colors">
              Donor Page
            </h3>
            <div className="inline-block px-2.5 py-1 rounded-md bg-red-950/80 border border-red-500/30 text-red-300 font-mono text-xs font-semibold mb-3">
              /donate/{currentSlug}
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Donor input form with BCEL One QR Code image, custom LAK amount buttons, Confirm Donation, and instant test alert trigger.
            </p>
            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-red-400 group-hover:text-red-300">
              <span>Open Donor Page</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Portal Card 2: /overlay/test */}
          <Link
            href={`/overlay/${currentSlug}`}
            target="_blank"
            className="group glass-card p-6 rounded-2xl border border-indigo-900/40 hover:border-indigo-500/60 transition-all hover:-translate-y-1 shadow-xl block"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-indigo-400 transition-colors">
              OBS Overlay Page
            </h3>
            <div className="inline-block px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold mb-3">
              /overlay/{currentSlug}
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Transparent background (`bg-transparent`) for OBS Studio. Plays pop-in alert card, glow effect, confetti, audio chime, and Web Speech TTS.
            </p>
            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-400 group-hover:text-indigo-300">
              <span>Open OBS Overlay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Portal Card 3: /dashboard/test */}
          <Link
            href={`/dashboard/${currentSlug}`}
            className="group glass-card p-6 rounded-2xl border border-amber-900/40 hover:border-amber-500/60 transition-all hover:-translate-y-1 shadow-xl block"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-amber-400 transition-colors">
              Streamer Dashboard
            </h3>
            <div className="inline-block px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold mb-3">
              /dashboard/{currentSlug}
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Realtime statistics feed, recent donations table, manual test alert trigger, and OBS overlay URL copy generator.
            </p>
            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-400 group-hover:text-amber-300">
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="border-t border-slate-800/80 bg-slate-900/40 py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
            <h4 className="font-semibold text-white">BCEL One Ready</h4>
            <p className="text-xs text-slate-400 mt-1">Instant QR scanning in Lao Kip (LAK)</p>
          </div>
          <div className="flex flex-col items-center">
            <Volume2 className="w-8 h-8 text-amber-400 mb-2" />
            <h4 className="font-semibold text-white">Chime & TTS Alert</h4>
            <p className="text-xs text-slate-400 mt-1">Web Audio synth + Speech Synthesis</p>
          </div>
          <div className="flex flex-col items-center">
            <Database className="w-8 h-8 text-sky-400 mb-2" />
            <h4 className="font-semibold text-white">Supabase Realtime</h4>
            <p className="text-xs text-slate-400 mt-1">Instant Postgres DB triggers</p>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-8 h-8 text-indigo-400 mb-2" />
            <h4 className="font-semibold text-white">OBS Transparent</h4>
            <p className="text-xs text-slate-400 mt-1">Zero border 8-second auto-hide</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-400">
        <p>© 2026 DonateLaos — Live Stream Donation Platform Laos. Built with Next.js 14, Supabase & Tailwind CSS.</p>
      </footer>
    </main>
  );
}
