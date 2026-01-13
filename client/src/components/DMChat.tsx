import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";
import type { DirectMessage, User } from "@shared/schema";
import { UserAvatar } from "./UserAvatar";
import { format } from "date-fns";

export function DMChat({ otherUser, onClose }: { otherUser: User; onClose: () => void }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const { data: messages = [] } = useQuery<DirectMessage[]>({
    queryKey: ["/api/dms", otherUser.id],
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (msgContent: string) => {
      const res = await apiRequest("POST", "/api/dms", { 
        receiverId: otherUser.id, 
        content: msgContent 
      });
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/dms", otherUser.id] });
    }
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "auth", userId: user?.id }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "dm" || data.type === "dm_sent") {
        queryClient.invalidateQueries({ queryKey: ["/api/dms", otherUser.id] });
      }
    };

    setWs(socket);
    return () => socket.close();
  }, [user?.id, otherUser.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!content.trim()) return;
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "dm",
        senderId: user?.id,
        receiverId: otherUser.id,
        content: content.trim()
      }));
      setContent("");
    } else {
      sendMutation.mutate(content.trim());
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-zinc-950 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col z-[100] rounded-lg overflow-hidden font-mono">
      <div className="p-3 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar user={otherUser} className="h-6 w-6" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">{otherUser.displayName || otherUser.username}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3 bg-black/40">
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`max-w-[80%] rounded-md p-2 text-xs ${
                msg.senderId === user?.id 
                  ? "bg-cyan-950/30 text-cyan-100 self-end border border-cyan-900/30" 
                  : "bg-zinc-900 text-zinc-300 self-start border border-white/5"
              }`}
            >
              <div>{msg.content}</div>
              <div className="text-[8px] opacity-40 mt-1 text-right">
                {format(new Date(msg.createdAt!), "HH:mm")}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-white/10 bg-zinc-900/50 flex gap-2">
        <Input 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="Mesaj yaz..." 
          className="h-8 bg-black border-zinc-800 text-[10px] text-cyan-500 placeholder:text-zinc-700 focus:border-cyan-900"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button size="icon" className="h-8 w-8 bg-cyan-950/50 text-cyan-400 border border-cyan-900/50 hover:bg-cyan-900/50" onClick={handleSendMessage}>
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
