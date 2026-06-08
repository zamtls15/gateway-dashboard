import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Copy, Check } from "lucide-react";
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
type Gateway = { id: string; name: string };
type Secret = { id: string; keyName: string; envVar: string };

function CopyButton({ value, label, className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(label ? `Copied ${label}` : "Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={className ?? "text-muted-foreground hover:text-foreground h-7 w-7"}
      data-testid={`button-copy-${label ?? "value"}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </Button>
  );
}

export default function SecretsTab() {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>("");
  const [newKeyName, setNewKeyName] = useState("");
  const [newEnvVar, setNewEnvVar] = useState("");
  const [deletingSecret, setDeletingSecret] = useState<Secret | null>(null);

  const proxyEndpoint = selectedGatewayId
    ? `${window.location.origin}/api/env/${selectedGatewayId}`
    : null;

  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: () => fetchApi("/gateway/groups"),
  });

  const { data: gateways = [] } = useQuery<Gateway[]>({
    queryKey: ["gateways", selectedGroupId],
    queryFn: () => fetchApi(`/gateway/groups/${selectedGroupId}/gateways`),
    enabled: !!selectedGroupId,
  });

  const { data: secrets = [], isLoading: secretsLoading } = useQuery<Secret[]>({
    queryKey: ["secrets", selectedGatewayId],
    queryFn: () => fetchApi(`/gateway/gateways/${selectedGatewayId}/secrets`),
    enabled: !!selectedGatewayId,
  });

  const createSecret = useMutation({
    mutationFn: (data: { keyName: string; envVar: string }) =>
      fetchApi(`/gateway/gateways/${selectedGatewayId}/secrets`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets", selectedGatewayId] });
      toast.success("Secret added");
      setNewKeyName("");
      setNewEnvVar("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteSecret = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/gateway/gateways/${selectedGatewayId}/secrets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets", selectedGatewayId] });
      toast.success("Secret deleted");
      setDeletingSecret(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Secrets</h1>

      <div className="flex flex-col gap-3">
        <Select
          value={selectedGroupId}
          onValueChange={(val) => {
            setSelectedGroupId(val);
            setSelectedGatewayId("");
          }}
        >
          <SelectTrigger className="w-full bg-card border-card-border" data-testid="select-secrets-group">
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

        <Select
          value={selectedGatewayId}
          onValueChange={setSelectedGatewayId}
          disabled={!selectedGroupId || gateways.length === 0}
        >
          <SelectTrigger className="w-full bg-card border-card-border" data-testid="select-secrets-gateway">
            <SelectValue placeholder="Select a gateway" />
          </SelectTrigger>
          <SelectContent>
            {gateways.map((gw) => (
              <SelectItem key={gw.id} value={gw.id} data-testid={`select-item-gateway-${gw.id}`}>
                {gw.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedGatewayId ? (
        <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-empty-secrets-unselected">
          Select a gateway to view secrets.
        </div>
      ) : (
        <>
          {/* Proxy endpoint card */}
          <div className="flex flex-col gap-1 p-4 rounded-md border border-card-border bg-card">
            <span className="text-xs text-muted-foreground mb-1">Proxy endpoint</span>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs text-foreground break-all flex-1 select-all"
                data-testid="text-proxy-endpoint"
              >
                {proxyEndpoint}
              </span>
              {proxyEndpoint && (
                <CopyButton value={proxyEndpoint} label="endpoint" />
              )}
            </div>
          </div>

          {/* Secrets list */}
          <div className="flex flex-col gap-2">
            {secretsLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : secrets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-empty-secrets">
                No secrets configured for this gateway.
              </div>
            ) : (
              secrets.map((secret) => (
                <div
                  key={secret.id}
                  className="flex items-center justify-between p-4 border rounded-md border-card-border bg-card gap-4"
                  data-testid={`row-secret-${secret.id}`}
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-foreground truncate">{secret.keyName}</span>
                      <CopyButton value={secret.keyName} label="key" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-muted-foreground truncate">{secret.envVar}</span>
                      <CopyButton value={secret.envVar} label="value" />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingSecret(secret)}
                    data-testid={`button-delete-secret-${secret.id}`}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Add secret form */}
          <Card className="bg-card border-card-border mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Add Secret</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                placeholder="Key Name (e.g. API_KEY)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                data-testid="input-new-secret-key"
                className="bg-background border-border focus-visible:ring-ring text-foreground font-mono text-sm"
              />
              <Input
                placeholder="Value"
                value={newEnvVar}
                onChange={(e) => setNewEnvVar(e.target.value)}
                data-testid="input-new-secret-env"
                className="bg-background border-border focus-visible:ring-ring text-foreground font-mono text-sm"
              />
              <Button
                onClick={() => createSecret.mutate({ keyName: newKeyName, envVar: newEnvVar })}
                disabled={createSecret.isPending || !newKeyName || !newEnvVar}
                data-testid="button-add-secret"
                className="w-full"
              >
                {createSecret.isPending ? "Adding..." : "Add Secret"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <ConfirmDeleteDrawer
        open={!!deletingSecret}
        onOpenChange={(open) => !open && setDeletingSecret(null)}
        title={`Delete secret ${deletingSecret?.keyName}?`}
        onConfirm={() => deletingSecret && deleteSecret.mutate(deletingSecret.id)}
        isDeleting={deleteSecret.isPending}
      />
    </div>
  );
}
