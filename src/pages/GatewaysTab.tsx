import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { SkeletonRow } from "@/components/SkeletonRow";
import { ConfirmDeleteDrawer } from "@/components/ConfirmDeleteDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Group = { id: string; name: string };
type Gateway = { id: string; name: string; baseUrl: string; status: 'ON' | 'OFF' };

export default function GatewaysTab() {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newGatewayName, setNewGatewayName] = useState("");
  const [newGatewayUrl, setNewGatewayUrl] = useState("");
  const [deletingGateway, setDeletingGateway] = useState<Gateway | null>(null);

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: () => fetchApi("/gateway/groups"),
  });

  const { data: gateways = [], isLoading: gatewaysLoading } = useQuery<Gateway[]>({
    queryKey: ["gateways", selectedGroupId],
    queryFn: () => fetchApi(`/gateway/groups/${selectedGroupId}/gateways`),
    enabled: !!selectedGroupId,
  });

  const createGateway = useMutation({
    mutationFn: (data: { name: string; baseUrl: string }) =>
      fetchApi(`/gateway/groups/${selectedGroupId}/gateways`, {
        method: "POST",
        body: JSON.stringify({ ...data, groupId: Number(selectedGroupId) }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateways", selectedGroupId] });
      toast.success("Gateway added");
      setNewGatewayName("");
      setNewGatewayUrl("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateGatewayStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ON' | 'OFF' }) =>
      fetchApi(`/gateway/groups/${selectedGroupId}/gateways/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateways", selectedGroupId] });
      toast.success("Status updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteGateway = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/gateway/groups/${selectedGroupId}/gateways/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateways", selectedGroupId] });
      toast.success("Gateway deleted");
      setDeletingGateway(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Gateways</h1>

      <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
        <SelectTrigger className="w-full bg-card border-card-border" data-testid="select-group">
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((g) => (
            <SelectItem key={g.id} value={g.id} data-testid={`select-item-group-${g.id}`}>
              {g.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!selectedGroupId ? (
        <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-empty-gateways-unselected">
          Select a group to view gateways.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {gatewaysLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : gateways.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-empty-gateways">
                No gateways in this group.
              </div>
            ) : (
              gateways.map((gw) => (
                <div
                  key={gw.id}
                  className="flex items-center justify-between p-4 border rounded-md border-card-border bg-card flex-wrap gap-4"
                  data-testid={`row-gateway-${gw.id}`}
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <span className="font-medium text-foreground truncate">{gw.name}</span>
                    <span className="text-xs font-mono text-muted-foreground truncate">{gw.baseUrl}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() =>
                        updateGatewayStatus.mutate({ id: gw.id, status: gw.status === 'ON' ? 'OFF' : 'ON' })
                      }
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors font-mono ${
                        gw.status === 'ON' ? 'bg-[#166534] text-white' : 'bg-[#991b1b] text-white'
                      }`}
                      data-testid={`button-toggle-status-${gw.id}`}
                    >
                      {gw.status}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingGateway(gw)}
                      data-testid={`button-delete-gateway-${gw.id}`}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Card className="bg-card border-card-border mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Add Gateway</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                placeholder="Gateway name"
                value={newGatewayName}
                onChange={(e) => setNewGatewayName(e.target.value)}
                data-testid="input-new-gateway-name"
                className="bg-background border-border focus-visible:ring-ring text-foreground"
              />
              <Input
                placeholder="Base URL (e.g. https://api.example.com)"
                value={newGatewayUrl}
                onChange={(e) => setNewGatewayUrl(e.target.value)}
                data-testid="input-new-gateway-url"
                className="bg-background border-border focus-visible:ring-ring text-foreground font-mono text-sm"
              />
              <Button
                onClick={() => createGateway.mutate({ name: newGatewayName, baseUrl: newGatewayUrl })}
                disabled={createGateway.isPending || !newGatewayName || !newGatewayUrl}
                data-testid="button-add-gateway"
                className="w-full"
              >
                {createGateway.isPending ? "Adding..." : "Add Gateway"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <ConfirmDeleteDrawer
        open={!!deletingGateway}
        onOpenChange={(open) => !open && setDeletingGateway(null)}
        title={`Delete ${deletingGateway?.name}?`}
        onConfirm={() => deletingGateway && deleteGateway.mutate(deletingGateway.id)}
        isDeleting={deleteGateway.isPending}
      />
    </div>
  );
}
