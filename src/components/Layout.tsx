import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import {
  LayoutDashboard,
  LineChart,
  PieChart,
  MessageSquare,
  Trophy,
  Target,
  User,
  LogOut,
  Wallet,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BOTTOM_NAV = [
  { href: "/dashboard",   label: "Home",        icon: LayoutDashboard },
  { href: "/markets",     label: "Markets",     icon: LineChart },
  { href: "/portfolio",   label: "Portfolio",   icon: PieChart },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile",     label: "Profile",     icon: User },
];

const SIDEBAR_NAV = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/markets",     label: "Markets",     icon: LineChart },
  { href: "/portfolio",   label: "Portfolio",   icon: PieChart },
  { href: "/coach",       label: "AI Coach",    icon: MessageSquare },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/challenges",  label: "Challenges",  icon: Target },
  { href: "/profile",     label: "Profile",     icon: User },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useGetMe();

  const handleLogout = () => {
    localStorage.removeItem("tradevision_user_id");
    window.location.href = "/";
  };

  const isActive = (href: string) =>
    location === href || location.startsWith(`${href}/`);

  return (
    <div className="min-h-screen flex bg-background text-foreground">

      {/* ── Desktop sidebar (hidden on mobile) ───────────────────────────── */}
      <aside className="w-64 border-r border-border bg-card flex-col hidden md:flex flex-shrink-0">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">
            TradeVision<span className="text-primary">AI</span>
          </span>
        </div>

        <div className="p-4 border-b border-border">
          <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <div className="text-xl font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              {formatCurrency(user?.virtualBalance ?? 0)}
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav (hidden on desktop) ────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
        style={{
          background: "#0F1629",
          borderTop: "1px solid #1E2A40",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
              style={{ color: active ? "#00D897" : "#8B9CB3" }}
            >
              <Icon
                className="h-5 w-5"
                style={{
                  filter: active
                    ? "drop-shadow(0 0 4px rgba(0,216,151,0.5))"
                    : "none",
                }}
              />
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: active ? "#00D897" : "#8B9CB3" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
