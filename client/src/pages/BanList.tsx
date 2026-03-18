import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Ban, Search, AlertTriangle, Clock, Shield, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function BanList() {
  const [search, setSearch] = useState("");
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealForm, setAppealForm] = useState({ banId: 0, eaUsername: "", message: "", contactEmail: "" });
  const bansQuery = trpc.bans.getAll.useQuery({ search: search || undefined });
  const appealMutation = trpc.bans.submitAppeal.useMutation({
    onSuccess: () => {
      toast.success("İtirazınız alındı! En kısa sürede değerlendireceğiz.");
      setShowAppeal(false);
      setAppealForm({ banId: 0, eaUsername: "", message: "", contactEmail: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (bansQuery.data || []).filter(b =>
    !search || b.eaUsername.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.55 0.20 25 / 0.15)" }}>
            <Ban size={20} style={{ color: "oklch(0.55 0.20 25)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>Ban Listesi</h1>
            <p className="text-sm text-muted-foreground">IYI Network sunucusundan banlanan oyuncular</p>
          </div>
        </div>
        <button onClick={() => setShowAppeal(!showAppeal)} className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium" style={{ background: "oklch(0.65 0.12 200 / 0.15)", color: "oklch(0.65 0.12 200)", border: "1px solid oklch(0.65 0.12 200 / 0.3)" }}>
          <MessageSquare size={14} /> İtiraz Et
        </button>
      </div>

      {/* Appeal Form */}
      {showAppeal && (
        <div className="rounded-lg border p-6 mb-6" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.65 0.12 200 / 0.3)" }}>
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Shield size={14} style={{ color: "oklch(0.65 0.12 200)" }} />
            Ban İtiraz Formu
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">EA Kullanıcı Adınız *</label>
              <input value={appealForm.eaUsername} onChange={e => setAppealForm(p => ({ ...p, eaUsername: e.target.value }))} placeholder="Banlanan EA hesabı" className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">İletişim E-postası</label>
              <input type="email" value={appealForm.contactEmail} onChange={e => setAppealForm(p => ({ ...p, contactEmail: e.target.value }))} placeholder="yanit@email.com" className="w-full h-9 px-3 text-sm rounded border outline-none" style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">İtiraz Mesajı *</label>
              <textarea value={appealForm.message} onChange={e => setAppealForm(p => ({ ...p, message: e.target.value }))} placeholder="Neden banlandığınızı düşündüğünüzü ve neden kaldırılması gerektiğini açıklayın..." rows={4} className="w-full px-3 py-2 text-sm rounded border outline-none resize-none" style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => appealMutation.mutate({ ...appealForm, banId: appealForm.banId || 0 })} disabled={!appealForm.eaUsername || !appealForm.message || appealMutation.isPending} className="px-4 py-2 rounded text-sm font-semibold" style={{ background: "oklch(0.65 0.12 200)", color: "oklch(0.10 0.01 60)" }}>
              {appealMutation.isPending ? "Gönderiliyor..." : "İtirazı Gönder"}
            </button>
            <button onClick={() => setShowAppeal(false)} className="px-4 py-2 rounded text-sm border text-muted-foreground" style={{ borderColor: "oklch(0.28 0.03 60)" }}>İptal</button>
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-lg border mb-6" style={{ background: "oklch(0.55 0.20 25 / 0.05)", borderColor: "oklch(0.55 0.20 25 / 0.2)" }}>
        <AlertTriangle size={16} style={{ color: "oklch(0.55 0.20 25)" }} className="shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Bu listede yer alan oyuncular IYI Network sunucusundan banlanmıştır. Hile, hakaret veya kural ihlali nedeniyle ban uygulanmıştır. Haksız banlandığınızı düşünüyorsanız "İtiraz Et" butonunu kullanın.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Oyuncu ara..." className="w-full h-9 pl-9 pr-3 text-sm rounded border outline-none" style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }} />
      </div>

      {/* Ban List */}
      <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
        {bansQuery.isLoading ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Ban size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{search ? "Arama sonucu bulunamadı." : "Henüz banlanan oyuncu yok."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-bf1">
              <thead>
                <tr>
                  <th>Oyuncu</th>
                  <th>Sebep</th>
                  <th>Tür</th>
                  <th>Tarih</th>
                  <th>Bitiş</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ban => (
                  <tr key={ban.id}>
                    <td className="font-semibold text-foreground">{ban.eaUsername}</td>
                    <td className="text-muted-foreground max-w-xs truncate">{ban.reason}</td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{
                        background: ban.banType === "permanent" ? "oklch(0.55 0.20 25 / 0.2)" : "oklch(0.70 0.15 30 / 0.2)",
                        color: ban.banType === "permanent" ? "oklch(0.65 0.18 25)" : "oklch(0.72 0.15 30)",
                      }}>
                        {ban.banType === "permanent" ? "Kalıcı" : "Geçici"}
                      </span>
                    </td>
                    <td className="text-muted-foreground text-xs">{formatDate(ban.createdAt)}</td>
                    <td className="text-muted-foreground text-xs">
                      {ban.expiresAt ? (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(ban.expiresAt)}
                        </span>
                      ) : (
                        <span style={{ color: "oklch(0.65 0.18 25)" }}>Kalıcı</span>
                      )}
                    </td>
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
