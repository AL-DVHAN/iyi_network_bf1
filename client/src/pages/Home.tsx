import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { formatNumber } from "@/lib/utils";
import {
  Users, Target, Trophy, BookOpen, Server, Zap, Shield,
  ChevronRight, Star, Clock, Crosshair, TrendingUp
} from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchInput, setSearchInput] = useState("");

  const serverQuery = trpc.server.getLive.useQuery(undefined, {
    refetchInterval: 30000,
    retry: false,
  });

  const leaderboardQuery = trpc.leaderboard.getTop.useQuery({ limit: 5 }, { retry: false });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    navigate(`/istatistik?player=${encodeURIComponent(searchInput.trim())}`);
  };

  const serverData = serverQuery.data;

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, var(--background) 0%, var(--background) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: "oklch(0.72 0.14 75 / 0.15)", border: "1px solid oklch(0.72 0.14 75 / 0.3)", color: "oklch(0.75 0.16 75)" }}>
              <Zap size={12} />
              Battlefield 1 Topluluk Portalı
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Oswald', sans-serif", color: "var(--foreground)" }}>
              IYI <span style={{ color: "oklch(0.75 0.16 75)" }}>NETWORK</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Battlefield 1 klan topluluğu. Oyuncu istatistiklerini takip et, ansiklopediyi keşfet, haftalık görevleri tamamla.
            </p>

            {/* Hero Search */}
            <form onSubmit={handleHeroSearch} className="flex gap-2 max-w-lg mx-auto mb-8">
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Oyuncu adı gir (örn: DVHAN)"
                className="flex-1 h-11 px-4 text-sm rounded-l-lg border outline-none"
                style={{ background: "var(--input)", borderColor: "oklch(0.30 0.03 60)", color: "var(--foreground)" }}
              />
              <button type="submit" className="h-11 px-5 rounded-r-lg font-semibold text-sm" style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.65 0.12 70))", color: "var(--primary-foreground)" }}>
                İstatistik Ara
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link href="/ansiklopedi" className="flex items-center gap-1.5 hover:text-foreground transition-colors no-underline">
                <BookOpen size={14} /> Ansiklopedi
              </Link>
              <span>•</span>
              <Link href="/liderlik" className="flex items-center gap-1.5 hover:text-foreground transition-colors no-underline">
                <Trophy size={14} /> Liderlik Tablosu
              </Link>
              <span>•</span>
              <Link href="/gorevler" className="flex items-center gap-1.5 hover:text-foreground transition-colors no-underline">
                <Target size={14} /> Haftalık Görevler
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <div className="border-y" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
        <div className="container py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Klan Üyeleri", value: "47+" },
              { icon: Crosshair, label: "Toplam Kill", value: "2.4M+" },
              { icon: Clock, label: "Toplam Süre", value: "18K Saat" },
              { icon: TrendingUp, label: "Ort. K/D", value: "1.85" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded flex items-center justify-center shrink-0" style={{ background: "oklch(0.72 0.14 75 / 0.15)" }}>
                    <Icon size={16} style={{ color: "oklch(0.75 0.16 75)" }} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-base font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "var(--foreground)" }}>{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Feature Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feature Grid */}
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif", color: "var(--foreground)" }}>
                Keşfet
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    href: "/ansiklopedi",
                    icon: BookOpen,
                    title: "Ansiklopedi",
                    desc: "Tüm silahlar, araçlar ve sınıflar hakkında detaylı bilgi. Pro-Tips ile uzman stratejileri öğren.",
                    color: "var(--primary)",
                    bg: "oklch(0.72 0.14 75 / 0.1)",
                  },
                  {
                    href: "/istatistik",
                    icon: Target,
                    title: "Oyuncu İstatistikleri",
                    desc: "K/D, KPM, SPM ve daha fazlası. Gametools API ile gerçek zamanlı veriler.",
                    color: "oklch(0.65 0.12 200)",
                    bg: "oklch(0.65 0.12 200 / 0.1)",
                  },
                  {
                    href: "/gorevler",
                    icon: Trophy,
                    title: "Haftalık Görevler",
                    desc: "Her hafta yeni görevler. Tamamla, rozet kazan, puan topla.",
                    color: "oklch(0.70 0.15 30)",
                    bg: "oklch(0.70 0.15 30 / 0.1)",
                  },
                  {
                    href: "/sunucu",
                    icon: Server,
                    title: "Canlı Sunucu",
                    desc: "IYI Network sunucusunun anlık durumu, harita ve skor bilgisi.",
                    color: "oklch(0.60 0.15 145)",
                    bg: "oklch(0.60 0.15 145 / 0.1)",
                  },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <Link key={i} href={card.href} className="no-underline group">
                      <div className="p-4 rounded-lg border transition-all group-hover:border-primary/40" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: card.bg }}>
                          <Icon size={20} style={{ color: card.color }} />
                        </div>
                        <h3 className="font-semibold text-sm mb-1 text-foreground group-hover:text-primary transition-colors">{card.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                        <div className="flex items-center gap-1 mt-3 text-xs font-medium" style={{ color: card.color }}>
                          Keşfet <ChevronRight size={12} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="rounded-lg border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <Trophy size={16} style={{ color: "oklch(0.75 0.16 75)" }} />
                  <h3 className="font-semibold text-sm">Bu Ayki Liderler</h3>
                </div>
                <Link href="/liderlik" className="text-xs no-underline" style={{ color: "var(--primary)" }}>
                  Tümünü Gör →
                </Link>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {leaderboardQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                      <div className="w-6 h-6 rounded bg-muted" />
                      <div className="flex-1 h-4 rounded bg-muted" />
                      <div className="w-16 h-4 rounded bg-muted" />
                    </div>
                  ))
                ) : leaderboardQuery.data?.length ? (
                  leaderboardQuery.data.map((entry, i) => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                      <span className="w-6 text-center text-sm font-bold" style={{ color: i === 0 ? "oklch(0.75 0.16 75)" : i === 1 ? "oklch(0.75 0.02 80)" : i === 2 ? "oklch(0.70 0.15 30)" : "oklch(0.55 0.02 80)" }}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium text-foreground">{entry.eaUsername}</span>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatNumber(entry.kills || 0)} kill</span>
                        <span className="font-semibold" style={{ color: "oklch(0.75 0.16 75)" }}>{entry.kd || "0.00"} K/D</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Henüz liderlik verisi yok. Klan üyeleri yakında eklenecek!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Live Server Widget */}
            <div className="rounded-lg border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <div className="live-dot" />
                  <h3 className="font-semibold text-sm">Canlı Sunucu</h3>
                </div>
                <Link href="/sunucu" className="text-xs no-underline" style={{ color: "var(--primary)" }}>
                  Detay →
                </Link>
              </div>
              <div className="p-4">
                {serverQuery.isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                ) : serverData ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Sunucu</p>
                      <p className="text-sm font-medium text-foreground truncate">{serverData.serverName || "[IYI] ALL MAP 200DMG/CQ"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Harita</p>
                      <p className="text-sm font-medium text-foreground">{serverData.currentMap || "Bilinmiyor"}</p>
                    </div>
                    {/* Score */}
                    <div className="rounded p-3" style={{ background: "var(--background)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Skor</span>
                        <span className="text-xs text-muted-foreground">{serverData.gameMode || "CQ"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.65 0.12 200)" }}>{serverData.team1Score || 1970}</span>
                        <span className="text-xs text-muted-foreground">vs</span>
                        <span className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.70 0.15 30)" }}>{serverData.team2Score || 1300}</span>
                      </div>
                    </div>
                    {/* Players */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-muted-foreground" />
                        <span className="font-semibold text-foreground">{serverData.playerCount || 0}</span>
                        <span className="text-muted-foreground">/ {serverData.maxPlayers || 64}</span>
                      </div>
                      {serverData.hasAdmin && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.60 0.15 145)" }}>
                          <Shield size={12} />
                          <span>Admin: {serverData.activeAdmin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Server size={24} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Sunucu verisi yüklenemiyor</p>
                    <Link href="/sunucu" className="text-xs no-underline mt-1 block" style={{ color: "var(--primary)" }}>
                      Sunucu sayfasına git →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Join CTA */}
            {!isAuthenticated && (
              <div className="rounded-lg border p-4" style={{ background: "linear-gradient(135deg, oklch(0.17 0.02 58), oklch(0.14 0.015 55))", borderColor: "oklch(0.72 0.14 75 / 0.3)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} style={{ color: "oklch(0.75 0.16 75)" }} />
                  <h3 className="font-semibold text-sm text-foreground">Topluluğa Katıl</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Hesap oluştur, EA hesabını bağla ve klan özelliklerine erişim sağla.
                </p>
                <a href={getLoginUrl()} className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold no-underline" style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.65 0.12 70))", color: "var(--primary-foreground)" }}>
                  Ücretsiz Kayıt Ol
                </a>
              </div>
            )}

            {/* Quick Links */}
            <div className="rounded-lg border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <h3 className="font-semibold text-sm">Hızlı Erişim</h3>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {[
                  { href: "/ban-listesi", label: "Ban Listesi", icon: Shield },
                  { href: "/destek", label: "Destekçi Ol", icon: Star },
                  { href: "/geri-bildirim", label: "Geri Bildirim", icon: Target },
                ].map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <Link key={i} href={link.href} className="flex items-center justify-between px-4 py-2.5 hover:bg-accent/30 transition-colors no-underline group">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        <Icon size={14} />
                        {link.label}
                      </div>
                      <ChevronRight size={12} className="text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
