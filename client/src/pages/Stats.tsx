import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { normalizeTurkish, secondsToHoursCeil, formatNumber, formatKD } from "@/lib/utils";
import { Search, User, Target, Clock, TrendingUp, Crosshair, Shield, Award, ChevronRight, AlertCircle } from "lucide-react";
import { Link } from "wouter";

interface PlayerStats {
  userName?: string;
  rank?: number;
  rankImg?: string;
  avatar?: string;
  kills?: number;
  deaths?: number;
  kdr?: number;
  kpm?: number;
  spm?: number;
  accuracy?: number;
  headshots?: number;
  headshotsPercent?: number;
  revives?: number;
  dogtagsTaken?: number;
  longestHeadshot?: number;
  highestKillStreak?: number;
  timePlayed?: number;
  wins?: number;
  losses?: number;
  infantryKills?: number;
  vehicleKills?: number;
  weapons?: Array<{ name: string; kills: number; accuracy: number; timeEquipped: number; image: string; type: string }>;
  vehicles?: Array<{ vehicleName: string; kills: number; timePlayed: number; image: string }>;
  classes?: Record<string, { kills: number; timePlayed: number; kdr: number; image?: string }>;
}

export default function Stats() {
  const searchStr = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(searchStr);
  const initialPlayer = params.get("player") || "";

  const [playerInput, setPlayerInput] = useState(initialPlayer);
  const [searchedPlayer, setSearchedPlayer] = useState(initialPlayer);
  const [platform, setPlatform] = useState("pc");

  const statsQuery = trpc.stats.getPlayer.useQuery(
    { name: searchedPlayer, platform },
    { enabled: !!searchedPlayer, retry: false }
  );

  useEffect(() => {
    if (initialPlayer) setSearchedPlayer(initialPlayer);
  }, [initialPlayer]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInput.trim()) return;
    const normalized = playerInput.trim();
    setSearchedPlayer(normalized);
    navigate(`/istatistik?player=${encodeURIComponent(normalized)}`);
  };

  const rawData = statsQuery.data?.data as PlayerStats | undefined;

  // Safely parse all numeric fields - Gametools API sometimes returns strings
  const data: PlayerStats | undefined = rawData ? {
    ...rawData,
    kdr: parseFloat(String(rawData.kdr ?? 0)) || 0,
    kpm: parseFloat(String(rawData.kpm ?? 0)) || 0,
    spm: parseFloat(String(rawData.spm ?? 0)) || 0,
    accuracy: parseFloat(String(rawData.accuracy ?? 0)) || 0,
    headshotsPercent: parseFloat(String(rawData.headshotsPercent ?? 0)) || 0,
    kills: parseInt(String(rawData.kills ?? 0)) || 0,
    deaths: parseInt(String(rawData.deaths ?? 0)) || 0,
    revives: parseInt(String(rawData.revives ?? 0)) || 0,
    dogtagsTaken: parseInt(String(rawData.dogtagsTaken ?? 0)) || 0,
    longestHeadshot: parseFloat(String(rawData.longestHeadshot ?? 0)) || 0,
    highestKillStreak: parseInt(String(rawData.highestKillStreak ?? 0)) || 0,
    wins: parseInt(String(rawData.wins ?? 0)) || 0,
    losses: parseInt(String(rawData.losses ?? 0)) || 0,
    timePlayed: parseFloat(String(rawData.timePlayed ?? 0)) || 0,
    rank: parseInt(String(rawData.rank ?? 0)) || 0,
    weapons: rawData.weapons?.map(w => ({
      ...w,
      kills: parseInt(String(w.kills ?? 0)) || 0,
      accuracy: parseFloat(String(w.accuracy ?? 0)) || 0,
      timeEquipped: parseFloat(String(w.timeEquipped ?? 0)) || 0,
    })),
    vehicles: rawData.vehicles?.map(v => ({
      ...v,
      kills: parseInt(String(v.kills ?? 0)) || 0,
      timePlayed: parseFloat(String(v.timePlayed ?? 0)) || 0,
    })),
    classes: rawData.classes ? Object.fromEntries(
      Object.entries(rawData.classes).map(([k, v]) => [k, {
        ...v,
        kills: parseInt(String(v.kills ?? 0)) || 0,
        kdr: parseFloat(String(v.kdr ?? 0)) || 0,
        timePlayed: parseFloat(String(v.timePlayed ?? 0)) || 0,
      }])
    ) : undefined,
  } : undefined;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.65 0.12 200 / 0.15)" }}>
          <Target size={20} style={{ color: "oklch(0.65 0.12 200)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>Oyuncu İstatistikleri</h1>
          <p className="text-sm text-muted-foreground">Gametools Network API ile gerçek zamanlı BF1 verileri</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={playerInput}
            onChange={e => setPlayerInput(e.target.value)}
            placeholder="Oyuncu adı gir (örn: DVHAN, rainrapmusic0001)"
            className="w-full h-10 pl-9 pr-3 text-sm rounded-l border outline-none"
            style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }}
          />
        </div>
        <select value={platform} onChange={e => setPlatform(e.target.value)} className="h-10 px-3 text-sm border outline-none" style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }}>
          <option value="pc">PC</option>
          <option value="xbox">Xbox</option>
          <option value="ps4">PS4</option>
        </select>
        <button type="submit" className="h-10 px-4 rounded-r text-sm font-semibold" style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75), oklch(0.65 0.12 70))", color: "oklch(0.10 0.01 60)" }}>
          Ara
        </button>
      </form>

      {/* Loading */}
      {statsQuery.isLoading && (
        <div className="space-y-4">
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
          </div>
        </div>
      )}

      {/* Error */}
      {statsQuery.isError && (
        <div className="flex items-start gap-3 p-4 rounded-lg border" style={{ background: "oklch(0.55 0.20 25 / 0.1)", borderColor: "oklch(0.55 0.20 25 / 0.3)" }}>
          <AlertCircle size={18} style={{ color: "oklch(0.55 0.20 25)" }} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium" style={{ color: "oklch(0.75 0.15 25)" }}>
              {statsQuery.error.message === "Oyuncu bulunamadı" ? `"${searchedPlayer}" adlı oyuncu bulunamadı.` : "Veri alınırken hata oluştu."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Türkçe karakter normalizasyonu aktif. Farklı yazım deneyin veya platform seçin.
            </p>
          </div>
        </div>
      )}

      {/* Player Data */}
      {data && !statsQuery.isLoading && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <div className="p-6" style={{ background: "linear-gradient(135deg, oklch(0.16 0.02 58), oklch(0.13 0.015 55))" }}>
              <div className="flex items-start gap-4">
                <div className="relative">
                  {data.avatar ? (
                    <img src={data.avatar} alt={data.userName} className="w-16 h-16 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.22 0.02 60)" }}>
                      <User size={28} className="text-muted-foreground" />
                    </div>
                  )}
                  {data.rankImg && (
                    <img src={data.rankImg} alt={`Rank ${data.rank}`} className="absolute -bottom-2 -right-2 w-8 h-8 object-contain" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>{data.userName || searchedPlayer}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {data.rank && <span className="flex items-center gap-1"><Award size={13} /> Rank {data.rank}</span>}
                    {data.timePlayed !== undefined && (
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {secondsToHoursCeil(data.timePlayed)} Saat
                      </span>
                    )}
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "oklch(0.22 0.02 60)" }}>
                      {platform.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatWidget label="K/D Oranı" value={data.kdr?.toFixed(2) || formatKD(data.kills || 0, data.deaths || 0)} sub={`${formatNumber(data.kills || 0)} Kill / ${formatNumber(data.deaths || 0)} Ölüm`} color="oklch(0.72 0.14 75)" icon={<Crosshair size={16} />} />
            <StatWidget label="KPM" value={(data.kpm || 0).toFixed(2)} sub="Dakika Başına Kill" color="oklch(0.65 0.12 200)" icon={<TrendingUp size={16} />} />
            <StatWidget label="SPM" value={formatNumber(Math.round(data.spm || 0))} sub="Dakika Başına Skor" color="oklch(0.60 0.15 145)" icon={<Award size={16} />} />
            <StatWidget label="İsabet Oranı" value={`${(data.accuracy || 0).toFixed(1)}%`} sub={`${(data.headshotsPercent || 0).toFixed(1)}% Kafa Vuruşu`} color="oklch(0.70 0.15 30)" icon={<Target size={16} />} />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Canlandırma", value: formatNumber(data.revives || 0) },
              { label: "Künyeler", value: formatNumber(data.dogtagsTaken || 0) },
              { label: "En Uzun Atış", value: `${data.longestHeadshot || 0}m` },
              { label: "En Uzun Seri", value: formatNumber(data.highestKillStreak || 0) },
              { label: "Galibiyet", value: formatNumber(data.wins || 0) },
              { label: "Mağlubiyet", value: formatNumber(data.losses || 0) },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded border text-center" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-base font-bold text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Top Weapons */}
          {data.weapons && data.weapons.length > 0 && (
            <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "oklch(0.22 0.02 60)" }}>
                <h3 className="font-semibold text-sm">En Çok Kullanılan Silahlar</h3>
                <Link href="/ansiklopedi" className="text-xs no-underline" style={{ color: "oklch(0.72 0.14 75)" }}>Ansiklopedi →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="table-bf1">
                  <thead>
                    <tr>
                      <th>Silah</th>
                      <th>Kill</th>
                      <th>İsabet</th>
                      <th>Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.weapons.slice(0, 8).map((w, i) => (
                      <tr key={i}>
                        <td>
                          <div className="flex items-center gap-2">
                            {w.image && <img src={w.image} alt={w.name} className="w-10 h-6 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                            <div>
                              <p className="text-sm font-medium text-foreground">{w.name}</p>
                              <p className="text-xs text-muted-foreground">{w.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="font-semibold" style={{ color: "oklch(0.75 0.16 75)" }}>{formatNumber(w.kills)}</td>
                        <td className="text-muted-foreground">{(w.accuracy || 0).toFixed(1)}%</td>
                        <td className="text-muted-foreground">{secondsToHoursCeil(w.timeEquipped)} Saat</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Vehicles */}
          {data.vehicles && data.vehicles.length > 0 && (
            <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "oklch(0.22 0.02 60)" }}>
                <h3 className="font-semibold text-sm">En Çok Kullanılan Araçlar</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table-bf1">
                  <thead>
                    <tr>
                      <th>Araç</th>
                      <th>Kill</th>
                      <th>Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vehicles.slice(0, 6).map((v, i) => (
                      <tr key={i}>
                        <td>
                          <div className="flex items-center gap-2">
                            {v.image && <img src={v.image} alt={v.vehicleName} className="w-10 h-6 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                            <p className="text-sm font-medium text-foreground">{v.vehicleName}</p>
                          </div>
                        </td>
                        <td className="font-semibold" style={{ color: "oklch(0.75 0.16 75)" }}>{formatNumber(v.kills)}</td>
                        <td className="text-muted-foreground">{secondsToHoursCeil(v.timePlayed * 60)} Saat</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Classes */}
          {data.classes && Object.keys(data.classes).length > 0 && (
            <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "oklch(0.22 0.02 60)" }}>
                <h3 className="font-semibold text-sm">Sınıf İstatistikleri</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
                {Object.entries(data.classes).map(([cls, stats]) => (
                  <div key={cls} className="p-3 rounded border" style={{ background: "oklch(0.14 0.01 58)", borderColor: "oklch(0.25 0.02 60)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      {stats.image && <img src={stats.image} alt={cls} className="w-6 h-6 object-contain" />}
                      <span className="text-xs font-semibold text-foreground">{cls}</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between"><span>Kill</span><span className="text-foreground font-medium">{formatNumber(stats.kills)}</span></div>
                      <div className="flex justify-between"><span>K/D</span><span className="text-foreground font-medium">{(stats.kdr || 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Süre</span><span className="text-foreground font-medium">{secondsToHoursCeil(stats.timePlayed)} Saat</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!searchedPlayer && !statsQuery.isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "oklch(0.65 0.12 200 / 0.1)" }}>
            <Search size={28} style={{ color: "oklch(0.65 0.12 200)" }} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Oyuncu Ara</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Battlefield 1 oyuncu adını girerek istatistiklerini görüntüle. Türkçe karakter normalizasyonu otomatik uygulanır.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield size={12} />
            <span>Fuzzy search aktif — yazım hatalarını tolere eder</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatWidget({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg border" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ fontFamily: "'Rajdhani', sans-serif", color }}>{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
