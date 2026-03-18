// IYI Network Stripe Ürün Tanımları
export const DONATION_TIERS = [
  {
    id: "bronze",
    name: "Bronz Destekçi",
    amount: 50, // TRY
    amountUSD: 150, // cents ($1.50)
    durationDays: 30,
    badge: "🥉 Bronz",
    nameColor: "#CD7F32",
    perks: ["Bronz rozet", "Özel isim rengi", "Destekçi kanalına erişim"],
  },
  {
    id: "silver",
    name: "Gümüş Destekçi",
    amount: 100,
    amountUSD: 300, // cents ($3.00)
    durationDays: 30,
    badge: "🥈 Gümüş",
    nameColor: "#C0C0C0",
    perks: ["Gümüş rozet", "Özel isim rengi", "Öncelikli sunucu girişi", "Destekçi kanalı"],
  },
  {
    id: "gold",
    name: "Altın Destekçi",
    amount: 200,
    amountUSD: 600, // cents ($6.00)
    durationDays: 30,
    badge: "🥇 Altın",
    nameColor: "#FFD700",
    perks: ["Altın rozet", "Altın isim rengi", "Öncelikli sunucu girişi", "Özel Discord rolü", "Admin ile doğrudan iletişim"],
  },
  {
    id: "diamond",
    name: "Elmas Destekçi",
    amount: 500,
    amountUSD: 1500, // cents ($15.00)
    durationDays: 90,
    badge: "💎 Elmas",
    nameColor: "#B9F2FF",
    perks: ["Elmas rozet", "Elmas isim rengi", "3 aylık tüm ayrıcalıklar", "Özel Discord rolü", "Sunucu kararlarında oy hakkı"],
  },
];
