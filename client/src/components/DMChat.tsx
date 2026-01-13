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
    refetchInterval: 500, // ULTRA FAST REFRESH (0.5s)
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
    <div className="absolute inset-0 flex flex-col bg-zinc-950/40 backdrop-blur-md z-[100] font-mono animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="p-4 border-b border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative isolate">
              <UserAvatar user={otherUser} className="h-10 w-10 ring-1 ring-cyan-500/50" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full z-20" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white uppercase tracking-widest truncate max-w-[180px]">{otherUser.displayName || otherUser.username}</span>
              <span className="text-[9px] text-cyan-500/80 uppercase tracking-[0.2em] font-black">{otherUser.rank}</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03),transparent)]">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const isConsecutive = prevMsg?.senderId === msg.senderId;

            return (
              <div 
                key={msg.id} 
                className={`flex flex-col gap-1.5 ${isMe ? "items-end" : "items-start"} ${isConsecutive ? "-mt-4" : ""}`}
              >
                <div className={`group relative max-w-[80%] md:max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed shadow-xl transition-all duration-300 ${
                  isMe 
                    ? "bg-cyan-600/10 text-cyan-50 border border-cyan-500/20 rounded-tr-none hover:bg-cyan-600/20" 
                    : "bg-zinc-900/80 text-zinc-300 border border-white/5 rounded-tl-none hover:bg-zinc-900"
                }`}>
                  {msg.imageUrl && (
                    <div className="relative mb-3 group/img">
                      <img 
                        src={msg.imageUrl} 
                        alt="DM" 
                        className="max-w-full h-auto rounded-lg border border-white/10 cursor-pointer hover:scale-[1.02] transition-transform duration-500"
                        onClick={() => window.open(msg.imageUrl!, '_blank')}
                      />
                    </div>
                  )}
                  <div className="break-words overflow-wrap-anywhere whitespace-pre-wrap font-mono tracking-tight">
                    {renderContent(msg.content)}
                  </div>
                </div>
                {!isConsecutive && (
                  <span className="text-[9px] text-zinc-700 px-2 font-black uppercase tracking-widest">
                    {format(new Date(msg.createdAt!), "HH:mm")}
                  </span>
                )}
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto flex gap-3 items-center">
          <input type="file" id="dm-image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-11 w-11 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 shrink-0 transition-colors"
            onClick={() => document.getElementById('dm-image-upload')?.click()}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder="Kriptolu mesaj iletiliyor..." 
            className="h-11 bg-zinc-950/50 border-zinc-800 text-xs text-cyan-400 placeholder:text-zinc-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/10 font-mono tracking-wider"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button 
            size="icon" 
            className="h-11 w-11 bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black shrink-0 transition-all duration-300" 
            onClick={handleSendMessage}
            disabled={!content.trim() && !sendMutation.isPending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
