import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import Fuse from "fuse.js";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { normalizeTurkish } from "@/lib/utils";
import {
  WEAPONS, VEHICLES, WEAPON_CATEGORIES, VEHICLE_CATEGORIES,
  type WeaponItem, type VehicleItem
} from "@/lib/encyclopediaData";
import { Search, BookOpen, Target, Truck, ChevronRight, ThumbsUp, Plus, X, Wrench } from "lucide-react";
import { toast } from "sonner";

type Tab = "silahlar" | "araclar" | "siniflar";

const BF1_CLASSES = [
  { tr: "Saldırı", en: "Assault", desc: "Cephe hattı savaşçısı, tıbbi destek", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/bf1/196/64/Assault-7c2a4e5a.png" },
  { tr: "Destek", en: "Support", desc: "Takım ikmal ve baskı ateşi", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/bf1/196/64/Support-3e2a4e5a.png" },
  { tr: "Keşif", en: "Scout", desc: "Uzun menzilli keskin nişancı", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/bf1/196/64/Scout-1c2a4e5a.png" },
  { tr: "Medic", en: "Medic", desc: "Sağlık desteği ve canlandırma", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/bf1/196/64/Medic-2c2a4e5a.png" },
  { tr: "Şövalye", en: "Tanker", desc: "Zırhlı araç operatörü", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/bf1/196/64/Tanker-4c2a4e5a.png" },
  { tr: "Pilot", en: "Pilot", desc: "Hava kuvvetleri uzmanı", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/bf1/196/64/Pilot-5c2a4e5a.png" },
];

export default function Encyclopedia() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialQ = params.get("q") || "";
  const initialType = params.get("type") as "weapon" | "vehicle" | null;

  const [tab, setTab] = useState<Tab>(initialType === "vehicle" ? "araclar" : "silahlar");
  const [search, setSearch] = useState(initialQ);
  const [weaponCategory, setWeaponCategory] = useState<string>("Tümü");
  const [vehicleCategory, setVehicleCategory] = useState<string>("Tümü");
  const [selectedItem, setSelectedItem] = useState<{ name: string; type: "weapon" | "vehicle" } | null>(
    initialQ ? { name: initialQ, type: initialType || "weapon" } : null
  );
  const [showTipForm, setShowTipForm] = useState(false);
  const [tipContent, setTipContent] = useState("");

  const { isAuthenticated } = useAuth();

  const proTipsQuery = trpc.encyclopedia.getProTips.useQuery(
    { itemName: selectedItem?.name || "", itemType: selectedItem?.type || "weapon" },
    { enabled: !!selectedItem }
  );

  const addTipMutation = trpc.encyclopedia.addProTip.useMutation({
    onSuccess: () => {
      toast.success("Pro-Tip gönderildi! Admin onayından sonra yayınlanacak.");
      setTipContent("");
      setShowTipForm(false);
      proTipsQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const weaponFuse = useMemo(() => new Fuse(WEAPONS, {
    keys: [{ name: "name", weight: 1.0 }, { name: "originalName", weight: 0.8 }, { name: "category", weight: 0.3 }],
    threshold: 0.4,
    getFn: (obj, path) => {
      const val = (obj as unknown as Record<string, unknown>)[path as string];
      return typeof val === "string" ? normalizeTurkish(val) : String(val || "");
    },
  }), []);

  const vehicleFuse = useMemo(() => new Fuse(VEHICLES, {
    keys: [{ name: "name", weight: 1.0 }, { name: "category", weight: 0.5 }],
    threshold: 0.4,
    getFn: (obj, path) => {
      const val = (obj as unknown as Record<string, unknown>)[path as string];
      return typeof val === "string" ? normalizeTurkish(val) : String(val || "");
    },
  }), []);

  const filteredWeapons = useMemo(() => {
    let results = search ? weaponFuse.search(normalizeTurkish(search)).map(r => r.item) : WEAPONS;
    if (weaponCategory !== "Tümü") results = results.filter(w => w.category === weaponCategory);
    return results;
  }, [search, weaponCategory, weaponFuse]);

  const filteredVehicles = useMemo(() => {
    let results = search ? vehicleFuse.search(normalizeTurkish(search)).map(r => r.item) : VEHICLES;
    if (vehicleCategory !== "Tümü") results = results.filter(v => v.category === vehicleCategory);
    return results;
  }, [search, vehicleCategory, vehicleFuse]);

  const selectedWeapon = selectedItem?.type === "weapon" ? WEAPONS.find(w => w.name === selectedItem.name) : null;
  const selectedVehicle = selectedItem?.type === "vehicle" ? VEHICLES.find(v => v.name === selectedItem.name) : null;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "color-mix(in oklch, var(--primary) 15%, transparent)" }}>
          <BookOpen size={20} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif", color: "var(--foreground)" }}>
            Ansiklopedi
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Silahlar, araçlar ve sınıflar hakkında detaylı bilgi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List */}
        <div className="lg:col-span-1">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Silah veya araç ara..."
              className="w-full h-9 pl-9 pr-3 text-sm rounded border outline-none"
              style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border mb-4" style={{ borderColor: "var(--border)" }}>
            {([
              ["silahlar", "Silahlar", Target],
              ["araclar", "Araçlar", Truck],
              ["siniflar", "Sınıflar", BookOpen],
            ] as [Tab, string, typeof Target][]).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all"
                style={{
                  background: tab === key
                    ? "color-mix(in oklch, var(--primary) 20%, transparent)"
                    : "var(--card)",
                  color: tab === key ? "var(--primary)" : "var(--muted-foreground)",
                  borderRight: "1px solid var(--border)",
                }}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          {tab === "silahlar" && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["Tümü", ...WEAPON_CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setWeaponCategory(cat)}
                  className="px-2 py-1 rounded text-xs font-medium transition-all"
                  style={{
                    background: weaponCategory === cat
                      ? "color-mix(in oklch, var(--primary) 20%, transparent)"
                      : "var(--muted)",
                    color: weaponCategory === cat ? "var(--primary)" : "var(--muted-foreground)",
                    border: `1px solid ${weaponCategory === cat
                      ? "color-mix(in oklch, var(--primary) 40%, transparent)"
                      : "var(--border)"}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          {tab === "araclar" && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["Tümü", ...VEHICLE_CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setVehicleCategory(cat)}
                  className="px-2 py-1 rounded text-xs font-medium transition-all"
                  style={{
                    background: vehicleCategory === cat
                      ? "color-mix(in oklch, var(--primary) 20%, transparent)"
                      : "var(--muted)",
                    color: vehicleCategory === cat ? "var(--primary)" : "var(--muted-foreground)",
                    border: `1px solid ${vehicleCategory === cat
                      ? "color-mix(in oklch, var(--primary) 40%, transparent)"
                      : "var(--border)"}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* List */}
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
              {tab === "silahlar" && filteredWeapons.map((weapon, i) => (
                <WeaponRow
                  key={i}
                  weapon={weapon}
                  selected={selectedItem?.name === weapon.name}
                  onClick={() => setSelectedItem({ name: weapon.name, type: "weapon" })}
                />
              ))}
              {tab === "araclar" && filteredVehicles.map((vehicle, i) => (
                <VehicleRow
                  key={i}
                  vehicle={vehicle}
                  selected={selectedItem?.name === vehicle.name}
                  onClick={() => setSelectedItem({ name: vehicle.name, type: "vehicle" })}
                />
              ))}
              {tab === "siniflar" && BF1_CLASSES.map((cls, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-3 border-b transition-colors"
                  style={{ borderColor: "var(--border)", background: "transparent" }}
                >
                  <img
                    src={cls.img}
                    alt={cls.tr}
                    className="w-8 h-8 object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{cls.tr}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{cls.desc}</p>
                  </div>
                </div>
              ))}
              {tab === "silahlar" && filteredWeapons.length === 0 && (
                <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Sonuç bulunamadı
                </div>
              )}
              {tab === "araclar" && filteredVehicles.length === 0 && (
                <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Sonuç bulunamadı
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Detail */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="rounded-lg border overflow-hidden"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              {/* Detail Header */}
              <div className="p-6 border-b" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-16 rounded flex items-center justify-center shrink-0"
                    style={{ background: "var(--background)" }}>
                    <img
                      src={selectedWeapon?.image || selectedVehicle?.image || ""}
                      alt={selectedItem.name}
                      className="max-w-full max-h-full object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{
                          background: "color-mix(in oklch, var(--primary) 20%, transparent)",
                          color: "var(--primary)",
                        }}
                      >
                        {selectedItem.type === "weapon" ? "Silah" : "Araç"}
                      </span>
                      {selectedWeapon?.category && (
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {selectedWeapon.category}
                        </span>
                      )}
                    </div>
                    <h2
                      className="text-xl font-bold"
                      style={{ fontFamily: "'Oswald', sans-serif", color: "var(--foreground)" }}
                    >
                      {selectedItem.name}
                    </h2>
                    {selectedWeapon?.originalName && selectedWeapon.originalName !== selectedItem.name && (
                      <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        Orijinal: {selectedWeapon.originalName}
                      </p>
                    )}
                    {selectedVehicle?.category && (
                      <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {selectedVehicle.category}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Content - BAKIMDA */}
              <div className="p-6">
                {/* BAKIMDA mesajı */}
                <div
                  className="flex items-center justify-center gap-3 py-8 rounded-lg border mb-6"
                  style={{
                    background: "color-mix(in oklch, var(--muted) 50%, transparent)",
                    borderColor: "var(--border)",
                    borderStyle: "dashed",
                  }}
                >
                  <Wrench size={18} style={{ color: "var(--muted-foreground)" }} />
                  <div className="text-center">
                    <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                      🔧 Bakımda
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      Bu bölüm yakında detaylı bilgilerle güncellenecek.
                    </p>
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className="text-sm font-semibold uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Pro-Tips
                    </h3>
                    {isAuthenticated && (
                      <button
                        onClick={() => setShowTipForm(!showTipForm)}
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: "var(--primary)" }}
                      >
                        <Plus size={12} /> Tip Ekle
                      </button>
                    )}
                  </div>

                  {showTipForm && (
                    <div
                      className="mb-4 p-3 rounded border"
                      style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                    >
                      <textarea
                        value={tipContent}
                        onChange={e => setTipContent(e.target.value)}
                        placeholder="Bu silah/araç için stratejinizi paylaşın..."
                        rows={3}
                        className="w-full text-sm rounded border px-3 py-2 outline-none resize-none"
                        style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => addTipMutation.mutate({
                            itemName: selectedItem.name,
                            itemType: selectedItem.type,
                            content: tipContent,
                          })}
                          disabled={tipContent.length < 10 || addTipMutation.isPending}
                          className="px-3 py-1.5 rounded text-xs font-semibold"
                          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                        >
                          {addTipMutation.isPending ? "Gönderiliyor..." : "Gönder"}
                        </button>
                        <button
                          onClick={() => setShowTipForm(false)}
                          className="px-3 py-1.5 rounded text-xs border"
                          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  )}

                  {proTipsQuery.isLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map(i => (
                        <div key={i} className="h-16 rounded animate-pulse" style={{ background: "var(--muted)" }} />
                      ))}
                    </div>
                  ) : proTipsQuery.data?.length ? (
                    <div className="space-y-3">
                      {proTipsQuery.data.map((tip) => (
                        <div
                          key={tip.id}
                          className="p-3 rounded border"
                          style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                        >
                          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                            {tip.content}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                              — {tip.authorName}
                            </span>
                            <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                              <ThumbsUp size={11} /> {tip.likes}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
                      Henüz Pro-Tip yok.
                      {!isAuthenticated && (
                        <span className="block mt-1 text-xs">
                          Giriş yaparak ilk ipucunu ekleyebilirsin!
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-lg border flex flex-col items-center justify-center py-20 text-center"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <BookOpen size={40} className="mb-4" style={{ color: "var(--muted-foreground)" }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                Bir öğe seçin
              </h3>
              <p className="text-sm max-w-xs" style={{ color: "var(--muted-foreground)" }}>
                Soldaki listeden bir silah veya araç seçerek detaylı bilgi ve Pro-Tips'leri görüntüleyin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WeaponRow({ weapon, selected, onClick }: { weapon: WeaponItem; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 border-b text-left transition-all"
      style={{
        borderColor: "var(--border)",
        background: selected ? "color-mix(in oklch, var(--primary) 10%, transparent)" : "transparent",
        borderLeft: selected ? "2px solid var(--primary)" : "2px solid transparent",
      }}
    >
      <img
        src={weapon.image}
        alt={weapon.name}
        className="w-12 h-8 object-contain shrink-0"
        onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
          {weapon.name}
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {weapon.category}
        </p>
      </div>
      <ChevronRight size={12} style={{ color: "var(--muted-foreground)" }} className="shrink-0" />
    </button>
  );
}

function VehicleRow({ vehicle, selected, onClick }: { vehicle: VehicleItem; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 border-b text-left transition-all"
      style={{
        borderColor: "var(--border)",
        background: selected ? "color-mix(in oklch, var(--primary) 10%, transparent)" : "transparent",
        borderLeft: selected ? "2px solid var(--primary)" : "2px solid transparent",
      }}
    >
      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="w-12 h-8 object-contain shrink-0"
        onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
          {vehicle.name}
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {vehicle.category}
        </p>
      </div>
      <ChevronRight size={12} style={{ color: "var(--muted-foreground)" }} className="shrink-0" />
    </button>
  );
}
