import { useState, useEffect, useMemo } from "react";
import { useSearch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { secondsToHoursCeil, formatNumber, formatKD } from "@/lib/utils";
import {
  Search, User, Target, Clock, TrendingUp, Crosshair, Shield,
  Award, AlertCircle, ChevronUp, ChevronDown, ChevronsUpDown
} from "lucide-react";
import { Link } from "wouter";

// ─── Gametools API field mapping ──────────────────────────────────────────────
// API returns: secondsPlayed (number), killDeath, killsPerMinute, scorePerMinute,
// accuracy ("16.48%"), headshots ("5.87%"), longestHeadShot, highestKillStreak,
// loses (not losses), weapons[].weaponName, weapons[].killsPerMinute,
// weapons[].headshots ("0.0%"), weapons[].timeEquipped (seconds),
// vehicles[].timeIn (seconds), classes[] array with className/kpm/secondsPlayed

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawApiData = Record<string, any>;

interface ParsedStats {
  userName: string;
  rank: number;
  rankImg: string;
  rankName: string;
  avatar: string;
  kills: number;
  deaths: number;
  kdr: number;
  kpm: number;
  spm: number;
  accuracyPct: number;       // e.g. 16.48
  headshotsPct: number;      // e.g. 5.87
  headShotsCount: number;
  revives: number;
  dogtagsTaken: number;
  longestHeadshot: number;
  highestKillStreak: number;
  timePlayed: string;        // human readable
  secondsPlayed: number;
  wins: number;
  losses: number;
  roundsPlayed: number;
  infantryKdr: number;
  infantryKpm: number;
  bestClass: string;
  weapons: ParsedWeapon[];
  vehicles: ParsedVehicle[];
  classes: ParsedClass[];
}

interface ParsedWeapon {
  name: string;
  type: string;
  image: string;
  kills: number;
  kpm: number;
  headshotPct: number;       // e.g. 24.1
  accuracy: number;          // e.g. 24.1
  timeEquippedSec: number;
  shotsFired: number;
  shotsHit: number;
}

interface ParsedVehicle {
  name: string;
  type: string;
  image: string;
  kills: number;
  kpm: number;
  destroyed: number;
  timeInSec: number;
}

interface ParsedClass {
  name: string;
  image: string;
  score: number;
  kills: number;
  kpm: number;
  secondsPlayed: number;
}

// Parse percent string like "16.48%" → 16.48
function parsePct(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val.replace("%", "")) || 0;
  return 0;
}

function parseNum(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val) || 0;
  return 0;
}

// Class name mappings
const CLASS_NAMES: Record<string, string> = {
  "Assault": "Taarruz",
  "Medic": "Sıhhiyeci",
  "Scout": "Nişancı",
  "Support": "Tankçı",
  "Attack": "Taarruz",
  "Recon": "Nişancı",
  "Cavalry": "Tankçı",
  "Pilot": "Pilot",
  "Tanker": "Tankçı",
};

function parseRawData(raw: RawApiData): ParsedStats {
  const weapons: ParsedWeapon[] = (raw.weapons || []).map((w: RawApiData) => ({
    name: w.weaponName || w.name || "?",
    type: w.type || "",
    image: w.image || "",
    kills: parseNum(w.kills),
    kpm: parseNum(w.killsPerMinute),
    headshotPct: parsePct(w.headshots),
    accuracy: parsePct(w.accuracy),
    timeEquippedSec: parseNum(w.timeEquipped),
    shotsFired: parseNum(w.shotsFired),
    shotsHit: parseNum(w.shotsHit),
  }));

  const vehicles: ParsedVehicle[] = (raw.vehicles || []).map((v: RawApiData) => ({
    name: v.vehicleName || v.name || "?",
    type: v.type || "",
    image: v.image || "",
    kills: parseNum(v.kills),
    kpm: parseNum(v.killsPerMinute),
    destroyed: parseNum(v.destroyed),
    timeInSec: parseNum(v.timeIn),
  }));

  // classes is an array: [{className, score, kills, kpm, image, timePlayed, secondsPlayed}]
  const classes: ParsedClass[] = (Array.isArray(raw.classes) ? raw.classes : []).map((c: RawApiData) => ({
    name: CLASS_NAMES[c.className] || c.className || "?",
    image: c.image || c.altImage || "",
    score: parseNum(c.score),
    kills: parseNum(c.kills),
    kpm: parseNum(c.kpm),
    secondsPlayed: parseNum(c.secondsPlayed),
  }));

  return {
    userName: raw.userName || "",
    rank: parseNum(raw.rank),
    rankImg: raw.rankImg || "",
    rankName: raw.rankName || "",
    avatar: raw.avatar || "",
    kills: parseNum(raw.kills),
    deaths: parseNum(raw.deaths),
    kdr: parseNum(raw.killDeath),
    kpm: parseNum(raw.killsPerMinute),
    spm: parseNum(raw.scorePerMinute),
    accuracyPct: parsePct(raw.accuracy),
    headshotsPct: parsePct(raw.headshots),
    headShotsCount: parseNum(raw.headShots),
    revives: parseNum(raw.revives),
    dogtagsTaken: parseNum(raw.dogtagsTaken),
    longestHeadshot: parseNum(raw.longestHeadShot),
    highestKillStreak: parseNum(raw.highestKillStreak),
    timePlayed: raw.timePlayed || "",
    secondsPlayed: parseNum(raw.secondsPlayed),
    wins: parseNum(raw.wins),
    losses: parseNum(raw.loses),  // API uses "loses" not "losses"
    roundsPlayed: parseNum(raw.roundsPlayed),
    infantryKdr: parseNum(raw.infantryKillDeath),
    infantryKpm: parseNum(raw.infantryKillsPerMinute),
    bestClass: raw.bestClass || "",
    weapons,
    vehicles,
    classes,
  };
}

// ─── Sortable table hook ──────────────────────────────────────────────────────
type SortDir = "asc" | "desc" | null;
function useSortable<T>(items: T[], defaultKey: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    if (!sortDir) return items;
    return [...items].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [items, sortKey, sortDir]);

  const toggle = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir(d => d === "desc" ? "asc" : d === "asc" ? null : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ k }: { k: keyof T }) => {
    if (sortKey !== k) return <ChevronsUpDown size={11} className="opacity-40 inline ml-0.5" />;
    if (sortDir === "desc") return <ChevronDown size={11} className="inline ml-0.5" style={{ color: "var(--primary)" }} />;
    if (sortDir === "asc") return <ChevronUp size={11} className="inline ml-0.5" style={{ color: "var(--primary)" }} />;
    return <ChevronsUpDown size={11} className="opacity-40 inline ml-0.5" />;
  };

  return { sorted, toggle, SortIcon, sortKey, sortDir };
}

// ─── Main Component ───────────────────────────────────────────────────────────
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

  const data: ParsedStats | undefined = useMemo(() => {
    const raw = statsQuery.data?.data as RawApiData | undefined;
    if (!raw) return undefined;
    return parseRawData(raw);
  }, [statsQuery.data]);

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
            style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <select value={platform} onChange={e => setPlatform(e.target.value)} className="h-10 px-3 text-sm border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }}>
          <option value="pc">PC</option>
          <option value="xbox">Xbox</option>
          <option value="ps4">PS4</option>
        </select>
        <button type="submit" className="h-10 px-4 rounded-r text-sm font-semibold" style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.65 0.12 70))", color: "var(--primary-foreground)" }}>
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
          <div className="rounded-lg border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="p-6" style={{ background: "linear-gradient(135deg, var(--card), var(--background))" }}>
              <div className="flex items-start gap-4">
                <div className="relative">
                  {data.avatar ? (
                    <img src={data.avatar} alt={data.userName} className="w-16 h-16 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: "var(--border)" }}>
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
                    {data.bestClass && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "oklch(0.72 0.14 75 / 0.15)", color: "var(--primary)" }}>
                        {data.bestClass}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {data.rank > 0 && <span className="flex items-center gap-1"><Award size={13} /> {data.rankName || `Rank ${data.rank}`}</span>}
                    {data.secondsPlayed > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {secondsToHoursCeil(data.secondsPlayed)} Saat
                      </span>
                    )}
                    {data.roundsPlayed > 0 && <span>{formatNumber(data.roundsPlayed)} Tur</span>}
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--border)" }}>
                      {platform.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatWidget
              label="K/D Oranı"
              value={data.kdr > 0 ? data.kdr.toFixed(2) : formatKD(data.kills, data.deaths)}
              sub={`${formatNumber(data.kills)} Kill / ${formatNumber(data.deaths)} Ölüm`}
              color="var(--primary)"
              icon={<Crosshair size={16} />}
            />
            <StatWidget
              label="KPM"
              value={data.kpm.toFixed(2)}
              sub={`Piyade KPM: ${data.infantryKpm.toFixed(2)}`}
              color="oklch(0.65 0.12 200)"
              icon={<TrendingUp size={16} />}
            />
            <StatWidget
              label="SPM"
              value={formatNumber(Math.round(data.spm))}
              sub="Dakika Başına Skor"
              color="oklch(0.60 0.15 145)"
              icon={<Award size={16} />}
            />
            <StatWidget
              label="İsabet Oranı"
              value={`${data.accuracyPct.toFixed(1)}%`}
              sub={`${data.headshotsPct.toFixed(1)}% Kafa Vuruşu`}
              color="oklch(0.70 0.15 30)"
              icon={<Target size={16} />}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Canlandırma", value: formatNumber(data.revives) },
              { label: "Künyeler", value: formatNumber(data.dogtagsTaken) },
              { label: "En Uzun Atış", value: `${data.longestHeadshot.toFixed(0)}m` },
              { label: "En Uzun Seri", value: formatNumber(data.highestKillStreak) },
              { label: "Galibiyet", value: formatNumber(data.wins) },
              { label: "Mağlubiyet", value: formatNumber(data.losses) },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded border text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-base font-bold text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Top Weapons */}
          {data.weapons.length > 0 && (
            <WeaponsTable weapons={data.weapons} />
          )}

          {/* Top Vehicles */}
          {data.vehicles.length > 0 && (
            <VehiclesTable vehicles={data.vehicles} />
          )}

          {/* Classes */}
          {data.classes.length > 0 && (
            <ClassesTable classes={data.classes} />
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

// ─── Weapons Table ────────────────────────────────────────────────────────────
function WeaponsTable({ weapons }: { weapons: ParsedWeapon[] }) {
  const { sorted, toggle, SortIcon } = useSortable(weapons, "kills");

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-semibold text-sm">En Çok Kullanılan Silahlar</h3>
        <Link href="/ansiklopedi" className="text-xs no-underline" style={{ color: "var(--primary)" }}>Ansiklopedi →</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="table-bf1">
          <thead>
            <tr>
              <th>Silah</th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("kills")}>
                Kill <SortIcon k="kills" />
              </th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("kpm")}>
                Kill/dk <SortIcon k="kpm" />
              </th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("accuracy")}>
                İsabet <SortIcon k="accuracy" />
              </th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("headshotPct")}>
                HS Oranı <SortIcon k="headshotPct" />
              </th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("timeEquippedSec")}>
                Süre <SortIcon k="timeEquippedSec" />
              </th>
            </tr>
          </thead>
          <tbody>
             {sorted.slice(0, 8).map((w, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.location.href = `/ansiklopedi?search=${encodeURIComponent(w.name)}`}>
                    {w.image && (
                      <img src={w.image} alt={w.name} className="w-12 h-7 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.type}</p>
                    </div>
                  </div>
                </td>
                <td className="font-semibold" style={{ color: "oklch(0.75 0.16 75)" }}>{formatNumber(w.kills)}</td>
                <td className="text-muted-foreground">{w.kpm.toFixed(2)}</td>
                <td className="text-muted-foreground">{w.accuracy.toFixed(1)}%</td>
                <td className="text-muted-foreground">{w.headshotPct.toFixed(1)}%</td>
                <td className="text-muted-foreground">{secondsToHoursCeil(w.timeEquippedSec)} Saat</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Vehicles Table ───────────────────────────────────────────────────────────
function VehiclesTable({ vehicles }: { vehicles: ParsedVehicle[] }) {
  const { sorted, toggle, SortIcon } = useSortable(vehicles, "kills");

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-semibold text-sm">Araç İstatistikleri</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table-bf1">
          <thead>
            <tr>
              <th>Araç</th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("kills")}>
                Kill <SortIcon k="kills" />
              </th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("kpm")}>
                Kill/dk <SortIcon k="kpm" />
              </th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("destroyed")}>
                Tahrip <SortIcon k="destroyed" />
              </th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("timeInSec")}>
                Süre <SortIcon k="timeInSec" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 8).map((v, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.location.href = `/ansiklopedi?search=${encodeURIComponent(v.name)}`}>
                    {v.image && (
                      <img src={v.image} alt={v.name} className="w-12 h-7 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.type}</p>
                    </div>
                  </div>
                </td>
                <td className="font-semibold" style={{ color: "oklch(0.75 0.16 75)" }}>{formatNumber(v.kills)}</td>
                <td className="text-muted-foreground">{v.kpm.toFixed(2)}</td>
                <td className="text-muted-foreground">{formatNumber(v.destroyed)}</td>
                <td className="text-muted-foreground">{secondsToHoursCeil(v.timeInSec)} Saat</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Classes Table ────────────────────────────────────────────────────────────
function ClassesTable({ classes }: { classes: ParsedClass[] }) {
  const { sorted, toggle, SortIcon } = useSortable(classes, "kills");

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-semibold text-sm">Sınıf İstatistikleri</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table-bf1">
          <thead>
            <tr>
              <th>Sınıf</th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("kills")}>
                Kill <SortIcon k="kills" />
              </th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("kpm")}>
                KPM <SortIcon k="kpm" />
              </th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("score")}>
                Skor <SortIcon k="score" />
              </th>
              <th className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggle("secondsPlayed")}>
                Süre <SortIcon k="secondsPlayed" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-2">
                    {c.image && (
                      <img src={c.image} alt={c.name} className="w-7 h-7 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <span className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => window.location.href = `/ansiklopedi?search=${encodeURIComponent(c.name)}`}>{c.name}</span>
                  </div>
                </td>
                <td className="font-semibold" style={{ color: "oklch(0.75 0.16 75)" }}>{formatNumber(c.kills)}</td>
                <td className="text-muted-foreground">{c.kpm.toFixed(2)}</td>
                <td className="text-muted-foreground">{formatNumber(c.score)}</td>
                <td className="text-muted-foreground">{secondsToHoursCeil(c.secondsPlayed)} Saat</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Stat Widget ──────────────────────────────────────────────────────────────
function StatWidget({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ fontFamily: "'Rajdhani', sans-serif", color }}>{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
