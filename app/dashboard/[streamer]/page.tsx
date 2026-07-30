"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getDonations, insertDonation, subscribeToDonations, DonationRecord, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatLAK, DEFAULT_STREAMER } from "@/lib/utils";
import {
  LayoutDashboard,
  Tv,
  Zap,
  Copy,
  CheckCircle2,
  ExternalLink,
  Search,
  RefreshCw,
  ArrowLeft,
  QrCode,
  DollarSign,
  Users,
  TrendingUp,
  Database,
  Sparkles
} from "lucide-react";

export default function StreamerDashboard() {
  const params = useParams();
  const streamerSlug = ((params?.streamer as string) || "souk").toLowerCase();

  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedOverlayUrl, setCopiedOverlayUrl] = useState(false);
  const [isTriggeringTest, setIsTriggeringTest] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [overlayUrl, setOverlayUrl] = useState("");
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Compute full OBS Overlay URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOverlayUrl(`${window.location.origin}/overlay/${streamerSlug}`);
    }
  }, [streamerSlug]);

  // Load donations history
  const loadDonations = useCallback(async () => {
    setLoading(true);
    const data = await getDonations(streamerSlug);
    setDonations(data);
    setLoading(false);
  }, [streamerSlug]);

  useEffect(() => {
    loadDonations();

    // Subscribe to realtime updates on dashboard
    const unsubscribe = subscribeToDonations(streamerSlug, (newDonation) => {
      setDonations((prev) => [newDonation, ...prev.filter((d) => d.id !== newDonation.id)]);
    });

    return () => {
      unsubscribe();
    };
  }, [streamerSlug, loadDonations]);

  // Trigger Manual Test Alert
  const handleTriggerManualTestAlert = async () => {
    setIsTriggeringTest(true);
    setStatusNotification(null);

    const testNames = ["Somphet", "Khamla", "Phoutthasack", "Bounmy", "Anousone", "Mimi Live"];
    const testMessages = [
      "Manual test alert from streamer dashboard! 🎯",
      "ຂອບໃຈຫຼາຍໆເດີ! ເຊຍໆ 🚀",
      "Testing OBS overlay chime & TTS 🔊",
      "Big donation test! Keep streaming! 🔥",
    ];
    const testAmounts = [20000, 50000, 100000, 250000, 500000];

    const randomName = testNames[Math.floor(Math.random() * testNames.length)];
    const randomMsg = testMessages[Math.floor(Math.random() * testMessages.length)];
    const randomAmt = testAmounts[Math.floor(Math.random() * testAmounts.length)];

    const result = await insertDonation({
      streamer_slug: streamerSlug,
      donor_name: `[MANUAL TEST] ${randomName}`,
      amount_lak: randomAmt,
      message: randomMsg,
      status: "approved",
    });

    setIsTriggeringTest(false);

    if (result.success) {
      setStatusNotification(`⚡ Manual Test Alert sent for ${formatLAK(randomAmt)}! Check your OBS Overlay.`);
      setTimeout(() => setStatusNotification(null), 5000);
    } else {
      setStatusNotification(`❌ Failed to trigger test alert: ${result.error}`);
    }
  };

  // Copy Overlay URL
  const handleCopyOverlayUrl = () => {
    if (overlayUrl) {
      navigator.clipboard.writeText(overlayUrl);
      setCopiedOverlayUrl(true);
      setTimeout(() => setCopiedOverlayUrl(false), 2500);
    }
  };

  // Compute analytics
  const totalRaisedLak = donations.reduce((sum, d) => sum + Number(d.amount_lak || 0), 0);
  const totalDonors = donations.length;
  const avgDonationLak = totalDonors > 0 ? Math.round(totalRaisedLak / totalDonors) : 0;

  // Filtered donations for search
  const filteredDonations = donations.filter(
    (d) =>
      d.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.message || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden pb-12">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base text-white flex items-center gap-2">
                  Streamer Dashboard
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 font-mono">
                    @{streamerSlug}
                  </span>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/donate/${streamerSlug}`}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-red-400" />
              <span>Donor Page</span>
            </Link>

            <button
              type="button"
              onClick={handleTriggerManualTestAlert}
              disabled={isTriggeringTest}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isTriggeringTest ? "Sending..." : "Trigger Manual Test Alert"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-8 flex-1 w-full space-y-8">
        {/* Supabase Status Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>
              Database Connection Mode:{" "}
              <strong className={isSupabaseConfigured ? "text-emerald-400" : "text-amber-400"}>
                {isSupabaseConfigured ? "Supabase Live Database Connected" : "Local Test Broadcast Mode (Add Supabase keys in .env.local for cloud DB)"}
              </strong>
            </span>
          </div>
          <button
            onClick={loadDonations}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Refresh donations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Status Toast */}
        {statusNotification && (
          <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-sm font-semibold flex items-center gap-2 animate-slide-up shadow-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{statusNotification}</span>
          </div>
        )}

        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Raised</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white gold-gradient-text">
              {formatLAK(totalRaisedLak)}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Cumulative LAK donations received</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Donations</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{totalDonors}</div>
            <p className="text-[11px] text-slate-400 mt-2">Supporters & test alert triggers</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Donation</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{formatLAK(avgDonationLak)}</div>
            <p className="text-[11px] text-slate-400 mt-2">Average contribution per donor</p>
          </div>
        </div>

        {/* OBS Overlay Link Box */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-900/50 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tv className="w-5 h-5 text-indigo-400" />
                <span>OBS Studio Overlay Browser Source Link</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Add this URL as a <strong className="text-slate-200">Browser Source</strong> in OBS Studio. Recommended size: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">1920 x 1080</code> with transparent background.
              </p>
            </div>

            <Link
              href={`/overlay/${streamerSlug}`}
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Test Overlay Window</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={overlayUrl}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-indigo-300 font-mono text-xs sm:text-sm select-all focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleCopyOverlayUrl}
              className={`px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shrink-0 ${
                copiedOverlayUrl
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {copiedOverlayUrl ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Copied Link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy OBS Overlay URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Donations Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Recent Donations Feed</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                  {filteredDonations.length} records
                </span>
              </h2>
              <p className="text-xs text-slate-400">Live incoming stream contributions</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search donor or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTriggerManualTestAlert}
                disabled={isTriggeringTest}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Trigger Test</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3.5">Donor</th>
                  <th className="px-6 py-3.5">Amount (LAK)</th>
                  <th className="px-6 py-3.5">Message</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Loading recent donations...
                    </td>
                  </tr>
                ) : filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No donations found for @{streamerSlug} yet.
                      <br />
                      <button
                        onClick={handleTriggerManualTestAlert}
                        className="mt-3 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-colors"
                      >
                        Click here to send a manual test donation alert!
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((d, idx) => (
                    <tr key={d.id || idx} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-slate-950 font-black text-xs shrink-0">
                          {d.donor_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{d.donor_name}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-amber-400 font-mono">
                        {formatLAK(d.amount_lak)}
                      </td>
                      <td className="px-6 py-4 max-w-xs text-slate-300 truncate">
                        {d.message || <span className="text-slate-600 italic">No message</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Approved
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                        {d.created_at ? new Date(d.created_at).toLocaleTimeString() : "Just now"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BCEL One Configuration & Preview Box */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-red-400" />
              <span>Streamer BCEL One QR Code Settings</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your BCEL One QR Code is automatically displayed to donors on your personal donation link:{" "}
              <code className="text-amber-300 font-mono">/donate/{streamerSlug}</code>. You can configure your account name and bank details in <code className="text-slate-300 font-mono">lib/utils.ts</code> or Supabase settings.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
              <div>Bank: <span className="text-white font-semibold">BCEL One</span></div>
              <div>Account Name: <span className="text-white font-semibold">{DEFAULT_STREAMER.accountName}</span></div>
              <div>Account #: <span className="text-amber-400 font-semibold">{DEFAULT_STREAMER.accountNumber}</span></div>
            </div>
          </div>

          <div className="md:col-span-4 flex justify-center">
            <div className="p-2 bg-white rounded-xl shadow-lg border border-amber-400/50">
              <Image
                src={DEFAULT_STREAMER.qrCodeUrl}
                alt="Streamer BCEL One QR"
                width={120}
                height={120}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-12 text-center text-xs text-slate-500">
        <p>DonateLaos Streamer Dashboard — Live Stream Donation Platform in Laos</p>
      </footer>
    </div>
  );
}
