import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { User, Link2, CheckCircle, Clock, Star, Shield } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [eaUsername, setEaUsername] = useState("");
  const [platform, setPlatform] = useState<"pc" | "xbox" | "ps4">("pc");

  const profileQuery = trpc.profile.getMe.useQuery(undefined, { enabled: isAuthenticated });
  const updateEaMutation = trpc.auth.updateEaAccount.useMutation({
    onSuccess: () => {
      toast.success("EA hesabı güncellendi!");
      profileQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "oklch(0.72 0.14 75 / 0.1)" }}>
            <User size={28} style={{ color: "var(--primary)" }} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Giriş Gerekli</h2>
          <p className="text-sm text-muted-foreground mb-6">Profilinizi görüntülemek için giriş yapın.</p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-2.5 rounded font-semibold text-sm no-underline" style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.65 0.12 70))", color: "var(--primary-foreground)" }}>
            Giriş Yap
          </a>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.72 0.14 75 / 0.15)" }}>
          <User size={20} style={{ color: "var(--primary)" }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>Profilim</h1>
      </div>

      {/* Profile Card */}
      <div className="rounded-lg border p-6 mb-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.60 0.12 70))", color: "var(--primary-foreground)" }}>
            {(user?.name || user?.email || "?")[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user?.name || "İsimsiz Kullanıcı"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {user?.role === "admin" && (
                <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>Admin</span>
              )}
              {profile?.isDonator && (
                <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "oklch(0.70 0.15 30 / 0.2)", color: "oklch(0.72 0.15 30)" }}>
                  ⭐ Destekçi
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Star size={11} /> Puan</p>
            <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{profile?.points || 0}</p>
          </div>
          <div className="p-3 rounded border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock size={11} /> Üyelik</p>
            <p className="text-sm font-medium text-foreground">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("tr-TR") : "—"}</p>
          </div>
        </div>

        {/* EA Account Linking */}
        <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Link2 size={14} style={{ color: "var(--primary)" }} />
            EA Hesabı Bağlama
          </h3>
          {profile?.eaUsername ? (
            <div className="flex items-center gap-3 p-3 rounded border" style={{ background: "var(--muted)", borderColor: "oklch(0.60 0.15 145 / 0.3)" }}>
              <CheckCircle size={16} style={{ color: "oklch(0.60 0.15 145)" }} />
              <div>
                <p className="text-sm font-medium text-foreground">{profile.eaUsername}</p>
                <p className="text-xs text-muted-foreground">{profile.eaPlatform?.toUpperCase()} • {profile.eaVerified ? "Doğrulandı" : "Doğrulama Bekleniyor"}</p>
              </div>
              <Link href={`/istatistik?player=${encodeURIComponent(profile.eaUsername)}`} className="ml-auto text-xs no-underline" style={{ color: "var(--primary)" }}>
                İstatistikleri Gör →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">EA hesabınızı bağlayarak istatistiklerinizi otomatik senkronize edin.</p>
              <div className="flex gap-2">
                <input value={eaUsername} onChange={e => setEaUsername(e.target.value)} placeholder="EA Oyuncu Adı" className="flex-1 h-9 px-3 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                <select value={platform} onChange={e => setPlatform(e.target.value as typeof platform)} className="h-9 px-2 text-sm rounded border outline-none" style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <option value="pc">PC</option>
                  <option value="xbox">Xbox</option>
                  <option value="ps4">PS4</option>
                </select>
                <button onClick={() => updateEaMutation.mutate({ eaUsername, platform })} disabled={!eaUsername || updateEaMutation.isPending} className="px-3 h-9 rounded text-xs font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                  Bağla
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/istatistik" className="p-3 rounded-lg border flex items-center gap-2 no-underline hover:border-primary/50 transition-all" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <Shield size={16} style={{ color: "var(--primary)" }} />
          <span className="text-sm text-foreground">İstatistiklerim</span>
        </Link>
        <Link href="/destek" className="p-3 rounded-lg border flex items-center gap-2 no-underline hover:border-primary/50 transition-all" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <Star size={16} style={{ color: "oklch(0.70 0.15 30)" }} />
          <span className="text-sm text-foreground">Destekçi Ol</span>
        </Link>
      </div>
    </div>
  );
}
