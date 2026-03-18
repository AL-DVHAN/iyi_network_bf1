import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Türkçe karakter normalizasyonu - arama için
 * ı→i, İ→i, ğ→g, Ğ→g, ş→s, Ş→s, ç→c, Ç→c, ö→o, Ö→o, ü→u, Ü→u
 */
export function normalizeTurkish(str: string): string {
  // Replace BEFORE toLowerCase() to avoid İ → i̇ (two-char) issue
  return str
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u");
}

/** Saniyeden saate çevirir (yukarı yuvarlama) */
export function secondsToHoursCeil(seconds: number): number {
  if (!seconds || seconds <= 0) return 0;
  return Math.ceil(seconds / 3600);
}

/** Dakikadan saate çevirir (yukarı yuvarlama) */
export function minutesToHoursCeil(minutes: number): number {
  if (!minutes || minutes <= 0) return 0;
  return Math.ceil(minutes / 60);
}

/** API'den gelen süreyi saate çevirir */
export function formatPlaytime(seconds: number): string {
  const hours = secondsToHoursCeil(seconds);
  return `${hours.toLocaleString("tr-TR")} Saat`;
}

/** K/D oranını formatlar */
export function formatKD(kills: number, deaths: number): string {
  if (!deaths || deaths === 0) return kills > 0 ? kills.toFixed(2) : "0.00";
  return (kills / deaths).toFixed(2);
}

/** Büyük sayıları kısaltır: 1000 → 1K */
export function formatNumber(num: number): string {
  if (!num) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString("tr-TR");
}

/** Tarihi Türkçe formatlar */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

/** Haftanın başlangıç ve bitiş tarihlerini döndürür */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/** Platform etiketini döndürür */
export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = { pc: "PC", xbox: "Xbox One", ps4: "PlayStation 4" };
  return labels[platform] || platform.toUpperCase();
}
