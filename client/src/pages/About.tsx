import { Users, Target, Trophy, Shield, Star, MessageSquare, Server } from "lucide-react";
import { Link } from "wouter";

const TEAM_MEMBERS = [
  { name: "DVHAN", role: "Kurucu & Lider", desc: "IYI Network'ün kurucusu ve ana organizatörü.", badge: "Kurucu" },
  { name: "TacticalWolf_TR", role: "Co-Leader", desc: "Klan stratejisi ve rekabetçi oyun uzmanı.", badge: "Co-Leader" },
  { name: "SniperAce_IYI", role: "Moderatör", desc: "Topluluk yönetimi ve etkinlik organizasyonu.", badge: "Mod" },
  { name: "TankCommander", role: "Moderatör", desc: "Araç uzmanı ve yeni üye eğitimi.", badge: "Mod" },
];

const RULES = [
  "Takım oyununa öncelik ver — solo oynamak yasak değil ama takım çalışması esastır.",
  "Tüm oyunculara saygılı davran — küfür, hakaret ve toxik davranış yasaktır.",
  "Hile ve exploit kullanımı kesinlikle yasaktır — ilk ihlalde kalıcı ban.",
  "Sunucu kurallarına uy — admin kararlarına itiraz Discord üzerinden yapılır.",
  "Klan etkinliklerine katılım önerilir — ayda en az 2 etkinlik.",
  "Discord'da aktif ol — önemli duyurular Discord üzerinden yapılır.",
];

export default function About() {
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.65 0.12 200 / 0.15)" }}>
          <Shield size={20} style={{ color: "oklch(0.65 0.12 200)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>Hakkımızda</h1>
          <p className="text-sm text-muted-foreground">IYI Network — Battlefield 1 Türk Klan Topluluğu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Story */}
          <div className="rounded-lg border p-6" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif", color: "oklch(0.75 0.16 75)" }}>Hikayemiz</h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">IYI Network</strong>, 2020 yılında Battlefield 1'in en yoğun döneminde bir araya gelen Türk oyuncular tarafından kurulmuştur. "IYI" — İyi, Yiğit, İleri — değerlerimizi temsil eder.
              </p>
              <p>
                Kuruluşumuzdan bu yana 47'den fazla aktif üye ile büyüyen topluluğumuz, rekabetçi oyun anlayışı ve sağlıklı topluluk kültürünü bir arada yaşatmaktadır.
              </p>
              <p>
                <strong className="text-foreground">[IYI] ALL MAP 200DMG/CQ</strong> sunucumuz, 7/24 aktif ve admin desteklidir. Tüm haritaları kapsayan, 200% hasar ile hızlı tempolu oyun deneyimi sunar.
              </p>
            </div>
          </div>

          {/* Rules */}
          <div className="rounded-lg border p-6" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif", color: "oklch(0.75 0.16 75)" }}>Klan Kuralları</h2>
            <div className="space-y-3">
              {RULES.map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>{i + 1}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>Yönetim Ekibi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEAM_MEMBERS.map((member, i) => (
                <div key={i} className="rounded-lg border p-4 flex items-start gap-3" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75), oklch(0.60 0.12 70))", color: "oklch(0.10 0.01 60)" }}>
                    {member.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-foreground">{member.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>{member.badge}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="rounded-lg border p-4" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <h3 className="font-semibold text-sm mb-4">Klan İstatistikleri</h3>
            <div className="space-y-3">
              {[
                { icon: Users, label: "Aktif Üye", value: "47+" },
                { icon: Target, label: "Toplam Kill", value: "2.4M+" },
                { icon: Trophy, label: "Kazanılan Maç", value: "12K+" },
                { icon: Server, label: "Sunucu Uptime", value: "%99.2" },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon size={14} />
                      {s.label}
                    </div>
                    <span className="font-semibold text-sm text-foreground">{s.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Join */}
          <div className="rounded-lg border p-4" style={{ background: "linear-gradient(135deg, oklch(0.17 0.02 58), oklch(0.14 0.015 55))", borderColor: "oklch(0.72 0.14 75 / 0.3)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} style={{ color: "oklch(0.75 0.16 75)" }} />
              <h3 className="font-semibold text-sm text-foreground">Katılmak İster misin?</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Klan üyeliği için Discord sunucumuza katıl ve başvuru formunu doldur.
            </p>
            <Link href="/geri-bildirim" className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold no-underline" style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75), oklch(0.65 0.12 70))", color: "oklch(0.10 0.01 60)" }}>
              <MessageSquare size={13} /> Başvur
            </Link>
          </div>

          {/* Contact */}
          <div className="rounded-lg border p-4" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
            <h3 className="font-semibold text-sm mb-3">İletişim</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>📧 iyi.network.bf1@gmail.com</p>
              <p>💬 Discord: discord.gg/iyinetwork</p>
              <p>🎮 EA Origin: [IYI] ALL MAP 200DMG/CQ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
