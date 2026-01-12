import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertMessage } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useChat() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery({
    queryKey: [api.chat.list.path],
    queryFn: async () => {
      const res = await fetch(api.chat.list.path);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.chat.list.responses[200].parse(await res.json());
    },
    refetchInterval: 3000, // Poll for now since no WS
  });

  const sendMessage = useMutation({
    mutationFn: async (data: InsertMessage) => {
      const res = await fetch(api.chat.send.path, {
        method: api.chat.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.chat.send.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chat.list.path] });
    },
    onError: () => {
      toast({
        title: "Transmission Failed",
        description: "Message could not be sent.",
        variant: "destructive",
      });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.chat.delete.path, { id });
      const res = await fetch(url, { method: api.chat.delete.method });
      if (!res.ok) throw new Error("Failed to delete message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chat.list.path] });
      toast({
        title: "Redacted",
        description: "Message removed from public log.",
        className: "bg-black border-red-900 text-red-500 font-mono",
      });
    },
  });

  const restoreMessage = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.chat.restore.path, { id });
      const res = await fetch(url, { method: api.chat.restore.method });
      if (!res.ok) throw new Error("Failed to restore message");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chat.list.path] });
      toast({
        title: "Restored",
        description: "Message recovered from archives.",
        className: "bg-black border-cyan-900 text-cyan-500 font-mono",
      });
    },
  });

  return {
    messages,
    isLoading,
    sendMessage,
    deleteMessage,
    restoreMessage,
  };
}
