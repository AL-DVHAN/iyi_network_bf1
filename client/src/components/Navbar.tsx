import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import Fuse from "fuse.js";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { normalizeTurkish } from "@/lib/utils";
import { getAllSearchableItems } from "@/lib/encyclopediaData";
import {
  BookOpen, BarChart2, Target, Trophy, Info, MessageSquare,
  Server, Search, X, Menu, ChevronDown, User, LogOut, Shield, Crown
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/ansiklopedi", label: "Ansiklopedi", icon: BookOpen },
  { href: "/istatistik", label: "İstatistik", icon: BarChart2 },
  { href: "/gorevler", label: "Haftalık Görevler", icon: Target },
  { href: "/liderlik", label: "Liderlik Tablosu", icon: Trophy },
  { href: "/hakkimizda", label: "Hakkımızda", icon: Info },
  { href: "/geri-bildirim", label: "Geri Bildirim", icon: MessageSquare },
  { href: "/sunucu", label: "Canlı Sunucu", icon: Server },
];

interface SearchResult {
  name: string;
  type: "weapon" | "vehicle" | "player";
  category?: string;
  href: string;
}

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const allItems = getAllSearchableItems();

  const fuse = new Fuse(allItems, {
    keys: [
      { name: "name", weight: 1.0 },
      { name: "normalizedName", weight: 0.8 },
    ],
    threshold: 0.4,
    includeScore: true,
    getFn: (obj, path) => {
      if (path === "normalizedName") return normalizeTurkish(obj.name);
      return obj.name;
    },
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const normalizedQuery = normalizeTurkish(query);
    const fuseResults = fuse.search(normalizedQuery);
    const results: SearchResult[] = fuseResults.slice(0, 6).map(r => ({
      name: r.item.name,
      type: r.item.type,
      category: r.item.category,
      href: r.item.type === "weapon"
        ? `/ansiklopedi?q=${encodeURIComponent(r.item.name)}&type=weapon`
        : `/ansiklopedi?q=${encodeURIComponent(r.item.name)}&type=vehicle`,
    }));
    // Oyuncu arama seçeneği ekle
    if (query.trim().length >= 2) {
      results.push({
        name: `"${query}" oyuncusunu ara`,
        type: "player",
        href: `/istatistik?player=${encodeURIComponent(query.trim())}`,
      });
    }
    setSearchResults(results);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Oyuncu mı silah/araç mı kontrol et
    const normalizedQ = normalizeTurkish(searchQuery);
    const itemMatch = allItems.find(item =>
      normalizeTurkish(item.name).includes(normalizedQ) ||
      normalizedQ.includes(normalizeTurkish(item.name).substring(0, 5))
    );
    if (itemMatch) {
      navigate(`/ansiklopedi?q=${encodeURIComponent(searchQuery)}&type=${itemMatch.type}`);
    } else {
      navigate(`/istatistik?player=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
  };

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <nav className="sticky top-0 z-50 w-full" style={{ background: "oklch(0.13 0.015 58)", borderBottom: "1px solid oklch(0.25 0.02 60)" }}>
      {/* Top bar */}
      <div className="container">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
            <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75), oklch(0.60 0.12 70))", color: "oklch(0.10 0.01 60)" }}>
              IYI
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-wide" style={{ fontFamily: "'Oswald', sans-serif", color: "oklch(0.75 0.16 75)" }}>IYI NETWORK</span>
              <span className="text-xs text-muted-foreground ml-1.5 hidden md:inline">BF1</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-all no-underline ${
                    active
                      ? "text-gold-dim bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  style={active ? { color: "oklch(0.75 0.16 75)" } : {}}
                >
                  <Icon size={13} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Search + Auth */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div ref={searchRef} className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Oyuncu, silah veya araç ara..."
                    className="w-56 md:w-72 h-8 px-3 text-xs rounded-l border-y border-l outline-none"
                    style={{ background: "oklch(0.20 0.01 60)", borderColor: "oklch(0.72 0.14 75 / 0.5)", color: "oklch(0.92 0.02 80)" }}
                  />
                  <button type="submit" className="h-8 px-2 rounded-r flex items-center" style={{ background: "oklch(0.72 0.14 75)", color: "oklch(0.10 0.01 60)" }}>
                    <Search size={14} />
                  </button>
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }} className="ml-1 p-1 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="flex items-center gap-1.5 px-3 h-8 rounded text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 transition-all" style={{ background: "oklch(0.18 0.01 60)" }}>
                  <Search size={13} />
                  <span className="hidden sm:inline">Ara...</span>
                </button>
              )}
              {/* Search Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-1 w-80 rounded-lg border shadow-xl z-50 overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.28 0.03 60)" }}>
                  {searchResults.map((result, i) => (
                    <Link
                      key={i}
                      href={result.href}
                      onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchOpen(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors no-underline border-b last:border-0"
                      style={{ borderColor: "oklch(0.22 0.02 60)" }}
                    >
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0" style={{
                        background: result.type === "player" ? "oklch(0.35 0.12 200 / 0.3)" : result.type === "weapon" ? "oklch(0.72 0.14 75 / 0.2)" : "oklch(0.55 0.15 30 / 0.3)",
                        color: result.type === "player" ? "oklch(0.65 0.12 200)" : result.type === "weapon" ? "oklch(0.72 0.14 75)" : "oklch(0.70 0.15 30)",
                      }}>
                        {result.type === "player" ? "Oyuncu" : result.type === "weapon" ? "Silah" : "Araç"}
                      </span>
                      <span className="text-sm text-foreground truncate">{result.name}</span>
                      {result.category && <span className="text-xs text-muted-foreground ml-auto shrink-0">{result.category}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Auth */}
            {isAuthenticated && user ? (
              <div ref={userMenuRef} className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-2 py-1 rounded border border-border hover:border-primary/50 transition-all" style={{ background: "oklch(0.18 0.01 60)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75), oklch(0.60 0.12 70))", color: "oklch(0.10 0.01 60)" }}>
                    {(user.name || user.email || "?")[0].toUpperCase()}
                  </div>
                  <span className="hidden md:block text-xs text-foreground max-w-20 truncate">{user.name || user.email}</span>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 rounded-lg border shadow-xl z-50 overflow-hidden" style={{ background: "oklch(0.16 0.015 58)", borderColor: "oklch(0.28 0.03 60)" }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: "oklch(0.22 0.02 60)" }}>
                      <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link href="/profil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors no-underline">
                      <User size={14} /> Profilim
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors no-underline" style={{ color: "oklch(0.72 0.14 75)" }}>
                        <Shield size={14} /> Admin Paneli
                      </Link>
                    )}
                    <Link href="/destek" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors no-underline" style={{ color: "oklch(0.75 0.16 75)" }}>
                      <Crown size={14} /> Destekçi Ol
                    </Link>
                    <div className="border-t" style={{ borderColor: "oklch(0.22 0.02 60)" }}>
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                        <LogOut size={14} /> Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a href={getLoginUrl()} className="flex items-center gap-1.5 px-3 h-8 rounded text-xs font-semibold no-underline transition-all" style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75), oklch(0.65 0.12 70))", color: "oklch(0.10 0.01 60)" }}>
                <User size={13} />
                <span>Giriş Yap</span>
              </a>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t" style={{ borderColor: "oklch(0.22 0.02 60)", background: "oklch(0.13 0.015 58)" }}>
          <div className="container py-2 flex flex-col gap-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium no-underline ${active ? "bg-accent" : "hover:bg-accent/50"}`}
                  style={active ? { color: "oklch(0.75 0.16 75)" } : { color: "oklch(0.75 0.02 80)" }}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
