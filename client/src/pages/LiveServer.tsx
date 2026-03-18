import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Server, Users, Map, RefreshCw, Shield, Globe, Clock,
  Wifi, WifiOff, Settings, ChevronRight, AlertCircle, Info, ChevronDown
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
  "British Empire": "Birleşik Krallık",
  "French Army": "Fransa",
  "US Army": "Amerika Birleşik Devletleri",
  "Austro-Hungarian Empire": "Avusturya-Macaristan",
  "Russian Empire": "Rus İmparatorluğu",
  "Italian Army": "İtalya Krallığı",
  "Kingdom of Italy": "İtalya Krallığı",
  "Kingdom of Bulgaria": "Bulgaristan Krallığı",
  "Harlem Hellfighters": "Harlem Cehennem Askerleri",
  "Royal Marines": "Kraliyet Denizcileri",
  "United States of America": "Amerika Birleşik Devletleri",
  "United Kingdom": "Birleşik Krallık",
  "France": "Fransa",
  "Red Army": "Kızıl Ordu",
  "Russia": "Rus İmparatorluğu",
  "Austria-Hungary Empire": "Avusturya-Macaristan",
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rotationOpen, setRotationOpen] = useState(false);

  const serverQuery = trpc.server.getLive.useQuery(undefined, {
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 15000,
  });

  const data = serverQuery.data as LiveData | undefined;
  const hasPlayers = data && Number(data.playerCount) > 0;
  const mapTr = data?.currentMap ? (BF1_MAPS[data.currentMap] || data.currentMap) : "Bilinmiyor";
  const modeTr = data?.gameMode ? (BF1_MODES[data.gameMode] || data.gameMode) : "";
  const settings = data?.settings as ServerSettings | null;
  const rotation = (data?.rotation || []) as RotationItem[];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "color-mix(in oklch, var(--success, oklch(0.60 0.15 145)) 15%, transparent)" }}
          >
            <Server size={20} style={{ color: "var(--success, oklch(0.60 0.15 145))" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif", color: "var(--foreground)" }}>
              Canlı Sunucu
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-all"
            style={{
              background: autoRefresh
                ? "color-mix(in oklch, var(--success, oklch(0.60 0.15 145)) 15%, transparent)"
                : "transparent",
              borderColor: autoRefresh
                ? "color-mix(in oklch, var(--success, oklch(0.60 0.15 145)) 40%, transparent)"
                : "var(--border)",
              color: autoRefresh ? "var(--success, oklch(0.60 0.15 145))" : "var(--muted-foreground)",
            }}
          >
            <RefreshCw size={11} className={autoRefresh ? "animate-spin" : ""} style={{ animationDuration: "3s" }} />
            {autoRefresh ? "Otomatik (30s)" : "Manuel"}
          </button>
          <button
            onClick={() => serverQuery.refetch()}
            disabled={serverQuery.isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-all"
            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--primary)" }}
          >
            <RefreshCw size={11} className={serverQuery.isFetching ? "animate-spin" : ""} />
            Yenile
          </button>
        </div>
      </div>

      {/* Loading */}
      {serverQuery.isLoading && (
        <div className="space-y-4">
          <div className="h-48 rounded-lg animate-pulse" style={{ background: "var(--muted)" }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 rounded-lg animate-pulse" style={{ background: "var(--muted)" }} />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {serverQuery.isError && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg border"
          style={{ background: "color-mix(in oklch, oklch(0.55 0.20 25) 10%, transparent)", borderColor: "color-mix(in oklch, oklch(0.55 0.20 25) 30%, transparent)" }}
        >
          <AlertCircle size={18} style={{ color: "oklch(0.55 0.20 25)" }} className="shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: "oklch(0.75 0.15 25)" }}>
            Sunucu verisi alınamadı. Lütfen tekrar deneyin.
          </p>
        </div>
      )}

      {/* Server Data */}
      {data && !serverQuery.isLoading && (
        <div className="space-y-4">
          {/* Main Server Card */}
          <div
            className="rounded-lg border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            {/* Map Banner */}
            <div className="relative h-44 overflow-hidden">
              {data.mapImage ? (
                <img src={data.mapImage} alt={data.currentMap} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "var(--muted)" }}
                >
                  <Map size={40} className="opacity-30" style={{ color: "var(--muted-foreground)" }} />
                </div>
              )}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, var(--card) 0%, transparent 55%)" }}
              />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <p className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {modeTr || data.gameMode}
                  </p>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Oswald', sans-serif", color: "var(--foreground)" }}>
                    {mapTr}
                  </h2>
                  {mapTr !== data.currentMap && (
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{data.currentMap}</p>
                  )}
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: hasPlayers
                      ? "color-mix(in oklch, oklch(0.60 0.15 145) 20%, transparent)"
                      : "color-mix(in oklch, var(--muted-foreground) 20%, transparent)",
                    color: hasPlayers ? "oklch(0.60 0.15 145)" : "var(--muted-foreground)",
                    border: `1px solid ${hasPlayers ? "color-mix(in oklch, oklch(0.60 0.15 145) 40%, transparent)" : "var(--border)"}`,
                  }}
                >
                  {hasPlayers ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {hasPlayers ? "Aktif" : "Boş"}
                </div>
              </div>
            </div>

            {/* Server Info */}
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--foreground)" }}>
                {data.serverName}
              </h3>

              {/* Player Count */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Users size={14} style={{ color: "var(--primary)" }} />
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: "'Rajdhani', sans-serif", color: "var(--primary)" }}
                  >
                    {data.playerCount} / {data.maxPlayers}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>oyuncu</span>
                </div>
                {Number(data.queueCount) > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: "color-mix(in oklch, var(--primary) 15%, transparent)",
                      color: "var(--primary)",
                    }}
                  >
                    +{data.queueCount} kuyrukta
                  </span>
                )}
              </div>

              {/* Player bar */}
              <div
                className="w-full h-2 rounded-full mb-4 overflow-hidden"
                style={{ background: "var(--muted)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (Number(data.playerCount) / Number(data.maxPlayers)) * 100)}%`,
                    background: Number(data.playerCount) > 48
                      ? "oklch(0.55 0.20 25)"
                      : Number(data.playerCount) > 24
                        ? "var(--primary)"
                        : "oklch(0.60 0.15 145)",
                  }}
                />
              </div>

              {/* Teams */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { name: data.team1Name, image: data.team1Image, score: data.team1Score },
                  { name: data.team2Name, image: data.team2Image, score: data.team2Score },
                ].map((team, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg flex items-center gap-3"
                    style={{ background: "var(--muted)" }}
                  >
                    {team.image && (
                      <img
                        src={team.image}
                        alt={team.name}
                        className="w-8 h-8 object-contain"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                        {BF1_TEAMS[team.name || ""] || team.name || "Takım"}
                      </p>
                      {team.score !== null && team.score !== undefined ? (
                        <p
                          className="text-xl font-bold"
                          style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            color: i === 0 ? "oklch(0.65 0.12 200)" : "oklch(0.70 0.15 30)",
                          }}
                        >
                          {team.score}
                        </p>
                      ) : (
                        <p className="text-xs italic mt-0.5" style={{ color: "var(--muted-foreground)" }}>—</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Score note when server is empty */}
              {!hasPlayers && (
                <div
                  className="flex items-start gap-2 p-3 rounded-lg mb-4"
                  style={{
                    background: "color-mix(in oklch, oklch(0.65 0.12 200) 8%, transparent)",
                    border: "1px solid color-mix(in oklch, oklch(0.65 0.12 200) 20%, transparent)",
                  }}
                >
                  <Info size={13} style={{ color: "oklch(0.65 0.12 200)" }} className="shrink-0 mt-0.5" />
                  <p className="text-xs" style={{ color: "oklch(0.65 0.12 200)" }}>
                    Bilet skorları yalnızca aktif oyun sırasında görüntülenebilir. Sunucu şu an boş — katılmak için Discord'a göz at!
                  </p>
                </div>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                {data.activeAdmin && (
                  <div className="flex items-center gap-1">
                    <Shield size={11} style={{ color: "var(--primary)" }} />
                    <span>
                      Sahip:{" "}
                      <span className="font-medium" style={{ color: "var(--foreground)" }}>
                        {data.activeAdmin}
                      </span>
                    </span>
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

          {/* Server Settings - Accordion */}
          {settings && Object.keys(settings).length > 0 && (
            <div
              className="rounded-lg border overflow-hidden"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <button
                onClick={() => setSettingsOpen(v => !v)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-accent/30"
                style={{ borderBottom: settingsOpen ? "1px solid var(--border)" : "none" }}
              >
                <Settings size={14} style={{ color: "var(--primary)" }} />
                <h3 className="font-semibold text-sm flex-1" style={{ color: "var(--foreground)" }}>
                  Sunucu Ayarları
                </h3>
                <ChevronDown
                  size={14}
                  style={{
                    color: "var(--muted-foreground)",
                    transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {settingsOpen && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(settings).map(([category, values]) => (
                    <div key={category}>
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{ color: "var(--primary)" }}
                      >
                        {category}
                      </p>
                      <div className="space-y-1">
                        {Object.entries(values as Record<string, string>).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span style={{ color: "var(--muted-foreground)" }}>{key}</span>
                            <span
                              className="font-medium"
                              style={{
                                color: val === "on"
                                  ? "oklch(0.60 0.15 145)"
                                  : val === "off"
                                    ? "var(--muted-foreground)"
                                    : "var(--primary)",
                              }}
                            >
                              {val === "on" ? "✓" : val === "off" ? "✗" : val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Map Rotation - Accordion */}
          {rotation.length > 0 && (
            <div
              className="rounded-lg border overflow-hidden"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <button
                onClick={() => setRotationOpen(v => !v)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-accent/30"
                style={{ borderBottom: rotationOpen ? "1px solid var(--border)" : "none" }}
              >
                <Map size={14} style={{ color: "oklch(0.65 0.12 200)" }} />
                <h3 className="font-semibold text-sm flex-1" style={{ color: "var(--foreground)" }}>
                  Harita Rotasyonu
                </h3>
                <span className="text-xs mr-2" style={{ color: "var(--muted-foreground)" }}>
                  {rotation.length} harita
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: "var(--muted-foreground)",
                    transform: rotationOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {rotationOpen && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {rotation.map((item, i) => (
                    <div
                      key={i}
                      className="rounded overflow-hidden"
                      style={{ background: "var(--muted)" }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.mapname || ""}
                          className="w-full h-16 object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <div className="p-2">
                        <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>
                          {BF1_MAPS[item.mapname || ""] || item.mapname || "?"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {BF1_MODES[item.mode || ""] || item.mode || ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* How to Join */}
          <div
            className="rounded-lg border p-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>
                  Sunucuya Katıl
                </h3>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  BF1'de <strong style={{ color: "var(--foreground)" }}>[IYI]</strong> aratın veya Discord'dan katılın
                </p>
              </div>
              <a
                href="https://discord.gg/kayiboyuclan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold no-underline shrink-0"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Discord <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!data && !serverQuery.isLoading && !serverQuery.isError && (
        <div
          className="text-center py-16 rounded-lg border"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <WifiOff size={32} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Sunucu verisi alınamadı.</p>
          <button
            onClick={() => serverQuery.refetch()}
            className="mt-3 text-xs font-medium"
            style={{ color: "var(--primary)" }}
          >
            Tekrar dene →
          </button>
        </div>
      )}
    </div>
  );
}
