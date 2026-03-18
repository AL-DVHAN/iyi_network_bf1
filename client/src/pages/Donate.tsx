import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Heart, Star, Shield, Palette, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { useSearch } from "wouter";

const BENEFITS = [
  { icon: Star, text: "Profilinde özel Destekçi rozeti" },
  { icon: Palette, text: "Liderlik tablosunda özel isim rengi" },
  { icon: Shield, text: "Sunucuda öncelikli slot hakkı" },
  { icon: Heart, text: "Discord'da özel Destekçi rolü" },
];

export default function Donate() {
  const { isAuthenticated } = useAuth();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const success = params.get("success");
  const cancelled = params.get("cancelled");
  const [loading, setLoading] = useState(false);

  const donatorsQuery = trpc.donations.getDonators.useQuery();

  const createCheckoutMutation = trpc.donations.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info("Ödeme sayfasına yönlendiriliyorsunuz...");
        window.open(data.checkoutUrl, "_blank");
      }
      setLoading(false);
    },
    onError: (e) => {
      toast.error(e.message);
      setLoading(false);
    },
  });

  const handleSupport = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoading(true);
    createCheckoutMutation.mutate({
      tierId: "supporter",
      amountUSD: 300,
      durationDays: 30,
      badge: "⭐ Destekçi",
      origin: window.location.origin,
    });
  };

  return (
    <div className="container py-12 max-w-2xl mx-auto">
      {/* Success / Cancel Banners */}
      {success && (
        <div
          className="mb-6 flex items-start gap-3 p-4 rounded-lg border"
          style={{
            background: "color-mix(in oklch, oklch(0.60 0.15 145) 10%, transparent)",
            borderColor: "color-mix(in oklch, oklch(0.60 0.15 145) 30%, transparent)",
          }}
        >
          <CheckCircle size={18} style={{ color: "oklch(0.60 0.15 145)" }} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.75 0.12 145)" }}>
              Ödeme başarılı! Teşekkürler 🎉
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Destekçi rozetiniz kısa süre içinde aktif edilecek.
            </p>
          </div>
        </div>
      )}
      {cancelled && (
        <div
          className="mb-6 flex items-start gap-3 p-4 rounded-lg border"
          style={{
            background: "color-mix(in oklch, oklch(0.55 0.20 25) 10%, transparent)",
            borderColor: "color-mix(in oklch, oklch(0.55 0.20 25) 30%, transparent)",
          }}
        >
          <AlertCircle size={18} style={{ color: "oklch(0.65 0.18 25)" }} className="shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: "oklch(0.75 0.15 25)" }}>
            Ödeme iptal edildi. İstediğiniz zaman tekrar deneyebilirsiniz.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "color-mix(in oklch, var(--primary) 15%, transparent)" }}
        >
          <Heart size={26} style={{ color: "var(--primary)" }} />
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "'Oswald', sans-serif", color: "var(--foreground)" }}
        >
          Destekçi Ol
        </h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: "var(--muted-foreground)" }}>
          Sunucu masraflarına katkıda bulun, karşılığında özel ayrıcalıklar kazan.
        </p>
      </div>

      {/* Single Package Card */}
      <div
        className="rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: "var(--primary)", background: "var(--card)" }}
      >
        {/* Card Header */}
        <div
          className="px-6 py-5 text-center"
          style={{ background: "color-mix(in oklch, var(--primary) 10%, transparent)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star size={16} style={{ color: "var(--primary)" }} />
            <span
              className="text-sm font-bold uppercase tracking-wider"
              style={{ color: "var(--primary)", fontFamily: "'Oswald', sans-serif" }}
            >
              Destekçi Paketi
            </span>
            <Star size={16} style={{ color: "var(--primary)" }} />
          </div>
          <div className="flex items-baseline justify-center gap-1 mt-2">
            <span
              className="text-5xl font-black"
              style={{ fontFamily: "'Rajdhani', sans-serif", color: "var(--foreground)" }}
            >
              100
            </span>
            <span className="text-xl font-semibold" style={{ color: "var(--muted-foreground)" }}>₺</span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Tek seferlik ödeme</p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--muted-foreground)" }}
          >
            Kazanacakların
          </p>
          <ul className="space-y-3">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <li key={i} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "color-mix(in oklch, var(--primary) 12%, transparent)" }}
                  >
                    <Icon size={14} style={{ color: "var(--primary)" }} />
                  </div>
                  <span className="text-sm" style={{ color: "var(--foreground)" }}>{b.text}</span>
                  <CheckCircle size={14} className="ml-auto shrink-0" style={{ color: "oklch(0.60 0.15 145)" }} />
                </li>
              );
            })}
          </ul>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSupport}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={{
              background: loading ? "var(--muted)" : "var(--primary)",
              color: loading ? "var(--muted-foreground)" : "var(--primary-foreground)",
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: "0.05em",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>Yükleniyor...</>
            ) : isAuthenticated ? (
              <>
                <Heart size={15} />
                Destekçi Ol — 100 ₺
                <ExternalLink size={13} />
              </>
            ) : (
              <>Giriş Yap &amp; Destekçi Ol</>
            )}
          </button>
          {!isAuthenticated && (
            <p className="text-xs text-center mt-2" style={{ color: "var(--muted-foreground)" }}>
              Ödeme yapmak için önce giriş yapmanız gerekiyor.
            </p>
          )}
        </div>
      </div>

      {/* Note */}
      <div
        className="mt-6 p-4 rounded-xl border text-center"
        style={{ background: "var(--muted)", borderColor: "var(--border)" }}
      >
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Ödeme{" "}
          <strong style={{ color: "var(--foreground)" }}>Stripe</strong>{" "}
          altyapısı üzerinden güvenli şekilde işlenir. Herhangi bir sorun için{" "}
          <a
            href="https://discord.gg/kayiboyuclan"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--primary)" }}
          >
            Discord
          </a>
          'dan ulaşabilirsiniz.
        </p>
      </div>

      {/* Current Donators */}
      {donatorsQuery.data && donatorsQuery.data.length > 0 && (
        <div className="mt-8">
          <h2
            className="text-lg font-bold mb-4 text-center"
            style={{ fontFamily: "'Oswald', sans-serif", color: "var(--foreground)" }}
          >
            Mevcut Destekçiler
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {donatorsQuery.data.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: "color-mix(in oklch, var(--primary) 12%, transparent)",
                  color: "var(--primary)",
                  border: "1px solid color-mix(in oklch, var(--primary) 25%, transparent)",
                }}
              >
                <Star size={10} />
                {d.name || "Destekçi"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
