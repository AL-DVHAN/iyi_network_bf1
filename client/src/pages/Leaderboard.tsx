import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatNumber } from "@/lib/utils";
import { Trophy, Crown, Medal, TrendingUp, Crosshair, Clock, Star } from "lucide-react";
import { Link } from "wouter";

type SortKey = "kills" | "kd" | "playtimeHours" | "score";

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<SortKey>("kills");

  const query = trpc.leaderboard.getTop.useQuery({ limit: 50, sortBy });

  const entries = query.data || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={16} style={{ color: "oklch(0.75 0.16 75)" }} />;
    if (rank === 2) return <Medal size={16} style={{ color: "oklch(0.75 0.02 80)" }} />;
    if (rank === 3) return <Medal size={16} style={{ color: "oklch(0.70 0.15 30)" }} />;
    return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "oklch(0.75 0.16 75)";
    if (rank === 2) return "oklch(0.75 0.02 80)";
    if (rank === 3) return "oklch(0.70 0.15 30)";
    return "oklch(0.55 0.02 80)";
  };

  const SORT_OPTIONS: { key: SortKey; label: string; icon: typeof Crosshair }[] = [
    { key: "kills", label: "Kill", icon: Crosshair },
    { key: "kd", label: "K/D Oranı", icon: TrendingUp },
    { key: "playtimeHours", label: "Oynama Süresi", icon: Clock },
    { key: "score", label: "Skor", icon: Star },
  ];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.75 0.16 75 / 0.15)" }}>
          <Trophy size={20} style={{ color: "oklch(0.75 0.16 75)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>Liderlik Tablosu</h1>
          <p className="text-sm text-muted-foreground">IYI Network klan içi sıralama</p>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SORT_OPTIONS.map(opt => {
          const Icon = opt.icon;
          return (
            <button key={opt.key} onClick={() => setSortBy(opt.key)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all" style={{
              background: sortBy === opt.key ? "oklch(0.72 0.14 75 / 0.2)" : "oklch(0.18 0.01 60)",
              color: sortBy === opt.key ? "oklch(0.75 0.16 75)" : "oklch(0.55 0.02 80)",
              border: `1px solid ${sortBy === opt.key ? "oklch(0.72 0.14 75 / 0.4)" : "oklch(0.25 0.02 60)"}`,
            }}>
              <Icon size={12} /> {opt.label}
            </button>
          );
        })}
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd */}
          <div className="flex flex-col items-center pt-8">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 text-lg font-bold" style={{ background: "oklch(0.75 0.02 80 / 0.15)", color: "oklch(0.75 0.02 80)", border: "2px solid oklch(0.75 0.02 80 / 0.4)" }}>
              {(entries[1]?.eaUsername || "?")[0].toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-foreground mb-0.5">{entries[1]?.eaUsername}</p>
            <p className="text-xs text-muted-foreground">{formatNumber(entries[1]?.kills || 0)} kill</p>
            <div className="mt-2 w-full rounded-t-lg py-4 flex items-center justify-center" style={{ background: "oklch(0.75 0.02 80 / 0.1)", border: "1px solid oklch(0.75 0.02 80 / 0.2)" }}>
              <Medal size={20} style={{ color: "oklch(0.75 0.02 80)" }} />
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 text-xl font-bold" style={{ background: "oklch(0.75 0.16 75 / 0.2)", color: "oklch(0.75 0.16 75)", border: "2px solid oklch(0.75 0.16 75 / 0.5)" }}>
              {(entries[0]?.eaUsername || "?")[0].toUpperCase()}
            </div>
            <Crown size={16} style={{ color: "oklch(0.75 0.16 75)" }} className="mb-1" />
            <p className="text-sm font-bold text-foreground mb-0.5">{entries[0]?.eaUsername}</p>
            <p className="text-xs text-muted-foreground">{formatNumber(entries[0]?.kills || 0)} kill</p>
            <div className="mt-2 w-full rounded-t-lg py-6 flex items-center justify-center" style={{ background: "oklch(0.75 0.16 75 / 0.15)", border: "1px solid oklch(0.75 0.16 75 / 0.3)" }}>
              <Crown size={24} style={{ color: "oklch(0.75 0.16 75)" }} />
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center pt-12">
            <div className="w-11 h-11 rounded-full flex items-center justify-center mb-2 text-base font-bold" style={{ background: "oklch(0.70 0.15 30 / 0.15)", color: "oklch(0.70 0.15 30)", border: "2px solid oklch(0.70 0.15 30 / 0.4)" }}>
              {(entries[2]?.eaUsername || "?")[0].toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-foreground mb-0.5">{entries[2]?.eaUsername}</p>
            <p className="text-xs text-muted-foreground">{formatNumber(entries[2]?.kills || 0)} kill</p>
            <div className="mt-2 w-full rounded-t-lg py-3 flex items-center justify-center" style={{ background: "oklch(0.70 0.15 30 / 0.1)", border: "1px solid oklch(0.70 0.15 30 / 0.2)" }}>
              <Medal size={18} style={{ color: "oklch(0.70 0.15 30)" }} />
            </div>
          </div>
        </div>
      )}

      {/* Full Table */}
      <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
        {query.isLoading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Henüz liderlik verisi yok.</p>
            <p className="text-xs text-muted-foreground mt-1">Klan üyeleri yakında eklenecek!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-bf1">
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  <th>Oyuncu</th>
                  <th>Kill</th>
                  <th>K/D</th>
                  <th>Oynama</th>
                  <th>Skor</th>
                  <th>Ay</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.id} style={i < 3 ? { background: `${getRankColor(i + 1)} / 0.05` } : {}}>
                    <td>
                      <div className="flex items-center justify-center w-6">
                        {getRankIcon(i + 1)}
                      </div>
                    </td>
                    <td>
                      <Link href={`/istatistik?player=${encodeURIComponent(entry.eaUsername)}`} className="font-semibold no-underline hover:underline" style={{ color: getRankColor(i + 1) }}>
                        {entry.eaUsername}
                      </Link>
                    </td>
                    <td className="font-semibold" style={{ color: "oklch(0.75 0.16 75)" }}>{formatNumber(entry.kills || 0)}</td>
                    <td className="font-semibold text-foreground">{entry.kd || "0.00"}</td>
                    <td className="text-muted-foreground">{entry.playtimeHours || 0} Saat</td>
                    <td className="text-muted-foreground">{formatNumber(entry.score || 0)}</td>
                    <td className="text-muted-foreground text-xs">{entry.month}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
