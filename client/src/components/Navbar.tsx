import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import Fuse from "fuse.js";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { normalizeTurkish } from "@/lib/utils";
import { getAllSearchableItems } from "@/lib/encyclopediaData";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import {
  BookOpen, BarChart2, Target, Trophy, Info, MessageSquare,
  Server, Search, X, Menu, ChevronDown, User, LogOut, Shield, Crown,
  Moon, Sun, Palette
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

const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "dark", label: "Siyah", icon: "⬛" },
  { value: "blue", label: "Mavi", icon: "🔵" },
  { value: "light", label: "Beyaz", icon: "⬜" },
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
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  const currentThemeOption = THEME_OPTIONS.find(t => t.value === theme);

  return (
    <nav className="sticky top-0 z-50 w-full" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
      {/* Main bar - taller height */}
      <div className="container">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663449295263/Gmy9fZETeSxEKPMRqUqKxx/iyi_clan_logo_5a29267d.png"
              alt="IYI Network Logo"
              className="w-10 h-10 rounded-full object-contain"
              style={{ background: "transparent" }}
            />
            <div className="hidden sm:block">
              <span className="font-bold text-base tracking-wide" style={{ fontFamily: "'Oswald', sans-serif", color: '#2b7ac5' }}>KAYI BOYU CLAN</span>
            </div>
          </Link>

          {/* Desktop Nav - more spacing between items */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-md text-xs font-medium transition-all no-underline whitespace-nowrap ${
                    active
                      ? "bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                  style={active ? { color: "var(--primary)" } : {}}
                >
                  <Icon size={13} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Theme + Search + Auth */}
          <div className="flex items-center gap-2 shrink-0">


            {/* Theme Switcher */}
            <div ref={themeMenuRef} className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 h-9 rounded-md text-xs text-muted-foreground hover:text-foreground border transition-all"
                style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                title="Tema Değiştir"
              >
                <Palette size={13} />
                <span className="hidden md:inline">{currentThemeOption?.label}</span>
              </button>
              {themeMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-36 rounded-lg border shadow-xl z-50 overflow-hidden" style={{ background: "var(--popover)", borderColor: "var(--border)" }}>
                  <div className="px-3 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tema</p>
                  </div>
                  {THEME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setTheme(opt.value); setThemeMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left"
                      style={{
                        background: theme === opt.value ? "var(--accent)" : "transparent",
                        color: theme === opt.value ? "var(--primary)" : "var(--foreground)",
                      }}
                    >
                      <span className="text-base leading-none">{opt.icon}</span>
                      <span className="font-medium">{opt.label}</span>
                      {theme === opt.value && <span className="ml-auto text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <div ref={searchRef} className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Oyuncu, silah veya araç ara..."
                    className="w-56 md:w-72 h-9 px-3 text-xs rounded-l border-y border-l outline-none"
                    style={{ background: "var(--input)", borderColor: "oklch(from var(--primary) l c h / 0.5)", color: "var(--foreground)" }}
                  />
                  <button type="submit" className="h-9 px-2.5 rounded-r flex items-center" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                    <Search size={14} />
                  </button>
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }} className="ml-1 p-1 text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="flex items-center gap-1.5 px-3 h-9 rounded-md text-xs text-muted-foreground hover:text-foreground border transition-all" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                  <Search size={13} />
                  <span className="hidden sm:inline">Ara...</span>
                </button>
              )}
              {/* Search Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-1 w-80 rounded-lg border shadow-xl z-50 overflow-hidden" style={{ background: "var(--popover)", borderColor: "var(--border)" }}>
                  {searchResults.map((result, i) => (
                    <Link
                      key={i}
                      href={result.href}
                      onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchOpen(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors no-underline border-b last:border-0"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0" style={{
                        background: result.type === "player" ? "oklch(0.35 0.12 200 / 0.3)" : result.type === "weapon" ? "oklch(from var(--primary) l c h / 0.2)" : "oklch(0.55 0.15 30 / 0.3)",
                        color: result.type === "player" ? "oklch(0.65 0.12 200)" : result.type === "weapon" ? "var(--primary)" : "oklch(0.70 0.15 30)",
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
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-2.5 h-9 rounded-md border transition-all" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, var(--primary), oklch(from var(--primary) calc(l - 0.1) c h))", color: "var(--primary-foreground)" }}>
                    {(user.name || user.email || "?")[0].toUpperCase()}
                  </div>
                  <span className="hidden md:block text-xs text-foreground max-w-20 truncate">{user.name || user.email}</span>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 rounded-lg border shadow-xl z-50 overflow-hidden" style={{ background: "var(--popover)", borderColor: "var(--border)" }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                      <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link href="/profil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors no-underline">
                      <User size={14} /> Profilim
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors no-underline" style={{ color: "var(--primary)" }}>
                        <Shield size={14} /> Admin Paneli
                      </Link>
                    )}

                    <div className="border-t" style={{ borderColor: "var(--border)" }}>
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                        <LogOut size={14} /> Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a href={getLoginUrl()} className="flex items-center gap-1.5 px-3.5 h-9 rounded-md text-xs font-semibold no-underline transition-all" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
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

      {/* Destek Ol Section */}
      <div className="border-t" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
        <div className="container">
          <a
            href="https://kreosus.com/kayiboyucomtr/about"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold no-underline transition-all hover:opacity-90"
            style={{ background: "oklch(0.75 0.16 75)", color: "var(--card)" }}
          >
            <Crown size={18} />
            <span>Klan Destekçisi Ol</span>
          </a>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <div className="container py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium no-underline ${active ? "bg-accent" : "hover:bg-accent/50"}`}
                  style={active ? { color: "var(--primary)" } : { color: "var(--foreground)" }}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            {/* Mobile theme switcher */}
            <div className="border-t mt-2 pt-2" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs text-muted-foreground px-3 mb-1.5 uppercase tracking-wide font-semibold">Tema</p>
              <div className="flex gap-1 px-1">
                {THEME_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: theme === opt.value ? "var(--accent)" : "transparent",
                      color: theme === opt.value ? "var(--primary)" : "var(--muted-foreground)",
                      border: `1px solid ${theme === opt.value ? "var(--primary)" : "var(--border)"}`,
                    }}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
