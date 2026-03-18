import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { formatDate } from "@/lib/utils";
import { Target, Trophy, Clock, CheckCircle2, Circle, Plus, Lock, Star } from "lucide-react";
import { toast } from "sonner";

const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  kills: "Kill",
  revives: "Canlandırma",
  playtime: "Oynama Süresi",
  headshots: "Kafa Vuruşu",
  wins: "Galibiyet",
  custom: "Özel",
};

const CHALLENGE_TYPE_COLORS: Record<string, string> = {
  kills: "var(--primary)",
  revives: "oklch(0.60 0.15 145)",
  playtime: "oklch(0.65 0.12 200)",
  headshots: "oklch(0.70 0.15 30)",
  wins: "oklch(0.75 0.16 75)",
  custom: "oklch(0.55 0.02 80)",
};

export default function WeeklyChallenges() {
  const { isAuthenticated, user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    type: "kills" as const,
    targetValue: 100,
    rewardPoints: 100,
    rewardBadge: "",
    weekStart: new Date().toISOString().slice(0, 10),
    weekEnd: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  });

  const challengesQuery = trpc.challenges.getAll.useQuery();
  const activeQuery = trpc.challenges.getActive.useQuery();

  const completeMutation = trpc.challenges.complete.useMutation({
    onSuccess: () => {
      toast.success("Görev tamamlandı! Puanlar hesabınıza eklendi.");
      challengesQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const createMutation = trpc.challenges.create.useMutation({
    onSuccess: () => {
      toast.success("Görev oluşturuldu!");
      setShowCreateForm(false);
      challengesQuery.refetch();
      activeQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const activeChallenges = activeQuery.data || [];
  const allChallenges = challengesQuery.data || [];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.70 0.15 30 / 0.15)" }}>
            <Target size={20} style={{ color: "oklch(0.70 0.15 30)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>Haftalık Görevler</h1>
            <p className="text-sm text-muted-foreground">Görevleri tamamla, rozet kazan, puan topla</p>
          </div>
        </div>
        {user?.role === "admin" && (
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium" style={{ background: "oklch(0.72 0.14 75 / 0.15)", color: "oklch(0.75 0.16 75)", border: "1px solid oklch(0.72 0.14 75 / 0.3)" }}>
            <Plus size={14} /> Görev Oluştur
          </button>
        )}
      </div>

      {/* Create Form (Admin) */}
      {showCreateForm && (
        <div className="rounded-lg border p-6 mb-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <h3 className="font-semibold text-sm mb-4">Yeni Görev Oluştur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Başlık</label>
              <input value={newChallenge.title} onChange={e => setNewChallenge(p => ({ ...p, title: e.target.value }))} className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Tür</label>
              <select value={newChallenge.type} onChange={e => setNewChallenge(p => ({ ...p, type: e.target.value as typeof p.type }))} className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                {Object.entries(CHALLENGE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground block mb-1">Açıklama</label>
              <textarea value={newChallenge.description} onChange={e => setNewChallenge(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 text-sm rounded border outline-none resize-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Hedef Değer</label>
              <input type="number" value={newChallenge.targetValue} onChange={e => setNewChallenge(p => ({ ...p, targetValue: Number(e.target.value) }))} className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Ödül Puanı</label>
              <input type="number" value={newChallenge.rewardPoints} onChange={e => setNewChallenge(p => ({ ...p, rewardPoints: Number(e.target.value) }))} className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Başlangıç</label>
              <input type="date" value={newChallenge.weekStart} onChange={e => setNewChallenge(p => ({ ...p, weekStart: e.target.value }))} className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Bitiş</label>
              <input type="date" value={newChallenge.weekEnd} onChange={e => setNewChallenge(p => ({ ...p, weekEnd: e.target.value }))} className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => createMutation.mutate(newChallenge)} disabled={!newChallenge.title || createMutation.isPending} className="px-4 py-2 rounded text-sm font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              {createMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
            </button>
            <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 rounded text-sm border text-muted-foreground" style={{ borderColor: "var(--border)" }}>İptal</button>
          </div>
        </div>
      )}

      {/* Active Challenges */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="live-dot" />
          <h2 className="text-lg font-semibold" style={{ fontFamily: "'Oswald', sans-serif" }}>Bu Haftanın Görevleri</h2>
        </div>
        {activeQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : activeChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isAuthenticated={isAuthenticated}
                onComplete={() => completeMutation.mutate({ challengeId: challenge.id })}
                isCompleting={completeMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <Target size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Bu hafta için henüz görev oluşturulmadı.</p>
            {user?.role === "admin" && (
              <button onClick={() => setShowCreateForm(true)} className="mt-3 text-xs font-medium" style={{ color: "var(--primary)" }}>
                İlk görevi oluştur →
              </button>
            )}
          </div>
        )}
      </div>

      {/* All Challenges */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>Tüm Görevler</h2>
        <div className="rounded-lg border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="table-bf1">
              <thead>
                <tr>
                  <th>Görev</th>
                  <th>Tür</th>
                  <th>Hedef</th>
                  <th>Ödül</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {allChallenges.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Henüz görev yok</td></tr>
                ) : allChallenges.map(c => (
                  <tr key={c.id}>
                    <td>
                      <p className="font-medium text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                    </td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: `${CHALLENGE_TYPE_COLORS[c.type] || "oklch(0.55 0.02 80)"} / 0.15`, color: CHALLENGE_TYPE_COLORS[c.type] || "oklch(0.55 0.02 80)" }}>
                        {CHALLENGE_TYPE_LABELS[c.type] || c.type}
                      </span>
                    </td>
                    <td className="font-semibold text-foreground">{c.targetValue}</td>
                    <td>
                      <div className="flex items-center gap-1" style={{ color: "oklch(0.75 0.16 75)" }}>
                        <Star size={12} />
                        <span className="font-semibold">{c.rewardPoints}</span>
                      </div>
                    </td>
                    <td className="text-muted-foreground text-xs">
                      {formatDate(c.weekStart)} – {formatDate(c.weekEnd)}
                    </td>
                    <td>
                      {c.isActive ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.60 0.15 145)" }}>
                          <div className="live-dot" style={{ width: "6px", height: "6px" }} /> Aktif
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sona Erdi</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, isAuthenticated, onComplete, isCompleting }: {
  challenge: { id: number; title: string; description: string; type: string; targetValue: number; rewardPoints: number; rewardBadge?: string | null; weekEnd: Date };
  isAuthenticated: boolean;
  onComplete: () => void;
  isCompleting: boolean;
}) {
  const color = CHALLENGE_TYPE_COLORS[challenge.type] || "oklch(0.55 0.02 80)";
  return (
    <div className="rounded-lg border p-4 flex flex-col" style={{ background: "var(--card)", borderColor: "var(--border)", borderTop: `2px solid ${color}` }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: `${color} / 0.15` }}>
          <Target size={16} style={{ color }} />
        </div>
        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: `${color} / 0.15`, color }}>
          {CHALLENGE_TYPE_LABELS[challenge.type] || challenge.type}
        </span>
      </div>
      <h3 className="font-semibold text-sm text-foreground mb-1">{challenge.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3">{challenge.description}</p>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={11} />
          <span>Bitiş: {formatDate(challenge.weekEnd)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "oklch(0.75 0.16 75)" }}>
          <Star size={11} />
          {challenge.rewardPoints} Puan
        </div>
      </div>
      {challenge.rewardBadge && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Trophy size={11} style={{ color: "var(--primary)" }} />
          <span>Rozet: {challenge.rewardBadge}</span>
        </div>
      )}
      {isAuthenticated ? (
        <button onClick={onComplete} disabled={isCompleting} className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold transition-all" style={{ background: "oklch(0.72 0.14 75 / 0.15)", color: "oklch(0.75 0.16 75)", border: "1px solid oklch(0.72 0.14 75 / 0.3)" }}>
          <CheckCircle2 size={13} />
          {isCompleting ? "Kaydediliyor..." : "Tamamlandı Olarak İşaretle"}
        </button>
      ) : (
        <a href={getLoginUrl()} className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-medium no-underline" style={{ background: "var(--border)", color: "oklch(0.55 0.02 80)" }}>
          <Lock size={13} />
          Giriş Yaparak Katıl
        </a>
      )}
    </div>
  );
}
