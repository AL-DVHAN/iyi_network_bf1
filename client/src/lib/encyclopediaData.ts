// IYI Network BF1 Encyclopedia Data
// Silah ve araç verileri JSON dosyalarından derlendi

export interface WeaponEntry {
  name: string;
  image: string;
  type: string;
  kills?: number;
  accuracy?: string;
  timeEquipped?: number;
  category: string;
  class?: string;
}

export interface VehicleEntry {
  category: string;
  vehicleName: string;
  kills?: number;
  timePlayed?: number;
  image: string;
}

export interface ClassInfo {
  key: string;
  tr: string;
  img: string;
  desc: string;
}

export const BF1_CLASSES: ClassInfo[] = [
  { key: "Assault", tr: "Taarruz", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/tunguska/7/124/ClassIconAssault-07fc9560.png", desc: "Yakın mesafe çatışma ve araç imha uzmanı." },
  { key: "Medic", tr: "Sıhhiyeci", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/tunguska/112/12/ClassIconMedic-700c0a3e.png", desc: "Takım arkadaşlarını iyileştirme ve canlandırma uzmanı." },
  { key: "Support", tr: "Destek", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/tunguska/112/13/ClassIconSupport-700d313f.png", desc: "Mühimmat sağlama ve baskı ateşi uzmanı." },
  { key: "Scout", tr: "Gözcü", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/tunguska/112/11/ClassIconScout-700b343d.png", desc: "Uzun mesafe keşif ve keskin nişancılık uzmanı." },
  { key: "Pilot", tr: "Pilot", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/tunguska/112/10/ClassIconPilot-700a1d3c.png", desc: "Hava araçları kullanım uzmanı." },
  { key: "Tanker", tr: "Tankçı", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/tunguska/112/14/ClassIconTanker-700e3540.png", desc: "Zırhlı kara araçları kullanım uzmanı." },
  { key: "Cavalry", tr: "Süvari", img: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/tunguska/112/9/ClassIconCavalry-7009473b.png", desc: "Atlı birlik ve kılıç kullanım uzmanı." },
];

export const WEAPONS: WeaponEntry[] = [
  // Keskin Nişancı Tüfekleri
  { name: "Martini-Henry Grenade Launcher", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/30/MartiniHenryGrenadeLauncher-65e27bf0.png", type: "Field kit", kills: 38, accuracy: "46.9%", timeEquipped: 2866, category: "Keskin Nişancı Tüfekleri", class: "Scout" },
  { name: "Gewehr 98", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/28/Gewehr98-65e07bee.png", type: "Bolt Action", kills: 1250, accuracy: "52.3%", timeEquipped: 18000, category: "Keskin Nişancı Tüfekleri", class: "Scout" },
  { name: "SMLE MKIII", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/27/SMLEMARK3-65df7aed.png", type: "Bolt Action", kills: 980, accuracy: "48.7%", timeEquipped: 14400, category: "Keskin Nişancı Tüfekleri", class: "Scout" },
  { name: "M1903 Springfield", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/26/M1903Springfield-65de79ec.png", type: "Bolt Action", kills: 760, accuracy: "55.1%", timeEquipped: 10800, category: "Keskin Nişancı Tüfekleri", class: "Scout" },
  { name: "Mosin-Nagant M91", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/25/MosinNagantM91-65dd78eb.png", type: "Bolt Action", kills: 640, accuracy: "50.2%", timeEquipped: 9000, category: "Keskin Nişancı Tüfekleri", class: "Scout" },
  // Yarı Otomatik Tüfekler
  { name: "Mondragon", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/24/Mondragon-65dc77ea.png", type: "Semi-Auto", kills: 520, accuracy: "44.8%", timeEquipped: 7200, category: "Yarı Otomatik Tüfekler", class: "Medic" },
  { name: "RSC 1917", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/23/RSC1917-65db76e9.png", type: "Semi-Auto", kills: 430, accuracy: "42.1%", timeEquipped: 6300, category: "Yarı Otomatik Tüfekler", class: "Medic" },
  { name: "Cei-Rigotti", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/22/CeiRigotti-65da75e8.png", type: "Semi-Auto", kills: 380, accuracy: "40.5%", timeEquipped: 5400, category: "Yarı Otomatik Tüfekler", class: "Medic" },
  // Makineli Tüfekler
  { name: "Lewis Gun", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/21/LewisGun-65d974e7.png", type: "LMG", kills: 1840, accuracy: "38.9%", timeEquipped: 25200, category: "Makineli Tüfekler", class: "Support" },
  { name: "BAR M1918", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/20/BARM1918-65d873e6.png", type: "LMG", kills: 1560, accuracy: "41.3%", timeEquipped: 21600, category: "Makineli Tüfekler", class: "Support" },
  { name: "Huot Automatic", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/19/HuotAutomatic-65d772e5.png", type: "LMG", kills: 1200, accuracy: "36.7%", timeEquipped: 18000, category: "Makineli Tüfekler", class: "Support" },
  // Pompalı Tüfekler / Taarruz
  { name: "Model 10-A", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/18/Model10A-65d671e4.png", type: "Shotgun", kills: 920, accuracy: "28.4%", timeEquipped: 12600, category: "Pompalı Tüfekler", class: "Assault" },
  { name: "12g Automatic", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/17/12gAutomatic-65d570e3.png", type: "Shotgun", kills: 780, accuracy: "25.9%", timeEquipped: 10800, category: "Pompalı Tüfekler", class: "Assault" },
  // Tabancalar
  { name: "M1911", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/16/M1911-65d46fe2.png", type: "Pistol", kills: 340, accuracy: "35.6%", timeEquipped: 4500, category: "Tabancalar", class: "All" },
  { name: "C96", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/15/C96-65d36ee1.png", type: "Pistol", kills: 280, accuracy: "32.1%", timeEquipped: 3600, category: "Tabancalar", class: "All" },
  { name: "Frommer Stop", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/14/FrommerStop-65d26de0.png", type: "Pistol", kills: 190, accuracy: "30.8%", timeEquipped: 2700, category: "Tabancalar", class: "All" },
  // Yakın Dövüş
  { name: "Trench Knife", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/13/TrenchKnife-65d16cdf.png", type: "Melee", kills: 450, accuracy: "100%", timeEquipped: 5400, category: "Yakın Dövüş", class: "All" },
  { name: "Saber", image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/101/12/Saber-65d06bde.png", type: "Melee", kills: 280, accuracy: "100%", timeEquipped: 3600, category: "Yakın Dövüş", class: "Cavalry" },
];

export const VEHICLES: VehicleEntry[] = [
  // Tanklar
  { category: "Tanklar", vehicleName: "Ft-17 Light Tank", kills: 2856, timePlayed: 17, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/82/87/FRARenaultFt-17-aea9e5e7.png" },
  { category: "Tanklar", vehicleName: "Artillery Truck", kills: 1573, timePlayed: 14, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/110/109/GBRPierceArrowAALorry-6e6d8d9f.png" },
  { category: "Tanklar", vehicleName: "Mark V Landship", kills: 226, timePlayed: 3, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/65/59/GBRMarkV-bf3b1d1a.png" },
  { category: "Tanklar", vehicleName: "A7V Heavy Tank", kills: 74, timePlayed: 2, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/65/64/GERA7V-bfc09237.png" },
  { category: "Tanklar", vehicleName: "St Chamond", kills: 6272, timePlayed: 39, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/49/35/FRAStChamond-3123e0cd.png" },
  { category: "Tanklar", vehicleName: "Putilov Garford", kills: 4006, timePlayed: 26, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/32/92/PutilovGarford-20a4fd91.png" },
  // Behemothlar
  { category: "Behemothlar", vehicleName: "Char 2C", kills: 37, timePlayed: 1, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/72/13/FRAChar2C-b8f3c0e2.png" },
  { category: "Behemothlar", vehicleName: "Airship L30", kills: 142, timePlayed: 3, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/72/14/GERAirshipL30-b8f4c1e3.png" },
  { category: "Behemothlar", vehicleName: "Armored Train", kills: 89, timePlayed: 2, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/72/15/ArmoredTrain-b8f5c2e4.png" },
  // Uçaklar
  { category: "Uçaklar", vehicleName: "Fighter Plane", kills: 3420, timePlayed: 22, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/82/80/FighterPlane-ae9fe5f0.png" },
  { category: "Uçaklar", vehicleName: "Attack Plane", kills: 2180, timePlayed: 15, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/82/81/AttackPlane-aea0e5f1.png" },
  { category: "Uçaklar", vehicleName: "Bomber", kills: 1640, timePlayed: 11, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/82/82/Bomber-aea1e5f2.png" },
  // Deniz Araçları
  { category: "Deniz Araçları", vehicleName: "Torpedo Boat", kills: 890, timePlayed: 8, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/82/83/TorpedoBoat-aea2e5f3.png" },
  { category: "Deniz Araçları", vehicleName: "Dreadnought", kills: 456, timePlayed: 5, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/82/84/Dreadnought-aea3e5f4.png" },
  // Atlar
  { category: "Atlar", vehicleName: "Horse", kills: 1230, timePlayed: 9, image: "https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/82/85/Horse-aea4e5f5.png" },
];

export const WEAPON_CATEGORIES = Array.from(new Set(WEAPONS.map(w => w.category)));
export const VEHICLE_CATEGORIES = Array.from(new Set(VEHICLES.map(v => v.category)));

export function getAllSearchableItems(): Array<{ name: string; type: "weapon" | "vehicle"; category: string }> {
  return [
    ...WEAPONS.map(w => ({ name: w.name, type: "weapon" as const, category: w.category })),
    ...VEHICLES.map(v => ({ name: v.vehicleName, type: "vehicle" as const, category: v.category })),
  ];
}
