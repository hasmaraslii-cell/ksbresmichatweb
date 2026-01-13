import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Send, X } from "lucide-react";
import type { DirectMessage, User } from "@shared/schema";

export function DMChat({ otherUser, onClose }: { otherUser: User; onClose: () => void }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const { data: messages = [] } = useQuery<DirectMessage[]>({
    queryKey: ["/api/dms", otherUser.id],
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

  const sendMessage = () => {
    if (!content.trim() || !ws) return;
    ws.send(JSON.stringify({
      type: "dm",
      senderId: user?.id,
      receiverId: otherUser.id,
      content
    }));
    setContent("");
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 flex flex-col shadow-xl border-primary/20 z-50">
      <div className="p-3 border-b bg-primary text-primary-foreground flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 border">
            <AvatarImage src={otherUser.avatarUrl || ""} />
            <AvatarFallback>{otherUser.displayName?.[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{otherUser.displayName}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-3 border-t flex gap-2">
        <Input 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="Mesaj yaz..." 
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button size="icon" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}
