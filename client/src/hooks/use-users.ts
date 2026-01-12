import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path);
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.users.list.responses[200].parse(await res.json());
    },
  });

  const toggleUserDelete = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.users.toggleDelete.path, { id });
      const res = await fetch(url, { method: api.users.toggleDelete.method });
      if (!res.ok) throw new Error("Failed to toggle user status");
      return api.users.toggleDelete.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({
        title: "Status Updated",
        description: `User ${data.username} is now ${data.isDeleted ? 'BANNED' : 'ACTIVE'}.`,
        className: "bg-black border-zinc-800 text-white font-mono",
      });
    },
  });

  return {
    users,
    isLoading,
    toggleUserDelete,
  };
}
