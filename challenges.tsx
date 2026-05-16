import { useGetChallenges, useClaimChallenge, getGetChallengesQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Clock, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ChallengePeriod } from "@workspace/api-client-react";

const PERIOD_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const PERIOD_COLORS: Record<string, string> = {
  daily: "border-blue-500/30 text-blue-400",
  weekly: "border-purple-500/30 text-purple-400",
  monthly: "border-orange-500/30 text-orange-400",
};

export default function Challenges() {
  const { data, isLoading } = useGetChallenges();
  const claimChallenge = useClaimChallenge();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleClaim = (id: string, badge: string) => {
    claimChallenge.mutate(
      { id },
      {
        onSuccess: (result) => {
          toast({
            title: result.success ? "Challenge claimed!" : "Already claimed",
            description: result.message,
          });
          if (result.success) {
            queryClient.invalidateQueries({ queryKey: getGetChallengesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          }
        },
        onError: () => {
          toast({ title: "Failed to claim", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const grouped = Object.values(ChallengePeriod).map((period) => ({
    period,
    challenges: data?.challenges?.filter((c) => c.period === period) ?? [],
  }));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Target className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Complete challenges to earn XP and badges.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ period, challenges }) =>
            challenges.length === 0 ? null : (
              <div key={period}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">{PERIOD_LABELS[period]} Challenges</h2>
                  <Badge variant="outline" className="text-xs">{challenges.length}</Badge>
                </div>
                <div className="space-y-3">
                  {challenges.map((challenge) => {
                    const progressPct = Math.min(100, (challenge.progress / Math.max(1, challenge.target)) * 100);
                    const canClaim = challenge.completed && !challenge.claimed;

                    return (
                      <Card
                        key={challenge.id}
                        className={`border transition-colors ${
                          challenge.completed
                            ? challenge.claimed
                              ? "border-border/40 opacity-70"
                              : "border-primary/30 bg-primary/5"
                            : "border-border"
                        }`}
                        data-testid={`challenge-card-${challenge.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${PERIOD_COLORS[period]}`}
                                >
                                  {PERIOD_LABELS[period]}
                                </Badge>
                                {challenge.completed && (
                                  <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">
                                    Completed
                                  </Badge>
                                )}
                                {challenge.claimed && (
                                  <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                                    Claimed
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-base">{challenge.title}</h3>
                              <p className="text-sm text-muted-foreground mt-0.5">{challenge.description}</p>

                              <div className="mt-3 space-y-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Progress: {challenge.progress} / {challenge.target}</span>
                                  <span>{progressPct.toFixed(0)}%</span>
                                </div>
                                <Progress value={progressPct} className="h-2" />
                              </div>

                              <div className="flex items-center gap-3 mt-3 text-sm">
                                <div className="flex items-center gap-1 text-yellow-500">
                                  <Star className="h-3.5 w-3.5" />
                                  <span className="font-medium">{challenge.xpReward} XP</span>
                                </div>
                                {challenge.badge && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Trophy className="h-3.5 w-3.5" />
                                    <span>{challenge.badge}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-muted-foreground ml-auto">
                                  <Clock className="h-3 w-3" />
                                  <span className="text-xs">
                                    {new Date(challenge.deadline).toLocaleDateString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {canClaim && (
                              <Button
                                size="sm"
                                onClick={() => handleClaim(challenge.id, challenge.badge)}
                                disabled={claimChallenge.isPending}
                                className="flex-shrink-0 font-semibold"
                                data-testid={`button-claim-${challenge.id}`}
                              >
                                Claim
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
