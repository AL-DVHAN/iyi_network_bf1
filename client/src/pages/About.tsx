import { Users, Target, Trophy, Shield, Star, MessageSquare, Server, Wrench, Crown } from "lucide-react";
import { Link } from "wouter";

const TEAM_MEMBERS = [
  {
    name: "RainRapMusic0001",
    role: "Kurucu",
    desc: "IYI Network'ün kurucusu ve klan lideri.",
    badge: "Kurucu",
    active: true,
  },
  { name: null, role: "Co-Leader", desc: null, badge: "Co-Leader", active: false },
  { name: null, role: "Moderatör", desc: null, badge: "Mod", active: false },
  { name: null, role: "Moderatör", desc: null, badge: "Mod", active: false },
];

const SERVER_RULES = [
  {
    title: "Hile & Üçüncü Parti Yazılım",
    desc: "Aimbot, wallhack veya oyun dosyalarını manipüle eden her türlü yazılım kesinlikle yasaktır. Tespit halinde kalıcı ban uygulanır.",
  },
  {
    title: "Saygı & Üslup",
    desc: "Küfür, hakaret ve kışkırtıcı söylemler yasaktır. Toxic davranışlara müsamaha gösterilmez.",
  },
  {
    title: "Siyasi, Dini & Irkçı Söylemler",
    desc: "Irkçılık, cinsiyetçilik veya nefret söylemi içeren ifadeler doğrudan ban sebebidir.",
  },
  {
    title: "Üs Baskını (Spawn Camping)",
    desc: "Düşman takımın spawn bölgesine baskın yaparak oyun zevkini bozmak yasaktır.",
  },
  {
    title: "Takım Dengesi (Anti-Stacking)",
    desc: "Tecrübeli oyuncuların tek takımda toplanarak maç dengesini bozması yasaktır. Admin dengeleme kararlarına itiraz edilmez.",
  },
  {
    title: "Amaca Yönelik Oyun (PTFO)",
    desc: "Bayrakları ele geçirmek yerine yalnızca istatistik kasarak pasif kalmak istenmez. Hedeflere odaklanmak esastır.",
  },
  {
    title: "Hata İstismarı (Glitching)",
    desc: "Duvar içine girme veya görünmezlik gibi harita hatalarından faydalanmak hile kapsamında değerlendirilir.",
  },
  {
    title: "Reklam & Klan Tanıtımı",
    desc: "Sunucu içinde başka klan reklamı yapmak veya klan dışı Discord linkleri paylaşmak yasaktır.",
  },
  {
    title: "Admin Kararları",
    desc: "Admin talimatlarına uyulmalıdır. Haksız bulduğunuz kararlar için oyun içinde tartışmak yerine site üzerindeki Geri Bildirim formunu kullanın.",
  },
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
          {/* Story - BAKIM */}
          <div className="rounded-lg border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Oswald', sans-serif", color: "oklch(0.75 0.16 75)" }}>Hikayemiz</h2>
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded font-semibold" style={{ background: "oklch(0.65 0.15 50 / 0.2)", color: "oklch(0.72 0.15 50)", border: "1px solid oklch(0.65 0.15 50 / 0.3)" }}>
                <Wrench size={10} /> BAKIMDA
              </span>
            </div>
            <div className="flex items-center justify-center py-8 rounded-lg" style={{ background: "var(--muted)", border: "1px dashed var(--border)" }}>
              <div className="text-center">
                <Wrench size={28} className="mx-auto mb-2" style={{ color: "oklch(0.45 0.02 60)" }} />
                <p className="text-sm text-muted-foreground">Bu bölüm yakında hazır olacak.</p>
              </div>
            </div>
          </div>

          {/* Server Rules */}
          <div className="rounded-lg border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif", color: "oklch(0.75 0.16 75)" }}>Sunucu Kuralları</h2>
            <div className="space-y-3">
              {SERVER_RULES.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--muted)" }}>
                  <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">{rule.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>Yetkililer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEAM_MEMBERS.map((member, i) => (
                <div key={i} className="rounded-lg border p-4 flex items-start gap-3" style={{ background: "var(--card)", borderColor: member.active ? "oklch(0.72 0.14 75 / 0.3)" : "var(--border)" }}>
                  {member.active ? (
                    <>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.60 0.12 70))", color: "var(--primary-foreground)" }}>
                        <Crown size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm text-foreground">{member.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>{member.badge}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{member.role}</p>
                        <p className="text-xs text-muted-foreground">{member.desc}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--secondary)", border: "2px dashed var(--border)" }}>
                        <Wrench size={14} style={{ color: "oklch(0.40 0.02 60)" }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "oklch(0.65 0.15 50 / 0.15)", color: "oklch(0.65 0.15 50)" }}>{member.badge}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{member.role}</p>
                        <p className="text-xs italic" style={{ color: "oklch(0.40 0.02 60)" }}>Bakımda</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="rounded-lg border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="font-semibold text-sm mb-4">Klan İstatistikleri</h3>
            <div className="space-y-3">
              {[
                { icon: Users, label: "Aktif Üye", value: "150+" },
                { icon: Target, label: "Toplam Kill", value: "2.4M+" },
                { icon: Trophy, label: "Kazanılan Maç", value: "12K+" },
                { icon: Server, label: "Sunucu Sayısı", value: "1" },
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
            <Link href="/geri-bildirim" className="w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-semibold no-underline" style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.65 0.12 70))", color: "var(--primary-foreground)" }}>
              <MessageSquare size={13} /> Başvur
            </Link>
          </div>

          {/* Contact */}
          <div className="rounded-lg border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="font-semibold text-sm mb-3">İletişim</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <a
                href="https://discord.gg/kayiboyuclan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 no-underline hover:text-foreground transition-colors"
              >
                <span className="text-base">💬</span>
                <span>discord.gg/kayiboyuclan</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
