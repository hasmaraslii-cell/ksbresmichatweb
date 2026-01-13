import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Image as ImageIcon } from "lucide-react";
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

  const renderContent = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const mentionRegex = /(@\w+)/g;
    const parts = text.split(/((?:https?:\/\/[^\s]+)|(?:@\w+))/g);
    
    return parts.map((part, i) => {
      if (!part) return null;
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all relative z-50 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            {part}
          </a>
        );
      }
      if (part.match(mentionRegex)) {
        return <span key={i} className="text-yellow-500 font-bold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const sendMutation = useMutation({
    mutationFn: async ({ msgContent, imageUrl }: { msgContent: string; imageUrl?: string }) => {
      const res = await apiRequest("POST", "/api/dms", { 
        receiverId: otherUser.id, 
        content: msgContent,
        imageUrl
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
      sendMutation.mutate({ msgContent: content.trim() });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Dosya boyutu çok büyük (Maksimum 20MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        sendMutation.mutate({ 
          msgContent: content.trim() || "Fotoğraf paylaşıldı", 
          imageUrl: reader.result as string 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-[450px] bg-zinc-950/90 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col z-[100] rounded-xl overflow-hidden font-mono transition-all duration-300">
      <div className="p-3 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserAvatar user={otherUser} className="h-8 w-8 ring-1 ring-cyan-500/50" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-900 rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate max-w-[120px]">{otherUser.displayName || otherUser.username}</span>
            <span className="text-[8px] text-cyan-500/70 uppercase tracking-widest">{otherUser.rank}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/5" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-black/40 to-transparent">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`max-w-[85%] flex flex-col gap-1 ${
                msg.senderId === user?.id ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div className={`rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                msg.senderId === user?.id 
                  ? "bg-cyan-600/20 text-cyan-50 border border-cyan-500/20 rounded-tr-none" 
                  : "bg-zinc-800/50 text-zinc-300 border border-white/5 rounded-tl-none"
              }`}>
                {msg.imageUrl && (
                  <img 
                    src={msg.imageUrl} 
                    alt="DM" 
                    className="max-w-full h-auto rounded-lg mb-2 border border-white/10"
                    onClick={() => window.open(msg.imageUrl!, '_blank')}
                  />
                )}
                <div className="break-words overflow-wrap-anywhere whitespace-pre-wrap">
                  {renderContent(msg.content)}
                </div>
              </div>
              <span className="text-[8px] text-zinc-600 px-1 font-mono uppercase tracking-tighter">
                {format(new Date(msg.createdAt!), "HH:mm")}
              </span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-white/10 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex gap-2 items-center">
          <input type="file" id="dm-image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 shrink-0"
            onClick={() => document.getElementById('dm-image-upload')?.click()}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder="Kripto mesaj..." 
            className="h-9 bg-black/50 border-zinc-800 text-[11px] text-cyan-400 placeholder:text-zinc-700 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button 
            size="icon" 
            className="h-9 w-9 bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-600/20 hover:text-cyan-300 shrink-0" 
            onClick={handleSendMessage}
            disabled={!content.trim() && !sendMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
