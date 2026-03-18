import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import Fuse from "fuse.js";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { normalizeTurkish, formatPlaytime, formatNumber } from "@/lib/utils";
import { WEAPONS, VEHICLES, BF1_CLASSES, WEAPON_CATEGORIES, VEHICLE_CATEGORIES, type WeaponEntry, type VehicleEntry } from "@/lib/encyclopediaData";
import { Search, BookOpen, Target, Truck, ChevronRight, ThumbsUp, Plus, X, Clock, Crosshair } from "lucide-react";
import { toast } from "sonner";

type Tab = "silahlar" | "araclar" | "siniflar";

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

  // Fuzzy search
  const weaponFuse = useMemo(() => new Fuse(WEAPONS, {
    keys: [{ name: "name", weight: 1.0 }, { name: "type", weight: 0.5 }, { name: "category", weight: 0.3 }],
    threshold: 0.4,
    getFn: (obj, path) => {
      const val = (obj as unknown as Record<string, unknown>)[path as string];
      return typeof val === "string" ? normalizeTurkish(val) : String(val || "");
    },
  }), []);

  const vehicleFuse = useMemo(() => new Fuse(VEHICLES, {
    keys: [{ name: "vehicleName", weight: 1.0 }, { name: "category", weight: 0.5 }],
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
  const selectedVehicle = selectedItem?.type === "vehicle" ? VEHICLES.find(v => v.vehicleName === selectedItem.name) : null;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.72 0.14 75 / 0.15)" }}>
          <BookOpen size={20} style={{ color: "oklch(0.75 0.16 75)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>Ansiklopedi</h1>
          <p className="text-sm text-muted-foreground">Silahlar, araçlar ve sınıflar hakkında detaylı bilgi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List */}
        <div className="lg:col-span-1">
          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Silah veya araç ara..."
              className="w-full h-9 pl-9 pr-3 text-sm rounded border outline-none"
              style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }}
            />
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border mb-4" style={{ borderColor: "oklch(0.25 0.02 60)" }}>
            {([["silahlar", "Silahlar", Target], ["araclar", "Araçlar", Truck], ["siniflar", "Sınıflar", BookOpen]] as [Tab, string, typeof Target][]).map(([key, label, Icon]) => (
              <button key={key} onClick={() => setTab(key)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all" style={{
                background: tab === key ? "oklch(0.72 0.14 75 / 0.2)" : "oklch(0.16 0.015 58)",
                color: tab === key ? "oklch(0.75 0.16 75)" : "oklch(0.55 0.02 80)",
                borderRight: "1px solid oklch(0.25 0.02 60)",
              }}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          {tab === "silahlar" && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["Tümü", ...WEAPON_CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setWeaponCategory(cat)} className="px-2 py-1 rounded text-xs font-medium transition-all" style={{
                  background: weaponCategory === cat ? "oklch(0.72 0.14 75 / 0.2)" : "oklch(0.18 0.01 60)",
                  color: weaponCategory === cat ? "oklch(0.75 0.16 75)" : "oklch(0.55 0.02 80)",
                  border: `1px solid ${weaponCategory === cat ? "oklch(0.72 0.14 75 / 0.4)" : "oklch(0.25 0.02 60)"}`,
                }}>{cat}</button>
              ))}
            </div>
          )}
          {tab === "araclar" && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["Tümü", ...VEHICLE_CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setVehicleCategory(cat)} className="px-2 py-1 rounded text-xs font-medium transition-all" style={{
                  background: vehicleCategory === cat ? "oklch(0.72 0.14 75 / 0.2)" : "oklch(0.18 0.01 60)",
                  color: vehicleCategory === cat ? "oklch(0.75 0.16 75)" : "oklch(0.55 0.02 80)",
                  border: `1px solid ${vehicleCategory === cat ? "oklch(0.72 0.14 75 / 0.4)" : "oklch(0.25 0.02 60)"}`,
                }}>{cat}</button>
              ))}
            </div>
          )}

          {/* List */}
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "oklch(0.25 0.02 60)" }}>
            <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
              {tab === "silahlar" && filteredWeapons.map((weapon, i) => (
                <WeaponRow key={i} weapon={weapon} selected={selectedItem?.name === weapon.name} onClick={() => setSelectedItem({ name: weapon.name, type: "weapon" })} />
              ))}
              {tab === "araclar" && filteredVehicles.map((vehicle, i) => (
                <VehicleRow key={i} vehicle={vehicle} selected={selectedItem?.name === vehicle.vehicleName} onClick={() => setSelectedItem({ name: vehicle.vehicleName, type: "vehicle" })} />
              ))}
              {tab === "siniflar" && BF1_CLASSES.map((cls, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 border-b hover:bg-accent/30 transition-colors" style={{ borderColor: "oklch(0.22 0.02 60)" }}>
                  <img src={cls.img} alt={cls.tr} className="w-8 h-8 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{cls.tr}</p>
                    <p className="text-xs text-muted-foreground">{cls.desc}</p>
                  </div>
                </div>
              ))}
              {tab === "silahlar" && filteredWeapons.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">Sonuç bulunamadı</div>
              )}
              {tab === "araclar" && filteredVehicles.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">Sonuç bulunamadı</div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Detail */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="rounded-lg border overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              {/* Detail Header */}
              <div className="p-6 border-b" style={{ borderColor: "oklch(0.22 0.02 60)", background: "oklch(0.14 0.015 56)" }}>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-16 rounded flex items-center justify-center shrink-0" style={{ background: "oklch(0.20 0.02 58)" }}>
                    <img
                      src={selectedWeapon?.image || selectedVehicle?.image || ""}
                      alt={selectedItem.name}
                      className="max-w-full max-h-full object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "oklch(0.72 0.14 75 / 0.2)", color: "oklch(0.75 0.16 75)" }}>
                        {selectedItem.type === "weapon" ? "Silah" : "Araç"}
                      </span>
                      {selectedWeapon?.type && (
                        <span className="text-xs text-muted-foreground">{selectedWeapon.type}</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>{selectedItem.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedWeapon?.category || selectedVehicle?.category}
                      {selectedWeapon?.class && ` • ${selectedWeapon.class} Sınıfı`}
                    </p>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="p-1 text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">İstatistikler</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {selectedWeapon && (
                    <>
                      <StatCard label="Toplam Kill" value={formatNumber(selectedWeapon.kills || 0)} icon={<Crosshair size={14} />} />
                      <StatCard label="İsabet Oranı" value={selectedWeapon.accuracy || "—"} icon={<Target size={14} />} />
                      <StatCard label="Kullanım Süresi" value={formatPlaytime(selectedWeapon.timeEquipped || 0)} icon={<Clock size={14} />} />
                    </>
                  )}
                  {selectedVehicle && (
                    <>
                      <StatCard label="Toplam Kill" value={formatNumber(selectedVehicle.kills || 0)} icon={<Crosshair size={14} />} />
                      <StatCard label="Oynama Süresi" value={`${selectedVehicle.timePlayed || 0} Saat`} icon={<Clock size={14} />} />
                      <StatCard label="Kategori" value={selectedVehicle.category} icon={<Truck size={14} />} />
                    </>
                  )}
                </div>

                {/* Pro Tips */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pro-Tips</h3>
                    {isAuthenticated && (
                      <button onClick={() => setShowTipForm(!showTipForm)} className="flex items-center gap-1 text-xs font-medium" style={{ color: "oklch(0.72 0.14 75)" }}>
                        <Plus size={12} /> Tip Ekle
                      </button>
                    )}
                  </div>

                  {showTipForm && (
                    <div className="mb-4 p-3 rounded border" style={{ background: "oklch(0.14 0.01 58)", borderColor: "oklch(0.28 0.03 60)" }}>
                      <textarea
                        value={tipContent}
                        onChange={e => setTipContent(e.target.value)}
                        placeholder="Bu silah/araç için stratejinizi paylaşın..."
                        rows={3}
                        className="w-full text-sm rounded border px-3 py-2 outline-none resize-none"
                        style={{ background: "oklch(0.18 0.01 60)", borderColor: "oklch(0.28 0.03 60)", color: "oklch(0.92 0.02 80)" }}
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => addTipMutation.mutate({ itemName: selectedItem.name, itemType: selectedItem.type, content: tipContent })} disabled={tipContent.length < 10 || addTipMutation.isPending} className="px-3 py-1.5 rounded text-xs font-semibold" style={{ background: "oklch(0.72 0.14 75)", color: "oklch(0.10 0.01 60)" }}>
                          {addTipMutation.isPending ? "Gönderiliyor..." : "Gönder"}
                        </button>
                        <button onClick={() => setShowTipForm(false)} className="px-3 py-1.5 rounded text-xs text-muted-foreground border" style={{ borderColor: "oklch(0.28 0.03 60)" }}>İptal</button>
                      </div>
                    </div>
                  )}

                  {proTipsQuery.isLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map(i => <div key={i} className="h-16 rounded bg-muted animate-pulse" />)}
                    </div>
                  ) : proTipsQuery.data?.length ? (
                    <div className="space-y-3">
                      {proTipsQuery.data.map((tip) => (
                        <div key={tip.id} className="p-3 rounded border" style={{ background: "oklch(0.14 0.01 58)", borderColor: "oklch(0.25 0.02 60)" }}>
                          <p className="text-sm text-foreground leading-relaxed">{tip.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">— {tip.authorName}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ThumbsUp size={11} /> {tip.likes}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      Henüz Pro-Tip yok.
                      {!isAuthenticated && <span className="block mt-1 text-xs">Giriş yaparak ilk ipucunu ekleyebilirsin!</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border flex flex-col items-center justify-center py-20 text-center" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.25 0.02 60)" }}>
              <BookOpen size={40} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Bir öğe seçin</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Soldaki listeden bir silah veya araç seçerek detaylı bilgi ve Pro-Tips'leri görüntüleyin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WeaponRow({ weapon, selected, onClick }: { weapon: WeaponEntry; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 border-b text-left transition-all" style={{
      borderColor: "oklch(0.22 0.02 60)",
      background: selected ? "oklch(0.72 0.14 75 / 0.1)" : "transparent",
      borderLeft: selected ? "2px solid oklch(0.72 0.14 75)" : "2px solid transparent",
    }}>
      <img src={weapon.image} alt={weapon.name} className="w-12 h-8 object-contain shrink-0" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{weapon.name}</p>
        <p className="text-xs text-muted-foreground">{weapon.type} • {weapon.category}</p>
      </div>
      <ChevronRight size={12} className="text-muted-foreground shrink-0" />
    </button>
  );
}

function VehicleRow({ vehicle, selected, onClick }: { vehicle: VehicleEntry; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 border-b text-left transition-all" style={{
      borderColor: "oklch(0.22 0.02 60)",
      background: selected ? "oklch(0.72 0.14 75 / 0.1)" : "transparent",
      borderLeft: selected ? "2px solid oklch(0.72 0.14 75)" : "2px solid transparent",
    }}>
      <img src={vehicle.image} alt={vehicle.vehicleName} className="w-12 h-8 object-contain shrink-0" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{vehicle.vehicleName}</p>
        <p className="text-xs text-muted-foreground">{vehicle.category}</p>
      </div>
      <ChevronRight size={12} className="text-muted-foreground shrink-0" />
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-3 rounded border" style={{ background: "oklch(0.14 0.01 58)", borderColor: "oklch(0.25 0.02 60)" }}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{value}</p>
    </div>
  );
}
