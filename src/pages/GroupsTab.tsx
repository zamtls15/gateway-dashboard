import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { SkeletonRow } from "@/components/SkeletonRow";
import { ConfirmDeleteDrawer } from "@/components/ConfirmDeleteDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Group = { id: string; name: string };

export default function GroupsTab() {
  const queryClient = useQueryClient();
  const [newGroupName, setNewGroupName] = useState("");
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);

  const { data: groups = [], isLoading, isError, error } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: () => fetchApi("/gateway/groups"),
  });

  const createGroup = useMutation({
    mutationFn: (name: string) =>
      fetchApi("/gateway/groups", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group created");
      setNewGroupName("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteGroup = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/gateway/groups/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group deleted");
      setDeletingGroup(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Groups</h1>
      
      <div className="flex gap-2">
        <Input
          placeholder="New group name..."
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          data-testid="input-new-group"
          className="bg-card border-card-border focus-visible:ring-ring text-foreground"
        />
        <Button
          onClick={() => newGroupName && createGroup.mutate(newGroupName)}
          disabled={createGroup.isPending || !newGroupName}
          data-testid="button-create-group"
        >
          {createGroup.isPending ? "Creating..." : "Create"}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : isError ? (
          <div className="text-center py-8 text-destructive text-sm" data-testid="text-error-groups">
            Failed to load groups: {(error as Error)?.message ?? "Unknown error"}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-empty-groups">
            No groups yet. Create your first one above.
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="flex items-center justify-between p-4 border rounded-md border-card-border bg-card"
              data-testid={`row-group-${group.id}`}
            >
              <span className="font-medium text-foreground">{group.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletingGroup(group)}
                data-testid={`button-delete-group-${group.id}`}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))
        )}
      </div>

      <ConfirmDeleteDrawer
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
        title={`Delete ${deletingGroup?.name}?`}
        onConfirm={() => deletingGroup && deleteGroup.mutate(deletingGroup.id)}
        isDeleting={deleteGroup.isPending}
      />
    </div>
  );
}
