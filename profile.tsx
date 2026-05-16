import { useGetMe, useResetBalance, getGetMeQueryKey, getGetPortfolioQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Trophy, Star, TrendingUp, LogOut, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

function xpForLevel(level: number) {
  return Math.pow(level - 1, 2) * 100;
}

function xpForNextLevel(level: number) {
  return Math.pow(level, 2) * 100;
}

export default function Profile() {
  const { data: user, isLoading } = useGetMe();
  const resetBalance = useResetBalance();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleReset = () => {
    resetBalance.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Balance reset!", description: "Your virtual balance has been reset to ₹10,00,000." });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPortfolioQueryKey() });
      },
      onError: () => {
        toast({ title: "Reset failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("tradevision_user_id");
    setLocation("/");
  };

  const currentLevelXp = user ? xpForLevel(user.level) : 0;
  const nextLevelXp = user ? xpForNextLevel(user.level) : 100;
  const xpInLevel = (user?.xp ?? 0) - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpProgress = Math.min(100, (xpInLevel / Math.max(1, xpNeeded)) * 100);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Your trading identity and achievements.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : (
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-xl font-bold" data-testid="text-display-name">{user?.name}</h2>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Lvl {user?.level}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {user?.xp} XP total &bull; {user?.totalTrades} trades &bull; {user?.winRate?.toFixed(0)}% win rate
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Level {user?.level}</span>
                    <span>Level {(user?.level ?? 1) + 1}</span>
                  </div>
                  <Progress value={xpProgress} className="h-2.5" />
                  <div className="text-xs text-muted-foreground text-right">
                    {xpInLevel} / {xpNeeded} XP to next level
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : (
          <>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{user?.level}</div>
                <div className="text-xs text-muted-foreground mt-1">Level</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{user?.xp}</div>
                <div className="text-xs text-muted-foreground mt-1">Total XP</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{user?.totalTrades}</div>
                <div className="text-xs text-muted-foreground mt-1">Trades</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{user?.winRate?.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground mt-1">Win Rate</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Portfolio Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm py-2 border-b border-border/40">
                <span className="text-muted-foreground">Virtual Balance</span>
                <span className="font-semibold" data-testid="text-virtual-balance">{formatCurrency(user?.virtualBalance ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border/40">
                <span className="text-muted-foreground">Total Portfolio Value</span>
                <span className="font-semibold">{formatCurrency(user?.totalPortfolioValue ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border/40">
                <span className="text-muted-foreground">Total P&L</span>
                <span className={`font-semibold ${(user?.totalPL ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {formatCurrency(user?.totalPL ?? 0, true)} ({formatPercent(user?.totalPLPercent ?? 0)})
                </span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-muted-foreground">Starting Balance</span>
                <span className="font-semibold">{formatCurrency(user?.startingBalance ?? 1000000)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {user?.badges && user.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-sm font-medium text-yellow-400"
                  data-testid={`badge-${badge}`}
                >
                  <Star className="h-3.5 w-3.5" />
                  {badge}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/10" data-testid="button-reset-balance">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Balance to ₹10,00,000
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset your balance?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset your virtual balance to ₹10,00,000 and close all open positions. Your trade history and XP will be preserved. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="button-confirm-reset"
              >
                Reset Balance
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
