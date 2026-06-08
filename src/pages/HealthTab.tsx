import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function HealthTab() {
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const { data, refetch, isFetching, error, isError } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      // Intentionally expecting a raw fetch or error since /health returns status directly
      const result = await fetchApi<any>("/health");
      setLastChecked(new Date());
      return result;
    },
    enabled: false,
    retry: false,
  });

  const handleCheck = async () => {
    try {
      await refetch();
    } catch (e) {
      setLastChecked(new Date());
      toast.error("Health check failed");
    }
  };

  const isOnline = data && !isError;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">System Health</h1>

      <Card className="max-w-sm mx-auto mt-8 w-full bg-card border-card-border">
        <CardContent className="flex flex-col items-center justify-center p-8 gap-6 text-center">
          {!lastChecked ? (
            <div className="flex flex-col gap-4 items-center">
              <div className="text-muted-foreground text-sm" data-testid="text-health-instruction">
                Click below to verify the gateway API connection.
              </div>
              <Button 
                onClick={handleCheck} 
                disabled={isFetching}
                data-testid="button-check-health"
                className="w-full max-w-[200px]"
              >
                {isFetching ? "Checking..." : "Check Health"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 items-center w-full">
              <div 
                className={`flex items-center gap-3 px-6 py-3 rounded-full border ${
                  isOnline 
                    ? "bg-[#166534]/10 border-[#166534]/30 text-[#166534]" 
                    : "bg-[#991b1b]/10 border-[#991b1b]/30 text-[#991b1b]"
                }`}
              >
                <span className="text-2xl leading-none">&bull;</span>
                <span className="font-bold tracking-wider uppercase text-lg" data-testid="text-health-status">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground font-mono">
                Last checked: {formatDistanceToNow(lastChecked, { addSuffix: true })}
              </div>

              <Button 
                onClick={handleCheck} 
                disabled={isFetching}
                variant="secondary"
                data-testid="button-recheck-health"
                className="w-full max-w-[200px]"
              >
                {isFetching ? "Checking..." : "Check Again"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
