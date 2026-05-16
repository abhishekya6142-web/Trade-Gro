import { useState } from "react";
import { useLocation } from "wouter";
import { useInitUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LineChart, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const initUser = useInitUser();

  const handleStart = () => {
    if (!displayName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a display name to continue.",
        variant: "destructive",
      });
      return;
    }

    const userId = crypto.randomUUID();
    localStorage.setItem("tradevision_user_id", userId);

    initUser.mutate(
      { data: { id: userId, name: displayName } },
      {
        onSuccess: () => {
          setLocation("/dashboard");
        },
        onError: () => {
          localStorage.removeItem("tradevision_user_id");
          toast({
            title: "Failed to initialize",
            description: "Could not create your account. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <LineChart className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">TradeVision<span className="text-primary">AI</span></CardTitle>
            <CardDescription className="text-base">
              Master the Indian stock market with ₹10L virtual money and AI-powered insights.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Choose your trader name
              </label>
              <Input 
                id="name" 
                placeholder="e.g. DalalStreetPro" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                className="h-12 bg-secondary/50 border-border/50 focus-visible:ring-primary"
              />
            </div>
            
            <div className="rounded-lg bg-secondary/30 p-4 border border-border/50">
              <h4 className="text-sm font-semibold mb-2">What you get:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  ₹10,00,000 starting virtual balance
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Real-time NSE/BSE market data
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  AI Coach & chart analysis
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full h-12 text-base font-semibold" 
            onClick={handleStart}
            disabled={initUser.isPending}
          >
            {initUser.isPending ? "Setting up..." : "Start Trading"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}