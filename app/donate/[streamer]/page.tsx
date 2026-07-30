"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { insertDonation } from "@/lib/supabase/client";
import { formatLAK, DEFAULT_STREAMER } from "@/lib/utils";
import { 
  Heart, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  QrCode, 
  Zap, 
  AlertCircle, 
  ArrowLeft,
  Tv,
  LayoutDashboard
} from "lucide-react";

export default function DonorPage() {
  const params = useParams();
  const streamerSlug = (params?.streamer as string) || "souk";

  const [donorName, setDonorName] = useState("");
  const [amountLak, setAmountLak] = useState<number | "">(50000);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  // Quick preset amounts in LAK
  const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 500000];

  const handleConfirmDonation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!donorName.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your donor name" });
      return;
    }
    const numAmount = Number(amountLak);
    if (!numAmount || numAmount <= 0) {
      setStatusMessage({ type: "error", text: "Please enter a valid amount in LAK" });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const result = await insertDonation({
      streamer_slug: streamerSlug.toLowerCase(),
      donor_name: donorName.trim(),
      amount_lak: numAmount,
      message: message.trim() || "ຂອບໃຈຫຼາຍໆ! (Thank you so much!)",
      status: "approved",
    });

    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({
        type: "success",
        text: `Donation of ${formatLAK(numAmount)} sent to @${streamerSlug}! Alert is populating on OBS overlay.`,
      });
      // Clear form optional reset
      setMessage("");
    } else {
      setStatusMessage({
        type: "error",
        text: result.error || "Failed to confirm donation. Please try again.",
      });
    }
  };

  const handleSendTestAlert = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const testNames = ["Khamla", "Somphet", "Bounmy", "Anousone", "Phoutthasack"];
    const testMessages = [
      "Keep up the great stream bro! 🚀",
      "ຂອບໃຈສຳລັບ High quality content!",
      "GG WP! Love from Vientiane ❤️",
      "Donation for the new gaming setup! 🎮",
    ];

    const randomName = testNames[Math.floor(Math.random() * testNames.length)];
    const randomAmount = PRESET_AMOUNTS[Math.floor(Math.random() * PRESET_AMOUNTS.length)];
    const randomMsg = testMessages[Math.floor(Math.random() * testMessages.length)];

    const result = await insertDonation({
      streamer_slug: streamerSlug.toLowerCase(),
      donor_name: `[TEST] ${randomName}`,
      amount_lak: randomAmount,
      message: randomMsg,
      status: "approved",
    });

    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({
        type: "success",
        text: `⚡ Quick Test Alert triggered for @${streamerSlug} (${formatLAK(randomAmount)})! Check OBS overlay.`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: result.error || "Test alert trigger failed.",
      });
    }
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(DEFAULT_STREAMER.accountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden pb-12">
      {/* Glow ambient background */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-red-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[300px] bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              @{streamerSlug}
            </span>
            <Link
              href={`/overlay/${streamerSlug}`}
              target="_blank"
              className="text-xs px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900 transition-colors flex items-center gap-1"
            >
              <Tv className="w-3 h-3" /> OBS Overlay
            </Link>
            <Link
              href={`/dashboard/${streamerSlug}`}
              className="text-xs px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 hover:bg-amber-900 transition-colors flex items-center gap-1"
            >
              <LayoutDashboard className="w-3 h-3" /> Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-4xl mx-auto px-4 pt-8 flex-1 w-full">
        {/* Streamer Profile Header Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-lg shrink-0">
              <Image
                src={DEFAULT_STREAMER.avatarUrl}
                alt={DEFAULT_STREAMER.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-black text-white">{DEFAULT_STREAMER.name}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                Support channel <span className="font-mono text-amber-400">@{streamerSlug}</span> with BCEL One
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendTestAlert}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-semibold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Send Test Alert</span>
          </button>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 border animate-slide-up ${
              statusMessage.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                : "bg-red-950/80 border-red-500/40 text-red-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm font-medium">{statusMessage.text}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: BCEL One QR Card (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="glass-card p-6 rounded-2xl border border-red-900/40 relative overflow-hidden shadow-2xl flex flex-col items-center text-center">
              {/* BCEL One Header Banner */}
              <div className="w-full bcel-gradient -mt-6 -mx-6 px-6 py-3 mb-6 flex items-center justify-between border-b border-red-500/30">
                <span className="font-extrabold text-xs tracking-wider text-white uppercase flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-300" />
                  BCEL One Pay
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-amber-200">
                  LAK ₭
                </span>
              </div>

              {/* QR Image Frame */}
              <div className="relative p-3 bg-white rounded-xl shadow-xl border-2 border-amber-400/50 mb-4 group cursor-pointer">
                <Image
                  src={DEFAULT_STREAMER.qrCodeUrl}
                  alt="BCEL One QR Code"
                  width={220}
                  height={220}
                  className="rounded-lg"
                  priority
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity text-white text-xs font-semibold">
                  Scan via BCEL One App
                </div>
              </div>

              <div className="w-full text-left space-y-2 mt-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Bank Account Info
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {DEFAULT_STREAMER.accountName}
                </div>
                <div className="text-xs text-slate-300 font-mono flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
                  <span className="truncate">{DEFAULT_STREAMER.accountNumber}</span>
                  <button
                    type="button"
                    onClick={handleCopyAccountNumber}
                    className="text-amber-400 hover:text-amber-300 ml-2 p-1"
                    title="Copy account number"
                  >
                    {copiedBank ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 leading-normal">
                Scan the QR code with your BCEL One app to transfer money. After completing payment, click <span className="text-amber-300 font-semibold">&quot;Confirm Donation&quot;</span> below.
              </p>
            </div>
          </div>

          {/* Right Column: Donation Input Form (7 cols) */}
          <div className="md:col-span-7">
            <form onSubmit={handleConfirmDonation} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between h-full space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <span>Send a Donation Alert</span>
                </h2>
                <p className="text-slate-400 text-xs mb-6">
                  Your donation alert will pop up on live stream in real-time.
                </p>

                {/* Input 1: Donor Name */}
                <div className="space-y-2 mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Your Name / Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Khamla (ຫຼື ຊື່ຫຼິ້ນ)"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-sm"
                  />
                </div>

                {/* Input 2: Amount LAK & Preset buttons */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Amount (LAK / ₭) <span className="text-red-400">*</span>
                    </label>
                    <span className="text-xs font-semibold text-amber-400 font-mono">
                      {formatLAK(Number(amountLak) || 0)}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                      ₭
                    </span>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={amountLak}
                      onChange={(e) => setAmountLak(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="50000"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono font-bold text-lg"
                    />
                  </div>

                  {/* Preset Amount Buttons */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmountLak(amt)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold font-mono transition-all border ${
                          amountLak === amt
                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                            : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                        }`}
                      >
                        {amt >= 1000 ? `${amt / 1000}k ₭` : `${amt} ₭`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input 3: Message */}
                <div className="space-y-2 mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Streamer Message (Will be read out on stream!)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={200}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here... (ຂໍໃຫ້ສະຕີມມວນໆເດີ!)"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm resize-none"
                  />
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    {message.length}/200 characters
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:via-amber-400 hover:to-red-500 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-red-900/30 transition-all transform active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-5 h-5 fill-slate-950" />
                  <span>{isSubmitting ? "Processing Donation..." : "Confirm Donation"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendTestAlert}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Send Test Alert (Quick Instant Trigger)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 mt-12 text-center text-xs text-slate-400">
        <p>DonateLaos Platform — Direct BCEL One Streamer Support</p>
      </footer>
    </div>
  );
}
