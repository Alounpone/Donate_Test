import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numeric value as Lao Kip (LAK)
 * e.g., 50000 -> "50,000 ₭"
 */
export function formatLAK(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 ₭";
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    maximumFractionDigits: 0,
  })
    .format(num)
    .replace("LAK", "₭");
}

/**
 * Play a high quality dual-tone chime sound for donation alert using Web Audio API
 */
export function playChimeSound() {
  if (typeof window === "undefined") return;
  
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // Notes: C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz) -> C6 (1046.50 Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.6);
    });
  } catch (err) {
    console.warn("Audio Context playback failed or blocked:", err);
  }
}

/**
 * Speak text out loud using Web Speech API (TTS)
 */
export function speakMessage(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    // Try to pick a clear voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith("en") || v.lang.startsWith("lo") || v.lang.startsWith("th")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Text-to-speech failed:", err);
  }
}

/**
 * Streamer helper data for BCEL One QR Code display
 */
export interface StreamerProfile {
  slug: string;
  name: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrCodeUrl: string;
  avatarUrl: string;
}

export const DEFAULT_STREAMER: StreamerProfile = {
  slug: "souk",
  name: "Soukphasone Live",
  bankName: "BCEL One (Banque Pour Le Commerce Exterieur Lao)",
  accountName: "SOUKPHASONE VONGSA",
  accountNumber: "160-12-00-01928472-001",
  qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BCELONE:SOUKPHASONE_VONGSA:160120001928472001:LAK",
  avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
};
