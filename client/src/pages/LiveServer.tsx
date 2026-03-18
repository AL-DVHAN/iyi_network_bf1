import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Server, Users, Map, RefreshCw, Shield, Globe, Clock,
  Wifi, WifiOff, Settings, ChevronRight, AlertCircle, Info
} from "lucide-react";

const BF1_MAPS: Record<string, string> = {
  "Sinai Desert": "Sina Çölü",
  "Ballroom Blitz": "Balo Salonu Baskını",
  "Argonne Forest": "Argonne Ormanı",
  "Fao Fortress": "Fao Kalesi",
  "Monte Grappa": "Monte Grappa",
  "Empire's Edge": "İmparatorluğun Kıyısı",
  "Amiens": "Amiens",
  "Suez": "Süveyş",
  "St. Quentin Scar": "St. Quentin Yarası",
  "Giant's Shadow": "Giant'ın Gölgesi",
  "Lupkow Pass": "Lupkow Geçidi",
  "Verdun Heights": "Verdun Tepeleri",
  "Prise de Tahure": "Tahure Kuşatması",
  "Fort De Vaux": "Vaux Kalesi",
  "Passchendaele": "Passchendaele",
  "Caporetto": "Caporetto",
  "Brusilov Keep": "Brusilov Kalesi",
  "Albion": "Albion",
  "River Somme": "Somme Nehri",
  "Cape Helles": "Seddülbahir",
  "Achi Baba": "Alçıtepe",
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
  "Galicia": "Galiçya",
  "Nivelle Nights": "Nivelle Geceleri",
  "Kaiserschlacht": "Kaiserschlacht",
  "Łódź": "Lodz",
};

const BF1_MODES: Record<string, string> = {
  "Conquest": "Fetih",
  "ConquestLarge0": "Fetih (Büyük)",
  "ConquestSmall0": "Fetih (Küçük)",
  "Rush0": "Saldırı",
  "TeamDeathMatch0": "Takım Dövüşü",
  "BreakthroughLarge0": "Kırılış (Büyük)",
  "Breakthrough0": "Kırılış",
  "AirAssault0": "Hava Saldırısı",
  "Domination0": "Hakimiyet",
  "SupremeCommander0": "Yüksek Komutan",
  "ZoneControl0": "Bölge Kontrolü",
  "Possession0": "Ele Geçirme",
  "War Pigeons": "Savaş Güvercinleri",
  "Operations": "Harekat",
};

const BF1_TEAMS: Record<string, string> = {
  "German Empire": "Alman İmparatorluğu",
  "Ottoman Empire": "Osmanlı İmparatorluğu",
  "British Empire": "İngiliz İmparatorluğu",
  "French Army": "Fransız Ordusu",
  "US Army": "ABD Ordusu",
  "Austro-Hungarian Empire": "Avusturya-Macaristan İmparatorluğu",
  "Russian Empire": "Rus İmparatorluğu",
  "Italian Army": "İtalyan Ordusu",
  "Kingdom of Italy": "İtalya Krallığı",
  "Kingdom of Bulgaria": "Bulgaristan Krallığı",
  "Harlem Hellfighters": "Harlem Cehennem Askerleri",
  "Royal Marines": "Kraliyet Denizcileri",
};

interface ServerSettings {
  Misc?: Record<string, string>;
  Scales?: Record<string, string>;
  Weapons?: Record<string, string>;
  Vehicles?: Record<string, string>;
  Kits?: Record<string, string>;
}

interface RotationItem {
  mapname?: string;
  mode?: string;
  image?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LiveData = Record<string, any>;

export default function LiveServer() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const serverQuery = trpc.server.getLive.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 15000,
  });

  const data = serverQuery.data as LiveData | undefined;
  const hasPlayers = data && Number(data.playerCount) > 0;
  const mapTr = data?.currentMap ? (BF1_MAPS[data.currentMap] || data.currentMap) : "Bilinmiyor";
  const settings = data?.settings as ServerSettings | null;
  const rotation = (data?.rotation || []) as RotationItem[];

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
            <p className="text-sm text-muted-foreground">Gametools Network API — gerçek zamanlı veri</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border"
            style={{
              background: autoRefresh ? "oklch(0.60 0.15 145 / 0.15)" : "transparent",
              borderColor: autoRefresh ? "oklch(0.60 0.15 145 / 0.4)" : "oklch(0.28 0.03 60)",
              color: autoRefresh ? "oklch(0.60 0.15 145)" : "oklch(0.55 0.02 60)"
            }}
          >
            <RefreshCw size={11} className={autoRefresh ? "animate-spin" : ""} style={{ animationDuration: "3s" }} />
            {autoRefresh ? "Otomatik (30s)" : "Manuel"}
          </button>
          <button
            onClick={() => serverQuery.refetch()}
            disabled={serverQuery.isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border"
            style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.72 0.14 75)" }}
          >
            <RefreshCw size={11} className={serverQuery.isFetching ? "animate-spin" : ""} />
            Yenile
          </button>
        </div>
      </div>

      {/* Loading */}
      {serverQuery.isLoading && (
        <div className="space-y-4">
          <div className="h-48 rounded-lg bg-muted animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
          </div>
        </div>
      )}

      {/* Error */}
      {serverQuery.isError && (
        <div className="flex items-start gap-3 p-4 rounded-lg border" style={{ background: "oklch(0.55 0.20 25 / 0.1)", borderColor: "oklch(0.55 0.20 25 / 0.3)" }}>
          <AlertCircle size={18} style={{ color: "oklch(0.55 0.20 25)" }} className="shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: "oklch(0.75 0.15 25)" }}>Sunucu verisi alınamadı. Lütfen tekrar deneyin.</p>
        </div>
      )}

      {/* Server Data */}
      {data && !serverQuery.isLoading && (
        <div className="space-y-6">
          {/* Main Server Card */}
          <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            {/* Map Banner */}
            <div className="relative h-44 overflow-hidden">
              {data.mapImage ? (
                <img src={data.mapImage} alt={data.currentMap} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "oklch(0.13 0.015 55)" }}>
                  <Map size={40} className="text-muted-foreground opacity-30" />
                </div>
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0.16 0.015 58) 0%, transparent 55%)" }} />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{data.gameMode}</p>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>{mapTr}</h2>
                  {mapTr !== data.currentMap && <p className="text-xs text-muted-foreground">{data.currentMap}</p>}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{
                  background: hasPlayers ? "oklch(0.60 0.15 145 / 0.2)" : "oklch(0.45 0.05 60 / 0.3)",
                  color: hasPlayers ? "oklch(0.60 0.15 145)" : "oklch(0.55 0.05 60)",
                  border: `1px solid ${hasPlayers ? "oklch(0.60 0.15 145 / 0.4)" : "oklch(0.35 0.03 60)"}`
                }}>
                  {hasPlayers ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {hasPlayers ? "Aktif" : "Boş"}
                </div>
              </div>
            </div>

            {/* Server Info */}
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-3 text-foreground">{data.serverName}</h3>

              {/* Player Count */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Users size={14} style={{ color: "oklch(0.72 0.14 75)" }} />
                  <span className="text-lg font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.72 0.14 75)" }}>
                    {data.playerCount} / {data.maxPlayers}
                  </span>
                  <span className="text-xs text-muted-foreground">oyuncu</span>
                </div>
                {Number(data.queueCount) > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "oklch(0.72 0.14 75 / 0.15)", color: "oklch(0.72 0.14 75)" }}>
                    +{data.queueCount} kuyrukta
                  </span>
                )}
              </div>

              {/* Player bar */}
              <div className="w-full h-2 rounded-full mb-4 overflow-hidden" style={{ background: "oklch(0.22 0.02 60)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (Number(data.playerCount) / Number(data.maxPlayers)) * 100)}%`,
                    background: Number(data.playerCount) > 48 ? "oklch(0.55 0.20 25)" : Number(data.playerCount) > 24 ? "oklch(0.72 0.14 75)" : "oklch(0.60 0.15 145)"
                  }}
                />
              </div>

              {/* Teams */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { name: data.team1Name, image: data.team1Image, score: data.team1Score },
                  { name: data.team2Name, image: data.team2Image, score: data.team2Score },
                ].map((team, i) => (
                  <div key={i} className="p-3 rounded-lg flex items-center gap-3" style={{ background: "oklch(0.20 0.02 58)" }}>
                    {team.image && (
                      <img src={team.image} alt={team.name} className="w-8 h-8 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{BF1_TEAMS[team.name || ""] || team.name || "Takım"}</p>
                      {team.score !== null && team.score !== undefined ? (
                        <p className="text-xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: i === 0 ? "oklch(0.65 0.12 200)" : "oklch(0.70 0.15 30)" }}>
                          {team.score}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic mt-0.5">—</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Score note when server is empty */}
              {!hasPlayers && (
                <div className="flex items-start gap-2 p-3 rounded-lg mb-4" style={{ background: "oklch(0.65 0.12 200 / 0.08)", border: "1px solid oklch(0.65 0.12 200 / 0.2)" }}>
                  <Info size={13} style={{ color: "oklch(0.65 0.12 200)" }} className="shrink-0 mt-0.5" />
                  <p className="text-xs" style={{ color: "oklch(0.65 0.12 200)" }}>
                    Bilet skorları yalnızca aktif oyun sırasında görüntülenebilir. Sunucu şu an boş — katılmak için Discord'a göz at!
                  </p>
                </div>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {data.activeAdmin && (
                  <div className="flex items-center gap-1">
                    <Shield size={11} style={{ color: "oklch(0.72 0.14 75)" }} />
                    <span>Sahip: <span className="text-foreground font-medium">{data.activeAdmin}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Globe size={11} />
                  <span>{data.region || "EU"} — {data.country || "DE"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>Son güncelleme: {new Date(data.fetchedAt).toLocaleTimeString("tr-TR")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Server Settings */}
          {settings && Object.keys(settings).length > 0 && (
            <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "oklch(0.22 0.02 60)" }}>
                <Settings size={14} style={{ color: "oklch(0.72 0.14 75)" }} />
                <h3 className="font-semibold text-sm">Sunucu Ayarları</h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(settings).map(([category, values]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "oklch(0.72 0.14 75)" }}>{category}</p>
                    <div className="space-y-1">
                      {Object.entries(values as Record<string, string>).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium" style={{
                            color: val === "on" ? "oklch(0.60 0.15 145)" : val === "off" ? "oklch(0.40 0.03 60)" : "oklch(0.72 0.14 75)"
                          }}>
                            {val === "on" ? "✓" : val === "off" ? "✗" : val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map Rotation */}
          {rotation.length > 0 && (
            <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "oklch(0.22 0.02 60)" }}>
                <Map size={14} style={{ color: "oklch(0.65 0.12 200)" }} />
                <h3 className="font-semibold text-sm">Harita Rotasyonu</h3>
                <span className="text-xs text-muted-foreground ml-auto">{rotation.length} harita</span>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {rotation.map((item, i) => (
                  <div key={i} className="rounded overflow-hidden" style={{ background: "oklch(0.20 0.02 58)" }}>
                    {item.image && (
                      <img src={item.image} alt={item.mapname || ""} className="w-full h-16 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div className="p-2">
                      <p className="text-xs font-medium text-foreground truncate">{BF1_MAPS[item.mapname || ""] || item.mapname || "?"}</p>
                      <p className="text-xs text-muted-foreground">{BF1_MODES[item.mode || ""] || item.mode || ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to Join */}
          <div className="rounded-lg border p-4" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm mb-1">Sunucuya Katıl</h3>
                <p className="text-xs text-muted-foreground">BF1'de <strong className="text-foreground">[IYI]</strong> aratın veya Discord'dan katılın</p>
              </div>
              <a
                href="https://discord.gg/kayiboyuclan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold no-underline shrink-0"
                style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75), oklch(0.65 0.12 70))", color: "oklch(0.10 0.01 60)" }}
              >
                Discord <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!data && !serverQuery.isLoading && !serverQuery.isError && (
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
