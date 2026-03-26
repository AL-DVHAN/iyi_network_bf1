import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { secondsToHoursCeil, formatNumber } from "@/lib/utils";
import {
  Target, Clock, TrendingUp, Crosshair, Shield,
  Award, AlertCircle, ArrowLeft
} from "lucide-react";


interface PlayerStats {
  name: string;
  avatar?: string;
  killDeath?: number;
  killsPerMinute?: number;
  scorePerMinute?: number;
  accuracy?: string;
  headshots?: string;
  longestHeadShot?: number;
  highestKillStreak?: number;
  secondsPlayed?: number;
  wins?: number;
  losses?: number;
  bestClass?: string;
  bestWeapon?: string;
  lastServer?: string;
  lastMap?: string;
  isOnline?: boolean;
}

interface WeaponStats {
  name: string;
  type: string;
  kills: number;
  kpm: number;
  score: number;
  secondsPlayed: number;
  image?: string;
}

interface ClassStats {
  name: string;
  kills: number;
  kpm: number;
  score: number;
  secondsPlayed: number;
  image?: string;
}

const WEAPON_TRANSLATIONS: Record<string, string> = {
  "Assault Rifle": "Saldırı Tüfeği",
  "Sniper Rifle": "Keskin Nişancı Tüfeği",
  "Light Machine Gun": "Hafif Makinalı Tüfek",
  "Shotgun": "Pompalı Tüfek",
  "Pistol": "Tabanca",
  "Melee": "Yakın Dövüş",
  "Grenade": "El Bombası",
  "Gadget": "Gadget",
};

const CLASS_TRANSLATIONS: Record<string, string> = {
  "Assault": "Taarruz",
  "Medic": "Sıhhiyeci",
  "Support": "Destek",
  "Scout": "Nişancı",
  "Cavalry": "Tankçı",
};

export default function PlayerProfile() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const playerName = searchParams.get("name") || "";
  
  const [playerData, setPlayerData] = useState<PlayerStats | null>(null);
  const [weapons, setWeapons] = useState<WeaponStats[]>([]);
  const [classes, setClasses] = useState<ClassStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerName) return;
    
    const fetchPlayerData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.gametools.network/v1/players?name=${encodeURIComponent(playerName)}&platform=pc`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.player) {
            setPlayerData({
              name: data.player.name,
              avatar: data.player.avatar,
              killDeath: data.player.killDeath,
              killsPerMinute: data.player.killsPerMinute,
              scorePerMinute: data.player.scorePerMinute,
              accuracy: data.player.accuracy,
              headshots: data.player.headshots,
              longestHeadShot: data.player.longestHeadShot,
              highestKillStreak: data.player.highestKillStreak,
              secondsPlayed: data.player.secondsPlayed,
              wins: data.player.wins,
              losses: data.player.losses,
              lastServer: data.player.lastServer,
              lastMap: data.player.lastMap,
              isOnline: data.player.isOnline,
            });

            // Parse weapons
            if (data.player.weapons) {
              const weaponList = data.player.weapons.map((w: any) => ({
                name: w.name,
                type: WEAPON_TRANSLATIONS[w.type] || w.type,
                kills: w.kills || 0,
                kpm: w.killsPerMinute || 0,
                score: w.score || 0,
                secondsPlayed: w.secondsPlayed || 0,
                image: w.image,
              }));
              setWeapons(weaponList.sort((a: WeaponStats, b: WeaponStats) => b.kills - a.kills).slice(0, 5));
            }

            // Parse classes
            if (data.player.classes) {
              const classList = data.player.classes.map((c: any) => ({
                name: CLASS_TRANSLATIONS[c.name] || c.name,
                kills: c.kills || 0,
                kpm: c.killsPerMinute || 0,
                score: c.score || 0,
                secondsPlayed: c.secondsPlayed || 0,
                image: c.image,
              }));
              setClasses(classList.sort((a: ClassStats, b: ClassStats) => b.kills - a.kills));
            }
          }
        } else {
          setError("Oyuncu bulunamadı");
        }
      } catch (err) {
        setError("Veri yüklenirken hata oluştu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerName]);

  if (!playerName) {
    return (
      <div className="container py-8">
        <a href="/istatistik" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 cursor-pointer">
          <ArrowLeft size={18} />
          İstatistiklere Dön
        </a>
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Oyuncu seçilmedi</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <a href="/istatistik" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 cursor-pointer">
          <ArrowLeft size={18} />
          İstatistiklere Dön
        </a>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--primary)" }}></div>
          <p className="text-muted-foreground mt-4">Oyuncu profili yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !playerData) {
    return (
      <div className="container py-8">
        <a href="/istatistik" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4 cursor-pointer">
          <ArrowLeft size={18} />
          İstatistiklere Dön
        </a>
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto mb-4 text-destructive" />
          <p className="text-destructive">{error || "Oyuncu bulunamadı"}</p>
        </div>
      </div>
    );
  }

  const winRate = playerData.wins && playerData.losses 
    ? ((playerData.wins / (playerData.wins + playerData.losses)) * 100).toFixed(1)
    : "N/A";

  return (
    <div className="container py-8">
      <a href="/istatistik" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 cursor-pointer">
        <ArrowLeft size={18} />
        İstatistiklere Dön
      </a>

      {/* Header */}
      <div className="flex items-start gap-6 mb-8 p-6 rounded-lg" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {playerData.avatar && (
          <img
            src={playerData.avatar}
            alt={playerData.name}
            className="w-24 h-24 rounded-lg object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{playerData.name}</h1>
            {playerData.isOnline && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "oklch(0.65 0.12 140)", color: "white" }}>
                ● Çevrimiçi
              </span>
            )}
          </div>
          {playerData.lastServer && (
            <p className="text-sm text-muted-foreground mb-1">Sunucu: {playerData.lastServer}</p>
          )}
          {playerData.lastMap && (
            <p className="text-sm text-muted-foreground">Harita: {playerData.lastMap}</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} style={{ color: "oklch(0.75 0.16 75)" }} />
            <span className="text-xs text-muted-foreground">K/D Oranı</span>
          </div>
          <p className="text-2xl font-bold">{(playerData.killDeath || 0).toFixed(2)}</p>
        </div>

        <div className="p-4 rounded-lg" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Crosshair size={18} style={{ color: "oklch(0.65 0.12 140)" }} />
            <span className="text-xs text-muted-foreground">KPM</span>
          </div>
          <p className="text-2xl font-bold">{(playerData.killsPerMinute || 0).toFixed(2)}</p>
        </div>

        <div className="p-4 rounded-lg" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} style={{ color: "oklch(0.75 0.16 200)" }} />
            <span className="text-xs text-muted-foreground">SPM</span>
          </div>
          <p className="text-2xl font-bold">{(playerData.scorePerMinute || 0).toFixed(2)}</p>
        </div>

        <div className="p-4 rounded-lg" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} style={{ color: "oklch(0.65 0.12 70)" }} />
            <span className="text-xs text-muted-foreground">Oyun Saati</span>
          </div>
          <p className="text-2xl font-bold">{secondsToHoursCeil(playerData.secondsPlayed || 0)}</p>
        </div>

        <div className="p-4 rounded-lg" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Award size={18} style={{ color: "oklch(0.75 0.16 75)" }} />
            <span className="text-xs text-muted-foreground">Kazanma Oranı</span>
          </div>
          <p className="text-2xl font-bold">{winRate}%</p>
        </div>

        <div className="p-4 rounded-lg" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} style={{ color: "oklch(0.65 0.12 140)" }} />
            <span className="text-xs text-muted-foreground">Başarılı Vuruş</span>
          </div>
          <p className="text-2xl font-bold">{playerData.accuracy || "N/A"}</p>
        </div>

        <div className="p-4 rounded-lg" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} style={{ color: "oklch(0.75 0.16 200)" }} />
            <span className="text-xs text-muted-foreground">Kafa Vurma</span>
          </div>
          <p className="text-2xl font-bold">{playerData.headshots || "N/A"}</p>
        </div>

        <div className="p-4 rounded-lg" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} style={{ color: "oklch(0.65 0.12 70)" }} />
            <span className="text-xs text-muted-foreground">En Yüksek Seri</span>
          </div>
          <p className="text-2xl font-bold">{playerData.highestKillStreak || 0}</p>
        </div>
      </div>

      {/* Top Weapons */}
      {weapons.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">En Çok Kullanılan Silahlar</h2>
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  <th className="text-left p-3">Silah</th>
                  <th className="text-right p-3">Tür</th>
                  <th className="text-right p-3">Kill</th>
                  <th className="text-right p-3">KPM</th>
                  <th className="text-right p-3">Skor</th>
                  <th className="text-right p-3">Oyun Saati</th>
                </tr>
              </thead>
              <tbody>
                {weapons.map((w, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {w.image && (
                          <img src={w.image} alt={w.name} className="w-6 h-6 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <span className="font-medium">{w.name}</span>
                      </div>
                    </td>
                    <td className="text-right p-3 text-muted-foreground">{w.type}</td>
                    <td className="text-right p-3 font-semibold" style={{ color: "oklch(0.75 0.16 75)" }}>{formatNumber(w.kills)}</td>
                    <td className="text-right p-3 text-muted-foreground">{w.kpm.toFixed(2)}</td>
                    <td className="text-right p-3 text-muted-foreground">{formatNumber(w.score)}</td>
                    <td className="text-right p-3 text-muted-foreground">{secondsToHoursCeil(w.secondsPlayed)} Saat</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Classes */}
      {classes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Sınıf Performansı</h2>
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  <th className="text-left p-3">Sınıf</th>
                  <th className="text-right p-3">Kill</th>
                  <th className="text-right p-3">KPM</th>
                  <th className="text-right p-3">Skor</th>
                  <th className="text-right p-3">Oyun Saati</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {c.image && (
                          <img src={c.image} alt={c.name} className="w-6 h-6 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        )}
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="text-right p-3 font-semibold" style={{ color: "oklch(0.75 0.16 75)" }}>{formatNumber(c.kills)}</td>
                    <td className="text-right p-3 text-muted-foreground">{c.kpm.toFixed(2)}</td>
                    <td className="text-right p-3 text-muted-foreground">{formatNumber(c.score)}</td>
                    <td className="text-right p-3 text-muted-foreground">{secondsToHoursCeil(c.secondsPlayed)} Saat</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
