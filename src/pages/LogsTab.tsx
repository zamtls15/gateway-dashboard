import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fetchApi } from "@/lib/api";
import { SkeletonRow } from "@/components/SkeletonRow";
import { Button } from "@/components/ui/button";

type Log = {
  id: string;
  gatewayId: string;
  status: string;
  reason: string;
  createdAt: string;
};

const PAGE_SIZE = 20;

export default function LogsTab() {
  const [page, setPage] = useState(1);

  const { data: logs = [], isLoading, isError, error, refetch, isRefetching } = useQuery<Log[]>({
    queryKey: ["logs"],
    queryFn: () => fetchApi("/gateway/logs"),
    // Reset to page 1 whenever data refreshes so the user isn't left on a now-
    // nonexistent page.
    select: (data) => {
      setPage(1);
      return data;
    },
  });

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageLogs = logs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Logs</h1>
        <div className="flex items-center gap-3">
          {logs.length > 0 && (
            <span className="text-xs text-muted-foreground font-mono">
              {logs.length} total
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            data-testid="button-refresh-logs"
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={18} className={isRefetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : isError ? (
          <div className="text-center py-8 text-destructive text-sm" data-testid="text-error-logs">
            Failed to load logs: {(error as Error)?.message ?? "Unknown error"}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-empty-logs">
            No logs available.
          </div>
        ) : (
          pageLogs.map((log) => {
            const isSuccess =
              log.status.startsWith("2") ||
              log.status === "OK" ||
              log.status.toLowerCase() === "success";

            return (
              <div
                key={log.id}
                className="flex flex-col p-4 border rounded-md border-card-border bg-card gap-2"
                data-testid={`row-log-${log.id}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={isSuccess ? "text-[#166534]" : "text-[#991b1b]"}>
                      &bull;
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {log.status}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground truncate" title={log.gatewayId}>
                      {log.gatewayId}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {log.reason && (
                  <div
                    className="text-xs text-muted-foreground truncate pl-4 border-l border-border ml-1.5"
                    title={log.reason}
                  >
                    {log.reason}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination controls — only rendered when there is more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            data-testid="button-logs-prev"
            className="flex items-center gap-1"
          >
            <ChevronLeft size={14} />
            Prev
          </Button>

          <span className="text-xs text-muted-foreground font-mono">
            Page {safePage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            data-testid="button-logs-next"
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
