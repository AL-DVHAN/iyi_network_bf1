import { trpc } from "@/lib/trpc";
import { Server, Users, Shield, RefreshCw, Wifi, WifiOff, Map } from "lucide-react";
import { Link } from "wouter";

const BF1_MAPS: Record<string, string> = {
  "Sinai Desert": "Sina Çölü",
  "Ballroom Blitz": "Balo Salonu Baskını",
  "Argonne Forest": "Argonne Ormanı",
  "Fao Fortress": "Fao Kalesi",
  "Monte Grappa": "Monte Grappa",
  "Empire's Edge": "İmparatorluğun Sınırı",
  "Amiens": "Amiens",
  "Suez": "Süveyş",
  "St. Quentin Scar": "St. Quentin Yarası",
  "Giant's Shadow": "Dev'in Gölgesi",
  "Lupkow Pass": "Lupkow Geçidi",
  "Verdun Heights": "Verdun Tepeleri",
  "Prise de Tahure": "Tahure Kuşatması",
  "Fort De Vaux": "Fort De Vaux",
  "Passchendaele": "Passchendaele",
  "Caporetto": "Caporetto",
  "Brusilov Keep": "Brusilov Kalesi",
  "Albion": "Albion",
  "Łódź": "Lodz",
  "River Somme": "Somme Nehri",
  "Cape Helles": "Cape Helles",
  "Achi Baba": "Achi Baba",
  "Rupture": "Kırılma",
  "Soissons": "Soissons",
  "Razor's Edge": "Bıçak Sırtı",
  "London Calling": "Londra'nın Çağrısı",
  "Zeebrugge": "Zeebrugge",
  "Heligoland Bight": "Heligoland Körfezi",
  "Tsaritsyn": "Tsaritsyn",
  "Volga River": "Volga Nehri",
  "Nile Tidings": "Nil Haberleri",
  "Tirailleur": "Tirailleur",
  "Conquer Hell": "Cehennemi Fethet",
};

export default function LiveServer() {
  const serverQuery = trpc.server.getLive.useQuery(undefined, {
    refetchInterval: 15000,
    retry: false,
  });

  const data = serverQuery.data;
  const mapTr = data?.currentMap ? (BF1_MAPS[data.currentMap] || data.currentMap) : "Bilinmiyor";

  const team1Pct = data ? Math.round((data.team1Score / (data.team1Score + data.team2Score + 1)) * 100) : 50;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.60 0.15 145 / 0.15)" }}>
            <Server size={20} style={{ color: "oklch(0.60 0.15 145)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>Canlı Sunucu</h1>
            <p className="text-sm text-muted-foreground">IYI Network Battlefield 1 Sunucusu</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {serverQuery.isLoading ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw size={12} className="animate-spin" /> Yükleniyor...
            </div>
          ) : serverQuery.isError ? (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.55 0.20 25)" }}>
              <WifiOff size={12} /> Bağlantı Hatası
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.60 0.15 145)" }}>
              <Wifi size={12} /> Canlı
            </div>
          )}
          <button onClick={() => serverQuery.refetch()} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border text-muted-foreground hover:text-foreground transition-all" style={{ borderColor: "oklch(0.28 0.03 60)" }}>
            <RefreshCw size={12} className={serverQuery.isFetching ? "animate-spin" : ""} /> Yenile
          </button>
        </div>
      </div>

      {serverQuery.isLoading ? (
        <div className="space-y-4">
          <div className="h-48 rounded-lg bg-muted animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 rounded-lg bg-muted animate-pulse" />
            <div className="h-32 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Server Name Card */}
          <div className="rounded-lg border p-6" style={{ background: "linear-gradient(135deg, oklch(0.16 0.02 58), oklch(0.13 0.015 55))", borderColor: "oklch(0.25 0.02 60)" }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="live-dot" />
                  <span className="text-xs font-medium" style={{ color: "oklch(0.60 0.15 145)" }}>CANLI</span>
                </div>
                <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>{data.serverName}</h2>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{data.playerCount}</span>
                  <span className="text-muted-foreground">/ {data.maxPlayers}</span>
                </div>
                {data.queueCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">{data.queueCount} kuyrukta</p>
                )}
              </div>
            </div>

            {/* Player bar */}
            <div className="w-full h-2 rounded-full overflow-hidden mb-4" style={{ background: "oklch(0.22 0.02 60)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(data.playerCount / data.maxPlayers) * 100}%`, background: data.playerCount >= data.maxPlayers * 0.9 ? "oklch(0.55 0.20 25)" : data.playerCount >= data.maxPlayers * 0.6 ? "oklch(0.70 0.15 30)" : "oklch(0.60 0.15 145)" }} />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Map size={13} />
                <span>{mapTr}</span>
              </div>
              <span>•</span>
              <span>{data.gameMode}</span>
              {data.hasAdmin && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5" style={{ color: "oklch(0.60 0.15 145)" }}>
                    <Shield size={13} />
                    <span>Admin: {data.activeAdmin}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Score Board */}
          <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "oklch(0.22 0.02 60)" }}>
              <h3 className="font-semibold text-sm">Anlık Skor</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                {/* Team 1 */}
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground mb-1 truncate">{data.team1Name}</p>
                  <p className="text-5xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.65 0.12 200)" }}>{data.team1Score}</p>
                </div>

                {/* VS */}
                <div className="text-center">
                  <span className="text-xl font-bold text-muted-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>VS</span>
                </div>

                {/* Team 2 */}
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground mb-1 truncate">{data.team2Name}</p>
                  <p className="text-5xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.70 0.15 30)" }}>{data.team2Score}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "oklch(0.70 0.15 30 / 0.3)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${team1Pct}%`, background: "oklch(0.65 0.12 200)" }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{team1Pct}%</span>
                <span>{100 - team1Pct}%</span>
              </div>
            </div>
          </div>

          {/* Map Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              <p className="text-xs text-muted-foreground mb-1">Harita</p>
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{mapTr}</p>
              <p className="text-xs text-muted-foreground">{data.currentMap}</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              <p className="text-xs text-muted-foreground mb-1">Oyun Modu</p>
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{data.gameMode}</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              <p className="text-xs text-muted-foreground mb-1">Son Güncelleme</p>
              <p className="text-base font-bold text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {new Date(data.fetchedAt).toLocaleTimeString("tr-TR")}
              </p>
              <p className="text-xs text-muted-foreground">Her 15 saniyede güncellenir</p>
            </div>
          </div>

          {/* How to Join */}
          <div className="rounded-lg border p-4" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <h3 className="font-semibold text-sm mb-3">Sunucuya Nasıl Katılırsın?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Battlefield 1'i aç ve <strong className="text-foreground">Sunucuya Gözat</strong>'a tıkla</p>
              <p>2. Arama kutusuna <strong className="text-foreground">[IYI]</strong> yaz</p>
              <p>3. <strong className="text-foreground">[IYI] ALL MAP 200DMG/CQ</strong> sunucusunu seç</p>
              <p>4. Katıl ve iyi oyunlar!</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-lg border" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
          <WifiOff size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sunucu verisi alınamadı.</p>
          <button onClick={() => serverQuery.refetch()} className="mt-3 text-xs font-medium" style={{ color: "oklch(0.72 0.14 75)" }}>
            Tekrar dene →
          </button>
        </div>
      )}
    </div>
  );
}
