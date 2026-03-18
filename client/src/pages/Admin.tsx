import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Shield, Users, MessageSquare, Ban, Trophy, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

type AdminTab = "feedback" | "bans" | "leaderboard" | "appeals";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<AdminTab>("feedback");
  const [banForm, setBanForm] = useState({ eaUsername: "", reason: "", banType: "permanent" as "permanent" | "temporary", expiresAt: "" });
  const [lbForm, setLbForm] = useState({ eaUsername: "", kills: 0, deaths: 0, playtimeHours: 0, score: 0 });

  const feedbackQuery = trpc.feedback.getAll.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const appealsQuery = trpc.bans.getAppeals.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  const addBanMutation = trpc.bans.add.useMutation({
    onSuccess: () => { toast.success("Ban eklendi!"); setBanForm({ eaUsername: "", reason: "", banType: "permanent", expiresAt: "" }); },
    onError: (e) => toast.error(e.message),
  });

  const addLbMutation = trpc.leaderboard.upsertEntry.useMutation({
    onSuccess: () => { toast.success("Liderlik tablosu güncellendi!"); },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Giriş yapmanız gerekiyor.</p>
        <a href={getLoginUrl()} className="mt-3 inline-block text-sm no-underline" style={{ color: "var(--primary)" }}>Giriş Yap</a>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="container py-8 text-center">
        <Shield size={32} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">Bu sayfaya erişim için admin yetkisi gereklidir.</p>
      </div>
    );
  }

  const TABS: { key: AdminTab; label: string; icon: typeof Shield }[] = [
    { key: "feedback", label: "Geri Bildirimler", icon: MessageSquare },
    { key: "bans", label: "Ban Yönetimi", icon: Ban },
    { key: "leaderboard", label: "Liderlik Tablosu", icon: Trophy },
    { key: "appeals", label: "İtirazlar", icon: Users },
  ];

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.72 0.14 75 / 0.15)" }}>
          <Shield size={20} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>Admin Paneli</h1>
          <p className="text-sm text-muted-foreground">IYI Network yönetim merkezi</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: "var(--border)" }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-all" style={{
              borderColor: tab === t.key ? "var(--primary)" : "transparent",
              color: tab === t.key ? "oklch(0.75 0.16 75)" : "oklch(0.55 0.02 80)",
            }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Feedback Tab */}
      {tab === "feedback" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Geri Bildirimler ({feedbackQuery.data?.length || 0})</h2>
            <button onClick={() => feedbackQuery.refetch()} className="flex items-center gap-1 text-xs text-muted-foreground">
              <RefreshCw size={12} className={feedbackQuery.isFetching ? "animate-spin" : ""} /> Yenile
            </button>
          </div>
          <div className="space-y-3">
            {feedbackQuery.data?.map(fb => (
              <div key={fb.id} className="rounded-lg border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded font-medium mr-2" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>{fb.type}</span>
                    <span className="font-semibold text-sm text-foreground">{fb.subject}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(fb.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{fb.message}</p>
                {fb.guestName && <p className="text-xs text-muted-foreground mt-1">Gönderen: {fb.guestName}</p>}
              </div>
            ))}
            {!feedbackQuery.data?.length && <p className="text-sm text-muted-foreground">Henüz geri bildirim yok.</p>}
          </div>
        </div>
      )}

      {/* Bans Tab */}
      {tab === "bans" && (
        <div className="space-y-6">
          <div className="rounded-lg border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Plus size={14} /> Yeni Ban Ekle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">EA Kullanıcı Adı</label>
                <input value={banForm.eaUsername} onChange={e => setBanForm(p => ({ ...p, eaUsername: e.target.value }))} className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Ban Türü</label>
                <select value={banForm.banType} onChange={e => setBanForm(p => ({ ...p, banType: e.target.value as typeof p.banType }))} className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <option value="permanent">Kalıcı</option>
                  <option value="temporary">Geçici</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Sebep</label>
                <input value={banForm.reason} onChange={e => setBanForm(p => ({ ...p, reason: e.target.value }))} className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </div>
              {banForm.banType === "temporary" && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Bitiş Tarihi</label>
                  <input type="date" value={banForm.expiresAt} onChange={e => setBanForm(p => ({ ...p, expiresAt: e.target.value }))} className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
              )}
            </div>
            <button onClick={() => addBanMutation.mutate(banForm)} disabled={!banForm.eaUsername || !banForm.reason || addBanMutation.isPending} className="mt-3 px-4 py-2 rounded text-sm font-semibold" style={{ background: "oklch(0.55 0.20 25)", color: "white" }}>
              {addBanMutation.isPending ? "Ekleniyor..." : "Ban Ekle"}
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {tab === "leaderboard" && (
        <div className="rounded-lg border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <h3 className="font-semibold text-sm mb-4">Oyuncu Ekle / Güncelle</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: "eaUsername", label: "EA Kullanıcı Adı", type: "text" },
              { key: "kills", label: "Kill", type: "number" },
              { key: "deaths", label: "Ölüm", type: "number" },
              { key: "playtimeHours", label: "Oynama (Saat)", type: "number" },
              { key: "score", label: "Skor", type: "number" },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs text-muted-foreground block mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={(lbForm as Record<string, string | number>)[field.key]}
                  onChange={e => setLbForm(p => ({ ...p, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }))}
                  className="w-full h-9 px-3 text-sm rounded border outline-none"
                  style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>
            ))}
          </div>
          <button onClick={() => addLbMutation.mutate(lbForm)} disabled={!lbForm.eaUsername || addLbMutation.isPending} className="mt-3 px-4 py-2 rounded text-sm font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {addLbMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      )}

      {/* Appeals Tab */}
      {tab === "appeals" && (
        <div>
          <h2 className="font-semibold mb-4">Ban İtirazları ({appealsQuery.data?.length || 0})</h2>
          <div className="space-y-3">
            {appealsQuery.data?.map(appeal => (
              <div key={appeal.id} className="rounded-lg border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm text-foreground">{appeal.eaUsername}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "oklch(0.70 0.15 30 / 0.2)", color: "oklch(0.72 0.15 30)" }}>{appeal.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{appeal.message}</p>
                {appeal.contactEmail && <p className="text-xs text-muted-foreground mt-1">İletişim: {appeal.contactEmail}</p>}
              </div>
            ))}
            {!appealsQuery.data?.length && <p className="text-sm text-muted-foreground">Henüz itiraz yok.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
