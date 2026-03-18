import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Star, Crown, Shield, Zap, Heart, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useSearch } from "wouter";

const TIERS = [
  {
    id: "bronze",
    name: "Bronz Destekçi",
    amountUSD: 150, // cents
    displayTRY: "~₺50",
    duration: 30,
    color: "oklch(0.72 0.14 75)",
    bg: "oklch(0.72 0.14 75 / 0.1)",
    border: "oklch(0.72 0.14 75 / 0.3)",
    icon: Star,
    badge: "🥉 Bronz",
    benefits: [
      "🥉 Bronz rozet",
      "Özel bronz isim rengi",
      "Discord VIP kanalı erişimi",
      "30 gün geçerli",
    ],
  },
  {
    id: "silver",
    name: "Gümüş Destekçi",
    amountUSD: 300, // cents
    displayTRY: "~₺100",
    duration: 30,
    color: "oklch(0.80 0.01 80)",
    bg: "oklch(0.80 0.01 80 / 0.1)",
    border: "oklch(0.80 0.01 80 / 0.4)",
    icon: Crown,
    badge: "🥈 Gümüş",
    popular: true,
    benefits: [
      "🥈 Gümüş rozet",
      "Özel gümüş isim rengi",
      "Discord VIP + Elite kanalı",
      "Öncelikli sunucu girişi",
      "30 gün geçerli",
    ],
  },
  {
    id: "gold",
    name: "Altın Destekçi",
    amountUSD: 600, // cents
    displayTRY: "~₺200",
    duration: 30,
    color: "oklch(0.82 0.17 85)",
    bg: "oklch(0.82 0.17 85 / 0.1)",
    border: "oklch(0.82 0.17 85 / 0.4)",
    icon: Shield,
    badge: "🥇 Altın",
    benefits: [
      "🥇 Altın rozet",
      "Özel altın isim rengi",
      "Tüm Discord kanalları",
      "Admin ile doğrudan iletişim",
      "30 gün geçerli",
    ],
  },
  {
    id: "diamond",
    name: "Elmas Destekçi",
    amountUSD: 1500, // cents
    displayTRY: "~₺500",
    duration: 90,
    color: "oklch(0.85 0.08 200)",
    bg: "oklch(0.85 0.08 200 / 0.1)",
    border: "oklch(0.85 0.08 200 / 0.4)",
    icon: Zap,
    badge: "💎 Elmas",
    benefits: [
      "💎 Elmas rozet",
      "Özel elmas isim rengi",
      "3 aylık tüm ayrıcalıklar",
      "Sunucu kararlarında oy hakkı",
      "90 gün geçerli",
    ],
  },
];

export default function Donate() {
  const { isAuthenticated } = useAuth();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const success = params.get("success");
  const cancelled = params.get("cancelled");

  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const donatorsQuery = trpc.donations.getDonators.useQuery();
  const createCheckoutMutation = trpc.donations.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info("Stripe ödeme sayfasına yönlendiriliyorsunuz...");
        window.open(data.checkoutUrl, "_blank");
      }
      setLoadingTier(null);
    },
    onError: (e) => {
      toast.error(e.message);
      setLoadingTier(null);
    },
  });

  const handleDonate = (tier: typeof TIERS[0]) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingTier(tier.id);
    createCheckoutMutation.mutate({
      tierId: tier.id,
      amountUSD: tier.amountUSD,
      durationDays: tier.duration,
      badge: tier.badge,
      origin: window.location.origin,
    });
  };

  return (
    <div className="container py-8">
      {/* Success / Cancel Banners */}
      {success && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg border" style={{ background: "oklch(0.60 0.15 145 / 0.1)", borderColor: "oklch(0.60 0.15 145 / 0.3)" }}>
          <CheckCircle size={18} style={{ color: "oklch(0.60 0.15 145)" }} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.75 0.12 145)" }}>Ödeme başarılı! Teşekkürler 🎉</p>
            <p className="text-xs text-muted-foreground mt-0.5">Destekçi rozetiniz kısa süre içinde aktif edilecek.</p>
          </div>
        </div>
      )}
      {cancelled && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg border" style={{ background: "oklch(0.55 0.20 25 / 0.1)", borderColor: "oklch(0.55 0.20 25 / 0.3)" }}>
          <AlertCircle size={18} style={{ color: "oklch(0.65 0.18 25)" }} className="shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: "oklch(0.75 0.15 25)" }}>Ödeme iptal edildi. İstediğiniz zaman tekrar deneyebilirsiniz.</p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "oklch(0.72 0.14 75 / 0.15)" }}>
          <Heart size={24} style={{ color: "oklch(0.72 0.14 75)" }} />
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>Destekçi Ol</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sunucu masraflarına katkıda bulun, özel ayrıcalıklar kazan. IYI Network'ü yaşatmaya yardım et!
        </p>
      </div>

      {/* Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const isLoading = loadingTier === tier.id;
          return (
            <div key={tier.id} className="rounded-lg border p-5 flex flex-col relative" style={{ background: tier.popular ? "oklch(0.18 0.02 58)" : "oklch(0.16 0.015 58)", borderColor: tier.border }}>
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ background: tier.color, color: "oklch(0.10 0.01 60)" }}>
                  En Popüler
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: tier.bg }}>
                  <Icon size={20} style={{ color: tier.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground">{tier.duration} gün</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: tier.color }}>{tier.displayTRY}</span>
                <span className="text-xs text-muted-foreground ml-1">/ {tier.duration} gün</span>
              </div>

              <div className="space-y-1.5 mb-5 flex-1">
                {tier.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle size={11} style={{ color: tier.color }} className="shrink-0" />
                    {b}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleDonate(tier)}
                disabled={isLoading || createCheckoutMutation.isPending}
                className="w-full py-2.5 rounded font-semibold text-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                style={{
                  background: tier.popular ? tier.color : tier.bg,
                  color: tier.popular ? "oklch(0.10 0.01 60)" : tier.color,
                  border: `1px solid ${tier.border}`,
                }}
              >
                {isLoading ? (
                  "Yönlendiriliyor..."
                ) : (
                  <>
                    {isAuthenticated ? "Satın Al" : "Giriş Yap"}
                    <ExternalLink size={12} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Stripe Info */}
      <div className="rounded-lg border p-4 mb-8 flex items-start gap-3" style={{ background: "oklch(0.65 0.12 200 / 0.05)", borderColor: "oklch(0.65 0.12 200 / 0.2)" }}>
        <Zap size={16} style={{ color: "oklch(0.65 0.12 200)" }} className="shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Güvenli Ödeme - Stripe</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tüm ödemeler Stripe güvencesiyle işlenir. Test kartı: <code className="px-1 rounded" style={{ background: "oklch(0.22 0.02 60)" }}>4242 4242 4242 4242</code>
          </p>
        </div>
      </div>

      {/* Current Donators */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>Destekçilerimiz</h2>
        {donatorsQuery.isLoading ? (
          <div className="flex gap-3">
            {[1,2,3].map(i => <div key={i} className="w-24 h-24 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : donatorsQuery.data?.length ? (
          <div className="flex flex-wrap gap-3">
            {donatorsQuery.data.map((d) => (
              <div key={d.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75), oklch(0.60 0.12 70))", color: "oklch(0.10 0.01 60)" }}>
                  {(d.name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: d.nameColor || "oklch(0.92 0.02 80)" }}>{d.name}</p>
                  {d.donatorBadge && <p className="text-xs text-muted-foreground">{d.donatorBadge}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-lg border" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <Heart size={24} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Henüz destekçi yok. İlk sen ol!</p>
          </div>
        )}
      </div>
    </div>
  );
}
