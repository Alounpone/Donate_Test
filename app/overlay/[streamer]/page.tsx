"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";
import { subscribeToDonations, DonationRecord } from "@/lib/supabase/client";
import { formatLAK, playChimeSound, speakMessage } from "@/lib/utils";
import { Heart, Volume2, Sparkles, Tv, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function OBSOverlayPage({ params }: { params?: { streamer?: string } }) {
  const routerParams = useParams();
  const rawStreamer = params?.streamer || (routerParams?.streamer as string) || "test";
  const streamerSlug = (typeof rawStreamer === "string" ? rawStreamer : "test").toLowerCase() || "test";

  const [currentAlert, setCurrentAlert] = useState<DonationRecord | null>(null);
  const [alertQueue, setAlertQueue] = useState<DonationRecord[]>([]);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  const [testLog, setTestLog] = useState<string>("Listening for realtime donations...");

  const isProcessingRef = useRef<boolean>(false);

  // Trigger Confetti blast on alert pop-in
  const fireConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6, x: 0.3 },
        colors: ["#FFB800", "#D32F2F", "#3B82F6", "#10B981", "#EC4899"],
      });
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6, x: 0.7 },
        colors: ["#FFB800", "#D32F2F", "#3B82F6", "#10B981", "#EC4899"],
      });
    } catch (e) {
      console.warn("Confetti error:", e);
    }
  }, []);

  // Process next alert in queue
  const processNextAlert = useCallback(() => {
    if (isProcessingRef.current) return;

    setAlertQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;

      const [nextAlert, ...remainingQueue] = prevQueue;
      isProcessingRef.current = true;

      setCurrentAlert(nextAlert);

      // Play Chime Sound
      playChimeSound();

      // Fire Visual Confetti
      fireConfetti();

      // Web Speech API Text-to-Speech
      const ttsText = `${nextAlert.donor_name} donated ${nextAlert.amount_lak} Kip: ${
        nextAlert.message || "Thank you!"
      }`;
      speakMessage(ttsText);

      // Hide alert after exactly 8 seconds
      setTimeout(() => {
        setCurrentAlert(null);
        isProcessingRef.current = false;
        setTimeout(() => {
          processNextAlert();
        }, 500);
      }, 8000);

      return remainingQueue;
    });
  }, [fireConfetti]);

  // Push new donation into queue
  const handleIncomingDonation = useCallback(
    (donation: DonationRecord) => {
      setTestLog(`[${new Date().toLocaleTimeString()}] New donation from ${donation.donor_name}: ${formatLAK(donation.amount_lak)}`);
      setAlertQueue((prev) => [...prev, donation]);
    },
    []
  );

  // Auto trigger queue processing when alertQueue updates and not currently busy
  useEffect(() => {
    if (!isProcessingRef.current && alertQueue.length > 0) {
      processNextAlert();
    }
  }, [alertQueue, processNextAlert]);

  // Subscribe to Supabase Realtime + Local fallback broadcast
  useEffect(() => {
    const unsubscribe = subscribeToDonations(streamerSlug, (donation) => {
      handleIncomingDonation(donation);
    });

    return () => {
      unsubscribe();
    };
  }, [streamerSlug, handleIncomingDonation]);

  // Unlock browser audio context on first user click
  const unlockAudio = () => {
    playChimeSound();
    speakMessage("Audio and speech synthesizer initialized for OBS Overlay!");
    setAudioUnlocked(true);
  };

  // Trigger manual test alert directly from overlay view
  const triggerLocalTest = () => {
    const sampleNames = ["Anousone", "Khamla", "Souvanny", "Vongdeuane", "Noy"];
    const sampleMsgs = [
      "Keep streaming! Love your content ❤️",
      "Donation for the stream! 🚀",
      "ຂອບໃຈຫຼາຍໆເດີ! ເຊຍໆ!",
      "Super GG WP play! 🎮",
    ];
    const sampleAmts = [20000, 50000, 100000, 200000, 500000];

    const testDonation: DonationRecord = {
      id: `test-${Date.now()}`,
      streamer_slug: streamerSlug,
      donor_name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
      amount_lak: sampleAmts[Math.floor(Math.random() * sampleAmts.length)],
      message: sampleMsgs[Math.floor(Math.random() * sampleMsgs.length)],
      status: "approved",
      created_at: new Date().toISOString(),
    };

    handleIncomingDonation(testDonation);
  };

  return (
    <div className="w-screen h-screen bg-transparent overflow-hidden relative flex flex-col items-center justify-center p-6 select-none">
      {/* Pop-in Animated Alert Card (Active when currentAlert exists) */}
      {currentAlert && (
        <div className="z-50 animate-pop-in transition-all transform duration-500 max-w-lg w-full">
          <div className="relative rounded-3xl p-[3px] bg-gradient-to-r from-amber-400 via-red-500 to-indigo-500 animate-glow-pulse shadow-2xl">
            <div className="bg-slate-950/95 backdrop-blur-xl rounded-[22px] p-6 sm:p-8 text-center border border-white/10 text-white relative overflow-hidden">
              {/* Background accent particle effect */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Badge Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30 animate-bounce">
                <Heart className="w-9 h-9 text-slate-950 fill-slate-950" />
              </div>

              {/* Title Header */}
              <div className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-1 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>NEW DONATION ALERT!</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>

              {/* Donor Name */}
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md">
                {currentAlert.donor_name}
              </h2>

              {/* Amount LAK Pill */}
              <div className="inline-block my-2 px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-2xl sm:text-3xl shadow-xl shadow-amber-500/20 border border-amber-300">
                {formatLAK(currentAlert.amount_lak)}
              </div>

              {/* Message Box */}
              {currentAlert.message && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-base sm:text-lg font-medium leading-relaxed shadow-inner italic">
                  &ldquo;{currentAlert.message}&rdquo;
                </div>
              )}

              {/* Progress bar (8 seconds) */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-red-500 h-full w-full animate-[shrink_8s_linear_forwards]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Control Bar for Streamer / Testing */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 opacity-30 hover:opacity-100 transition-opacity duration-300 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200 px-2">
          <Tv className="w-4 h-4 text-indigo-400" />
          <span>OBS Overlay (@{streamerSlug})</span>
        </div>

        {!audioUnlocked && (
          <button
            type="button"
            onClick={unlockAudio}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Enable Audio & Speech</span>
          </button>
        )}

        {audioUnlocked && (
          <span className="px-2 py-1 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Audio Active
          </span>
        )}

        <button
          type="button"
          onClick={triggerLocalTest}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Test Alert</span>
        </button>

        <span className="text-[11px] text-slate-400 max-w-[200px] truncate hidden sm:inline-block">
          {testLog}
        </span>
      </div>

      <style jsx global>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
