import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Encyclopedia from "./pages/Encyclopedia";
import Stats from "./pages/Stats";
import WeeklyChallenges from "./pages/WeeklyChallenges";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import LiveServer from "./pages/LiveServer";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Donate from "./pages/Donate";
import BanList from "./pages/BanList";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 mt-12" style={{ borderColor: "oklch(0.22 0.02 60)", background: "oklch(0.13 0.015 58)" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, oklch(0.72 0.14 75), oklch(0.60 0.12 70))", color: "oklch(0.10 0.01 60)" }}>
                IYI
              </div>
              <span className="text-sm font-semibold" style={{ color: "oklch(0.75 0.16 75)", fontFamily: "'Oswald', sans-serif" }}>IYI NETWORK</span>
              <span className="text-xs text-muted-foreground">Battlefield 1 Topluluk Portalı</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>© 2024 IYI Network</span>
              <span>•</span>
              <a href="/geri-bildirim" className="hover:text-foreground transition-colors no-underline">İletişim</a>
              <span>•</span>
              <a href="/ban-listesi" className="hover:text-foreground transition-colors no-underline">Ban Listesi</a>
              <span>•</span>
              <a href="/destek" className="hover:text-foreground transition-colors no-underline" style={{ color: "oklch(0.72 0.14 75)" }}>Destekçi Ol</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/ansiklopedi" component={Encyclopedia} />
        <Route path="/istatistik" component={Stats} />
        <Route path="/gorevler" component={WeeklyChallenges} />
        <Route path="/liderlik" component={Leaderboard} />
        <Route path="/hakkimizda" component={About} />
        <Route path="/geri-bildirim" component={Feedback} />
        <Route path="/sunucu" component={LiveServer} />
        <Route path="/profil" component={Profile} />
        <Route path="/admin" component={Admin} />
        <Route path="/destek" component={Donate} />
        <Route path="/ban-listesi" component={BanList} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
